// Simple test framework - no external dependencies

class TestRunner {
    constructor() {
        this.tests = [];
        this.beforeEachHooks = [];
        this.afterEachHooks = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    describe(suiteName, testFn) {
        console.log(`\n📋 ${suiteName}`);
        // Clear hooks for next suite (does not affect already-registered tests)
        this.beforeEachHooks = [];
        this.afterEachHooks = [];
        testFn();
    }

    beforeEach(hookFn) {
        this.beforeEachHooks.push(hookFn);
    }

    afterEach(hookFn) {
        this.afterEachHooks.push(hookFn);
    }

    it(testName, testFn) {
        this.tests.push({
            name: testName,
            fn: testFn,
            beforeEachHooks: [...this.beforeEachHooks],
            afterEachHooks: [...this.afterEachHooks]
        });
    }

    async run() {
        console.log('🚀 Starting tests...\n');

        for (const test of this.tests) {
            this.results.total++;
            try {
                for (const hook of test.beforeEachHooks) {
                    await hook();
                }

                await test.fn();

                this.results.passed++;
                console.log(`  ✅ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.log(`  ❌ ${test.name}`);
                console.error(`     Error: ${error.message}`);
                if (error.stack) {
                    console.error(`     ${error.stack.split('\n').slice(1, 3).join('\n     ')}`);
                }
            } finally {
                // Always run afterEach for cleanup, even if test failed
                for (const hook of test.afterEachHooks) {
                    try {
                        await hook();
                    } catch (hookError) {
                        console.error(`     afterEach hook error: ${hookError.message}`);
                    }
                }
            }
        }

        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(50));
        console.log(`📊 Test Results: ${this.results.passed}/${this.results.total} passed`);
        if (this.results.failed > 0) {
            console.log(`   ❌ ${this.results.failed} failed`);
        }
        console.log('='.repeat(50));
    }
}

// Assertion helpers
const assert = {
    equals(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(
                message || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
            );
        }
    },

    notEquals(actual, expected, message = '') {
        if (actual === expected) {
            throw new Error(
                message || `Expected not to equal ${JSON.stringify(expected)}`
            );
        }
    },

    truthy(value, message = '') {
        if (!value) {
            throw new Error(message || `Expected truthy value but got ${JSON.stringify(value)}`);
        }
    },

    falsy(value, message = '') {
        if (value) {
            throw new Error(message || `Expected falsy value but got ${JSON.stringify(value)}`);
        }
    },

    contains(array, item, message = '') {
        if (!array.includes(item)) {
            throw new Error(
                message || `Expected array to contain ${JSON.stringify(item)}`
            );
        }
    },

    exists(value, message = '') {
        if (value === null || value === undefined) {
            throw new Error(message || 'Expected value to exist');
        }
    },

    isNull(value, message = '') {
        if (value !== null) {
            throw new Error(message || `Expected null but got ${JSON.stringify(value)}`);
        }
    },

    throws(fn, message = '') {
        let threw = false;
        try {
            fn();
        } catch (e) {
            threw = true;
        }
        if (!threw) {
            throw new Error(message || 'Expected function to throw');
        }
    },

    async rejects(promise, message = '') {
        let rejected = false;
        try {
            await promise;
        } catch (e) {
            rejected = true;
        }
        if (!rejected) {
            throw new Error(message || 'Expected promise to reject');
        }
    },

    elementExists(selector, message = '') {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(message || `Expected element "${selector}" to exist`);
        }
        return element;
    },

    elementHasText(selector, expectedText, message = '') {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element "${selector}" not found`);
        }
        if (!element.textContent.includes(expectedText)) {
            throw new Error(
                message || `Expected element to contain "${expectedText}" but got "${element.textContent}"`
            );
        }
    },

    elementHasClass(selector, className, message = '') {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element "${selector}" not found`);
        }
        if (!element.classList.contains(className)) {
            throw new Error(
                message || `Expected element to have class "${className}"`
            );
        }
    }
};

// Helper to wait for a condition
async function waitFor(conditionFn, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        if (conditionFn()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error('Timeout waiting for condition');
}

// Helper to simulate user input
function simulateInput(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

// Helper to simulate click
function simulateClick(element) {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

// Helper to clean up DOM after tests
function cleanupDOM() {
    const containers = ['#messages', '#prompts-container', '#main-content'];
    containers.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = '';
        }
    });
}
