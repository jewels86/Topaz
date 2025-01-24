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
    console.log("Loading workspace...");

    const workspacePath = await _api.workspace();
    const workspace = JSON.parse(await _api.read(resolveFilePath(workspacePath)));
    window.workspace = workspace;

    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(resolveFilePath(window.workspace.profile)));
    loadTheme(profile.theme.index);
    window.profile = profile;

    console.log("Theme loaded.");

    console.log("Loading status bar...");
    
}

main()