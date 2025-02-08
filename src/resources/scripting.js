window.scripting = {
    getProfileName: () => window.profile.name,
    getProfileTheme: () => window.profile.theme.index,
    getProfileStatusBar: () => window.profile.status_bar,
    getWorkspaceName: () => window.workspace.name,
    getWorkspaceStatusBar: () => window.workspace.status_bar,
    getWorkspacePath: () => window.workspacePath,
    getProfilePath: () => window.workspace.profile,

    openSelector: () => window._api.openSelector(),
    openSettings: () => window._api.openSettings(),
    openMarketplace: () => window._api.openMarketplace(),
}

function interpret(script) {
    script = escapeHTML(script);
    return script.replace(/\$\{(\w+)(?:\((.*?)\))?\}/g, (match, p1, p2) => {
        const func = window.scripting[p1];
        if (typeof func === 'function') {
            const args = p2 ? p2.split(',').map(arg => arg.trim()) : [];
            return func(...args);
        }
        return match;
    });
}