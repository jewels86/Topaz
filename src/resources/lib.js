async function checkForMainfile() {
    const dir = await _api.getDirectory();
    const path = `${dir}\\main.json`;
    return await _api.exists(path);
}

async function handleNew() {
    const templateRes = await fetch("https://jewels86.me/static/topaz/main-template.json");
    const template = await templateRes.json();
    const dir = await _api.getDirectory();
    const path = `${dir}\\main.json`;
    console.log("Initializing new mainfile at", path);

    await _api.write(path, JSON.stringify(template));
    console.log("Mainfile initialized.");

    await _api.tryCreateDir(`${dir}\\workspaces`);
    await _api.tryCreateDir(`${dir}\\profiles`);
    console.log("Workspaces and profiles directories created.");

    const workspaceTemplateRes = await fetch("https://jewels86.me/static/topaz/workspace-template.json");
    const workspaceTemplate = await workspaceTemplateRes.json();
    console.log(workspaceTemplate);
    const workspacePath = `${dir}\\${template.known_workspaces[0].path}`;
    await _api.write(workspacePath, JSON.stringify(workspaceTemplate));
    console.log("Workspace template written.");

    const profileTemplateRes = await fetch("https://jewels86.me/static/topaz/profile-template.json");
    const profileTemplate = await profileTemplateRes.json();
    const profilePath = `${dir}\\${template.known_profiles[0].path}`;
    await _api.write(profilePath, JSON.stringify(profileTemplate));
    console.log("Profile template written.");

    console.log("Reloading window...");
    window.location.reload();
}

async function loadMainfile() {
    const dir = await _api.getDirectory();
    const path = `${dir}\\main.json`;
    if (!window._data) window._data = {};
    window._data.mainfile = JSON.parse(await _api.read(path));
}

async function bootstrap() {
    console.log("Bootstrapping...");
    if (await checkForMainfile() == true) {
        console.log("Mainfile found. Loading data into _data...");
        await loadMainfile();
        console.log("Data loaded. Waiting for response from handler script...");
    } else {
        console.log("No mainfile found. Creating new...");
        await handleNew();
    }
}

function loadTheme(theme) {
    const body = document.body.style;

    body.setProperty('--background-1', theme.background1);
    body.setProperty('--background-2', theme.background2);
    body.setProperty('--background-3', theme.background3);
    body.setProperty('--accent-1', theme.accent1);
    body.setProperty('--accent-2', theme.accent2);
    body.setProperty('--accent-3', theme.accent3);
    body.setProperty('--text-1', theme.text1);
    body.setProperty('--text-2', theme.text2);
    body.setProperty('--text-3', theme.text3);
}
