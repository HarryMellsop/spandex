const { dialog } = require('electron').remote;
const path = require('path');
const fs = require('fs');

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

/* global workercontroller */
var backend = new workercontroller.XdvipdfmxController(
    './xetex-js/xdvipdfmx.worker.js');
backend.texLiveManifestUrl = '../texlive.lst';
var controller = new workercontroller.XeLaTeXController(
    backend, './xetex-js/xetex.worker.js');
controller.xelatexFmtUrl = './xetex-js/xelatex.fmt';
controller.texLiveManifestUrl = './xetex-js/texlive.lst';

// Setup virtual filesystem and return a promise. We need to call this
// function every time the xetex image reloads, since the filesystem
// defaults to an in-memory filesystem with no persistence.
var doReload = function () {
    console.log('Reloading...');
    return controller.reload().then(stats => {
        console.log('Loaded.', stats);
    });
};

// Prepare the FS either when the program is ready again or when the user
// requests compile
var reloaded = doReload();
var isCompiling = false;

// link the compiler
document.getElementById('compileButton').addEventListener('click', () => {
    console.log("Beginning compilation");
    var sourceTextArea = document.getElementById('editor');

    console.log('Performing compilation...');
    controller.compile(sourceTextArea.value).then(function (pdfData) {
        console.log('Compilation complete.');
        var pdfBlob = new Blob([pdfData], { type: 'application/pdf' });

        // draw the PDF
        var previewUrl = URL.createObjectURL(pdfBlob);
        displayPDF(previewUrl);


    }, function (error) {
        console.error('Compilation error', error);
    })
});

function PDFTeXCompile() {
    var pdftex = new PDFTeX();
    var latex_code = document.getElementById("editor").innerHTML;

    pdftex.compile(latex_code)
        .then(function (pdf) {
            console.log("Trying to display PDF");
            displayPDF(pdf);
        });
}

function displayPDF(pdf) {

    // Since we only allow one file, just use the first one
    console.log(pdf)
    const filePath = pdf;

    const viewerEle = document.getElementById('viewer');
    viewerEle.innerHTML = ''; // destroy the old instance of PDF.js (if it exists)

    // Create an iframe that points to our PDF.js viewer, and tell PDF.js to open the file that was selected from the file picker.
    const iframe = document.createElement('iframe');
    iframe.src = filePath;

    // hide the picker element
    document.getElementsByClassName('picker')[0].style.display = "none"

    // Add the iframe to our UI.
    viewerEle.appendChild(iframe);
}