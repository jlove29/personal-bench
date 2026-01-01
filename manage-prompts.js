// Manage Prompts Page Logic

let prompts = [];
let isAuthorized = false;

// Initialize the page
async function initializePage() {
    showLoading(true);
    
    try {
        await sheetsAPI.init();
        console.log('Google Sheets API loaded');
        
        // Check if we have a valid access token from the index page
        const authStatus = sessionStorage.getItem('sheetsAuthorized');
        if (authStatus !== 'true' || !sheetsAPI.accessToken) {
            // Not authorized, redirect to index page
            showError('Please authorize from the home page first.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        console.log('Already authorized, loading sheet...');
        
        try {
            await sheetsAPI.getUserSheetId();
        } catch (error) {
            // Token might be expired, try to re-authorize
            if (error.status === 401 || error.result?.error?.code === 401) {
                console.log('Token expired, re-authorizing...');
                await sheetsAPI.authorize();
                await sheetsAPI.getUserSheetId();
                sessionStorage.setItem('sheetsAuthorized', 'true');
            } else {
                throw error;
            }
        }
        
        isAuthorized = true;
        
        // Show main content
        document.getElementById('authorize-btn').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // Show link to the Google Sheet
        const sheetUrl = sheetsAPI.getSheetUrl();
        const sheetLinkDiv = document.getElementById('sheet-link');
        sheetLinkDiv.innerHTML = `<a href="${sheetUrl}" target="_blank" class="sheet-link">📊 Open in Google Sheets</a>`;
        sheetLinkDiv.style.display = 'block';
        
        // Load prompts
        await loadPrompts();
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('Failed to initialize Google Sheets API. Please check your configuration.');
    }
    
    showLoading(false);
}

// Authorize with Google (kept for backwards compatibility, but redirects to index)
async function authorizeUser() {
    window.location.href = 'index.html';
}

// Load all prompts from the sheet
async function loadPrompts() {
    showLoading(true);
    
    try {
        prompts = await sheetsAPI.getPrompts();
        renderPrompts();
    } catch (error) {
        console.error('Failed to load prompts:', error);
        
        // If 401 error, try to re-authorize
        if (error.status === 401 || error.result?.error?.code === 401) {
            console.log('Token expired while loading prompts, re-authorizing...');
            try {
                await sheetsAPI.authorize();
                sessionStorage.setItem('sheetsAuthorized', 'true');
                // Retry loading prompts
                prompts = await sheetsAPI.getPrompts();
                renderPrompts();
            } catch (retryError) {
                console.error('Failed to re-authorize and load prompts:', retryError);
                showError('Failed to load prompts from Google Sheets.');
            }
        } else {
            showError('Failed to load prompts from Google Sheets.');
        }
    }
    
    showLoading(false);
}

// Render prompts to the page
function renderPrompts() {
    const container = document.getElementById('prompts-container');
    
    if (prompts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No prompts yet. Click "Add New Prompt" to create one.</p>';
        return;
    }
    
    container.innerHTML = prompts.map(prompt => {
        const responsesHtml = prompt.responses && prompt.responses.length > 0 
            ? `
                <div class="model-responses">
                    <h4>Model Responses (${prompt.responses.length}):</h4>
                    ${prompt.responses.map((resp, idx) => `
                        <div class="response-item">
                            <div class="response-header">
                                <strong>${escapeHtml(resp.modelName)}</strong>
                                <span class="response-time">${new Date(resp.timestamp).toLocaleString()}</span>
                                <button class="btn-icon" onclick="deleteResponse(${prompt.id}, ${idx})" title="Delete response">🗑️</button>
                            </div>
                            <div class="response-content">${escapeHtml(resp.response)}</div>
                            ${resp.metadata && Object.keys(resp.metadata).length > 0 ? `
                                <div class="response-metadata">
                                    ${Object.entries(resp.metadata).map(([key, value]) => 
                                        `<span class="metadata-tag">${escapeHtml(key)}: ${escapeHtml(String(value))}</span>`
                                    ).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `
            : '<p class="no-responses">No model responses yet.</p>';
        
        return `
            <div class="prompt-item" data-id="${prompt.id}">
                <h3>${escapeHtml(prompt.title)}</h3>
                <p>${escapeHtml(prompt.content)}</p>
                ${prompt.category ? `<span class="category-tag">${escapeHtml(prompt.category)}</span>` : ''}
                ${responsesHtml}
                <div class="prompt-actions">
                    <button class="btn btn-primary" onclick="showResponseModal(${prompt.id})">Add Response</button>
                    <button class="btn btn-edit" onclick="editPrompt(${prompt.id})">Edit</button>
                    <button class="btn btn-delete" onclick="deletePrompt(${prompt.id})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Show add/edit modal
function showPromptModal(promptId = null) {
    const modal = document.getElementById('prompt-modal');
    const title = document.getElementById('modal-title');
    const titleInput = document.getElementById('prompt-title');
    const contentInput = document.getElementById('prompt-content');
    const categoryInput = document.getElementById('prompt-category');
    
    if (promptId) {
        // Edit mode
        const prompt = prompts.find(p => p.id === promptId);
        title.textContent = 'Edit Prompt';
        titleInput.value = prompt.title;
        contentInput.value = prompt.content;
        categoryInput.value = prompt.category;
        modal.dataset.editId = promptId;
    } else {
        // Add mode
        title.textContent = 'Add New Prompt';
        titleInput.value = '';
        contentInput.value = '';
        categoryInput.value = '';
        delete modal.dataset.editId;
    }
    
    modal.style.display = 'flex';
}

// Hide modal
function hidePromptModal() {
    document.getElementById('prompt-modal').style.display = 'none';
}

// Save prompt (add or edit)
async function savePrompt() {
    const modal = document.getElementById('prompt-modal');
    const title = document.getElementById('prompt-title').value.trim();
    const content = document.getElementById('prompt-content').value.trim();
    const category = document.getElementById('prompt-category').value.trim();
    
    if (!title || !content) {
        alert('Please fill in both title and content.');
        return;
    }
    
    showLoading(true);
    
    try {
        if (modal.dataset.editId) {
            // Update existing prompt
            await sheetsAPI.updatePrompt(parseInt(modal.dataset.editId), title, content, category);
        } else {
            // Add new prompt
            await sheetsAPI.addPrompt(title, content, category);
        }
        
        hidePromptModal();
        await loadPrompts();
    } catch (error) {
        console.error('Failed to save prompt:', error);
        showError('Failed to save prompt. Please try again.');
    }
    
    showLoading(false);
}

// Edit prompt
function editPrompt(promptId) {
    showPromptModal(promptId);
}

// Delete prompt
async function deletePrompt(promptId) {
    if (!confirm('Are you sure you want to delete this prompt?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        await sheetsAPI.deletePrompt(promptId);
        await loadPrompts();
    } catch (error) {
        console.error('Failed to delete prompt:', error);
        showError('Failed to delete prompt. Please try again.');
    }
    
    showLoading(false);
}

// Show response modal
function showResponseModal(promptId) {
    const modal = document.getElementById('response-modal');
    const prompt = prompts.find(p => p.id === promptId);
    
    if (!prompt) return;
    
    document.getElementById('response-prompt-title').textContent = prompt.title;
    document.getElementById('response-model-name').value = '';
    document.getElementById('response-content').value = '';
    document.getElementById('response-metadata').value = '';
    modal.dataset.promptId = promptId;
    
    modal.style.display = 'flex';
}

// Hide response modal
function hideResponseModal() {
    document.getElementById('response-modal').style.display = 'none';
}

// Save model response
async function saveResponse() {
    const modal = document.getElementById('response-modal');
    const promptId = parseInt(modal.dataset.promptId);
    const modelName = document.getElementById('response-model-name').value.trim();
    const responseContent = document.getElementById('response-content').value.trim();
    const metadataStr = document.getElementById('response-metadata').value.trim();
    
    if (!modelName || !responseContent) {
        alert('Please fill in both model name and response.');
        return;
    }
    
    let metadata = {};
    if (metadataStr) {
        try {
            metadata = JSON.parse(metadataStr);
        } catch (e) {
            alert('Invalid JSON in metadata field. Please fix or leave empty.');
            return;
        }
    }
    
    showLoading(true);
    
    try {
        await sheetsAPI.addModelResponse(promptId, modelName, responseContent, metadata);
        hideResponseModal();
        await loadPrompts();
    } catch (error) {
        console.error('Failed to save response:', error);
        showError('Failed to save response. Please try again.');
    }
    
    showLoading(false);
}

// Delete a model response
async function deleteResponse(promptId, responseIndex) {
    if (!confirm('Are you sure you want to delete this response?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        await sheetsAPI.deleteModelResponse(promptId, responseIndex);
        await loadPrompts();
    } catch (error) {
        console.error('Failed to delete response:', error);
        showError('Failed to delete response. Please try again.');
    }
    
    showLoading(false);
}

// Utility functions
function showLoading(show) {
    const loader = document.getElementById('loading');
    loader.style.display = show ? 'flex' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', initializePage);
