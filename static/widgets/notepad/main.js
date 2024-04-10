import { getSettings } from '../widget.js';

const textarea = document.getElementById("text");
textarea.innerText = getSettings().get("text");