let page;

async function startSettings() {
    window.mainfile = JSON.parse((await window._api.read("main.json")));
    window.profile = JSON.parse((await window._api.read(mainfile.profiles[mainfile.latest_profile])));
    window.workspace = JSON.parse((await window._api.read(mainfile.workspace[mainfile.latest_workspace])));
    window._vars = {};
    setTheme(profile.theme);

    loadWorkspaceSettings();
    loadProfileSettings();

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
}

function loadProfileSettings() {
    const setting = x => document.getElementById(x);
    setting("profile-name").value = profile.name;
    setting("profile-theme").value = profile.theme;
}

function saveWorkspaceSettings() {
    const setting = x => document.getElementById(x);
    profile.name = setting("profile-name").value;
    profile.theme = setting("profile-theme").value;
    workspace.name = setting("workspace-name").value;
    workspace.theme = setting("workspace-theme").value;
    window._api.write("main.json", JSON.stringify(window.mainfile));
    window._api.write(mainfile.profiles[mainfile.latest_profile], JSON.stringify(window.profile));
    window._api.write(mainfile.workspace[mainfile.latest_workspace], JSON.stringify(window.workspace));
}