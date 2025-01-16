function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", cleanCSS(theme.background));
    html.style.setProperty("--title-buttons", cleanCSS(theme.title_buttons));
    html.style.setProperty("--heading", cleanCSS(theme.heading));
    html.style.setProperty("--buttons", cleanCSS(theme.buttons));
    html.style.setProperty("--buttons-hover", cleanCSS(theme.buttons_hover));
    html.style.setProperty("--workspace-name", cleanCSS(theme.workspace_name));
    html.style.setProperty("--workspace-path", cleanCSS(theme.workspace_path));
    html.style.setProperty("--last-accessed", cleanCSS(theme.last_accessed));
    html.style.setProperty("--workspace-background", cleanCSS(theme.workspace_background));
    html.style.setProperty("--workspace-hover", cleanCSS(theme.workspace_hover));
    html.style.setProperty("--text", cleanCSS(theme.text));
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile));
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

function newWorkspace() {
    
}

main();