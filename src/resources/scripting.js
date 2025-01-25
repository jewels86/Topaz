window.scripting = {
    getProfileName: () => window.profile.name,
    getProfileTheme: () => window.profile.theme.index,
    getProfileStatusBar: () => window.profile.status_bar,
    getWorkspaceStatusBar: () => window.workspace.status_bar,
    getWorkspacePath: () => window.workspacePath,
    getProfilePath: () => window.workspace.profile,
}

function cleanHTML(html) {
    return html.replace(/<[^>]*>?/gm, '');
}

function interpret(script) {
    script = cleanHTML(script);
    return script.replace(/\$\{(\w+)(?:\((.*?)\))?\}/g, (match, p1, p2) => {
        const func = window.scripting[p1];
        if (typeof func === 'function') {
            const args = p2 ? p2.split(',').map(arg => arg.trim()) : [];
            return func(...args);
        }
        return match;
    });
}