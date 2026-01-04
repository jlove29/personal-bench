# PersonalBench testing

This directory contains browser-based integration tests for the PersonalBench application.

## Running the Tests

1. Start a Python server in your terminal
2. Open `localhost:8000/test-runner.html` in a web browser
3. Click one of the test buttons:
   - **Run All Tests**: Executes all test suites
   - **Run Sheets API Tests**: Tests Google Sheets API functionality (requires Google API authorization)
   - **Run UI Tests**: Tests UI helper functions and DOM manipulation

## Writing New Tests

To add new tests, follow this pattern:

```javascript
function registerYourTests(runner) {
    runner.describe('Your Test Suite Name', () => {
        runner.it('should do something specific', () => {
            // Arrange
            const element = document.getElementById('test-element');
            
            // Act
            someFunction();
            
            // Assert
            assert.equals(element.textContent, 'expected value');
        });
        
        runner.it('should handle async operations', async () => {
            const result = await someAsyncFunction();
            assert.truthy(result);
        });
    });
}
```

Then register your tests in `test-runner.html`:

```javascript
const runner = new TestRunner();
registerYourTests(runner);
await runner.run();
```