function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", escapeCSS(theme.background));
    html.style.setProperty("--heading", escapeCSS(theme.heading));
    html.style.setProperty("--buttons", escapeCSS(theme.buttons));
    html.style.setProperty("--buttons-hover", escapeCSS(theme.buttons_hover));
    html.style.setProperty("--marketplace-name", escapeCSS(theme.marketplace_name));
    html.style.setProperty("--marketplace-url", escapeCSS(theme.marketplace_url));
    html.style.setProperty("--marketplace-background", escapeCSS(theme.marketplace_background));
    html.style.setProperty("--marketplace-hover", escapeCSS(theme.marketplace_hover));
    html.style.setProperty("--text", escapeCSS(theme.text));
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile));
    loadTheme(profile.theme.marketplace_selector);
    
    console.log("Theme loaded.");

    window._data.mainfile.known_marketplaces.forEach(marketplace => {
        const element = document.createElement("div");
        element.classList.add("marketplace");
        element.onclick = () => openMarketplaceSite(marketplace.src);
        element.innerHTML = `
        <h2>${marketplace.name}</h2>
        <h3>${marketplace.src}</h3>
        `
        document.getElementById("marketplaces").appendChild(element);
    });
}

function openMarketplaceSite(marketplace) {
    window._api.openMarketplaceSite(marketplace);
}
function openSelector() {
    window._api.openSelector();
}
async function newMarketplace() {
    const questions = [
        {
            name: "Name",
            type: "text"
        },
        {
            name: "URL",
            type: "text"
        }
    ]
    const answer = await window._api.openPrompt("New Marketplace", questions);
}

main();