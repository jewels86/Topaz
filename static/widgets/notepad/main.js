
const textarea = document.getElementById("text");
textarea.innerText = new URLSearchParams(location.href).get('text');

function endfunc(functions) {
    functions.setData('text', textarea.value);
    functions.log('Notepad saved');
}

