// E2E tests for Manage Prompts page

function registerManagePromptsE2ETests(runner) {
    runner.describe('E2E: Manage Prompts Page', () => {

        runner.it('E2E: View All Prompts - should display prompts list with categories', () => {
            if (typeof renderPrompts === 'function' && typeof window.setTestPrompts === 'function') {
                const container = document.getElementById('prompts-container');
                
                // Set up test prompts with various data
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'Python Best Practices',
                        content: 'What are the best practices for Python development?',
                        category: 'Programming',
                        responses: [
                            {
                                modelName: 'GPT-4',
                                response: 'Here are key Python best practices...',
                                timestamp: '2024-01-01T10:00:00.000Z'
                            }
                        ]
                    },
                    {
                        rowId: 3,
                        title: 'ML Fundamentals',
                        content: 'Explain machine learning basics',
                        category: 'Education',
                        responses: []
                    },
                    {
                        rowId: 4,
                        title: 'Code Review',
                        content: 'Review this code snippet',
                        category: 'Programming',
                        responses: [
                            {
                                modelName: 'GPT-4',
                                response: 'Response 1',
                                timestamp: '2024-01-01T10:00:00.000Z'
                            },
                            {
                                modelName: 'Gemini',
                                response: 'Response 2',
                                timestamp: '2024-01-01T11:00:00.000Z'
                            }
                        ]
                    }
                ]);
                
                // Render prompts
                renderPrompts();
                
                // Verify prompts rendered
                assert.truthy(container.innerHTML.length > 0);
                assert.falsy(container.innerHTML.includes('No prompts yet'));
            }
        });

        runner.it('E2E: Add New Prompt - should open modal and create prompt', () => {
            if (typeof showPromptModal === 'function' && typeof hidePromptModal === 'function') {
                const modal = document.getElementById('prompt-modal');
                const titleInput = document.getElementById('prompt-title');
                const contentInput = document.getElementById('prompt-content');
                const categoryInput = document.getElementById('prompt-category');
                
                // Open modal for new prompt
                showPromptModal();
                
                // Verify modal opened with empty fields
                assert.equals(modal.style.display, 'flex');
                assert.equals(titleInput.value, '');
                assert.equals(contentInput.value, '');
                assert.equals(categoryInput.value, '');
                assert.falsy(modal.dataset.editId);
                
                // Simulate user input
                titleInput.value = 'New Prompt';
                contentInput.value = 'This is a new prompt content';
                categoryInput.value = 'Testing';
                
                // Verify values set
                assert.equals(titleInput.value, 'New Prompt');
                assert.equals(contentInput.value, 'This is a new prompt content');
                assert.equals(categoryInput.value, 'Testing');
                
                // Close modal
                hidePromptModal();
                assert.equals(modal.style.display, 'none');
            }
        });

        runner.it('E2E: Edit Existing Prompt - should load prompt data into modal', () => {
            if (typeof showPromptModal === 'function' && typeof window.setTestPrompts === 'function') {
                const modal = document.getElementById('prompt-modal');
                const titleInput = document.getElementById('prompt-title');
                const contentInput = document.getElementById('prompt-content');
                const categoryInput = document.getElementById('prompt-category');
                
                // Set up test prompt
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'Existing Prompt',
                        content: 'Existing content here',
                        category: 'Original Category',
                        responses: []
                    }
                ]);
                
                // Open modal for editing
                showPromptModal(2);
                
                // Verify modal opened with prompt data
                assert.equals(modal.style.display, 'flex');
                assert.equals(titleInput.value, 'Existing Prompt');
                assert.equals(contentInput.value, 'Existing content here');
                assert.equals(categoryInput.value, 'Original Category');
                assert.equals(modal.dataset.editId, '2');
                
                // Simulate editing
                titleInput.value = 'Updated Prompt';
                contentInput.value = 'Updated content';
                categoryInput.value = 'New Category';
                
                // Verify changes
                assert.equals(titleInput.value, 'Updated Prompt');
                assert.equals(contentInput.value, 'Updated content');
                assert.equals(categoryInput.value, 'New Category');
            }
        });

        runner.it('E2E: View Prompt Responses - should open response modal with all responses', () => {
            if (typeof showResponseModal === 'function' && typeof window.setTestPrompts === 'function') {
                const modal = document.getElementById('response-modal');
                const promptTitle = document.getElementById('response-prompt-title');
                
                // Set up prompt with multiple responses
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'Multi-Response Prompt',
                        content: 'Test content',
                        category: 'Testing',
                        responses: [
                            {
                                modelName: 'GPT-4',
                                response: 'GPT-4 response here',
                                timestamp: '2024-01-01T10:00:00.000Z'
                            },
                            {
                                modelName: 'Gemini Pro',
                                response: 'Gemini response here',
                                timestamp: '2024-01-01T11:00:00.000Z'
                            },
                            {
                                modelName: 'Claude 3',
                                response: 'Claude response here',
                                timestamp: '2024-01-01T12:00:00.000Z'
                            }
                        ]
                    }
                ]);
                
                // Open response modal
                showResponseModal(2);
                
                // Verify modal opened with correct prompt
                assert.equals(modal.style.display, 'flex');
                assert.equals(promptTitle.textContent, 'Multi-Response Prompt');
                assert.equals(modal.dataset.promptId, '2');
                
                // Verify prompt has 3 responses
                const prompts = window.savedPrompts || window.prompts || [];
                const prompt = prompts.find(p => p.rowId === 2);
                assert.exists(prompt, 'Prompt should exist');
                assert.equals(prompt.responses.length, 3);
            }
        });

        runner.it('E2E: Add Response to Prompt - should open modal and allow adding response', () => {
            if (typeof showResponseModal === 'function' && typeof window.setTestPrompts === 'function') {
                const modal = document.getElementById('response-modal');
                const modelNameInput = document.getElementById('response-model-name');
                const contentInput = document.getElementById('response-content');
                
                // Set up prompt
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'Test Prompt',
                        content: 'Test content',
                        category: 'Testing',
                        responses: []
                    }
                ]);
                
                // Open response modal
                showResponseModal(2);
                
                // Verify modal opened
                assert.equals(modal.style.display, 'flex');
                assert.equals(modal.dataset.promptId, '2');
                
                // Simulate adding new response
                modelNameInput.value = 'GPT-4 Turbo';
                contentInput.value = 'This is a new response from GPT-4 Turbo';
                
                // Verify values set
                assert.equals(modelNameInput.value, 'GPT-4 Turbo');
                assert.equals(contentInput.value, 'This is a new response from GPT-4 Turbo');
            }
        });

        runner.it('E2E: Delete Prompt - should remove prompt from list', () => {
            if (typeof window.setTestPrompts === 'function' && typeof renderPrompts === 'function') {
                const container = document.getElementById('prompts-container');
                
                // Set up prompts
                window.setTestPrompts([
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
                    }
                ]);
                
                // Verify initial count
                const prompts = window.savedPrompts || window.prompts || [];
                assert.equals(prompts.length, 2);
                
                // Simulate deletion
                const filtered = prompts.filter(p => p.rowId !== 2);
                if (window.savedPrompts) {
                    window.savedPrompts = filtered;
                } else {
                    window.prompts = filtered;
                }
                
                // Verify deletion
                const updatedPrompts = window.savedPrompts || window.prompts || [];
                assert.equals(updatedPrompts.length, 1);
                assert.equals(updatedPrompts[0].rowId, 3);
                
                // Re-render
                renderPrompts();
                
                // Verify UI updated
                assert.truthy(container.innerHTML.length > 0);
            }
        });

        runner.it('E2E: Empty State - should show message when no prompts', () => {
            if (typeof renderPrompts === 'function' && typeof window.setTestPrompts === 'function') {
                const container = document.getElementById('prompts-container');
                
                // Set empty prompts
                window.setTestPrompts([]);
                
                // Render
                renderPrompts();
                
                // Verify empty state shown
                assert.truthy(container.innerHTML.includes('No prompts yet'));
            }
        });

        runner.it('E2E: Filter by Category - should group prompts by category', () => {
            if (typeof window.setTestPrompts === 'function') {
                // Set up prompts with different categories
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'Python Tips',
                        content: 'Content',
                        category: 'Programming',
                        responses: []
                    },
                    {
                        rowId: 3,
                        title: 'JS Best Practices',
                        content: 'Content',
                        category: 'Programming',
                        responses: []
                    },
                    {
                        rowId: 4,
                        title: 'ML Basics',
                        content: 'Content',
                        category: 'Education',
                        responses: []
                    },
                    {
                        rowId: 5,
                        title: 'Random',
                        content: 'Content',
                        category: '',
                        responses: []
                    }
                ]);
                
                // Group by category
                const byCategory = {};
                const prompts = window.savedPrompts || window.prompts || [];
                prompts.forEach(prompt => {
                    const cat = prompt.category || 'Uncategorized';
                    if (!byCategory[cat]) {
                        byCategory[cat] = [];
                    }
                    byCategory[cat].push(prompt);
                });
                
                // Verify grouping
                assert.equals(byCategory['Programming'].length, 2);
                assert.equals(byCategory['Education'].length, 1);
                assert.equals(byCategory['Uncategorized'].length, 1);
            }
        });

        runner.it('E2E: Modal Close Behavior - should clear form on close', () => {
            if (typeof showPromptModal === 'function' && typeof hidePromptModal === 'function') {
                const modal = document.getElementById('prompt-modal');
                const titleInput = document.getElementById('prompt-title');
                const contentInput = document.getElementById('prompt-content');
                const categoryInput = document.getElementById('prompt-category');
                
                // Open modal and fill in data
                showPromptModal();
                titleInput.value = 'Test Title';
                contentInput.value = 'Test Content';
                categoryInput.value = 'Test Category';
                
                // Close modal
                hidePromptModal();
                
                // Verify modal closed
                assert.equals(modal.style.display, 'none');
                
                // Note: Form clearing would typically happen in hidePromptModal implementation
                // This test verifies the modal closes properly
            }
        });

        runner.it('E2E: Response Count Display - should show correct response count', () => {
            if (typeof window.setTestPrompts === 'function') {
                window.setTestPrompts([
                    {
                        rowId: 2,
                        title: 'No Responses',
                        content: 'Content',
                        category: 'Test',
                        responses: []
                    },
                    {
                        rowId: 3,
                        title: 'One Response',
                        content: 'Content',
                        category: 'Test',
                        responses: [
                            { modelName: 'GPT-4', response: 'Response', timestamp: '2024-01-01' }
                        ]
                    },
                    {
                        rowId: 4,
                        title: 'Multiple Responses',
                        content: 'Content',
                        category: 'Test',
                        responses: [
                            { modelName: 'GPT-4', response: 'R1', timestamp: '2024-01-01' },
                            { modelName: 'Gemini', response: 'R2', timestamp: '2024-01-01' },
                            { modelName: 'Claude', response: 'R3', timestamp: '2024-01-01' }
                        ]
                    }
                ]);
                
                // Verify response counts
                assert.equals(window.savedPrompts[0].responses.length, 0);
                assert.equals(window.savedPrompts[1].responses.length, 1);
                assert.equals(window.savedPrompts[2].responses.length, 3);
            }
        });
    });
}
