function cleanCSS(css) {
    if (css === undefined) return "inherit";
    return css.replace(/[^#a-fA-F0-9]/g, '');
}