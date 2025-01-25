function escapeCSS(css) {
    if (css === undefined) return "inherit";
    if (/^#[0-9a-fA-F]{6}$/.test(css) || /^[0-9]*\.?[0-9](px|em|rem|vw|vh|vmin|vmax)$/.test(css)) return css;
    return "inherit";
}
function escapeHTML(html) {
    return html.replace(/<[^>]*>?/gm, '');
}

async function resolveFilePath(path) {
    if (await _api.isAbsolute(path)) return path;
    else return await _api.pathJoin(await _api.getDirectory(), path);
}