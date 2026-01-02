import Anthropic from '@anthropic-ai/sdk';

// API endpoints
const API_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/models/',
    claude: 'https://api.anthropic.com/v1/messages'
};

// DOM elements
const apiSelect = document.getElementById('api-select');
const modelInput = document.getElementById('model-input');
const apiKeyInput = document.getElementById('api-key');
const promptInput = document.getElementById('prompt-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const promptSelect = document.getElementById('prompt-select');
const sheetsStatus = document.getElementById('sheets-status');
const saveToTrackerBtn = document.getElementById('save-to-tracker-btn');
const clearBtn = document.getElementById('clear-btn');

// State
let isAuthorizedForSheets = false;
let savedPrompts = [];
let lastPrompt = '';
let lastResponse = '';


// Initialize the app
async function init() {
    // Load saved API key and model from localStorage
    loadApiKey();
    loadModel();

    // Event listeners
    apiSelect.addEventListener('change', () => { clearStatusMessages(); handleApiChange(); });
    apiKeyInput.addEventListener('input', () => { clearStatusMessages(); saveApiKey(); });
    modelInput.addEventListener('input', () => { clearStatusMessages(); saveModel(); });
    sendBtn.addEventListener('click', handleSendMessage);
    promptInput.addEventListener('keydown', handleKeyPress);
    promptInput.addEventListener('input', clearStatusMessages);
    promptSelect.addEventListener('change', handlePromptSelect);
    saveToTrackerBtn.addEventListener('click', handleSaveToTracker);
    clearBtn.addEventListener('click', handleClearMessages);

    // Initialize Google Sheets API
    await initializeSheets();
}



// Handle API provider change
function handleApiChange() {
    loadApiKey();
    loadModel();
    // Clear chat history when switching providers
    messagesContainer.innerHTML = '';
}

// Save API key to localStorage
function saveApiKey() {
    const selectedApi = apiSelect.value;
    const key = apiKeyInput.value;
    localStorage.setItem(`apiKey_${selectedApi}`, key);
}

// Load API key from localStorage
function loadApiKey() {
    const selectedApi = apiSelect.value;
    const savedKey = localStorage.getItem(`apiKey_${selectedApi}`) || '';
    apiKeyInput.value = savedKey;
}

// Save model name to localStorage
function saveModel() {
    const selectedApi = apiSelect.value;
    const model = modelInput.value;
    localStorage.setItem(`model_${selectedApi}`, model);
}

// Load model name from localStorage
function loadModel() {
    const selectedApi = apiSelect.value;
    const savedModel = localStorage.getItem(`model_${selectedApi}`) || '';
    modelInput.value = savedModel;
}

// Handle Enter key in prompt input
function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

// Add message to chat
function addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    const p = document.createElement('p');
    p.textContent = content;
    messageDiv.appendChild(p);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Show clear button when there are messages
    if (messagesContainer.children.length > 0) {
        clearBtn.style.display = 'inline-block';
    }

    return messageDiv;
}

// Clear status messages (success/error messages)
function clearStatusMessages() {
    const statusMessages = messagesContainer.querySelectorAll('.message.success, .message.error');
    statusMessages.forEach(msg => msg.remove());
}

// Add loading indicator
function addLoadingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant loading-message';
    messageDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageDiv;
}

// Remove loading indicator
function removeLoadingIndicator(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
        loadingElement.parentNode.removeChild(loadingElement);
    }
}

// Handle send message
async function handleSendMessage() {
    clearStatusMessages();
    const prompt = promptInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!prompt) {
        addMessage('Please enter a prompt', 'error');
        return;
    }

    if (!apiKey) {
        addMessage('Please enter an API key', 'error');
        return;
    }

    // Store the prompt for later saving
    lastPrompt = prompt;

    // Add user message
    addMessage(prompt, 'user');

    // Clear input box
    promptInput.value = '';

    // Disable send button
    sendBtn.disabled = true;

    // Add loading indicator
    const loadingIndicator = addLoadingIndicator();

    try {
        const response = await sendApiRequest(prompt, apiKey);
        lastResponse = response;
        removeLoadingIndicator(loadingIndicator);
        addMessage(response, 'assistant');
        if (isAuthorizedForSheets) {
            saveToTrackerBtn.style.display = 'inline-block';
        }
    } catch (error) {
        removeLoadingIndicator(loadingIndicator);
        addMessage(`Error: ${error.message}`, 'error');
    } finally {
        sendBtn.disabled = false;
    }
}

