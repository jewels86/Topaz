function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", theme.background);
    html.style.setProperty("--status-bar", theme.status_bar);
    html.style.setProperty("--status-bar-text", theme.status_bar_text);
    html.style.setProperty("--status-bar-hover", theme.status_bar_hover);
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading workspace...");

    const workspacePath = await _api.workspace();
    const workspace = JSON.parse(await _api.read(await resolveFilePath(workspacePath)));
    window.workspace = workspace;

    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await resolveFilePath(window.workspace.profile)));
    loadTheme(profile.theme.index);
    window.profile = profile;

    console.log("Theme loaded.");

    console.log("Loading status bar...");
    addStatusBarItems(profile.status_bar, document.getElementById("status-bar-left"));
    addStatusBarItems(workspace.status_bar, document.getElementById("status-bar-right"));
    console.log("Status bar loaded.");
}

function addStatusBarItems(items, parent) {
    items.forEach(item => {
        var element;
        item.content = interpret(item.content);
        if (item.type === "button") {
            element = document.createElement("button");
            element.innerHTML = item.content;
            element.classList.add("status-bar-item", "status-bar-button", "no-button-style");
        }
        else if (item.type === "text") {
            element = document.createElement("p");
            element.innerHTML = item.content;
            element.classList.add("status-bar-item", "status-bar-text");
        }
        else if (item.type === "dropdown") {
            element = document.createElement("select");
            element.textContent = item.content;
            element.classList.add("status-bar-item", "status-bar-dropdown");
            item.options.forEach(option => {
                var optionElement = document.createElement("option");
                optionElement.innerHTML = option.content;
                optionElement.value = option.value;
                element.appendChild(optionElement);
            });
        }
        parent.appendChild(element);
    });
}

main()