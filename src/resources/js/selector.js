async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile.replace("/", "\\")));
    loadTheme(profile.theme);
    console.log("Theme loaded.");
    window._api.setTitleBarColor(profile.theme.background3);

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