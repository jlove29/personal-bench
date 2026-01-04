// E2E tests for API backend integrations

function registerApiE2ETests(runner) {
    runner.describe('E2E: API Backend Integration', () => {

        runner.it('E2E: OpenAI API - should send prompt and receive response', async () => {
            const apiKey = localStorage.getItem('apiKey_openai');
            
            if (!apiKey || apiKey === '') {
                console.log('  ⚠️  Skipping - OpenAI API key not configured');
                return;
            }

            const apiSelect = document.getElementById('api-select');
            const modelInput = document.getElementById('model-input');
            const apiKeyInput = document.getElementById('api-key');
            const promptInput = document.getElementById('prompt-input');
            const sendBtn = document.getElementById('send-btn');
            const messagesContainer = document.getElementById('messages');

            if (!apiSelect || !promptInput || !sendBtn || !messagesContainer) {
                console.log('  ⚠️  Skipping - Required DOM elements not found');
                return;
            }

            // Set up OpenAI
            apiSelect.value = 'openai';
            apiKeyInput.value = apiKey;
            modelInput.value = 'gpt-4o-mini'; // Use cheaper model for testing
            
            // Clear messages
            messagesContainer.innerHTML = '';
            
            // Send a very short prompt to minimize cost
            promptInput.value = 'Say "test"';
            
            console.log('  ℹ️  Sending test prompt to OpenAI API...');
            
            // Click send button
            sendBtn.click();
            
            // Wait for response (max 10 seconds)
            let responseReceived = false;
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const messages = messagesContainer.querySelectorAll('.message');
                const assistantMessages = Array.from(messages).filter(m => 
                    m.classList.contains('assistant') && !m.classList.contains('loading')
                );
                
                if (assistantMessages.length > 0) {
                    responseReceived = true;
                    break;
                }
            }
            
            assert.truthy(responseReceived, 'Should receive response from OpenAI API');
            
            const assistantMessage = messagesContainer.querySelector('.message.assistant:not(.loading)');
            assert.exists(assistantMessage, 'Assistant message should exist');
            assert.truthy(assistantMessage.textContent.length > 0, 'Response should have content');
            
            console.log('  ✓  OpenAI API response received');
        });

        runner.it('E2E: Gemini API - should send prompt and receive response', async () => {
            const apiKey = localStorage.getItem('apiKey_gemini');
            
            if (!apiKey || apiKey === '') {
                console.log('  ⚠️  Skipping - Gemini API key not configured');
                return;
            }

            const apiSelect = document.getElementById('api-select');
            const modelInput = document.getElementById('model-input');
            const apiKeyInput = document.getElementById('api-key');
            const promptInput = document.getElementById('prompt-input');
            const sendBtn = document.getElementById('send-btn');
            const messagesContainer = document.getElementById('messages');

            if (!apiSelect || !promptInput || !sendBtn || !messagesContainer) {
                console.log('  ⚠️  Skipping - Required DOM elements not found');
                return;
            }

            // Set up Gemini
            apiSelect.value = 'gemini';
            apiKeyInput.value = apiKey;
            modelInput.value = 'gemini-1.5-flash'; // Use flash model for testing
            
            // Clear messages
            messagesContainer.innerHTML = '';
            
            // Send a very short prompt to minimize cost
            promptInput.value = 'Say "test"';
            
            console.log('  ℹ️  Sending test prompt to Gemini API...');
            
            // Click send button
            sendBtn.click();
            
            // Wait for response (max 10 seconds)
            let responseReceived = false;
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const messages = messagesContainer.querySelectorAll('.message');
                const assistantMessages = Array.from(messages).filter(m => 
                    m.classList.contains('assistant') && !m.classList.contains('loading')
                );
                
                if (assistantMessages.length > 0) {
                    responseReceived = true;
                    break;
                }
            }
            
            assert.truthy(responseReceived, 'Should receive response from Gemini API');
            
            const assistantMessage = messagesContainer.querySelector('.message.assistant:not(.loading)');
            assert.exists(assistantMessage, 'Assistant message should exist');
            assert.truthy(assistantMessage.textContent.length > 0, 'Response should have content');
            
            console.log('  ✓  Gemini API response received');
        });

        runner.it('E2E: Claude API - should send prompt and receive response', async () => {
            const apiKey = localStorage.getItem('apiKey_claude');
            
            if (!apiKey || apiKey === '') {
                console.log('  ⚠️  Skipping - Claude API key not configured');
                return;
            }

            const apiSelect = document.getElementById('api-select');
            const modelInput = document.getElementById('model-input');
            const apiKeyInput = document.getElementById('api-key');
            const promptInput = document.getElementById('prompt-input');
            const sendBtn = document.getElementById('send-btn');
            const messagesContainer = document.getElementById('messages');

            if (!apiSelect || !promptInput || !sendBtn || !messagesContainer) {
                console.log('  ⚠️  Skipping - Required DOM elements not found');
                return;
            }

            // Set up Claude
            apiSelect.value = 'claude';
            apiKeyInput.value = apiKey;
            modelInput.value = 'claude-3-haiku-20240307'; // Use haiku for testing
            
            // Clear messages
            messagesContainer.innerHTML = '';
            
            // Send a very short prompt to minimize cost
            promptInput.value = 'Say "test"';
            
            console.log('  ℹ️  Sending test prompt to Claude API...');
            
            // Click send button
            sendBtn.click();
            
            // Wait for response (max 10 seconds)
            let responseReceived = false;
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const messages = messagesContainer.querySelectorAll('.message');
                const assistantMessages = Array.from(messages).filter(m => 
                    m.classList.contains('assistant') && !m.classList.contains('loading')
                );
                
                if (assistantMessages.length > 0) {
                    responseReceived = true;
                    break;
                }
            }
            
            assert.truthy(responseReceived, 'Should receive response from Claude API');
            
            const assistantMessage = messagesContainer.querySelector('.message.assistant:not(.loading)');
            assert.exists(assistantMessage, 'Assistant message should exist');
            assert.truthy(assistantMessage.textContent.length > 0, 'Response should have content');
            
            console.log('  ✓  Claude API response received');
        });

    });
}
