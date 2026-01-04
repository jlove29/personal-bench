// Integration tests for Google Sheets API

function registerSheetsAPITests(runner) {
    runner.describe('Google Sheets API Integration Tests', () => {

        runner.it('should parse CSV lines correctly with quoted fields', () => {
            const api = new SheetsAPI();

            const simple = api.parseCSVLine('Title,Content,Category,Responses');
            assert.equals(simple.length, 4);
            assert.equals(simple[0], 'Title');

            const withComma = api.parseCSVLine('Test,"Hello, World",Category,[]');
            assert.equals(withComma.length, 4);
            assert.equals(withComma[1], 'Hello, World');

            const withQuotes = api.parseCSVLine('Test,"He said ""Hello""",Cat,[]');
            assert.equals(withQuotes[1], 'He said "Hello"');

            const withNewline = api.parseCSVLine('Test,"Line1\nLine2",Cat,[]');
            assert.equals(withNewline[1], 'Line1\nLine2');
        });

        runner.it('should generate correct sheet URL', () => {
            const api = new SheetsAPI();
            api.sheetId = 'test-sheet-id-123';

            const url = api.getSheetUrl();
            assert.truthy(url);
            assert.truthy(url.includes('test-sheet-id-123'));
            assert.truthy(url.includes('docs.google.com/spreadsheets'));
        });

        runner.it('should return null for sheet URL when no sheetId', () => {
            const api = new SheetsAPI();
            const url = api.getSheetUrl();
            assert.isNull(url);
        });

        runner.it('should initialize with correct default values', () => {
            const api = new SheetsAPI();
            assert.equals(api.gapiLoaded, false);
            assert.equals(api.gisLoaded, false);
            assert.isNull(api.tokenClient);
            assert.isNull(api.accessToken);
            assert.isNull(api.sheetId);
        });

        runner.it('should handle empty prompts array correctly', async () => {
            if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.drive) {
                console.log('  ⚠️  Skipping - Google API not loaded or not authorized');
                return;
            }

            const api = new SheetsAPI();
            api.sheetId = 'test-id';

            // Mock the gapi response
            const originalExport = gapi.client.drive.files.export;
            gapi.client.drive.files.export = async () => ({
                body: 'Title,Content,Category,ModelResponses\n'
            });

            try {
                const prompts = await api.getPrompts();
                assert.equals(prompts.length, 0);
            } finally {
                gapi.client.drive.files.export = originalExport;
            }
        });

        runner.it('should parse prompts with responses correctly', async () => {
            if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.drive) {
                console.log('  ⚠️  Skipping - Google API not loaded or not authorized');
                return;
            }

            const api = new SheetsAPI();
            api.sheetId = 'test-id';

            const mockCSV = `Title,Content,Category,ModelResponses
Test Prompt,Test content,Testing,"[{""modelName"":""GPT-4"",""response"":""Test response"",""timestamp"":""2024-01-01T00:00:00.000Z""}]"`;

            const originalExport = gapi.client.drive.files.export;
            gapi.client.drive.files.export = async () => ({ body: mockCSV });

            try {
                const prompts = await api.getPrompts();
                assert.equals(prompts.length, 1);
                assert.equals(prompts[0].title, 'Test Prompt');
                assert.equals(prompts[0].content, 'Test content');
                assert.equals(prompts[0].category, 'Testing');
                assert.equals(prompts[0].responses.length, 1);
                assert.equals(prompts[0].responses[0].modelName, 'GPT-4');
            } finally {
                gapi.client.drive.files.export = originalExport;
            }
        });

        runner.it('should handle prompts without responses', async () => {
            if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.drive) {
                console.log('  ⚠️  Skipping - Google API not loaded or not authorized');
                return;
            }

            const api = new SheetsAPI();
            api.sheetId = 'test-id';

            const mockCSV = `Title,Content,Category,ModelResponses
Test Prompt,Test content,Testing,[]`;

            const originalExport = gapi.client.drive.files.export;
            gapi.client.drive.files.export = async () => ({ body: mockCSV });

            try {
                const prompts = await api.getPrompts();
                assert.equals(prompts.length, 1);
                assert.equals(prompts[0].responses.length, 0);
            } finally {
                gapi.client.drive.files.export = originalExport;
            }
        });

        runner.it('should assign correct rowId to prompts', async () => {
            if (typeof gapi === 'undefined' || !gapi.client || !gapi.client.drive) {
                console.log('  ⚠️  Skipping - Google API not loaded or not authorized');
                return;
            }

            const api = new SheetsAPI();
            api.sheetId = 'test-id';

            const mockCSV = `Title,Content,Category,ModelResponses
Prompt 1,Content 1,Cat1,[]
Prompt 2,Content 2,Cat2,[]
Prompt 3,Content 3,Cat3,[]`;

            const originalExport = gapi.client.drive.files.export;
            gapi.client.drive.files.export = async () => ({ body: mockCSV });

            try {
                const prompts = await api.getPrompts();
                assert.equals(prompts.length, 3);
                // rowId should be 1-indexed, starting at 2 (row 1 is header)
                assert.equals(prompts[0].rowId, 2);
                assert.equals(prompts[1].rowId, 3);
                assert.equals(prompts[2].rowId, 4);
            } finally {
                gapi.client.drive.files.export = originalExport;
            }
        });
    });
}
