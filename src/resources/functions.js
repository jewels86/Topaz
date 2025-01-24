function cleanCSS(css) {
    if (css === undefined) return "inherit";
    return css.replace(/[^#a-fA-F0-9]/g, '');
}

async function resolveFilePath(path) {
    if (await _api.isAbsolute(path)) return path;
    else return await _api.pathJoin(await _api.getDirectory(), path);
}