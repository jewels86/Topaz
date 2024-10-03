const fs = require('node:fs')

async function write(path, x) {
    fs.writeFileSync(path, x, (err) => {
        if (err) throw err
    })
    return true;
}
function read(path) {
    try {
        return fs.readFileSync(path, {encoding:'utf-8'})
    }
    catch (err) { throw err }
}
function exists(path) {
    try {
        fs.accessSync(path, fs.constants.F_OK)
        return true
    }
    catch { return false }
}
function mkdir(path) {
    try {
        fs.mkdirSync(path)
        return true
    }
    catch (err) { throw err }
}

function getSecureData(id) {
    const keytar = require('keytar')
}
function setSecureData(id, value) {
    const keytar = require('keytar')
}

module.exports = {
    write, read, exists, mkdir,
    getSecureData, setSecureData
}