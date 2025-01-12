async function checkForMainfile() {
    const dir = await _api.getDirectory();
    console.log(dir);
    const path = `${dir}/main.json`;

    if (await _api.exists(path)) {
        return true;
    } else { return false; }
}

async function handleNew() {
    const templateRes = await fetch("https://jewels86.me/static/topaz/main-template.json");
    const template = await templateRes.json();
    const dir = await _api.getDirectory();
    const path = `${dir}/main.json`;
    _api.write(path, JSON.stringify(template));

    _api.tryCreateDir(`${dir}/workspaces`);
    _api.tryCreateDir(`${dir}/profiles`);

    const workspaceTemplateRes = await fetch("https://jewels86.me/static/topaz/workspace-template.json");
    const workspaceTemplate = await workspaceTemplateRes.json();
    const workspacePath = `${dir}/${template.known_workspaces[0].path}`;
    _api.write(workspacePath, JSON.stringify(workspaceTemplate));

    const profileTemplateRes = await fetch("https://jewels86.me/static/topaz/profile-template.json");
    const profileTemplate = await profileTemplateRes.json();
    const profilePath = `${dir}/${template.known_profiles[0].path}`;
    _api.write(profilePath, JSON.stringify(profileTemplate));

    window.location.reload();
}

async function loadMainfile() {
    const dir = await _api.getDirectory();
    const path = `${dir}/main.json`;
    window._data.mainfile = JSON.parse(await _api.read(path));
}

async function bootstrap() {
    console.log("Bootstrapping...");
    if (checkForMainfile()) {
        console.log("Mainfile found. Loading data into _data...");
        await loadMainfile();
        console.log("Data loaded. Waiting for response from handler script...");
        
    } else {
        console.log("No mainfile found. Creating new...");
        await handleNew();
    }
}

function loadTheme(theme) {
    const rootStyles = getComputedStyle(document.documentElement);
    rootStyles.setProperty('--background-1', theme.background_1);
    rootStyles.setProperty('--background-2', theme.background_2);
    rootStyles.setProperty('--background-3', theme.background_3);
    rootStyles.setProperty('--accent-1', theme.accent_1);
    rootStyles.setProperty('--accent-2', theme.accent_2);
    rootStyles.setProperty('--accent-3', theme.accent_3);
    rootStyles.setProperty('--text-1', theme.text_1);
    rootStyles.setProperty('--text-2', theme.text_2);
    rootStyles.setProperty('--text-3', theme.text_3);

    return rootStyles;
}
