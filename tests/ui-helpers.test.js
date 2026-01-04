// Integration tests for UI helper functions from script.js

function registerUIHelpersTests(runner) {
    runner.describe('UI Helper Functions Integration Tests', () => {
        
        runner.it('should add user message to chat', () => {
            if (typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                addMessage('Hello, world!', 'user');
                
                const messages = messagesContainer.querySelectorAll('.message.user');
                assert.equals(messages.length, 1);
                assert.truthy(messages[0].textContent.includes('Hello, world!'));
            }
        });
        
        runner.it('should add assistant message to chat', () => {
            if (typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                addMessage('AI response here', 'assistant');
                
                const messages = messagesContainer.querySelectorAll('.message.assistant');
                assert.equals(messages.length, 1);
                assert.truthy(messages[0].textContent.includes('AI response here'));
            }
        });
        
        runner.it('should show clear button when messages exist', () => {
            if (typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                const clearBtn = document.getElementById('clear-btn');
                messagesContainer.innerHTML = '';
                clearBtn.style.display = 'none';
                
                addMessage('Test message', 'user');
                
                assert.notEquals(clearBtn.style.display, 'none');
            }
        });
        
        runner.it('should clear status messages', () => {
            if (typeof clearStatusMessages === 'function' && typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                addMessage('Success!', 'success');
                addMessage('Error!', 'error');
                addMessage('Regular message', 'user');
                
                clearStatusMessages();
                
                const successMessages = messagesContainer.querySelectorAll('.message.success');
                const errorMessages = messagesContainer.querySelectorAll('.message.error');
                const userMessages = messagesContainer.querySelectorAll('.message.user');
                
                assert.equals(successMessages.length, 0);
                assert.equals(errorMessages.length, 0);
                assert.equals(userMessages.length, 1);
            }
        });
        
        runner.it('should save and load API key from localStorage', () => {
            if (typeof saveApiKey === 'function' && typeof loadApiKey === 'function') {
                const apiSelect = document.getElementById('api-select');
                const apiKeyInput = document.getElementById('api-key');
                
                apiSelect.value = 'openai';
                apiKeyInput.value = 'test-api-key-123';
                
                saveApiKey();
                
                // Clear input and reload
                apiKeyInput.value = '';
                loadApiKey();
                
                assert.equals(apiKeyInput.value, 'test-api-key-123');
                
                // Cleanup
                localStorage.removeItem('apiKey_openai');
            }
        });
        
        runner.it('should save and load model from localStorage', () => {
            if (typeof saveModel === 'function' && typeof loadModel === 'function') {
                const apiSelect = document.getElementById('api-select');
                const modelInput = document.getElementById('model-input');
                
                apiSelect.value = 'openai';
                modelInput.value = 'gpt-4';
                
                saveModel();
                
                // Clear input and reload
                modelInput.value = '';
                loadModel();
                
                assert.equals(modelInput.value, 'gpt-4');
                
                // Cleanup
                localStorage.removeItem('model_openai');
            }
        });
        
        runner.it('should handle API provider change', () => {
            if (typeof handleApiChange === 'function') {
                const apiSelect = document.getElementById('api-select');
                const apiKeyInput = document.getElementById('api-key');
                const modelInput = document.getElementById('model-input');
                const messagesContainer = document.getElementById('messages');
                
                // Set up some data
                apiSelect.value = 'openai';
                apiKeyInput.value = 'openai-key';
                modelInput.value = 'gpt-4';
                localStorage.setItem('apiKey_openai', 'openai-key');
                localStorage.setItem('model_openai', 'gpt-4');
                localStorage.setItem('apiKey_gemini', 'gemini-key');
                localStorage.setItem('model_gemini', 'gemini-pro');
                
                messagesContainer.innerHTML = '<div class="message">Test</div>';
                
                // Change to gemini
                apiSelect.value = 'gemini';
                handleApiChange();
                
                // Should load gemini credentials and clear messages
                assert.equals(apiKeyInput.value, 'gemini-key');
                assert.equals(modelInput.value, 'gemini-pro');
                assert.equals(messagesContainer.innerHTML, '');
                
                // Cleanup
                localStorage.removeItem('apiKey_openai');
                localStorage.removeItem('model_openai');
                localStorage.removeItem('apiKey_gemini');
                localStorage.removeItem('model_gemini');
            }
        });
        
        runner.it('should handle prompt selection', () => {
            if (typeof handlePromptSelect === 'function') {
                const promptSelect = document.getElementById('prompt-select');
                const promptInput = document.getElementById('prompt-input');
                const messagesContainer = document.getElementById('messages');
                
                window.savedPrompts = [{
                    rowId: 2,
                    title: 'Test Prompt',
                    content: 'This is a test prompt',
                    category: 'Testing'
                }];
                
                messagesContainer.innerHTML = '<div class="message">Old message</div>';
                promptSelect.value = '2';
                
                handlePromptSelect();
                
                assert.equals(promptInput.value, 'This is a test prompt');
                assert.equals(messagesContainer.innerHTML, '');
            }
        });
        
        runner.it('should clear prompt input when no prompt selected', () => {
            if (typeof handlePromptSelect === 'function') {
                const promptSelect = document.getElementById('prompt-select');
                const promptInput = document.getElementById('prompt-input');
                
                promptInput.value = 'Some text';
                promptSelect.value = '';
                
                handlePromptSelect();
                
                assert.equals(promptInput.value, '');
            }
        });
        
        runner.it('should handle clear messages', () => {
            if (typeof handleClearMessages === 'function') {
                const messagesContainer = document.getElementById('messages');
                const saveBtn = document.getElementById('save-to-tracker-btn');
                const clearBtn = document.getElementById('clear-btn');
                
                messagesContainer.innerHTML = '<div class="message">Test</div>';
                saveBtn.style.display = 'block';
                clearBtn.style.display = 'block';
                
                window.lastPrompt = 'test';
                window.lastResponse = 'response';
                
                handleClearMessages();
                
                assert.equals(messagesContainer.innerHTML, '');
                assert.equals(saveBtn.style.display, 'none');
                assert.equals(clearBtn.style.display, 'none');
                assert.equals(window.lastPrompt, '');
                assert.equals(window.lastResponse, '');
            }
        });
        
        runner.it('should add and remove loading indicator', () => {
            if (typeof addLoadingIndicator === 'function' && typeof removeLoadingIndicator === 'function') {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                const loadingElement = addLoadingIndicator();
                
                assert.truthy(loadingElement);
                assert.truthy(loadingElement.classList.contains('loading-message'));
                
                const loadingMessages = messagesContainer.querySelectorAll('.loading-message');
                assert.equals(loadingMessages.length, 1);
                
                removeLoadingIndicator(loadingElement);
                
                const remainingLoading = messagesContainer.querySelectorAll('.loading-message');
                assert.equals(remainingLoading.length, 0);
            }
        });
    });
}
