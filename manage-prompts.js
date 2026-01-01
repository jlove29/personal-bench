// Manage Prompts Page Logic

let prompts = [];
let isAuthorized = false;

// Initialize the page
async function initializePage() {
    showLoading(true);
    
    try {
        await sheetsAPI.init();
        console.log('Google Sheets API loaded');
        
        // Show authorization button
        document.getElementById('authorize-btn').style.display = 'block';
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError('Failed to initialize Google Sheets API. Please check your configuration.');
    }
    
    showLoading(false);
}

// Authorize with Google
async function authorizeUser() {
    showLoading(true);
    
    try {
        await sheetsAPI.authorize();
        isAuthorized = true;
        
        // Hide authorize button, show main content
        document.getElementById('authorize-btn').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // Get or create the user's sheet
        const sheetId = await sheetsAPI.getUserSheetId();
        console.log('Using sheet ID:', sheetId);
        
        // Show link to the Google Sheet
        const sheetUrl = sheetsAPI.getSheetUrl();
        const sheetLinkDiv = document.getElementById('sheet-link');
        sheetLinkDiv.innerHTML = `<a href="${sheetUrl}" target="_blank" class="sheet-link">📊 Open in Google Sheets</a>`;
        sheetLinkDiv.style.display = 'block';
        
        // Load prompts
        await loadPrompts();
    } catch (error) {
        console.error('Authorization failed:', error);
        showError('Authorization failed. Please try again.');
    }
    
    showLoading(false);
}

// Load all prompts from the sheet
async function loadPrompts() {
    showLoading(true);
    
    try {
        prompts = await sheetsAPI.getPrompts();
        renderPrompts();
    } catch (error) {
        console.error('Failed to load prompts:', error);
        showError('Failed to load prompts from Google Sheets.');
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
    
    container.innerHTML = prompts.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <h3>${escapeHtml(prompt.title)}</h3>
            <p>${escapeHtml(prompt.content)}</p>
            ${prompt.category ? `<span class="category-tag">${escapeHtml(prompt.category)}</span>` : ''}
            <div class="prompt-actions">
                <button class="btn btn-edit" onclick="editPrompt(${prompt.id})">Edit</button>
                <button class="btn btn-delete" onclick="deletePrompt(${prompt.id})">Delete</button>
            </div>
        </div>
    `).join('');
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
