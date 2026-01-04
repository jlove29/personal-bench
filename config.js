// Google Sheets API Configuration
// Instructions:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Google Sheets API
// 4. Create OAuth 2.0 Client ID credentials
// 5. Replace the CLIENT_ID below with your credentials

const CONFIG = {
    // OAuth 2.0 Client ID (for user-specific access)
    CLIENT_ID: '309803961959-phoek6detmaocjog6rjlnlfqv311lg4l.apps.googleusercontent.com',

    // The name of the sheet/tab within the spreadsheet
    SHEET_NAME: 'Prompts',

    // Discovery docs for Google Sheets and Drive APIs
    DISCOVERY_DOCS: [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
        'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
    ],

    // Authorization scope (drive.file allows full access to files created by the app)
    SCOPES: 'https://www.googleapis.com/auth/drive.file'
};
