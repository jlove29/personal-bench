# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment

### Running the Application
This is a client-side web application with no build step. Serve files with any local HTTP server:
```bash
python3 -m http.server 8000
# or
python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000/index.html` in a browser.

### Running Tests
Open `test-runner.html` in a browser after starting the local server:
```bash
# Navigate to http://localhost:8000/test-runner.html
```

Test runner provides buttons for:
- **Run All Tests** - Execute complete test suite
- **Run Sheets API Tests** - Test Google Sheets integration (requires OAuth authorization via button)
- **Run UI Tests** - Test UI helpers and DOM manipulation
- **Run E2E Tests** - End-to-end integration tests

Tests run in the browser with results displayed in a console-style output panel.

## Architecture

### Data Model
The application stores all user data in a Google Sheet named "PersonalBench Prompts" with this CSV structure:
```
Title,Content,Category,ModelResponses
```

Where `ModelResponses` is a JSON-stringified array of objects:
```javascript
[
  {
    model: "gpt-4",
    response: "...",
    timestamp: "2024-01-01T12:00:00.000Z"
  },
  // ...
]
```

### State Management Pattern
All three pages (`index.html`, `test.html`, `manage_prompts.html`) share OAuth state through `sessionStorage`:
- `sheetsAuthorized`: "true" when OAuth flow completes
- `googleAccessToken`: OAuth access token for API requests
- `personalBenchSheetId`: User's spreadsheet ID (also in `localStorage`)

**Navigation flow**: Users must authorize on `index.html` first. Other pages check `sessionStorage.sheetsAuthorized` on load and redirect to index if not set.

### Core Components

#### SheetsAPI (`sheets-api.js`)
Singleton class managing all Google Sheets operations. Key methods:
- `init()` - Loads Google APIs dynamically, restores tokens from sessionStorage
- `authorize()` - Triggers OAuth popup flow
- `getUserSheetId()` - Finds or creates "PersonalBench Prompts" spreadsheet
- `getPrompts()` - Exports sheet as CSV via Drive API, parses to JS objects
- `addPrompt()`, `updatePrompt()`, `deletePrompt()` - CRUD operations via CSV export/import pattern
- `addResponse()` - Appends LLM response to prompt's ModelResponses JSON array

**Important**: All data operations use Drive API CSV export/import, not Sheets API batchUpdate. This is intentional to work with the `drive.file` scope.

#### API Testing (`script.js`)
Handles LLM API calls on `test.html`:
- Direct fetch to OpenAI API
- Uses `@google/generative-ai` SDK for Gemini (imported from CDN)
- Uses `@anthropic-ai/sdk` for Claude (imported from CDN)
- Saves last prompt/response pair for tracking via "Save to Tracker" button

#### Prompt Management (`manage-prompts.js`)
UI for CRUD operations on prompts:
- Renders prompt cards grouped by category
- Edit modal for updating prompt details
- Inline response viewing with timestamps
- Direct sync with Google Sheets on all operations

### Testing Architecture

#### Custom Test Framework (`tests/test-helpers.js`)
Minimal test runner with these primitives:
- `TestRunner` class with `describe()`, `it()`, `beforeEach()`, `afterEach()`
- Assertion library: `assert.equals()`, `assert.truthy()`, `assert.falsy()`, `assert.throws()`
- Async test support with `async () => {}` test functions

#### Test Organization
- `e2e-*.test.js` - End-to-end tests requiring full page context
- `*.test.js` - Unit/integration tests for specific modules
- All tests import code via ES6 modules or script tags in `test-runner.html`

#### Mock Pattern
`__mocks__/` contains stub implementations of Google/Anthropic SDKs to avoid import errors during test runs. Tests that need actual APIs should check for authorization state.

## Key Constraints

### Security Model
- **Client-side only** - No backend server
- **API keys in localStorage** - Keys never leave user's browser
- **OAuth scope**: `https://www.googleapis.com/auth/drive.file` (can only access files created by this app)
- Sheet ID stored in localStorage; token stored in sessionStorage (expires with browser session)

### Google Sheets as Database
The app uses Google Drive API CSV export/import instead of Sheets API for all data operations. This has implications:
- **Full sheet rewrites** on every update (addPrompt, updatePrompt, deletePrompt)
- CSV parsing handles quoted fields with embedded commas/newlines
- ModelResponses column stores JSON as escaped CSV string
- Row IDs are index-based (+2 for header offset), not stable across operations

When modifying sheets-api.js, maintain this CSV export/import pattern. Do not introduce Sheets API batchUpdate calls.

### No Build System
This is intentional. All JavaScript is ES6 modules loaded directly by the browser or via CDN:
- `@anthropic-ai/sdk` - Imported via CDN esm.sh
- `@google/generative-ai` - Imported via CDN esm.sh
- Google API Client - Loaded from googleapis.com
- Google Identity Services - Loaded from accounts.google.com

When adding dependencies, use CDN imports (esm.sh, skypack, unpkg) in HTML script tags.

## Common Patterns

### Adding a New LLM Provider
1. Add endpoint to `API_ENDPOINTS` in script.js
2. Add model to API dropdown in test.html
3. Implement request format in `sendMessage()` function
4. Handle response streaming if provider supports it
5. Update README with provider documentation link

### Modifying Sheet Structure
If changing the CSV schema:
1. Update header in `createSpreadsheet()` (sheets-api.js:95)
2. Update parse logic in `getPrompts()` (sheets-api.js:229-235)
3. Update rebuild logic in all CRUD methods (addPrompt, updatePrompt, etc.)
4. Consider backward compatibility for existing user sheets

### Testing Google Sheets Code
Tests requiring Sheets API must:
1. Check if `sheetsAPI.accessToken` exists before running
2. Provide "Authorize Google" button in test-runner.html
3. Handle 401 errors gracefully (token expiration)
4. Use `beforeEach`/`afterEach` to create/cleanup test data

Example:
```javascript
runner.describe('Sheets API Tests', () => {
    runner.beforeEach(async () => {
        if (!sheetsAPI.accessToken) {
            console.log('Skipping - no authorization');
            return;
        }
        // Test setup
    });

    runner.it('should save prompt', async () => {
        if (!sheetsAPI.accessToken) return;
        // Test logic
    });
});
```
