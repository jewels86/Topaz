const source = new URLSearchParams(location.href).get('source');
console.log(source);
console.log(location.href);
document.getElementById('frame').src = source.startsWith('https') || source.startsWith('http') ? source : 'https://' + source;
function endfunc() {}