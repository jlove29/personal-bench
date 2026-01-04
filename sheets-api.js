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

                    // Restore access token from sessionStorage if available
                    const storedToken = sessionStorage.getItem('googleAccessToken');
                    if (storedToken) {
                        this.accessToken = storedToken;
                        gapi.client.setToken({ access_token: this.accessToken });
                        console.log('Restored access token from sessionStorage');
                    }

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
                // Store token in sessionStorage for use across pages
                sessionStorage.setItem('googleAccessToken', this.accessToken);
                resolve();
            };
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    // Create a new Google Sheet for the user using Drive API
    async createSpreadsheet() {
        try {
            // Create a new spreadsheet file using Drive API
            const fileMetadata = {
                name: 'PersonalBench Prompts',
                mimeType: 'application/vnd.google-apps.spreadsheet'
            };

            const response = await gapi.client.drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            });

            this.sheetId = response.result.id;
            
            // Initialize with header row using CSV format
            const csvContent = 'Title,Content,Category,ModelResponses\n';
            const blob = new Blob([csvContent], { type: 'text/csv' });
            
            await this.uploadFileContent(this.sheetId, blob);
            
            return this.sheetId;
        } catch (error) {
            console.error('Error creating spreadsheet:', error);
            throw error;
        }
    }

    // Helper method to upload content to a file
    async uploadFileContent(fileId, blob) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const contentType = 'text/csv';
        const metadata = {
            mimeType: 'application/vnd.google-apps.spreadsheet'
        };

        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.readAsArrayBuffer(blob);
            reader.onload = async () => {
                const base64Data = btoa(
                    new Uint8Array(reader.result)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );

                const multipartRequestBody =
                    delimiter +
                    'Content-Type: application/json\r\n\r\n' +
                    JSON.stringify(metadata) +
                    delimiter +
                    'Content-Type: ' + contentType + '\r\n' +
                    'Content-Transfer-Encoding: base64\r\n' +
                    '\r\n' +
                    base64Data +
                    close_delim;

                try {
                    const response = await gapi.client.request({
                        path: `/upload/drive/v3/files/${fileId}`,
                        method: 'PATCH',
                        params: { uploadType: 'multipart' },
                        headers: {
                            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
                        },
                        body: multipartRequestBody
                    });
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            };
        });
    }

    // Get or create the user's sheet ID
    async getUserSheetId() {
        try {
            // Check if we have a stored sheet ID
            const storedSheetId = localStorage.getItem('personalBenchSheetId');
            if (storedSheetId) {
                // Verify the sheet still exists and is not trashed
                try {
                    const fileCheck = await gapi.client.drive.files.get({
                        fileId: storedSheetId,
                        fields: 'id,trashed'
                    });
                    // Only use if not trashed
                    if (!fileCheck.result.trashed) {
                        this.sheetId = storedSheetId;
                        return storedSheetId;
                    } else {
                        console.log('Stored sheet is in trash, will search for another or create new one');
                        localStorage.removeItem('personalBenchSheetId');
                    }
                } catch (error) {
                    console.log('Stored sheet not found, creating new one');
                    localStorage.removeItem('personalBenchSheetId');
                }
            }

            // Search for existing PersonalBench spreadsheet in Drive
            const searchResponse = await gapi.client.drive.files.list({
                q: "name='PersonalBench Prompts' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
                spaces: 'drive',
                fields: 'files(id, name)'
            });

            if (searchResponse.result.files && searchResponse.result.files.length > 0) {
                // Use the first matching spreadsheet
                this.sheetId = searchResponse.result.files[0].id;
                localStorage.setItem('personalBenchSheetId', this.sheetId);
                return this.sheetId;
            }

            // No existing sheet found, create a new one
            const newSheetId = await this.createSpreadsheet();
            localStorage.setItem('personalBenchSheetId', newSheetId);
            return newSheetId;
        } catch (error) {
            console.error('Error getting/creating sheet:', error);
            throw error;
        }
    }

    // Read all prompts from the sheet using Drive API export
    async getPrompts() {
        try {
            // Export the spreadsheet as CSV using Drive API
            const response = await gapi.client.drive.files.export({
                fileId: this.sheetId,
                mimeType: 'text/csv'
            });

            const csvText = response.body;
            const lines = csvText.split('\n');

            // Skip header row and parse CSV
            const rows = [];
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                const row = this.parseCSVLine(lines[i]);
                if (row.length > 0) {
                    rows.push(row);
                }
            }

            return rows.map((row, index) => ({
                rowId: index + 2, // +2 because we start at row 2 (after header)
                title: row[0] || '',
                content: row[1] || '',
                category: row[2] || '',
                responses: row[3] ? JSON.parse(row[3]) : []
            })).filter(prompt => prompt.title || prompt.content); // Filter out empty rows
        } catch (error) {
            console.error('Error reading prompts:', error);
            throw error;
        }
    }

    // Helper to parse CSV line (handles quoted fields with commas)
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        
        return result;
    }

    // Add a new prompt
    async addPrompt(title, content, category = '') {
        try {
            // Get current data
            const prompts = await this.getPrompts();
            
            // Add new row
            const newRow = [title, content, category, '[]'];
            
            // Rebuild CSV
            await this.updateSheetData([...prompts.map(p => [
                p.title,
                p.content,
                p.category,
                JSON.stringify(p.responses)
            ]), newRow]);
            
            return { success: true };
        } catch (error) {
            console.error('Error adding prompt:', error);
            throw error;
        }
    }

    // Update an existing prompt
    async updatePrompt(rowId, title, content, category = '') {
        try {
            // Get current data
            const prompts = await this.getPrompts();
            
            // Update the specific row (rowId is 1-indexed, starting at 2)
            const index = rowId - 2;
            if (index >= 0 && index < prompts.length) {
                prompts[index].title = title;
                prompts[index].content = content;
                prompts[index].category = category;
            }
            
            // Rebuild CSV
            await this.updateSheetData(prompts.map(p => [
                p.title,
                p.content,
                p.category,
                JSON.stringify(p.responses)
            ]));
            
            return { success: true };
        } catch (error) {
            console.error('Error updating prompt:', error);
            throw error;
        }
    }

    // Add a model response to a prompt
    async addModelResponse(rowId, modelName, response, metadata = {}) {
        try {
            // Get current data
            const prompts = await this.getPrompts();
            
            // Find the prompt (rowId is 1-indexed, starting at 2)
            const index = rowId - 2;
            if (index >= 0 && index < prompts.length) {
                const prompt = prompts[index];
                
                // Add new response
                prompt.responses.push({
                    modelName,
                    response,
                    timestamp: new Date().toISOString(),
                    metadata
                });
            }
            
            // Rebuild CSV
            await this.updateSheetData(prompts.map(p => [
                p.title,
                p.content,
                p.category,
                JSON.stringify(p.responses)
            ]));
            
            return { success: true };
        } catch (error) {
            console.error('Error adding model response:', error);
            throw error;
        }
    }

    // Delete a specific model response
    async deleteModelResponse(rowId, responseIndex) {
        try {
            // Get current data
            const prompts = await this.getPrompts();
            
            // Find the prompt (rowId is 1-indexed, starting at 2)
            const index = rowId - 2;
            if (index >= 0 && index < prompts.length) {
                const prompt = prompts[index];
                
                // Remove the response at the specified index
                prompt.responses.splice(responseIndex, 1);
            }
            
            // Rebuild CSV
            await this.updateSheetData(prompts.map(p => [
                p.title,
                p.content,
                p.category,
                JSON.stringify(p.responses)
            ]));
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting model response:', error);
            throw error;
        }
    }

    // Delete a prompt (by removing the row)
    async deletePrompt(rowId) {
        try {
            // Get current data
            const prompts = await this.getPrompts();
            
            // Remove the prompt (rowId is 1-indexed, starting at 2)
            const index = rowId - 2;
            if (index >= 0 && index < prompts.length) {
                prompts.splice(index, 1);
            }
            
            // Rebuild CSV
            await this.updateSheetData(prompts.map(p => [
                p.title,
                p.content,
                p.category,
                JSON.stringify(p.responses)
            ]));
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting prompt:', error);
            throw error;
        }
    }

    // Helper method to update the entire sheet data
    async updateSheetData(rows) {
        // Build CSV content
        let csvContent = 'Title,Content,Category,ModelResponses\n';
        
        for (const row of rows) {
            const escapedRow = row.map(cell => {
                const cellStr = String(cell || '');
                // Escape quotes and wrap in quotes if contains comma, quote, or newline
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return '"' + cellStr.replace(/"/g, '""') + '"';
                }
                return cellStr;
            });
            csvContent += escapedRow.join(',') + '\n';
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        await this.uploadFileContent(this.sheetId, blob);
    }

    // Get the URL to the user's Google Sheet
    getSheetUrl() {
        if (!this.sheetId) return null;
        return `https://docs.google.com/spreadsheets/d/${this.sheetId}/edit`;
    }
}

// Export for use in other files
const sheetsAPI = new SheetsAPI();
