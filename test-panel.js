// In-page test panel for E2E testing
// Add ?test=true to URL to show the test panel

(function() {
    // Check if test mode is enabled
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.get('test')) {
        return; // Not in test mode, exit
    }

    // Set TEST_MODE flag
    window.TEST_MODE = true;

    // Create test panel HTML
    const panelHTML = `
        <div id="test-panel" style="
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #2c3e50;
            color: white;
            padding: 15px;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="font-size: 14px;">🧪 E2E Test Panel</strong>
                <button id="close-test-panel" style="
                    background: #e74c3c;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    cursor: pointer;
                    border-radius: 3px;
                ">Close</button>
            </div>
            <div style="margin-bottom: 10px;">
                <button id="run-e2e-tests" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    cursor: pointer;
                    border-radius: 3px;
                    margin-right: 10px;
                ">Run E2E Tests</button>
                <button id="authorize-sheets-test" style="
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    cursor: pointer;
                    border-radius: 3px;
                    margin-right: 10px;
                ">Authorize Google Sheets</button>
                <button id="clear-test-output" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    cursor: pointer;
                    border-radius: 3px;
                ">Clear Output</button>
            </div>
            <div id="test-output" style="
                background: #34495e;
                padding: 10px;
                border-radius: 3px;
                max-height: 200px;
                overflow-y: auto;
                font-size: 11px;
                line-height: 1.4;
            ">
                <div style="color: #95a5a6;">Ready to run tests...</div>
            </div>
        </div>
    `;

    // Inject panel when DOM is ready
    function injectPanel() {
        document.body.insertAdjacentHTML('beforeend', panelHTML);

        // Set up event listeners
        document.getElementById('close-test-panel').addEventListener('click', () => {
            document.getElementById('test-panel').remove();
        });

        document.getElementById('clear-test-output').addEventListener('click', () => {
            document.getElementById('test-output').innerHTML = '<div style="color: #95a5a6;">Output cleared...</div>';
        });

        document.getElementById('run-e2e-tests').addEventListener('click', runTests);
        
        document.getElementById('authorize-sheets-test').addEventListener('click', authorizeGoogleSheets);

        // Override console.log to capture test output
        const originalLog = console.log;
        const testOutput = document.getElementById('test-output');
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            const message = args.join(' ');
            const div = document.createElement('div');
            
            // Color code based on message content
            if (message.includes('✅') || message.includes('passed')) {
                div.style.color = '#2ecc71';
            } else if (message.includes('❌') || message.includes('failed')) {
                div.style.color = '#e74c3c';
            } else if (message.includes('⚠️') || message.includes('Skipping')) {
                div.style.color = '#f39c12';
            } else if (message.includes('📋') || message.includes('🚀')) {
                div.style.color = '#3498db';
                div.style.fontWeight = 'bold';
            } else {
                div.style.color = '#ecf0f1';
            }
            
            div.textContent = message;
            testOutput.appendChild(div);
            testOutput.scrollTop = testOutput.scrollHeight;
        };
    }

    async function authorizeGoogleSheets() {
        const output = document.getElementById('test-output');
        console.log('🔐 Authorizing Google Sheets...');
        
        try {
            // Check if sheetsAPI is available
            if (typeof sheetsAPI === 'undefined') {
                console.log('❌ sheetsAPI not loaded');
                return;
            }
            
            // Initialize if needed
            if (!sheetsAPI.accessToken) {
                await sheetsAPI.init();
            }
            
            // Request authorization
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: CONFIG.SCOPES,
                callback: async (response) => {
                    if (response.error) {
                        console.log('❌ Authorization failed:', response.error);
                        return;
                    }
                    
                    sheetsAPI.accessToken = response.access_token;
                    sessionStorage.setItem('sheetsAuthorized', 'true');
                    
                    // Try to get or create sheet
                    try {
                        await sheetsAPI.getUserSheetId();
                        console.log('✅ Google Sheets authorized successfully!');
                        console.log('   Sheet ID:', sheetsAPI.sheetId);
                    } catch (error) {
                        console.log('⚠️  Authorized but no sheet found. Creating one...');
                        try {
                            await sheetsAPI.createUserSheet();
                            console.log('✅ Sheet created successfully!');
                        } catch (createError) {
                            console.log('❌ Failed to create sheet:', createError.message);
                        }
                    }
                },
            });
            
            tokenClient.requestAccessToken();
        } catch (error) {
            console.log('❌ Authorization error:', error.message);
        }
    }

    async function runTests() {
        const output = document.getElementById('test-output');
        output.innerHTML = '';
        
        console.log('🚀 Starting E2E tests...');
        console.log('');

        // Determine which page we're on and run appropriate tests
        const currentPage = window.location.pathname.split('/').pop();
        
        if (typeof TestRunner === 'undefined') {
            console.log('❌ TestRunner not loaded. Loading test framework...');
            
            // Load test framework
            await loadScript('tests/test-helpers.js');
            
            // Load appropriate test files based on current page
            if (currentPage.includes('test.html') || currentPage === 'index.html' || currentPage === '') {
                await loadScript('tests/e2e-core.test.js');
                await loadScript('tests/e2e-sheets.test.js');
                await loadScript('tests/e2e-api.test.js');
            } else if (currentPage.includes('manage_prompts.html')) {
                await loadScript('tests/e2e-manage-prompts.test.js');
            }
        }

        // Run tests
        if (typeof TestRunner !== 'undefined') {
            const runner = new TestRunner();
            
            // Register tests based on current page
            if (currentPage.includes('test.html') || currentPage === 'index.html' || currentPage === '') {
                if (typeof registerCoreE2ETests === 'function') {
                    registerCoreE2ETests(runner);
                }
                if (typeof registerSheetsE2ETests === 'function') {
                    registerSheetsE2ETests(runner);
                }
                if (typeof registerApiE2ETests === 'function') {
                    registerApiE2ETests(runner);
                }
            } else if (currentPage.includes('manage_prompts.html')) {
                if (typeof registerManagePromptsE2ETests === 'function') {
                    registerManagePromptsE2ETests(runner);
                }
            }
            
            await runner.run();
        } else {
            console.log('❌ Failed to load test framework');
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Inject panel when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectPanel);
    } else {
        injectPanel();
    }
})();
