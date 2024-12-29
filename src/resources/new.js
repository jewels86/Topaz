async function startNewWidget() {
    window.mainfile = JSON.parse((await window._api.read("main.json")));
    window.workspace = JSON.parse((await window._api.read(mainfile.workspaces[mainfile.latest_workspace])));
    window.profile = JSON.parse((await window._api.read(window.workspace.profile != "" ? window.workspace.profile: mainfile.profiles[mainfile.default_profile])));
    window._vars = {};
    setTheme(profile.theme);
}

function finish() {
    _api.createWidget(
        document.getElementById("id").value, // !! this wont work
        document.getElementById("name").value,
        document.getElementById("author").value,
        document.getElementById("y").value,
        document.getElementById("h").value,
        document.getElementById("w").value
    );
}