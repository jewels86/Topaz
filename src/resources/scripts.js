const interpret = (x) => x.replace(/\[(.+)]/g, (m, v) => _vars[v] || "N/A"); // a function that allows strings to have vars embedded in them
const getWidgetFromKnown = (id) => _data.current_profile.known_widgets.filter(v => v.id == id)[0]; // tries to get a widgets path and name from the known widgets in the profile
const tryTo = (x) => {
    try { return x(); }
    catch { return null; }
} // function to execute a function inside a try/catch block (just to save time and space)

/** 
 * Sets the current theme.
 *
 * @param {string} path - The path to load the theme from
 */
async function setTheme(path) {
    var root = document.querySelector(':root'); // gets the CSS variables from the document
    const theme = JSON.parse(await _api.read(path)); // gets theme data 

    if (theme == null || theme == {}) return false;

    // sets CSS variables
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent2', theme.accent2);
    root.style.setProperty('--text', theme.text);
    root.style.setProperty('--font', theme.font || 'arial');
    root.style.setProperty('--background', theme.background || theme.primary);

    _vars.theme = theme; // so widgets and the rest of the program know what the theme is

    return true; // success
}

/** 
 * Loads a profile from a given path.
 *
 * @param {string} path - The path to load from.
 */
async function loadProfile(path) {
    const profile = JSON.parse(await _api.read(path)); // get the profile from the file

    await setTheme(profile.theme); // sets the theme to the profile's theme

    window._data.current_profile = profile; // set the profile var to the data 
    _vars.current_profile_name = profile.name; // give the widgets the profile name
}
/** 
 * Loads a workspace from a given path.
 *
 * @param {string} path - The path to load from.
 */
async function loadWorkspace(path) {
    const workspace = JSON.parse(await _api.read(path)); // get workspace data from the file

    if (workspace.theme_dominance) setTheme(workspace.theme); // if workspace themes override profile themes, set it to the workspace theme

    window._data.current_workspace = workspace; // set the variable
    _vars.current_workspace_name = workspace.name; // give them the name
    _vars.current_workspace_theme = workspace.theme; // give them the theme
}
/**
 * Builds the bottom status bar.
 */
async function constructStatusBar() {
    const footer = document.getElementById('footer'); // get the bar's HTML

    const setInnerText = (s, x) => { // shorthand to set text
        x.innerText = interpret(s.label);
    } 
    const setTooltip = (s, x) => { // shorthand to set tooltips
        if (s.tooltip != null) x.title = interpret(x.tooltip);
    }

    [..._data.current_profile.statusbar, ..._vars.current_workspace.statusbar].forEach((stat) => { // for all the status bar items
        if (stat.interaction != null) { // if its interactable
            if (stat.interaction_type == "button") { // if it should be a button
                const btn = document.createElement('button');
                btn.classList.add("stat-btn");
                
                setInnerText(stat, btn);
                setTooltip(stat, btn);

                btn.onclick = (ev) => {

                }

                footer.appendChild(btn);
            }
        }
        else { // if its just text
            const p = document.createElement('p');

            setInnerText(stat, p);
            setTooltip(stat, p);

            footer.appendChild(p);
        }
        // TODO: Finish this
    })
}

/** 
 * Runs on start.
 */
async function startup() {
    if (!(await _api.exists('main.json'))) await handleFirstTime(); // handle the first time if it is the first time

    window._fns = {}; // functions accessible to widgets or status bar items
    window._vars = {}; // variables accessible to widgets or status bar items
    window._data = {}; // private data for the app itself (not accessible to widgets or status bar items)
    window._vars.grid = []; // grid that holds placeholders (numbers that represent widgets)
    window._data.grid_ref = {}; // number representation -> actual widget
    window._vars.grid_height = 0; // height of the grid
    window._vars.grid_width = 0; // width of the grid
    window._vars.next_n = 0; // widget numbers count

    window._data.mainfile = JSON.parse(await window._api.read('main.json')); // read the mainfile (it holds all the paths for profiles and workspaces)
    window._data.current_profile_path = _data.mainfile.profiles[_data.mainfile.latest_profile]; // set the profile to the latest one
    window._data.current_workspace_path = _data.mainfile.workspaces[_data.mainfile.latest_profile]; // set the workspace to the latest one

    // load the profile, workspace and status bar
    await loadProfile(_data.current_profile_path); 
    await loadWorkspace(_data.current_workspace_path);
    
    await constructStatusBar();

    _api.subscribeToClose(end)
}
// handle the first time
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
// Adjust the grid by increments
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
// creates a widget (in-progress)
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
// loads a widget (in-progress)
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
    // function that needs to be run on close
    // this needs to save workspace data to file, then give the "go ahead" to main
}