// Send API request based on selected provider
async function sendApiRequest(prompt, apiKey) {
    const selectedApi = apiSelect.value;
    const selectedModel = modelInput.value.trim();

    switch (selectedApi) {
        case 'openai':
            return await sendOpenAIRequest(prompt, apiKey, selectedModel);
        case 'gemini':
            return await sendGeminiRequest(prompt, apiKey, selectedModel);
        case 'claude':
            return await sendClaudeRequest(prompt, apiKey, selectedModel);
        default:
            throw new Error('Unknown API provider');
    }
}

// OpenAI API request
async function sendOpenAIRequest(prompt, apiKey, model) {
    const response = await fetch(API_ENDPOINTS.openai, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// Gemini API request
async function sendGeminiRequest(prompt, apiKey, model) {
    // Dynamically import the @google/genai SDK
    const { GoogleGenAI } = await import('@google/genai');

    // Initialize the SDK with the API key
    const ai = new GoogleGenAI({ apiKey });

    // Generate content using the SDK
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt
    });

    return response.text;
}

// Claude API request using Anthropic SDK
async function sendClaudeRequest(prompt, apiKey, model) {
    const anthropic = new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
    });

    const message = await anthropic.messages.create({
        model: model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
    });

    return message.content[0].text;
}

// Initialize Google Sheets
async function initializeSheets() {
    try {
        await sheetsAPI.init();
        const authStatus = sessionStorage.getItem('sheetsAuthorized');
        if (authStatus === 'true' && sheetsAPI.accessToken) {
            try {
                await sheetsAPI.getUserSheetId();
            } catch (error) {
                if (error.status === 401 || error.result?.error?.code === 401) {
                    console.log('Token expired, re-authorizing...');
                    await sheetsAPI.authorize();
                    await sheetsAPI.getUserSheetId();
                    sessionStorage.setItem('sheetsAuthorized', 'true');
                } else {
                    throw error;
                }
            }
            isAuthorizedForSheets = true;
            await loadPrompts();
        }
    } catch (error) {
        console.error('Failed to initialize Google Sheets API:', error);
    }
}

// Load prompts from Google Sheets
async function loadPrompts() {
    try {
        savedPrompts = await sheetsAPI.getPrompts();
        promptSelect.innerHTML = '<option value="">-- Select a saved prompt --</option>';
        savedPrompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.id;
            option.textContent = `${prompt.title}${prompt.category ? ` [${prompt.category}]` : ''}`;
            promptSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load prompts:', error);
    }
}

function handlePromptSelect() {
    // Clear all messages and reset state
    messagesContainer.innerHTML = '';
    lastPrompt = '';
    lastResponse = '';
    saveToTrackerBtn.style.display = 'none';
    clearBtn.style.display = 'none';

    const selectedId = parseInt(promptSelect.value);
    if (!selectedId) {
        promptInput.value = '';
        return;
    }

    const prompt = savedPrompts.find(p => p.id === selectedId);
    if (prompt) {
        promptInput.value = prompt.content;
        promptInput.focus();
    }
}

async function handleSaveToTracker() {
    if (!lastPrompt || !lastResponse) {
        addMessage('No prompt/response to save', 'error');
        return;
    }

    try {
        saveToTrackerBtn.disabled = true;
        const selectedId = parseInt(promptSelect.value);
        let promptId;
        if (selectedId) {
            promptId = selectedId;
        } else {
            const title = prompt('Enter a title for this prompt:', lastPrompt.substring(0, 50));
            if (!title) {
                saveToTrackerBtn.disabled = false;
                return;
            }
            const category = prompt('Enter a category (optional):', '');
            await sheetsAPI.addPrompt(title, lastPrompt, category);
            await loadPrompts();
            const prompts = await sheetsAPI.getPrompts();
            promptId = prompts[prompts.length - 1].id;
        }
        const modelName = `${apiSelect.value} - ${modelInput.value}`;
        await sheetsAPI.addModelResponse(promptId, modelName, lastResponse, {
            provider: apiSelect.value,
            model: modelInput.value
        });
        addMessage('✓ Saved to Prompt Tracker!', 'success');
        saveToTrackerBtn.style.display = 'none';

        await loadPrompts();
    } catch (error) {
        console.error('Failed to save to tracker:', error);
        addMessage('Failed to save to tracker', 'error');
    } finally {
        saveToTrackerBtn.disabled = false;
    }
}

function handleClearMessages() {
    messagesContainer.innerHTML = '';
    lastPrompt = '';
    lastResponse = '';
    saveToTrackerBtn.style.display = 'none';
    clearBtn.style.display = 'none';
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
