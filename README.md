# PersonalBench

A personal benchmarking tool for testing and tracking LLM prompts across different models. Test prompts with OpenAI, Google Gemini, and Anthropic Claude, then save and organize your results in Google Sheets for easy comparison and analysis.

## Features

### LLM API Testing
- Support for multiple LLM providers:
  - OpenAI (GPT-4, GPT-3.5, etc.)
  - Google Gemini
  - Anthropic Claude
- Simple chat-style interface for testing prompts
- Local API key storage (stored in browser localStorage)

### Google Sheets Integration
- Automatic Google Sheets creation for storing prompts and responses
- OAuth 2.0 authentication with Google
- Save prompts with titles and categories
- Track multiple model responses per prompt with metadata
- Direct link to view and edit your data in Google Sheets

### Prompt Management
- Create, edit, and delete prompts
- Organize prompts by category
- Load saved prompts for quick testing
- Compare responses from different models side-by-side
- Track timestamps and metadata for each response

## Getting Started

### Prerequisites

1. LLM API Keys - Get keys from the providers you want to test:
   - OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Google Gemini: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Anthropic Claude: [console.anthropic.com](https://console.anthropic.com/)

2. Google Cloud Project - For Google Sheets integration:
   - See [SETUP_GOOGLE_SHEETS.md](SETUP_GOOGLE_SHEETS.md) for detailed setup instructions
   - You'll need to create a Google Cloud project and enable the Sheets API
   - Configure OAuth 2.0 credentials

### Setup

1. Clone or download this repository
2. Follow the instructions in `SETUP_GOOGLE_SHEETS.md` to configure Google Sheets API
3. Update `config.js` with your Google Cloud OAuth client ID
4. Open `index.html` in a web browser
5. Authorize with Google to enable prompt tracking

### Usage

1. Launch the Tester (`test.html`):
   - Select an API provider and model
   - Enter your API key (saved locally per provider)
   - Type or load a saved prompt
   - Click send to get a response
   - Save the prompt and response to your tracker

2. Manage Prompts (`manage_prompts.html`):
   - View all saved prompts and their responses
   - Create new prompts with titles and categories
   - Edit or delete existing prompts
   - Add model responses manually
   - Compare responses from different models

## Project Structure

- `index.html` - Landing page with Google authentication
- `test.html` - LLM API testing interface
- `manage_prompts.html` - Prompt management interface
- `script.js` - API testing logic
- `manage-prompts.js` - Prompt management logic
- `sheets-api.js` - Google Sheets API integration
- `config.js` - Configuration (Google OAuth client ID)
- `style.css` - Styling

## Data Storage

- API Keys: Stored in browser localStorage (never sent to Google Sheets)
- Prompts & Responses: Stored in your personal Google Sheet
- Sheet Structure:
  - Column A: Title
  - Column B: Content (prompt text)
  - Column C: Category
  - Column D: ModelResponses (JSON array of responses with metadata)

## Security Notes

- This is a client-side application
- API keys are stored in localStorage and sent directly from your browser to the respective API providers
- Google Sheets access uses OAuth 2.0 with session-based token storage
- For production use, consider implementing a backend proxy for API requests

## Browser Compatibility

Requires a modern browser with support for:
- ES6+ JavaScript features
- localStorage and sessionStorage
- Google Identity Services (for OAuth)
