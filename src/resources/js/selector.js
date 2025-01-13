function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", theme.background);
    html.style.setProperty("--title-buttons", theme.title_buttons);
    html.style.setProperty("--heading", theme.heading);
    html.style.setProperty("--buttons", theme.buttons);
    html.style.setProperty("--buttons-hover", theme.buttons_hover);
    html.style.setProperty("--workspace-name", theme.workspace_name);
    html.style.setProperty("--workspace-path", theme.workspace_path);
    html.style.setProperty("--last-accessed", theme.last_accessed);
    html.style.setProperty("--workspace-background", theme.workspace_background);
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile.replace("/", "\\")));
    loadTheme(profile.theme.selector);
    
    console.log("Theme loaded.");
    window._api.setTitleBarColor(profile.theme.selector.title_buttons);

    window._data.mainfile.known_workspaces.forEach(workspace => {
        const element = document.createElement("div");
        element.classList.add("workspace");
        element.innerHTML = `
        <div>
            <button class="no-button-style"><h2>${workspace.name}</h2></button>
            <h3>${workspace.path}</h3>
        </div>
        <p>Last Accessed: ${workspace.last_accessed}</p>
        `
        document.getElementById("workspaces").appendChild(element);
    });
}

main();