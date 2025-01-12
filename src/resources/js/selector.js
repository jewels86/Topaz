async function main() {
    bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(window._data.mainfile.default_profile));
    const styles = loadTheme(profile.theme);
    console.log("Theme loaded.");
    window._api.setTitleBarColor(styles.getPropertyValue('--background-3'));
}

main();