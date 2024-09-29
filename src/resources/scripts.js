const interpret = (x) => x.replace(/\[(.+)]/g, (m, v) => _vars[v] || "N/A");
const getWidgetFromKnown = (id) => _vars.current_profile.known_widgets.filter(v => v.id == id)[0];
const tryTo = (x) => {
    try { return x(); }
    catch { return null; }
}

async function setTheme(path) {
    var root = document.querySelector(':root');
    const theme = JSON.parse(await _api.read(path));

    if (theme == null || theme == '') return false;

    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent2', theme.accent2);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--font', theme.font || 'arial');
    root.style.setProperty('--background', theme.background || theme.primary);

    _vars.theme = theme;

    return true;
}

async function loadProfile(path) {
    const profile = JSON.parse(await _api.read(path));

    await setTheme(profile.theme);

    window._vars.current_profile = profile;
    _vars.current_profile_name = profile.name;
}
async function loadWorkspace(path) {
    const workspace = JSON.parse(await _api.read(path));

    if (workspace.theme_dominance) setTheme(workspace.theme);

    window._data.current_workspace_obj = workspace;
    _vars.current_workspace_name = workspace.name;
    _vars.current_workspace_theme = workspace.theme;
}
async function constructStatusBar() {
    const footer = document.getElementById('footer');

    const interpret = (x) => x.replace(/\[(.+)]/g, (m, v) => _vars[v] || "N/A");
    const setInnerText = (s, x) => {
        x.innerText = interpret(s.label);
    } 
    const setTooltip = (s, x) => {
        if (s.tooltip != null) x.title = interpret(x.tooltip);
    }

    [..._vars.current_profile.statusbar, ..._vars.current_workspace.statusbar].forEach((stat) => {
        if (stat.interaction != null) {
            const btn = document.createElement('button');
            btn.classList.add("stat-btn");
            
            setInnerText(stat, btn);
            setTooltip(stat, btn);

            btn.onclick = (ev) => {

            }

            footer.appendChild(btn);
        }
        else {
            const p = document.createElement('p');

            setInnerText(stat, p);
            setTooltip(stat, p);

            footer.appendChild(p);
        }
    })
}

async function startup() {
    if (!(await _api.exists('main.json'))) await handleFirstTime();

    window._fns = {}; // functions accessible to non-trusted components
    window._vars = {}; // variables accessible to non-trusted components
    window._data = {}; // private data for the app itself (not accessible to non-trusted components)
    window._vars.grid = []; // grid that holds placeholders (numbers that represent widgets)
    window._data.grid_ref = {}; // number representation -> actual widget
    window._vars.grid_height = 0; // height of the grid
    window._vars.grid_width = 0; // width of the grid
    window._vars.next_n = 0; // widget numbers count

    window._data.mainfile = JSON.parse(await window._api.read('main.json'));
    window._data.current_profile = _data.mainfile.profiles[_data.mainfile.latest_profile];
    window._data.current_workspace = _data.mainfile.workspaces[_data.mainfile.latest_profile];

    await loadProfile(_data.current_profile);
    await loadWorkspace(_data.current_workspace);
    
    await constructStatusBar();

    _api.subscribeToClose(end)
}

async function handleFirstTime() {
    await _api.mkdir('profiles')
    await _api.mkdir('workspaces')

    const template = JSON.parse(await _api.read("data/template.json"));

    const mainfile = template.mainfile;
    const profile = template.profile;
    const workspace = template.workspace;

    profile.name = "Main Profile";
    workspace.name = "Main Workspace";

    await _api.write('main.json', JSON.stringify(mainfile));
    await _api.write('profiles/main-profile.json', JSON.stringify(profile));
    await _api.write('workspaces/main-workspace.json', JSON.stringify(workspace));
}

async function adjustGrid(inc_w, inc_h) {
    for (let i = 0; i < inc_w; i++) {
        const arr = [];
        arr.fill(-1, 0, _vars.grid_height);
        _vars.grid.push(arr);
    }
    for (let i = 0; i < inc_h; i++) {
        _vars.grid.forEach(v => v.push(-1));
    }

    _vars.grid_height += inc_h;
    _vars.grid_width += inc_w;

    const container = document.getElementById('container');
    container.style.gridTemplateColumns = `repeat(${_vars.grid_width}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${_vars.grid_height}, 1fr)`;
}

async function newWidget(id, name, x, y, height=1, width=1) {
    if (tryTo(() => getWidgetFromKnown(id)) == null) throw new Error("Widget ID not known.");
    if (id == null || name == null || x == null || y == null) throw new Error("At least one required parameter is null.");

    if ((x + (width - 1)) >= _vars.grid_width) adjustGrid((x + (width - 1)) - (_vars.grid_width - 1), 0);
    if ((y + (height - 1)) >= _vars.grid_height) adjustGrid(0, (y + (height - 1)) - (_vars.grid_height - 1));

    const wdata = JSON.parse(await _api.read(getWidgetFromKnown(id).path));
    
    const widget = {
        name: name,
        id: id,
        x: x,
        y: y,
        height: height,
        width: width,
        data: {},
        settings: {},
        n: _vars.next_n
    }
    _vars.next_n += 1;

    wdata.data.forEach(v => widget.data[v.id] = v.initial_value);
    wdata.settings.forEach(v => widget.settings[v.id] = v.initial_value);

    _data.current_workspace_obj.widgets.push(widget);

    loadWidget(widget);
}

async function loadWidget(widget) {
    const widgetDiv = document.createElement('div');
    widgetDiv.id = `widget-${widget.n}-container`
    widgetDiv.style.gridColumn = `${widget.x} / ${(widget.width - 1) + widget.x}`;
    widgetDiv.style.gridRow = `${widget.y} / ${(widget.height - 1) + widget.y}`;
    widgetDiv.classList.add("vertical-flex");
    
    const frame = document.createElement('iframe');
    frame.id = `widget-${widget.n}`;
    frame.src = JSON.parse(await _api.read(getWidgetFromKnown(widget.id).path)).path;
    frame.sandbox = "allow-scripts";
    frame.onload = () => frame.contentWindow.postMessage({ vars: _vars, fns: _fns });
    frame.classList.add("grow", "border-secondary");

    const topbar = document.createElement('div');
    topbar.classList.add("height-fit", "width-full", "back-secondary", "space-between");
    const name = document.createElement('p');
    name.classList.add('no-extra');
    name.innerText = widget.name;
    topbar.appendChild(name);

    widgetDiv.appendChild(topbar);
    widgetDiv.appendChild(frame);

    document.getElementById('container').appendChild(widgetDiv);
}

async function end() {
    
}