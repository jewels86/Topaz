export function getWidgetArguments() {
    return Object.fromEntries([...new URLSearchParams(document.location.href.split('?')[1])]);
}