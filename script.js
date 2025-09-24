class PNGToJPEGConverter {
    constructor() {
        this.selectedFile = null;
        this.convertedBlob = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.fileInfo = document.getElementById('fileInfo');
        this.previewImage = document.getElementById('previewImage');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.getElementById('qualityValue');
        this.convertBtn = document.getElementById('convertBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.successMessage = document.getElementById('successMessage');
    }

    attachEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Click to browse
        this.uploadArea.addEventListener('click', () => this.fileInput.click());

        // Quality slider
        this.qualitySlider.addEventListener('input', (e) => {
            this.qualityValue.textContent = e.target.value;
        });

        // Control buttons
        this.convertBtn.addEventListener('click', () => this.convertToJPEG());
        this.downloadBtn.addEventListener('click', () => this.downloadJPEG());
        this.resetBtn.addEventListener('click', () => this.resetConverter());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/png')) {
            this.showError('Please select a PNG image file.');
            return;
        }

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            this.showError('File size must be less than 50MB.');
            return;
        }

        this.selectedFile = file;
        this.hideError();
        this.hideSuccess();
        this.displayFileInfo(file);
        this.enableConvertButton();
    }

    displayFileInfo(file) {
        // Show file info section
        this.fileInfo.style.display = 'block';

        // Display file name
        this.fileName.textContent = file.name;

        // Display file size
        this.fileSize.textContent = this.formatFileSize(file.size);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    enableConvertButton() {
        this.convertBtn.disabled = false;
        this.convertBtn.classList.add('enabled');
    }

    async convertToJPEG() {
        if (!this.selectedFile) {
            this.showError('Please select a PNG file first.');
            return;
        }

        this.showProgress();
        this.convertBtn.disabled = true;
        this.convertBtn.classList.remove('enabled');

        try {
            // Update progress
            this.updateProgress(20, 'Loading image...');

            // Create canvas for conversion
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = URL.createObjectURL(this.selectedFile);
            });

            // Update progress
            this.updateProgress(40, 'Processing image...');

            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image on canvas
            ctx.drawImage(img, 0, 0);

            // Update progress
            this.updateProgress(70, 'Converting to JPEG...');

            // Convert to JPEG blob
            const quality = parseInt(this.qualitySlider.value) / 100;
            
            await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    this.convertedBlob = blob;
                    resolve();
                }, 'image/jpeg', quality);
            });

            // Update progress
            this.updateProgress(100, 'Conversion complete!');

            // Clean up
            URL.revokeObjectURL(img.src);

            // Show success and enable download
            setTimeout(() => {
                this.hideProgress();
                this.showSuccess();
                this.enableDownloadButton();
            }, 500);

        } catch (error) {
            console.error('Conversion error:', error);
            this.hideProgress();
            this.showError('Failed to convert image. Please try again.');
            this.enableConvertButton();
        }
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = percent + '%';
        this.progressText.textContent = text;
    }

    showProgress() {
        this.progressContainer.style.display = 'block';
        this.updateProgress(0, 'Starting conversion...');
    }

    hideProgress() {
        this.progressContainer.style.display = 'none';
    }

    enableDownloadButton() {
        this.downloadBtn.disabled = false;
        this.downloadBtn.classList.add('enabled');
    }

    downloadJPEG() {
        if (!this.convertedBlob) {
            this.showError('No converted file available. Please convert first.');
            return;
        }

        // Create download link
        const url = URL.createObjectURL(this.convertedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.getJPEGFileName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getJPEGFileName() {
        const originalName = this.selectedFile.name;
        const nameWithoutExtension = originalName.replace(/\.png$/i, '');
        return `${nameWithoutExtension}.jpg`;
    }

    resetConverter() {
        // Reset all state
        this.selectedFile = null;
        this.convertedBlob = null;
        this.fileInput.value = '';

        // Hide all sections
        this.fileInfo.style.display = 'none';
        this.progressContainer.style.display = 'none';
        this.hideError();
        this.hideSuccess();

        // Reset buttons
        this.convertBtn.disabled = true;
        this.convertBtn.classList.remove('enabled');
        this.downloadBtn.disabled = true;
        this.downloadBtn.classList.remove('enabled');

        // Reset quality slider
        this.qualitySlider.value = 85;
        this.qualityValue.textContent = '85';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'block';
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showSuccess() {
        this.successMessage.style.display = 'block';
    }

    hideSuccess() {
        this.successMessage.style.display = 'none';
    }
}

// Initialize the converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PNGToJPEGConverter();
});