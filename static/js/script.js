const uploadArea = document.getElementById('upload-area');
const pdfInput = document.getElementById('pdf-input');
const fileList = document.getElementById('file-list');
const mergeBtn = document.getElementById('merge-btn');
const downloadLink = document.getElementById('download-link');
const loading = document.getElementById('loading');

let files = [];

// Handle drag-and-drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e94560';
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#00ffcc';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#00ffcc';
    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
});

// Handle file input click
uploadArea.addEventListener('click', () => {
    pdfInput.click();
});

pdfInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(newFiles) {
    files = [...files, ...newFiles].filter(file => file.type === 'application/pdf');
    updateFileList();
}

function updateFileList() {
    if (files.length === 0) {
        fileList.innerHTML = '<p>No PDFs Selected</p>';
        mergeBtn.disabled = true;
    } else {
        let list = '<ul>';
        files.forEach((file, index) => {
            list += `<li>${file.name}</li>`;
        });
        list += '</ul>';
        fileList.innerHTML = list;
        mergeBtn.disabled = files.length < 2;
    }
}

// Handle merge button click
mergeBtn.addEventListener('click', () => {
    if (files.length < 2) return;

    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));

    // Show loading spinner
    loading.style.display = 'block';
    mergeBtn.disabled = true;
    downloadLink.style.display = 'none';

    fetch('/merge', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loading.style.display = 'none';
        if (data.error) {
            alert(data.error);
        } else {
            downloadLink.href = data.download_url;
            downloadLink.style.display = 'block';
        }
        mergeBtn.disabled = false;
    })
    .catch(error => {
        loading.style.display = 'none';
        alert('An error occurred: ' + error);
        mergeBtn.disabled = false;
    });
});