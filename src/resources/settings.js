let page;

async function startSettings() {
    window.mainfile = JSON.parse((await window._api.read("main.json")));
    window.profile = JSON.parse((await window._api.read(mainfile.profiles[0])));
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
    setting("workspace-name").value = profile.name;
    setting("workspace-theme").value = profile.theme;
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
}