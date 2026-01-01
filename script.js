

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


// Initialize the app
function init() {
    // Load saved API key and model from localStorage
    loadApiKey();
    loadModel();

    // Event listeners
    apiSelect.addEventListener('change', handleApiChange);
    apiKeyInput.addEventListener('input', saveApiKey);
    modelInput.addEventListener('input', saveModel);
    sendBtn.addEventListener('click', handleSendMessage);
    promptInput.addEventListener('keydown', handleKeyPress);

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
}

// Handle send message
async function handleSendMessage() {
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

    // Add user message
    addMessage(prompt, 'user');
    
    // Clear input box
    promptInput.value = '';

    // Disable send button
    sendBtn.disabled = true;

    try {
        const response = await sendApiRequest(prompt, apiKey);
        addMessage(response, 'assistant');
    } catch (error) {
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
    const endpoint = `${API_ENDPOINTS.gemini}${model}:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API request failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// Claude API request
async function sendClaudeRequest(prompt, apiKey, model) {
    const response = await fetch(API_ENDPOINTS.claude, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data = await response.json();
    return data.content[0].text;
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
