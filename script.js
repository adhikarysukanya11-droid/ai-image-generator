// Configuration
const API_ENDPOINT = 'http://localhost:5000/generate';

// DOM Elements
const promptTextarea = document.getElementById('prompt');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const stepsInput = document.getElementById('steps');
const generateBtn = document.getElementById('generateBtn');
const alertBox = document.getElementById('alert');
const resultSection = document.getElementById('resultSection');
const loadingContainer = document.getElementById('loadingContainer');
const imageContainer = document.getElementById('imageContainer');
const generatedImage = document.getElementById('generatedImage');
const downloadBtn = document.getElementById('downloadBtn');

// State
let isGenerating = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadSavedSettings();
});

// Event Listeners
function initializeEventListeners() {
    generateBtn.addEventListener('click', handleGenerate);
    
    // Ctrl+Enter to generate
    promptTextarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleGenerate();
        }
    });

    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownload);
    }

    // Auto-save settings
    [widthInput, heightInput, stepsInput].forEach(input => {
        input.addEventListener('change', saveSettings);
    });

    // Input validation
    widthInput.addEventListener('input', () => validateNumberInput(widthInput, 256, 2048, 64));
    heightInput.addEventListener('input', () => validateNumberInput(heightInput, 256, 2048, 64));
    stepsInput.addEventListener('input', () => validateNumberInput(stepsInput, 1, 50, 1));
}

// Main Generate Function
async function handleGenerate() {
    if (isGenerating) return;

    const prompt = promptTextarea.value.trim();

    // Validation
    if (!prompt) {
        showAlert('Please enter a prompt to generate an image', 'error');
        promptTextarea.focus();
        return;
    }

    if (prompt.length < 3) {
        showAlert('Prompt is too short. Please provide more details', 'error');
        return;
    }

    // Get parameters
    const params = {
        prompt: prompt,
        width: parseInt(widthInput.value),
        height: parseInt(heightInput.value),
        steps: parseInt(stepsInput.value)
    };

    // Start generation
    isGenerating = true;
    updateButtonState(true);
    hideAlert();
    showLoading();

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.image && !data.image_url) {
            throw new Error('No image data received from server');
        }

        // Display the generated image
        displayImage(data);
        showAlert('Image generated successfully!', 'success');

    } catch (error) {
        console.error('Generation error:', error);
        handleError(error);
    } finally {
        isGenerating = false;
        updateButtonState(false);
    }
}

// Display Generated Image
function displayImage(data) {
    let imageUrl;

    if (data.image_url) {
        imageUrl = data.image_url;
    } else if (data.image) {
        imageUrl = `data:image/png;base64,${data.image}`;
    }

    generatedImage.src = imageUrl;
    generatedImage.alt = promptTextarea.value;
    generatedImage.dataset.url = imageUrl;

    hideLoading();
    showImageContainer();
}

// UI State Management
function updateButtonState(loading) {
    if (loading) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        generateBtn.innerHTML = '<span class="spinner-small"></span> Generating...';
    } else {
        generateBtn.disabled = false;
        generateBtn.textContent = '✨ Generate Image';
    }
}

function showLoading() {
    resultSection.classList.add('show');
    loadingContainer.classList.remove('hidden');
    imageContainer.classList.add('hidden');
}

function hideLoading() {
    loadingContainer.classList.add('hidden');
}

function showImageContainer() {
    imageContainer.classList.remove('hidden');
}

function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} show`;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            hideAlert();
        }, 5000);
    }
}

function hideAlert() {
    alertBox.classList.remove('show');
}

// Error Handling
function handleError(error) {
    let message = 'An error occurred while generating the image';

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        message = '🔌 Cannot connect to the server. Make sure your Python backend is running on http://localhost:5000';
    } else if (error.message) {
        message = error.message;
    }

    showAlert(message, 'error');
    hideLoading();
    resultSection.classList.remove('show');
}

// Download Function
function handleDownload() {
    const imageUrl = generatedImage.dataset.url;
    
    if (!imageUrl) {
        showAlert('No image to download', 'error');
        return;
    }

    const link = document.createElement('a');
    const timestamp = new Date().getTime();
    link.href = imageUrl;
    link.download = `flux-generated-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert('Image downloaded!', 'success');
}

// Input Validation
function validateNumberInput(input, min, max, step) {
    let value = parseInt(input.value);

    if (isNaN(value) || value < min) {
        value = min;
    } else if (value > max) {
        value = max;
    }

    // Round to nearest step
    value = Math.round(value / step) * step;
    input.value = value;
}

// Settings Persistence
function saveSettings() {
    const settings = {
        width: widthInput.value,
        height: heightInput.value,
        steps: stepsInput.value
    };

    localStorage.setItem('fluxSettings', JSON.stringify(settings));
}

function loadSavedSettings() {
    try {
        const saved = localStorage.getItem('fluxSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            widthInput.value = settings.width || 1024;
            heightInput.value = settings.height || 1024;
            stepsInput.value = settings.steps || 28;
        }
    } catch (error) {
        console.error('Failed to load saved settings:', error);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Example prompts (optional feature)
const examplePrompts = [
    "A futuristic cityscape at sunset with flying cars and neon lights",
    "A serene mountain landscape with a crystal clear lake reflection",
    "A magical forest with glowing mushrooms and fireflies at night",
    "An astronaut exploring a colorful alien planet",
    "A cozy coffee shop interior with warm lighting and plants"
];

function getRandomPrompt() {
    return examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
}

// Expose to window for optional use
window.fluxApp = {
    getRandomPrompt,
    generateImage: handleGenerate
};