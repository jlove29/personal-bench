# PersonalBench Integration Tests

This directory contains browser-based integration tests for the PersonalBench application. No Node.js or external dependencies required!

## Running the Tests

1. Open `test-runner.html` in your web browser
2. Click one of the test buttons:
   - **Run All Tests**: Executes all test suites
   - **Run Sheets API Tests**: Tests Google Sheets API functionality
   - **Run UI Tests**: Tests UI helper functions and DOM manipulation

## Test Files

### `test-helpers.js`
A lightweight testing framework with:
- `TestRunner`: Manages test execution and reporting
- `assert`: Assertion library with common test assertions
- Helper functions for DOM manipulation and async testing

### `sheets-api.test.js`
Integration tests for `sheets-api.js`:
- CSV parsing with quoted fields, commas, and newlines
- Prompt data parsing and rowId assignment
- Sheet URL generation
- Empty state handling

### `manage-prompts.test.js`
Integration tests for `manage-prompts.js`:
- Prompt rendering (empty state, single prompt, multiple prompts)
- Modal show/hide functionality
- Loading and error message display
- HTML escaping for security

### `ui-helpers.test.js`
Integration tests for `script.js` UI functions:
- Message display (user, assistant, status messages)
- LocalStorage persistence (API keys, models)
- API provider switching
- Prompt selection and clearing
- Loading indicators

## Test Coverage

The tests cover:
- ✅ Data parsing and manipulation
- ✅ DOM rendering and updates
- ✅ User interaction flows
- ✅ LocalStorage persistence
- ✅ Error handling
- ✅ Security (HTML escaping)

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

## Available Assertions

- `assert.equals(actual, expected, message)`
- `assert.notEquals(actual, expected, message)`
- `assert.truthy(value, message)`
- `assert.falsy(value, message)`
- `assert.contains(array, item, message)`
- `assert.exists(value, message)`
- `assert.isNull(value, message)`
- `assert.throws(fn, message)`
- `assert.rejects(promise, message)`
- `assert.elementExists(selector, message)`
- `assert.elementHasText(selector, text, message)`
- `assert.elementHasClass(selector, className, message)`

## Helper Functions

- `waitFor(conditionFn, timeout, interval)` - Wait for a condition to be true
- `simulateInput(element, value)` - Simulate user input
- `simulateClick(element)` - Simulate click event
- `cleanupDOM()` - Clean up test DOM elements

## Notes

- Tests run directly in the browser without any build step
- Some tests may require Google Sheets authorization
- Tests are isolated and clean up after themselves
- Console output is captured and displayed in the test runner UI
