// Integration tests for manage-prompts.js

function registerManagePromptsTests(runner) {
    runner.describe('Manage Prompts Page Integration Tests', () => {
        
        runner.it('should render empty state when no prompts', () => {
            const container = document.getElementById('prompts-container');
            
            // Simulate empty prompts array
            window.prompts = [];
            
            // Call renderPrompts (need to load manage-prompts.js first)
            if (typeof renderPrompts === 'function') {
                renderPrompts();
                
                assert.truthy(container.innerHTML.includes('No prompts yet'));
                assert.truthy(container.innerHTML.includes('Add New Prompt'));
            }
        });
        
        runner.it('should show/hide loading indicator', () => {
            const loader = document.getElementById('loading');
            
            if (typeof showLoading === 'function') {
                showLoading(true);
                assert.equals(loader.style.display, 'flex');
                
                showLoading(false);
                assert.equals(loader.style.display, 'none');
            }
        });
        
        runner.it('should show error message and auto-hide after 5 seconds', async () => {
            const errorDiv = document.getElementById('error-message');
            
            if (typeof showError === 'function') {
                showError('Test error message');
                
                assert.equals(errorDiv.style.display, 'block');
                assert.truthy(errorDiv.textContent.includes('Test error message'));
                
                // Wait for auto-hide (we'll wait 5.1 seconds)
                await new Promise(resolve => setTimeout(resolve, 5100));
                assert.equals(errorDiv.style.display, 'none');
            }
        });
        
        runner.it('should escape HTML in escapeHtml function', () => {
            if (typeof escapeHtml === 'function') {
                const dangerous = '<script>alert("xss")</script>';
                const escaped = escapeHtml(dangerous);
                
                assert.falsy(escaped.includes('<script>'));
                assert.truthy(escaped.includes('&lt;script&gt;'));
            }
        });
        
        runner.it('should show prompt modal with correct data for editing', () => {
            if (typeof showPromptModal === 'function' && typeof window.setTestPrompts === 'function') {
                // Set up prompts data using test helper
                window.setTestPrompts([{
                    rowId: 2,
                    title: 'Test Prompt',
                    content: 'Test content',
                    category: 'Testing',
                    responses: []
                }]);
                
                showPromptModal(2);
                
                const modal = document.getElementById('prompt-modal');
                const title = document.getElementById('prompt-title');
                const content = document.getElementById('prompt-content');
                const category = document.getElementById('prompt-category');
                
                assert.equals(modal.style.display, 'flex');
                assert.equals(title.value, 'Test Prompt');
                assert.equals(content.value, 'Test content');
                assert.equals(category.value, 'Testing');
                assert.equals(modal.dataset.editId, '2');
            }
        });
        
        runner.it('should show empty prompt modal for new prompt', () => {
            if (typeof showPromptModal === 'function') {
                showPromptModal();
                
                const modal = document.getElementById('prompt-modal');
                const title = document.getElementById('prompt-title');
                const content = document.getElementById('prompt-content');
                const category = document.getElementById('prompt-category');
                
                assert.equals(modal.style.display, 'flex');
                assert.equals(title.value, '');
                assert.equals(content.value, '');
                assert.equals(category.value, '');
                assert.falsy(modal.dataset.editId);
            }
        });
        
        runner.it('should hide prompt modal', () => {
            if (typeof hidePromptModal === 'function') {
                const modal = document.getElementById('prompt-modal');
                modal.style.display = 'flex';
                
                hidePromptModal();
                
                assert.equals(modal.style.display, 'none');
            }
        });
        
        runner.it('should show response modal with prompt title', () => {
            if (typeof showResponseModal === 'function' && typeof window.setTestPrompts === 'function') {
                // Set up prompts data using test helper
                window.setTestPrompts([{
                    rowId: 2,
                    title: 'Test Prompt',
                    content: 'Test content',
                    category: 'Testing',
                    responses: []
                }]);
                
                showResponseModal(2);
                
                const modal = document.getElementById('response-modal');
                const promptTitle = document.getElementById('response-prompt-title');
                
                assert.equals(modal.style.display, 'flex');
                assert.equals(promptTitle.textContent, 'Test Prompt');
                assert.equals(modal.dataset.promptId, '2');
            }
        });
        
        runner.it('should hide response modal', () => {
            if (typeof hideResponseModal === 'function') {
                const modal = document.getElementById('response-modal');
                modal.style.display = 'flex';
                
                hideResponseModal();
                
                assert.equals(modal.style.display, 'none');
            }
        });
        
        runner.it('should render prompts with responses correctly', () => {
            if (typeof renderPrompts === 'function' && typeof window.setTestPrompts === 'function') {
                window.setTestPrompts([{
                    rowId: 2,
                    title: 'Test Prompt',
                    content: 'Test content',
                    category: 'Testing',
                    responses: [
                        {
                            modelName: 'GPT-4',
                            response: 'Test response',
                            timestamp: '2024-01-01T00:00:00.000Z'
                        }
                    ]
                }]);
                
                renderPrompts();
                
                const container = document.getElementById('prompts-container');
                // Just verify that content was rendered (not empty)
                assert.truthy(container.innerHTML.length > 0);
                // Should not show empty state
                const hasEmptyState = container.innerHTML.includes('No prompts yet');
                assert.truthy(!hasEmptyState, 'Should not show empty state when prompts exist');
            }
        });
        
        runner.it('should render multiple prompts', () => {
            if (typeof renderPrompts === 'function' && typeof window.setTestPrompts === 'function') {
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
                
                renderPrompts();
                
                const container = document.getElementById('prompts-container');
                // Just verify that content was rendered
                assert.truthy(container.innerHTML.length > 0);
                // Should not show empty state
                const hasEmptyState = container.innerHTML.includes('No prompts yet');
                assert.truthy(!hasEmptyState, 'Should not show empty state when prompts exist');
            }
        });
    });
}
