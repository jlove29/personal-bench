# LLM API Tester

A simple web application to test and compare different LLM APIs (OpenAI, Google Gemini, and Anthropic Claude).

## Features

- 🤖 Support for multiple LLM providers:
  - OpenAI (GPT-4, GPT-3.5)
  - Google Gemini
  - Anthropic Claude
- 🎛️ Adjustable parameters (temperature, max tokens)
- 💾 Local API key storage
- 🎨 Modern, responsive UI
- 💬 Chat-style interface

## Getting Started

1. Open `index.html` in your web browser
2. Select your preferred API provider
3. Choose a model from the dropdown
4. Enter your API key (stored locally in your browser)
5. Start testing prompts!

## API Keys

You'll need API keys from the providers you want to test:

- **OpenAI**: Get your key at [platform.openai.com](https://platform.openai.com/api-keys)
- **Google Gemini**: Get your key at [makersuite.google.com](https://makersuite.google.com/app/apikey)
- **Anthropic Claude**: Get your key at [console.anthropic.com](https://console.anthropic.com/)

API keys are stored locally in your browser's localStorage and are never sent anywhere except to the respective API endpoints.

## Usage

Simply open the `index.html` file in any modern web browser. No build process or server required!

## Security Note

This is a client-side application. Your API keys are stored in localStorage and sent directly from your browser to the API providers. For production use, consider implementing a backend proxy to handle API requests securely.

## Browser Compatibility

Works with all modern browsers that support ES6+ JavaScript features.
