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
    workspaceTemplate.name = "Main Workspace";
    console.log(workspaceTemplate);
    const workspacePath = `${dir}\\${template.known_workspaces[0].path}`;
    await _api.write(workspacePath, JSON.stringify(workspaceTemplate, null, 4));
    console.log("Workspace template written.");

    const profileTemplateRes = await fetch("https://jewels86.me/static/topaz/profile-template.json");
    const profileTemplate = await profileTemplateRes.json();
    profileTemplate.name = "Main Profile";
    const profilePath = `${dir}\\${template.known_profiles[0].path}`;
    await _api.write(profilePath, JSON.stringify(profileTemplate, null, 4));
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
        console.log("Data loaded. Waiting for handler script...");
    } else {
        console.log("No mainfile found. Creating new...");
        await handleNew();
    }
}

