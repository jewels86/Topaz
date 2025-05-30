async function main() {
    const frame = document.getElementById("frame");
    const url = new URLSearchParams(window.location.search).get("src");
    frame.src = url;
    frame.onload = () => {
        const title = document.getElementById("title");
        title.innerText = frame.contentDocument.title;
    };
}

main();