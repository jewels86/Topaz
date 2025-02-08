var grid = [[]];
var gridElement = document.getElementsByTagName("main")[0];

function initialize() {

}

function accommodate(sx, sy, ex, sy) {
    for (let i = grid.length; i <= ex; i++) {
        grid.push([]);
    }
    for (let i = 0; i < grid.length; i++) {
        for (let j = grid[i].length; j <= sy; j++) {
            grid[i].push(null);
        }
    }

    gridElement.style.gridTemplateColumns = `repeat(${grid.length}, 1fr)`;
    gridElement.style.gridTemplateRows = `repeat(${grid[0].length}, 1fr)`;
}
function getSource(id) {
    var src = null;
    window.mainfile.known_widgets.forEach(widget => {
        if (widget.id === id) {
            src = widget.src;
        }
    });
    return src;
}

function widget(x, y, w, h, id, settings, data, allowsOverlap = false) {
    endx = x + (w - 1);
    endy = y + (h - 1);
    accommodate(x, y, endx, endy);

    for (let i = x; i <= endx; i++) {
        for (let j = y; j <= endy; j++) {
            if (grid[i][j] !== null) {
                var item = null;
                if (grid[i][j].ref !== undefined) item = grid[i][j].ref;
                else item = grid[i][j];
                if (item.allowsOverlap) { 
                    item.widget(x, y, w, h, id, settings, data, allowsOverlap); 
                    return true, "success-overlap";
                }
            }
        }
    }

    grid[x][y] = {
        x: x,
        y: y,
        w: w,
        h: h,
        id: id,
        settings: settings,
        data: data,
        allowsOverlap: allowsOverlap
    };
    for (let i = x; i <= endx; i++) {
        for (let j = y; j <= endy; j++) {
            if (i !== x || j !== y) {
                grid[i][j] = { ref: grid[x][y] };
            }
        }
    }

    const element = document.createElement("div");
    element.classList.add("widget");
    
    const frame = document.createElement("iframe");
    frame.src = getSource(id);
    frame.classList.add("widget-frame");
    element.appendChild(frame);

    gridElement.appendChild(element);

    return true, "success";
}