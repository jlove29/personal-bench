// Google Sheets API Integration

class SheetsAPI {
    constructor() {
        this.gapiLoaded = false;
        this.gisLoaded = false;
        this.tokenClient = null;
        this.accessToken = null;
        this.sheetId = null; // Will be set per user
    }

    // Initialize the Google API
    async init() {
        return new Promise((resolve, reject) => {
            // Load the Google API client
            const script1 = document.createElement('script');
            script1.src = 'https://apis.google.com/js/api.js';
            script1.onload = () => {
                gapi.load('client', async () => {
                    await gapi.client.init({
                        discoveryDocs: CONFIG.DISCOVERY_DOCS,
                    });
                    this.gapiLoaded = true;
                    if (this.gisLoaded) resolve();
                });
            };
            document.head.appendChild(script1);

            // Load the Google Identity Services
            const script2 = document.createElement('script');
            script2.src = 'https://accounts.google.com/gsi/client';
            script2.onload = () => {
                this.tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CONFIG.CLIENT_ID,
                    scope: CONFIG.SCOPES,
                    callback: (response) => {
                        if (response.error) {
                            reject(response);
                            return;
                        }
                        this.accessToken = response.access_token;
                    },
                });
                this.gisLoaded = true;
                if (this.gapiLoaded) resolve();
            };
            document.head.appendChild(script2);
        });
    }

    // Request authorization
    async authorize() {
        return new Promise((resolve) => {
            this.tokenClient.callback = (response) => {
                if (response.error) {
                    console.error('Authorization error:', response);
                    return;
                }
                this.accessToken = response.access_token;
                gapi.client.setToken({ access_token: this.accessToken });
                resolve();
            };
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    // Create a new Google Sheet for the user
    async createSpreadsheet() {
        try {
            const response = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: 'PersonalBench Prompts'
                },
                sheets: [{
                    properties: {
                        title: CONFIG.SHEET_NAME
                    },
                    data: [{
                        startRow: 0,
                        startColumn: 0,
                        rowData: [{
                            values: [
                                { userEnteredValue: { stringValue: 'Title' } },
                                { userEnteredValue: { stringValue: 'Content' } },
                                { userEnteredValue: { stringValue: 'Category' } }
                            ]
                        }]
                    }]
                }]
            });
            
            this.sheetId = response.result.spreadsheetId;
            return this.sheetId;
        } catch (error) {
            console.error('Error creating spreadsheet:', error);
            throw error;
        }
    }

    // Get or create the user's sheet ID
    async getUserSheetId() {
        // Check localStorage first
        const storedSheetId = localStorage.getItem('personalBenchSheetId');
        if (storedSheetId) {
            this.sheetId = storedSheetId;
            return storedSheetId;
        }
        
        // Create a new sheet
        const newSheetId = await this.createSpreadsheet();
        localStorage.setItem('personalBenchSheetId', newSheetId);
        return newSheetId;
    }

    // Read all prompts from the sheet
    async getPrompts() {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetId,
                range: `${CONFIG.SHEET_NAME}!A2:C`, // Skip header row
            });

            const rows = response.result.values || [];
            return rows.map((row, index) => ({
                id: index + 2, // Row number (starting from 2 because of header)
                title: row[0] || '',
                content: row[1] || '',
                category: row[2] || ''
            }));
        } catch (error) {
            console.error('Error reading prompts:', error);
            throw error;
        }
    }

    // Add a new prompt
    async addPrompt(title, content, category = '') {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.sheetId,
                range: `${CONFIG.SHEET_NAME}!A:C`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[title, content, category]]
                }
            });
            return response.result;
        } catch (error) {
            console.error('Error adding prompt:', error);
            throw error;
        }
    }

    // Update an existing prompt
    async updatePrompt(rowId, title, content, category = '') {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.sheetId,
                range: `${CONFIG.SHEET_NAME}!A${rowId}:C${rowId}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[title, content, category]]
                }
            });
            return response.result;
        } catch (error) {
            console.error('Error updating prompt:', error);
            throw error;
        }
    }

    // Delete a prompt (by clearing the row)
    async deletePrompt(rowId) {
        try {
            const response = await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: this.sheetId,
                range: `${CONFIG.SHEET_NAME}!A${rowId}:C${rowId}`,
            });
            return response.result;
        } catch (error) {
            console.error('Error deleting prompt:', error);
            throw error;
        }
    }

    // Get the URL to the user's Google Sheet
    getSheetUrl() {
        if (!this.sheetId) return null;
        return `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit`;
    }
}

// Export for use in other files
const sheetsAPI = new SheetsAPI();
