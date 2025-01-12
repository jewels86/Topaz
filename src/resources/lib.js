function checkForMainfile() {
    const dir = _api.getDirectory();
    console.log(dir);
    const path = `${dir}/main.json`;

    if (_api.exists(path)) {
        return true;
    } else { return false; }
}

async function handleNew() {
    const templateRes = await fetch("https://jewels86.me/static/topaz/main-template.json");
    const template = await templateRes.json();
    const dir = _api.getDirectory();
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

function loadMainfile() {
    const dir = _api.getDirectory();
    const path = `${dir}/main.json`;
    const mainfile = JSON.parse(_api.read(path));
}

async function bootstrap() {
    console.log("Bootstrapping...");
    if (checkForMainfile()) {
        console.log("Mainfile found. Loading data into _data...");
        
    } else {
        console.log("No mainfile found. Creating new...");
        handleNew();
    }
}

function loadTheme() {
    const rootStyles = getComputedStyle(document.documentElement);

    return rootStyles;
}
