const defaultHeight = 300;
const defaultWidth = 400;
let overlayOpen = false;
/**
 * Loads the widget given into the container.
 * @param {HTMLDivElement} container Container to load into in the form of a div.
 * @param {string} name Name of the widget to loading.
 * @param {string} id ID of the widget.
 * @param {object} settings The widget's settings.
 * @param {object} data The widget's data.
 * @param {function} onError A function to be performed if an error occurs.
 * @returns {bool} True if successful, false if not.  
 */
function loadWidget(container, name, id, settings, data, onError=(err)=>console.error(err)) {
    if (container == null || name == null || settings == null) { onError(new Error("One required parameter is null.")); return false; }
    if (!document.contains(container)) { onError(new Error("Document does not contain the given container.")); return false; }
    if (name.length = 0) { onError(new Error("'name' parameter is empty.")); return false; }

    if (container.className != "widget") container.className = "widget";
    // Checks finished, All are non-null and operable.

    const settingsHasHeight = Object.hasOwn(settings, 'height');
    const settingsHasWidth = Object.hasOwn(settings, 'width');
    const settingsHasX = Object.hasOwn(settings, 'x');
    const settingsHasY = Object.hasOwn(settings, 'y');

    container.style.height = `${settingsHasHeight ? settings.height : defaultHeight}px`;
    container.style.width = `${settingsHasWidth ? settings.width : defaultWidth}px`;
    if (settingsHasX) container.style.gridColumn = settings.x;
    if (settingsHasY) container.style.gridRow = settings.y;
    // Container configured. 
    if (settingsHasHeight) delete settings.height;
    if (settingsHasWidth) delete settings.width;
    if (settingsHasX) delete settings.x;
    if (settingsHasY) delete settings.y;
    // Cleaned up.

    const subdiv = document.createElement('div');
    subdiv.className = "subdiv";
    subdiv.innerHTML = `
<div><p>${name}</p></div>
<div><button id="${container.id}-btn">Settings</div>
    `
    // Subdiv configured.

    const iframe = document.createElement('iframe');
    iframe.src = `../static/widgets/${id}/index.html`;
    var settingsArray = Object.keys(settings).map((key) => [key, settings[key]]);
    settingsArray.forEach((setting, index) => {
        if (index === 0) { iframe.src += '?'; }
        iframe.src += `${setting[0]}=${setting[1]}`;
        if (!(index === settingsArray.length)) { iframe.src += '&'; }
    });
    var dataArray = Object.keys(data).map((key) => [key, data[key]]);
    dataArray.forEach((value, index) => {
        if (index === 0) { iframe.src += "&"; }
        iframe.src += `${value[0]}=${value[1]}`;
        if (!(index === dataArray.length)) { iframe.src += '&'; }
    });
    // IFrame configured.

    container.appendChild(subdiv);
    container.appendChild(iframe);
    // Finished.

    document.getElementById(`${container.id}-btn`).addEventListener('click', (ev) => {
        if (overlayOpen === true) { 
            var overlay = document.getElementById(`${container.id}-overlay`);
            overlay.parentNode.removeChild(overlay);
            overlayOpen = false;
        } else {
            const overlay = document.createElement('div');
            overlay.className = "overlay";
            overlay.id = `${container.id}-overlay`;
            overlay.style.visibility = 'visible';
            document.body.appendChild(overlay);
            overlayOpen = true;
        }
        
    });
}