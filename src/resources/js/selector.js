async function main() {
    bootstrap();

    const styles = loadTheme();
    window._api.setTitleBarColor(styles.getPropertyValue('--background-3'));
}

main();