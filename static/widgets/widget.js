function getSettings() {
    return new URLSearchParams(document.location.href.split('?')[1]);
}

module.exports = {
    getSettings: getSettings
}