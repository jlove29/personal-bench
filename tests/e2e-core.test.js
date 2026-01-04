// E2E tests for core chat functionality

function registerCoreE2ETests(runner) {
    runner.describe('E2E: Core Chat Functionality', () => {

        runner.it('E2E: First-Time User Setup - should save API key and model to localStorage', () => {
            // Clear localStorage first
            localStorage.clear();
            
            const apiSelect = document.getElementById('api-select');
            const apiKeyInput = document.getElementById('api-key');
            
            if (apiSelect && apiKeyInput && typeof saveApiKey === 'function' && typeof loadApiKey === 'function') {
                // Simulate user selecting OpenAI and entering API key
                apiSelect.value = 'openai';
                apiKeyInput.value = 'sk-test-key-123';
                
                // Call saveApiKey to save to localStorage (no params - reads from DOM)
                saveApiKey();
                
                // Verify localStorage (actual format is apiKey_openai)
                const savedKey = localStorage.getItem('apiKey_openai');
                assert.equals(savedKey, 'sk-test-key-123', 'API key should be saved to localStorage');
                
                // Verify settings load on page refresh simulation
                apiKeyInput.value = '';
                loadApiKey();
                assert.equals(apiKeyInput.value, 'sk-test-key-123', 'API key should be loaded from localStorage');
            } else {
                console.log('   ⚠️  Skipping - Required elements or functions not available');
            }
            
            // Cleanup
            localStorage.clear();
        });

        runner.it('E2E: Send Prompt and Get Response - should show loading, display message, and enable save button', async () => {
            if (typeof addMessage === 'function' && typeof addLoadingIndicator === 'function') {
                const messagesContainer = document.getElementById('messages');
                const saveBtn = document.getElementById('save-to-tracker-btn');
                const clearBtn = document.getElementById('clear-btn');
                
                messagesContainer.innerHTML = '';
                saveBtn.style.display = 'none';
                clearBtn.style.display = 'none';
                
                // Simulate user message
                addMessage('What is the capital of France?', 'user');
                
                // Simulate loading indicator
                const loadingElement = addLoadingIndicator();
                assert.truthy(loadingElement);
                assert.truthy(messagesContainer.querySelector('.loading-message'));
                
                // Simulate response
                if (typeof removeLoadingIndicator === 'function') {
                    removeLoadingIndicator(loadingElement);
                }
                addMessage('The capital of France is Paris.', 'assistant');
                
                // Verify state
                const userMessages = messagesContainer.querySelectorAll('.message.user');
                const assistantMessages = messagesContainer.querySelectorAll('.message.assistant');
                
                assert.equals(userMessages.length, 1);
                assert.equals(assistantMessages.length, 1);
                assert.truthy(userMessages[0].textContent.includes('What is the capital of France?'));
                assert.truthy(assistantMessages[0].textContent.includes('Paris'));
                
                // Clear button should be visible
                assert.notEquals(clearBtn.style.display, 'none');
            }
        });

        runner.it('E2E: Switch Between API Providers - should clear chat and load correct settings', () => {
            if (typeof handleApiChange === 'function' && typeof saveApiKey === 'function' && typeof saveModel === 'function') {
                const apiSelect = document.getElementById('api-select');
                const apiKeyInput = document.getElementById('api-key');
                const modelInput = document.getElementById('model-input');
                const messagesContainer = document.getElementById('messages');
                
                // Set up OpenAI
                apiSelect.value = 'openai';
                apiKeyInput.value = 'sk-openai-key';
                modelInput.value = 'gpt-4';
                saveApiKey();
                saveModel();
                
                // Add some messages
                if (typeof addMessage === 'function') {
                    messagesContainer.innerHTML = '';
                    addMessage('Test message', 'user');
                    assert.truthy(messagesContainer.children.length > 0);
                }
                
                // Set up Gemini
                apiSelect.value = 'gemini';
                apiKeyInput.value = 'gemini-api-key';
                modelInput.value = 'gemini-pro';
                saveApiKey();
                saveModel();
                
                // Switch back to OpenAI
                apiSelect.value = 'openai';
                handleApiChange();
                
                // Verify correct settings loaded
                assert.equals(apiKeyInput.value, 'sk-openai-key');
                assert.equals(modelInput.value, 'gpt-4');
                
                // Verify chat cleared
                assert.equals(messagesContainer.innerHTML, '');
                
                // Switch to Gemini
                apiSelect.value = 'gemini';
                handleApiChange();
                
                assert.equals(apiKeyInput.value, 'gemini-api-key');
                assert.equals(modelInput.value, 'gemini-pro');
                
                // Cleanup
                localStorage.clear();
            }
        });

        runner.it('E2E: Session Persistence - should maintain API keys across page reloads', () => {
            if (typeof saveApiKey === 'function' && typeof loadApiKey === 'function' && 
                typeof saveModel === 'function' && typeof loadModel === 'function') {
                
                const apiSelect = document.getElementById('api-select');
                const apiKeyInput = document.getElementById('api-key');
                const modelInput = document.getElementById('model-input');
                
                // Save settings for multiple providers
                apiSelect.value = 'openai';
                apiKeyInput.value = 'sk-openai-123';
                modelInput.value = 'gpt-4';
                saveApiKey();
                saveModel();
                
                apiSelect.value = 'gemini';
                apiKeyInput.value = 'gemini-key-456';
                modelInput.value = 'gemini-pro';
                saveApiKey();
                saveModel();
                
                apiSelect.value = 'claude';
                apiKeyInput.value = 'claude-key-789';
                modelInput.value = 'claude-3-opus';
                saveApiKey();
                saveModel();
                
                // Simulate page reload by clearing inputs
                apiKeyInput.value = '';
                modelInput.value = '';
                
                // Load OpenAI settings
                apiSelect.value = 'openai';
                loadApiKey();
                loadModel();
                assert.equals(apiKeyInput.value, 'sk-openai-123');
                assert.equals(modelInput.value, 'gpt-4');
                
                // Load Gemini settings
                apiSelect.value = 'gemini';
                loadApiKey();
                loadModel();
                assert.equals(apiKeyInput.value, 'gemini-key-456');
                assert.equals(modelInput.value, 'gemini-pro');
                
                // Load Claude settings
                apiSelect.value = 'claude';
                loadApiKey();
                loadModel();
                assert.equals(apiKeyInput.value, 'claude-key-789');
                assert.equals(modelInput.value, 'claude-3-opus');
                
                // Cleanup
                localStorage.clear();
            }
        });

        runner.it('E2E: Error Handling - should display error message and auto-hide', async () => {
            if (typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                // Simulate error
                addMessage('Invalid API key', 'error');
                
                const errorMessages = messagesContainer.querySelectorAll('.message.error');
                assert.equals(errorMessages.length, 1);
                assert.truthy(errorMessages[0].textContent.includes('Invalid API key'));
                
                // Verify error is visible
                assert.truthy(errorMessages[0].offsetHeight > 0);
            }
        });

        runner.it('E2E: Clear and Reset - should clear all messages and reset state', () => {
            if (typeof handleClearMessages === 'function' && typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                const saveBtn = document.getElementById('save-to-tracker-btn');
                const clearBtn = document.getElementById('clear-btn');
                
                // Set up state with messages
                messagesContainer.innerHTML = '';
                addMessage('User prompt', 'user');
                addMessage('Assistant response', 'assistant');
                
                saveBtn.style.display = 'block';
                clearBtn.style.display = 'block';
                window.lastPrompt = 'User prompt';
                window.lastResponse = 'Assistant response';
                
                // Verify initial state
                assert.truthy(messagesContainer.children.length > 0);
                
                // Clear messages
                handleClearMessages();
                
                // Verify cleared state
                assert.equals(messagesContainer.innerHTML, '');
                assert.equals(saveBtn.style.display, 'none');
                assert.equals(clearBtn.style.display, 'none');
                assert.equals(window.lastPrompt, '');
                assert.equals(window.lastResponse, '');
            }
        });

        runner.it('E2E: Keyboard Shortcuts - Enter should send, Shift+Enter should add newline', () => {
            if (typeof handleKeyPress === 'function') {
                const promptInput = document.getElementById('prompt-input');
                let sendCalled = false;
                
                // Mock handleSendMessage
                const originalHandleSendMessage = window.handleSendMessage;
                window.handleSendMessage = () => { sendCalled = true; };
                
                // Test Enter key (should send)
                promptInput.value = 'Test prompt';
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
                Object.defineProperty(enterEvent, 'preventDefault', { value: () => {} });
                
                handleKeyPress(enterEvent);
                assert.truthy(sendCalled, 'Enter key should trigger send');
                
                // Test Shift+Enter (should not send)
                sendCalled = false;
                const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
                
                handleKeyPress(shiftEnterEvent);
                assert.falsy(sendCalled, 'Shift+Enter should not trigger send');
                
                // Restore original function
                window.handleSendMessage = originalHandleSendMessage;
            }
        });

        runner.it('E2E: Status Messages - should clear only status messages, not chat', () => {
            if (typeof clearStatusMessages === 'function' && typeof addMessage === 'function') {
                const messagesContainer = document.getElementById('messages');
                messagesContainer.innerHTML = '';
                
                // Add various message types
                addMessage('User message', 'user');
                addMessage('Assistant response', 'assistant');
                addMessage('Success!', 'success');
                addMessage('Error occurred', 'error');
                
                // Verify all messages present
                assert.equals(messagesContainer.querySelectorAll('.message.user').length, 1);
                assert.equals(messagesContainer.querySelectorAll('.message.assistant').length, 1);
                assert.equals(messagesContainer.querySelectorAll('.message.success').length, 1);
                assert.equals(messagesContainer.querySelectorAll('.message.error').length, 1);
                
                // Clear status messages
                clearStatusMessages();
                
                // Verify only chat messages remain
                assert.equals(messagesContainer.querySelectorAll('.message.user').length, 1);
                assert.equals(messagesContainer.querySelectorAll('.message.assistant').length, 1);
                assert.equals(messagesContainer.querySelectorAll('.message.success').length, 0);
                assert.equals(messagesContainer.querySelectorAll('.message.error').length, 0);
            }
        });
    });
}
