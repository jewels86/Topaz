const interpret = (x) => x.replace(/\[(.+)]/g, (m, v) => _vars[v] || "N/A");
const getWidgetFromKnown = (id) => _vars.current_profile.known_widgets.filter(v => v[0] == id)[0];
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

    _data.theme.obj = theme;
    _data.theme.name = theme.name;
    _data.theme.author = theme.author;
    _vars.theme = _data.theme;

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

    window._vars.current_workspace = workspace;
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

    window._fns = {};
    window._vars = {};
    window._data = {};
    window._data.theme = {};

    window._data.mainfile = JSON.parse(await window._api.read('main.json'));
    window._data.current_profile = _data.mainfile.profiles[_data.mainfile.latest_profile];
    window._data.current_workspace = _data.mainfile.workspaces[_data.mainfile.latest_profile];

    await loadProfile(_data.current_profile);
    await loadWorkspace(_data.current_workspace);
    
    await constructStatusBar();
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

    await _api.write('main.json', mainfile);
    await _api.write('profiles/main-profile.json', profile);
    await _api.write('workspaces/main-workspace.json', workspace);
}

async function newWidget(id, name, x, y, height=1, width=1) {
    if (tryTo(() => getWidgetFromKnown(id)) == null) throw new Error("Widget ID not known.");
}