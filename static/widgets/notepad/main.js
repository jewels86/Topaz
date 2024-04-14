import { getWidgetArguments } from '../widget.js';

const textarea = document.getElementById("text");
textarea.innerText = getWidgetArguments().text;