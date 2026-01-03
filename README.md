# PersonalBench

We all have favorite prompts for testing out new AI models and products.

PersonalBench helps you save your personal benchmark queries, makes it easy to try them on new models, and tracks the results.

PersonalBench doesn't store any data - your data is stored in your Google Drive account.

Access the app [here](https://jujukin.com/pages/personal_bench).

## Features

### LLM API Testing
- Support for multiple LLM providers:
  - OpenAI
  - Google
  - Anthropic
- Simple chat-style interface for testing prompts
- Local API key storage

### Google Sheets Integration
- Automatic Google Sheets creation for storing prompts and responses
- OAuth 2.0 authentication with Google
- Save prompts with titles and categories
- Track multiple model responses per prompt
- Direct link to view and edit your data in Google Sheets

### Prompt Management
- Create, edit, and delete prompts
- Organize prompts by category
- Load saved prompts for quick testing
- Compare responses from different models side-by-side
- Track timestamps for each response

## Getting Started

### Prerequisites

LLM API keys - Get keys from the providers you want to test:
- OpenAI: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Google: [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- Anthropic: [console.anthropic.com](https://console.anthropic.com/)

### Setup

1. Clone or download this repository
2. Update `config.js` with your Google Cloud OAuth client ID
3. Open `index.html` in a web browser
4. Authorize with Google to enable prompt tracking

## Project Structure

- `index.html` - Landing page with Google authentication
- `test.html` - LLM API testing interface
- `manage_prompts.html` - Prompt management interface
- `script.js` - API testing logic
- `manage-prompts.js` - Prompt management logic
- `sheets-api.js` - Google Sheets API integration
- `config.js` - Configuration (Google OAuth client ID)
- `style.css` - Styling

## Security Notes

- This is a client-side application
- API keys are stored in localStorage and sent directly from your browser to the respective API providers
- Google Sheets access uses OAuth 2.0 with session-based token storage
- Each user owns their own Google Sheet

## Browser Compatibility

Requires a modern browser with support for:
- ES6+ JavaScript features
- localStorage and sessionStorage
- Google Identity Services (for OAuth)
