var currentColumns = 0;
var currentRows = 0;
let overlayOpen = false;
let currentWidgetCount = 0;
let data = {};
let workspace = {};

function setUp() {
    const container = document.getElementById('container');
    container.style.gridTemplateColumns = 'minmax(0, 1fr)';

    if (window.api.fs.exists('data.json')) {
        window.api.fs.save('data.json', JSON.stringify({ workspaces: { default: { path: "workspaces/default.json" } }, latest: "default" }));
        window.api.fs.mkdir('workspaces');
        window.api.fs.save('workspaces/default.json', JSON.stringify({ name: "Default Workspace", widgets: [] }));
    }

    data = window.api.fs.read('data.json');
    workspace = window.api.fs.read(data.workspace[data.latest].path);

    workspace.widgets.forEach(widget => {
        loadWidget(
            document.getElementById('container'),
            widget.name,
            widget.id,
            widget.settings,
            widget.data,
        );
    });
}

/**
 * Loads the widget given into the container.
 * @param {HTMLDivElement} parent Container to load into in the form of a div.
 * @param {string} name Name of the widget to loading.
 * @param {string} id ID of the widget.
 * @param {object} settings The widget's settings.
 * @param {object} data The widget's data.
 * @param {function} onError A function to be performed if an error occurs.
 * @returns {bool} True if successful, false if not.  
 */
async function loadWidget(parent, name, id, settings, data, onError=(err)=>console.error(err)) {
    if (name == null || settings == null) { onError(new Error("One required parameter is null.")); return false; }
    if (name.length = 0) { onError(new Error("'name' parameter is empty.")); return false; }

    const settingsHas = (x) => Object.hasOwn(settings, x);
    const dataHas = (x) => Object.hasOwn(data, x);

    const prevColumns = currentRows;
    const prevRows = currentRows;

    var coords = '';
    if (settingsHas('x')) { settings.x += 1; coords += settings.x; }
    else { coords += '/0' }

    if (settingsHas('y')) { settings.y += 1; coords += '/' + settings.y; }
    else { coords += '/' + '0'; }

    currentColumns += (parseInt(coords.split("/")[0]) - currentColumns) >= 0 ? parseInt(coords.split("/")[0]) - currentColumns : 0;
    currentRows += (parseInt(coords.split("/")[1]) - currentRows) >= 0 ? parseInt(coords.split("/")[1]) - currentRows : 0;

    for (let y = prevRows; y < currentRows; y++) {
        parent.style.gridTemplateRows += ' minmax(0, 1fr)';
    }
    for (let x = prevColumns; x < currentColumns; x++) {
        parent.style.gridTemplateColumns += ' minmax(0, 1fr)';
    }
    for (let x = 1; x <= currentColumns; x++) {
        for (let y = 1; y <= currentRows; y++) {
            if (document.getElementById(x + '/' + y) != null) { continue; }
            const tmp = document.createElement('div');
            tmp.id = x + '/' + y;
            parent.appendChild(tmp);
        }
    }

    for (let x = coords.split('/')[0] + 1; x <= coords.split('/')[0] + (settingsHas('width') ? settings.width : 1); x++) {
        const block = document.getElementById(x + '/' + coords.split('/')[1]);
        if (block == null) { continue; }
        block.remove();
    }
    for (let y = coords.split('/')[1] + 1; y <= coords.split('/')[1] + (settingsHas('height') ? settings.height : 1); y++) {
        const block = document.getElementById(coords.split('/')[0] + '/' + y);
        if (block == null) { continue; }
        block.remove();
    }

    const container = document.getElementById(coords);
    container.className = 'widget';
    container.style.gridColumn = `${coords.split('/')[0]} / ${settingsHas('width') ? parseInt(coords.split('/')[0]) + settings.width : parseInt(coords.split('/')[0])}`;
    container.style.gridRow = `${coords.split('/')[1]} / ${settingsHas('height') ? parseInt(coords.split('/')[1]) + settings.height : parseInt(coords.split('/')[1])}`;


    if (settingsHas('height')) delete settings.height;
    if (settingsHas('width')) delete settings.width;
    if (settingsHas('x')) delete settings.x;
    if (settingsHas('y')) delete settings.y;

    const subdiv = document.createElement('div');
    subdiv.className = "subdiv";
    subdiv.innerHTML = `<div><p>${name}</p></div>\n<div><button id="${container.id}-btn">Settings</div>`

    const widgetData = JSON.parse(await (await fetch(`../static/widgets/${id}/${id}.widget.json`)).text());
    if (widgetData == null) { throw new Error("Widget data can't be found."); }

    const iframe = document.createElement('iframe');
    iframe.src = `../static/widgets/${id}/${widgetData.entry.path}`;

    var settingsArray = Object.keys(settings).map((key) => [key, settings[key]]);
    settingsArray.forEach((setting, index) => {
        //if (!settingsHas(setting[0])) { return; }
        if (widgetData.settings[setting[0]].type != typeof setting[1]) {
            console.log(`Settings value ${setting[1]} (${typeof setting[1]} - from ${setting[0]}) is not of type ${widgetData.settings[setting[0]].type}`); 
            return; 
        }

        if (index === 0) { iframe.src += '?'; }
        iframe.src += `${setting[0]}=${setting[1]}`;
        if (!(index === settingsArray.length)) { iframe.src += '&'; }
    });
    var dataArray = Object.keys(data).map((key) => [key, data[key]]);
    dataArray.forEach((value, index) => {
        //if (Object.hasOwn(widgetData.data, value[0])) { return; }
        if (widgetData.data[value[0]].type != typeof value[1]) { 
            //console.log(`Data value ${value[1]} (${typeof value[1]} - from ${value[0]}) is not of type ${widgetData.data[value[0]].type}`);
            if (Object.hasOwn(widgetData.data[value[0]], 'default')) { value[1] == widgetData.data[value[0]].default; }
            else { return; }
        }

        if (index === 0) { if (iframe.src.includes('?')) { iframe.src += "&"; } else { iframe.src += "?"; } }
        iframe.src += `${value[0]}=${value[1]}`;
        if (!(index === dataArray.length)) { iframe.src += '&'; }
    });

    container.appendChild(subdiv);
    container.appendChild(iframe);

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

            settingsArray.forEach((value) => {
                const div = document.createElement('div');
                div.style.display = 'flex';
                div.style.flexDirection = 'row';
                div.style.width = '100%';
                div.appendChild(document.createElement('p').innerText = value[0]);
                div.appendChild((document.createElement('input')).value = value[1]);
            });
        }
    });
}

function newWidget() {}