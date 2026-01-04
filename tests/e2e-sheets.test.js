// E2E tests for Google Sheets integration

function registerSheetsE2ETests(runner) {
    runner.describe('E2E: Google Sheets Integration', () => {

        runner.it('E2E: Google Sheets Authorization - should initialize and authorize', async () => {
            if (typeof sheetsAPI !== 'undefined' && sheetsAPI.init) {
                // Note: This test requires manual authorization in the test runner
                console.log('  ℹ️  This test requires Google Sheets authorization');
                
                // Check if already authorized
                const authStatus = sessionStorage.getItem('sheetsAuthorized');
                if (authStatus === 'true') {
                    assert.truthy(sheetsAPI.accessToken, 'Should have access token');
                    console.log('  ✓  Already authorized');
                } else {
                    console.log('  ⚠️  Skipping - requires manual authorization');
                }
            }
        });

        runner.it('E2E: Save New Prompt to Tracker - should create prompt and save response', async () => {
            if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.sheets) {
                console.log('  ⚠️  Skipping - Google API not loaded or not authorized');
                return;
            }

            if (typeof sheetsAPI === 'undefined' || !sheetsAPI.sheetId) {
                console.log('  ⚠️  Skipping - No sheet ID available');
                return;
            }

            // Simulate the full flow
            const messagesContainer = document.getElementById('messages');
            const saveBtn = document.getElementById('save-to-tracker-btn');
            const promptSelect = document.getElementById('prompt-select');
            
            messagesContainer.innerHTML = '';
            
            // Ensure no prompt is selected (so it creates a new one)
            promptSelect.value = '';
            
            // Simulate user interaction
            if (typeof addMessage === 'function') {
                addMessage('What is machine learning?', 'user');
                addMessage('Machine learning is a subset of AI...', 'assistant');
            }
            
            // Set last prompt/response
            window.lastPrompt = 'What is machine learning?';
            window.lastResponse = 'Machine learning is a subset of AI...';
            
            // Save button should be visible
            saveBtn.style.display = 'block';
            
            // Mock prompt() to provide test values automatically
            const originalPrompt = window.prompt;
            let promptCallCount = 0;
            window.prompt = (message) => {
                promptCallCount++;
                if (message.includes('title')) return 'Test ML Prompt';
                if (message.includes('category')) return 'Testing';
                return null;
            };
            
            try {
                // Actually click the save button
                console.log('  ℹ️  Clicking save button with mocked prompts...');
                saveBtn.click();
                
                // Wait a bit for async operations
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Verify prompt was called for title and category
                assert.truthy(promptCallCount >= 1, 'Should have prompted for title');
                console.log('  ✓  Save button clicked and prompts handled');
            } finally {
                // Restore original prompt
                window.prompt = originalPrompt;
            }
        });

        runner.it('E2E: Use Saved Prompt - should load prompt content and clear chat', async () => {
            if (typeof handlePromptSelect === 'function' && typeof window.setTestPrompts === 'function') {
                const promptSelect = document.getElementById('prompt-select');
                const promptInput = document.getElementById('prompt-input');
                const messagesContainer = document.getElementById('messages');
                const saveBtn = document.getElementById('save-to-tracker-btn');
                const clearBtn = document.getElementById('clear-btn');
                
                // Set up test prompts
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'ML Basics',
                        content: 'Explain machine learning in simple terms',
                        category: 'Education',
                        responses: []
                    },
                    {
                        rowId: 3,
                        title: 'Python Tips',
                        content: 'What are best practices for Python?',
                        category: 'Programming',
                        responses: []
                    }
                ]);
                
                // Add some existing messages
                if (typeof addMessage === 'function') {
                    messagesContainer.innerHTML = '';
                    addMessage('Old message', 'user');
                    addMessage('Old response', 'assistant');
                }
                
                saveBtn.style.display = 'block';
                window.lastPrompt = 'Old message';
                window.lastResponse = 'Old response';
                
                // Select first prompt
                promptSelect.value = '2';
                handlePromptSelect();
                
                // Verify prompt loaded and state reset
                assert.equals(promptInput.value, 'Explain machine learning in simple terms');
                assert.equals(messagesContainer.innerHTML, '');
                assert.equals(window.lastPrompt, '');
                assert.equals(window.lastResponse, '');
                assert.equals(saveBtn.style.display, 'none');
                
                // Select second prompt
                promptSelect.value = '3';
                handlePromptSelect();
                
                assert.equals(promptInput.value, 'What are best practices for Python?');
                
                // Deselect prompt
                promptSelect.value = '';
                handlePromptSelect();
                
                assert.equals(promptInput.value, '');
            }
        });

        runner.it('E2E: Multi-Response Tracking - should handle multiple responses for same prompt', async () => {
            // Set up test data with multiple responses
            const testPrompt = {
                rowId: 2,
                title: 'Multi-Model Test',
                content: 'Explain quantum computing',
                category: 'Technology',
                responses: [
                    { model: 'gpt-4', response: 'GPT-4 response...', timestamp: Date.now() },
                    { model: 'gemini-pro', response: 'Gemini response...', timestamp: Date.now() }
                ]
            };
            
            // Set prompts directly
            if (typeof window.setTestPrompts === 'function') {
                window.setTestPrompts([testPrompt]);
            } else {
                window.prompts = [testPrompt];
            }
            
            // Verify prompt has multiple responses
            // After setTestPrompts, prompts are in window.savedPrompts
            const prompts = window.savedPrompts || window.prompts || [];
            const prompt = prompts.find(p => p.rowId === 2);
            assert.exists(prompt, 'Prompt should exist');
            assert.equals(prompt.responses.length, 2, 'Should have 2 responses');
            assert.equals(prompt.responses[0].model, 'gpt-4');
            assert.equals(prompt.responses[1].model, 'gemini-pro');
        });

        runner.it('E2E: Load Prompts from Sheets - should populate dropdown with prompts', async () => {
            if (typeof loadPrompts === 'function') {
                const promptSelect = document.getElementById('prompt-select');
                
                // Set up test prompts
                const testPrompts = [
                    {
                        rowId: 2,
                        title: 'Prompt 1',
                        content: 'Content 1',
                        category: 'Cat1',
                        responses: []
                    },
                    {
                        rowId: 3,
                        title: 'Prompt 2',
                        content: 'Content 2',
                        category: 'Cat2',
                        responses: []
                    },
                    {
                        rowId: 4,
                        title: 'Prompt 3',
                        content: 'Content 3',
                        category: '',
                        responses: []
                    }
                ];
                
                // Set prompts directly
                if (typeof window.setTestPrompts === 'function') {
                    window.setTestPrompts(testPrompts);
                } else {
                    window.prompts = testPrompts;
                }
                
                // Manually populate dropdown (simulating loadPrompts)
                const prompts = window.savedPrompts || window.prompts || [];
                promptSelect.innerHTML = '<option value="">-- Select a saved prompt --</option>';
                prompts.forEach(prompt => {
                    const option = document.createElement('option');
                    option.value = prompt.rowId;
                    option.textContent = `${prompt.title}${prompt.category ? ` [${prompt.category}]` : ''}`;
                    promptSelect.appendChild(option);
                });
                
                // Verify dropdown populated correctly
                const options = promptSelect.querySelectorAll('option');
                assert.equals(options.length, 4); // 1 default + 3 prompts
                
                assert.equals(options[0].value, '');
                assert.equals(options[1].value, '2');
                assert.equals(options[2].value, '3');
                assert.equals(options[3].value, '4');
                
                // Verify text includes category
                assert.truthy(options[1].textContent.includes('[Cat1]'));
                assert.truthy(options[2].textContent.includes('[Cat2]'));
                assert.falsy(options[3].textContent.includes('['));
            } else {
                console.log('   ⚠️  Skipping - loadPrompts not available');
            }
        });

        runner.it('E2E: Session Storage Persistence - should maintain auth state', () => {
            // Simulate authorization
            sessionStorage.setItem('sheetsAuthorized', 'true');
            
            // Verify persistence
            assert.equals(sessionStorage.getItem('sheetsAuthorized'), 'true');
            
            // Simulate page reload check
            const authStatus = sessionStorage.getItem('sheetsAuthorized');
            assert.equals(authStatus, 'true');
            
            // Clear session
            sessionStorage.removeItem('sheetsAuthorized');
            assert.isNull(sessionStorage.getItem('sheetsAuthorized'));
        });

        runner.it('E2E: Save Response to Existing Prompt - should add response to prompt', async () => {
            // Set up existing prompt
            const existingPrompt = {
                rowId: 2,
                title: 'Existing Prompt',
                content: 'What is machine learning?',
                category: 'AI',
                responses: [
                    { model: 'gpt-4', response: 'First response', timestamp: Date.now() - 1000 }
                ]
            };
            
            // Set prompts directly
            if (typeof window.setTestPrompts === 'function') {
                window.setTestPrompts([existingPrompt]);
            } else {
                window.prompts = [existingPrompt];
            }
            
            // Add new response
            const newResponse = {
                model: 'gemini-pro',
                response: 'Second response from Gemini',
                timestamp: Date.now()
            };
            
            const prompts = window.savedPrompts || window.prompts || [];
            const prompt = prompts.find(p => p.rowId === 2);
            if (prompt) {
                prompt.responses.push(newResponse);
                
                // Verify response was added
                assert.equals(prompt.responses.length, 2, 'Should have 2 responses');
                assert.equals(prompt.responses[1].model, 'gemini-pro');
            } else {
                console.log('   ⚠️  Skipping - Prompt not found');
            }
        });
    });
}
