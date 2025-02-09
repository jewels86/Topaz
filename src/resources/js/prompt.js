function loadTheme(theme) {
    const html = document.getElementsByTagName("html")[0];
    html.style.setProperty("--background", escapeCSS(theme.background));
    html.style.setProperty("--heading", escapeCSS(theme.heading));
    html.style.setProperty("--questions", escapeCSS(theme.questions));
    html.style.setProperty("--text", escapeCSS(theme.text));
    html.style.setProperty("--input-background", escapeCSS(theme.input_background));
    html.style.setProperty("--input-border", escapeCSS(theme.input_border));
    html.style.setProperty("--input-text", escapeCSS(theme.input_text));
    html.style.setProperty("--submit-text", escapeCSS(theme.submit_text));
    html.style.setProperty("--submit-background", escapeCSS(theme.submit_background));
}

function createQuestionElement(question) {
    const container = document.createElement('div');
    container.className = 'question';

    const label = document.createElement('label');
    label.innerText = question.name;
    container.appendChild(label);

    let input;
    switch (question.type) {
        case 'text':
            input = document.createElement('input');
            input.type = 'text';
            input.classList.add('prompt-text', 'prompt')
            break;
        case 'selection':
            input = document.createElement('input');
            input.type = 'radio';
            input.classList.add('prompt-selection', 'prompt')
            break;
        case 'dropdown':
            input = document.createElement('select');
            question.options.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option;
                opt.innerText = option;
                input.appendChild(opt);
            });
            break;
        case 'slider':
            input = document.createElement('input');
            input.type = 'range';
            input.min = question.min;
            input.max = question.max;
            break;
        default:
            console.error('Unknown question type:', question.type);
            return null;
    }

    container.appendChild(input);
    return container;
}

function loadQuestions(questions) {
    const container = document.getElementById('questions-container');
    questions.forEach(question => {
        const questionElement = createQuestionElement(question);
        if (questionElement) {
            container.appendChild(questionElement);
        }
    });
}

async function main() {
    await bootstrap();
    console.log("Bootstrapped.");
    console.log("Loading theme...");

    const profile = JSON.parse(await _api.read(await window._api.getDirectory() + "\\" + window._data.mainfile.default_profile));
    loadTheme(profile.theme.prompt);
    
    console.log("Theme loaded.");

    console.log("Fetching parameters...");
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const questions = JSON.parse(urlParams.get('questions'));

    document.getElementsByTagName("title")[0].innerHTML = title;

    console.log("Parameters fetched: ", title, questions);
    console.log("Loading prompt...");

    loadQuestions(questions);

    console.log("Prompt loaded.");
}

main();