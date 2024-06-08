import { getWidgetArguments } from '../widget.js';

document.getElementById('1').innerText = 'setting1 is ' + getWidgetArguments().setting1;
console.log(getWidgetArguments().setting1);
window.api.debug('Hello world!');