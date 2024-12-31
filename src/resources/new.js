async function startNewWidget() {
    window.mainfile = JSON.parse((await window._api.read("main.json")));
    window.workspace = JSON.parse((await window._api.read(mainfile.workspaces[mainfile.latest_workspace])));
    window.profile = JSON.parse((await window._api.read(window.workspace.profile != "" ? window.workspace.profile: mainfile.profiles[mainfile.default_profile])));
    window._vars = {};
    setTheme(profile.theme);
}

function finish() {
    const widget = {
        name: document.getElementById("name").value,
        x: document.getElementById("x").value,
        y: document.getElementById("y").value,
        width: document.getElementById("width").value,
        height: document.getElementById("height").value,
        id: document.getElementById("id").value
    }
    window.workspace.widgets.push(widget);
    window._api.write(mainfile.workspaces[mainfile.latest_workspace], JSON.stringify(window.workspace));
}