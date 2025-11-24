const photoInput = document.getElementById('photoInput');
const fileInputLabel = document.querySelector('.file-input-label');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('previewImg');
const previewActions = document.getElementById('previewActions');
const removeBtn = document.getElementById('removeBtn');
const submitBtn = document.getElementById('submitBtn');
const photoForm = document.getElementById('photoForm');

photoInput.addEventListener('change', handleFileSelect);
photoForm.addEventListener('dragover', handleDragOver);
photoForm.addEventListener('drop', handleDrop);
removeBtn.addEventListener('click', removePhoto);

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        displayPreview(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    photoForm.style.opacity = '0.7';
}

function handleDrop(e) {
    e.preventDefault();
    photoForm.style.opacity = '1';
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
        photoInput.files = files;
        displayPreview(files[0]);
    }
}

function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImg.src = e.target.result;
        preview.classList.add('show');
        previewActions.classList.add('show');
        fileInputLabel.classList.add('active');
        submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

function removePhoto(e) {
    e.preventDefault();
    photoInput.value = '';
    preview.classList.remove('show');
    previewActions.classList.remove('show');
    fileInputLabel.classList.remove('active');
    submitBtn.disabled = true;
}

submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Foto enviada! Próxima etapa em desenvolvimento.');
});