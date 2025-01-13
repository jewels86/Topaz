async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile.replace("/", "\\")));
    const styles = loadTheme(profile.theme);
    console.log("Theme loaded.");
    window._api.setTitleBarColor(profile.theme.background3);
}

main();