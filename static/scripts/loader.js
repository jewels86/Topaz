var currentColumns = 0;
var currentRows = 0;
let overlayClose = () => {};
let currentWidgetCount = 0;
let data = {};
let workspace = {};
const widgetParts =                 ["Name", "ID"];
const extraWidgetParts =            ["X", "Y", "Width", "Height"];
const extraWidgetPartsDefaults =    [() => 0, () => parseInt(currentRows), () => 1, () => 1];
const column = ' minmax(28%, 1fr)'
const row = ' minmax(28%, 1fr)';

function forAllBlocks(f) {
    for (let y = 1; y <= currentRows; y++) {
        for (let x = 1; x <= currentColumn; x++) {
            f(document.getElementById(x + '/' + y));
        }
    }
} 

/**
 * Sets up the app for execution.
 */
async function setUp() {
    const container = document.getElementById('container');
    //container.style.gridTemplateColumns = 'minmax(0, 1fr)';

    if (await window.api.fs.exists('data.json') != true) {
        window.api.fs.save('data.json', JSON.stringify({ workspaces: { default: { path: "workspaces/default.json" } }, latest: "default" }));
        window.api.fs.mkdir('workspaces');
        window.api.fs.save('workspaces/default.json', JSON.stringify({ name: "Default Workspace", widgets: [] }));
    }

    const decoder = new TextDecoder();
    data = JSON.parse(decoder.decode(await window.api.fs.read('data.json')));
    workspace = JSON.parse(decoder.decode(await window.api.fs.read(data.workspaces[data.latest].path)));

    workspace.widgets.forEach(async widget => {
        await loadWidget(container, widget.name, widget.id, widget.settings, widget.data);
    });
}

/**
 * Loads the widget given into the parent.
 * @param {HTMLDivElement} parent parent to load into in the form of a div.
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

    var foundY;
    var coords = '';
    if (settingsHas('x')) { settings.x += 1; coords += settings.x; }
    else { 
        for (let y = 1; y <= currentRows; y++) {
            for (let x = 1; x <= currentColumns; x++) {
                if (document.getElementById(x + '/' + y) == null) { coords += x; foundY = y; }
            }
        }
        currentRows += 1;
        foundY = currentRows;
        coords += 1;
    }

    if (settingsHas('y')) { settings.y += 1; coords += '/' + settings.y; }
    else { coords += '/' + foundY; }
    console.log(coords);
    currentColumns += (parseInt(coords.split("/")[0]) - currentColumns) >= 0 ? parseInt(coords.split("/")[0]) - currentColumns : 0;
    currentRows += (parseInt(coords.split("/")[1]) - currentRows) >= 0 ? parseInt(coords.split("/")[1]) - currentRows : 0;

    for (let y = prevRows; y < currentRows; y++) {
        parent.style.gridTemplateRows += row;
    }
    for (let x = prevColumns; x < currentColumns; x++) {
        parent.style.gridTemplateColumns += column;
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

    
}

function trim() {
    const container = document.getElementById('container');
    const getgtc = () => container.style.gridTemplateColumns;
    for (; currentColumns < getgtc().split('minmax').length - 1;) {
        console.log(currentColumns);
        console.log(getgtc().split(column).length - 1);
        container.style.gridTemplateColumns = getgtc().substring(0, getgtc().lastIndexOf('minmax'))
        //forAllBlocks(x => { if (parseInt(x.id.split('/')[0]) )})
    }
    const getgtr = () => container.style.gridTemplateRows;
    for (; currentRows < getgtr().split(row).length - 1;) {
        container.style.gridTemplateRows = getgtr().substring(0, getgtr().lastIndexOf(row));
    }
}

/**
 * Creates a new widget.
 */
async function newWidget() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    overlayClose();

    widgetParts.forEach(async (part) => {
        if (String(part) == "ID") {
            const ids = (await window.api.fs.ls('static/widgets')).filter(d => !d.includes('.'));
            const stack = document.createElement('select');
            stack.id = 'id';
            ids.forEach(async id => {
                const widgetData = JSON.parse(new TextDecoder().decode(await window.api.fs.read(`static/widgets/${id}/${id}.widget.json`)));
                const option = document.createElement('option');
                option.value = id;
                option.innerText = widgetData.name;
                stack.appendChild(option);
                
            });
            const subdiv = document.createElement('div');
            subdiv.className = 'horizontal-subdiv';
            const p = document.createElement('p');
            p.innerText = part;
            subdiv.appendChild(p);
            subdiv.appendChild(stack);
            overlay.appendChild(subdiv);
            return;
        }
        part = String(part);
        const subdiv = document.createElement('div');
        subdiv.className = 'horizontal-subdiv';
        const p = document.createElement('p');
        p.innerText = part;
        const input = document.createElement('input');
        input.id = part.toLowerCase();
        subdiv.appendChild(p);
        subdiv.appendChild(input);
        overlay.appendChild(subdiv);
    });

    await new Promise((r) => setTimeout(r, 100));

    extraWidgetParts.forEach(part => {
        part = String(part);

        const subdiv = document.createElement('div');
        subdiv.className = 'horizontal-subdiv';
        const p = document.createElement('p');
        p.innerText = part;
        const input = document.createElement('input');
        input.id = part.toLowerCase();

        subdiv.appendChild(p);
        subdiv.appendChild(input);
        overlay.appendChild(subdiv);
    });

    await new Promise((r) => setTimeout(r, 100));

    const submit = document.createElement('button');
    submit.innerText = "Create";
    submit.addEventListener('click', (ev) => {
        const settings = {};
        extraWidgetParts.forEach((part, index) => { settings[part.toLowerCase()] = document.getElementById(part.toLowerCase()).value == '' ? extraWidgetPartsDefaults[index]() : parseInt(document.getElementById(part.toLowerCase()).value); })
        console.log(settings);
        loadWidget(document.getElementById('container'), document.getElementById('name').value, document.getElementById('id').value, settings, {});
        trim();
        closeOverlay();
    });
    overlay.appendChild(submit);

    document.body.appendChild(overlay);
    closeOverlay = () => overlay.remove();
}