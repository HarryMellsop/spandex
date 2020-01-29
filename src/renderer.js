const { dialog } = require('electron').remote;
const path = require('path');

// Add an event listener to our button.
document.getElementById('myButton').addEventListener('click', () => {
    // When the button is clicked, open the native file picker to select a PDF.
    dialog.showOpenDialog({
        properties: ['openFile'], // set to use openFileDialog
        filters: [{ name: "PDFs", extensions: ['pdf'] }] // limit the picker to just pdfs
    }).then(result => {

        // Since we only allow one file, just use the first one
        const filePath = result.filePaths[0];

        const viewerEle = document.getElementById('viewer');
        viewerEle.innerHTML = ''; // destroy the old instance of PDF.js (if it exists)

        // Create an iframe that points to our PDF.js viewer, and tell PDF.js to open the file that was selected from the file picker.
        const iframe = document.createElement('iframe');
        iframe.src = path.resolve(__dirname, `../public/pdfjs/web/viewer.html?file=${filePath}`);

        // hide the picker element
        document.getElementsByClassName('picker')[0].style.display = "none"

        // Add the iframe to our UI.
        viewerEle.appendChild(iframe);
    })
});

// link the compiler

document.getElementById('compileButton').addEventListener('click', () => {
    console.log("Beginning compilation");
    var pdftex = new PDFTeX();
    var latex_code = "" +
    "\\documentclass{article}" +
    "\\begin{document}" +
    "\\LaTeX is great!" +
    "$E = mc^2$" +
    "\\end{document}";

    pdftex.compile(latex_code)
        .then(function(pdf) {
            console.log("Trying to open the window");
            window.open(pdf) 
        });
});