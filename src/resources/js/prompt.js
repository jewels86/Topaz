function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", escapeCSS(theme.background));
    html.style.setProperty("--title-buttons", escapeCSS(theme.title_buttons));
    html.style.setProperty("--heading", escapeCSS(theme.heading));
    html.style.setProperty("--buttons", escapeCSS(theme.buttons));
    html.style.setProperty("--buttons-hover", escapeCSS(theme.buttons_hover));
    html.style.setProperty("--workspace-name", escapeCSS(theme.workspace_name));
    html.style.setProperty("--workspace-path", escapeCSS(theme.workspace_path));
    html.style.setProperty("--last-accessed", escapeCSS(theme.last_accessed));
    html.style.setProperty("--workspace-background", escapeCSS(theme.workspace_background));
    html.style.setProperty("--workspace-hover", escapeCSS(theme.workspace_hover));
    html.style.setProperty("--text", escapeCSS(theme.text));
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile));
    loadTheme(profile.theme.prompt);
    
    console.log("Theme loaded.");

    console.log("Fetching parameters...");
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const questions = JSON.parse(urlParams.get('questions'));

    window.getElementsByTagName("title")[0].innerHTML = title;
}