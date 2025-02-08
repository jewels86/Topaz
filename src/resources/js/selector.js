function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", escapeCSS(theme.background));
    html.style.setProperty("--title-buttons", escapeCSS(theme.title_buttons));
    html.style.setProperty("--heading", escapeCSS(theme.heading));
    html.style.setProperty("--buttons", escapeCSS(theme.buttons));
    html.style.setProperty("--buttons-hover", escapeCSS(theme.buttons_hover));
    html.style.setProperty("--workspace-name", escapeCSS(theme.workspace_name));
    html.style.setProperty("--workspace-path", escapeCSS(theme.workspace_path));
    html.style.setProperty("--last-accessed", escapeCSS(theme.last_accessed));
    html.style.setProperty("--workspace-background", escapeCSS(theme.workspace_background));
    html.style.setProperty("--workspace-hover", escapeCSS(theme.workspace_hover));
    html.style.setProperty("--text", escapeCSS(theme.text));
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile));
    loadTheme(profile.theme.selector);
    
    console.log("Theme loaded.");
    window._api.setTitleBarColor(profile.theme.selector.title_buttons);

    window._data.mainfile.known_workspaces.forEach(workspace => {
        const element = document.createElement("div");
        element.classList.add("workspace");
        element.onclick = () => openIndex(workspace.path);
        element.innerHTML = `
        <div>
            <h2>${workspace.name}</h2>
            <h3>${workspace.path}</h3>
        </div>
        <p>Last Accessed: ${workspace.last_accessed}</p>
        `
        document.getElementById("workspaces").appendChild(element);
    });
}

function openIndex(workspace) {
    window._api.openIndex(workspace);
}

async function newWorkspace() {
    const template = await fetch("https://jewels86.me/static/topaz/workspace-template.json").then(response => response.json());
    template.name = "New Workspace";
    const date = new Date().toISOString().split('T')[0];
    template.path = `workspaces/new-workspace-${date}.workspace.tpz`;
    template.last_accessed = "Never";
    _api.write(await resolveFilePath(template.path), JSON.stringify(template, null, 4));

    const mainfile = JSON.parse(await _api.read(await resolveFilePath("main.json")));
    mainfile.known_workspaces.push({ name: template.name, path: template.path, last_accessed: template.last_accessed });
    await _api.write(await resolveFilePath("main.json"), JSON.stringify(mainfile, null, 4));

    window.location.reload();
}

function openMarketplace() {
    window._api.openMarketplace();
}

async function refreshWorkspaces() {
    const uniqueWorkspaces = [];
    const paths = new Set();

    window._data.mainfile.known_workspaces = window._data.mainfile.known_workspaces.filter(workspace => {
        if (paths.has(workspace.path)) {
            return false;
        }
        paths.add(workspace.path);
        const exists = _api.exists(workspace.path);
        if (!exists) {
            return false;
        }
        uniqueWorkspaces.push(workspace);
        return true;
    });

    window._data.mainfile.known_workspaces = uniqueWorkspaces;
    _api.write(await resolveFilePath("main.json"), JSON.stringify(window._data.mainfile, null, 4));
    window.location.reload();
}

main();