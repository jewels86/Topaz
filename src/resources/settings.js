let page;

async function startSettings() {
    window.mainfile = JSON.parse((await window._api.read("main.json")));
    window.workspace = JSON.parse((await window._api.read(mainfile.workspaces[mainfile.latest_workspace])));
    window.profile = JSON.parse((await window._api.read(window.workspace.profile != "" ? window.workspace.profile: mainfile.profiles[mainfile.default_profile])));
    window._vars = {};
    setTheme(profile.theme);

    loadWorkspaceSettings();
    loadProfileSettings();
    loadMainfileSettings();

    openPage("workspace");
}

function openPage(pageName) {
    if (page) {
        page.style.display = "none";
    }
    page = document.getElementById(pageName);
    page.style.display = "flex";
}

function loadWorkspaceSettings() {
    const setting = x => document.getElementById(x);
    setting("workspace-name").value = workspace.name;
    setting("workspace-theme").value = workspace.theme;
    setting("workspace-profile").value = workspace.profile;

    setting("workspace-name").onchange = save;
    setting("workspace-theme").onchange = save;
    setting("workspace-profile").onchange = save;
}

function loadProfileSettings() {
    const setting = x => document.getElementById(x);
    setting("profile-name").value = profile.name;
    setting("profile-theme").value = profile.theme;

    setting("profile-name").onchange = save;
    setting("profile-theme").onchange = save;
}

function loadMainfileSettings() {
    const setting = x => document.getElementById(x);
    setting("mainfile-default-profile").value = mainfile.default_profile;
}

function saveWorkspaceSettings() {
    const setting = x => document.getElementById(x);
    workspace.name = setting("workspace-name").value;
    workspace.theme = setting("workspace-theme").value;
    workspace.profile = setting("workspace-profile").value;
    window._api.write("main.json", JSON.stringify(window.mainfile));
    window._api.write(mainfile.workspaces[mainfile.latest_workspace], JSON.stringify(window.workspace));
}

function saveProfileSettings() {
    const setting = x => document.getElementById(x);
    profile.name = setting("profile-name").value;
    profile.theme = setting("profile-theme").value;
    window._api.write(mainfile.profiles[mainfile.default_profile], JSON.stringify(window.profile));
}

function save() {
    saveWorkspaceSettings();
    saveProfileSettings();
}

