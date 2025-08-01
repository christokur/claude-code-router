// Test setup file
import { jest } from '@jest/globals';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

// Create a temporary test directory for config files
export const TEST_HOME_DIR = path.join(os.tmpdir(), 'ccr-test-' + Date.now());
export const TEST_CONFIG_FILE = path.join(TEST_HOME_DIR, 'config.json');

// Mock constants to use test directories
jest.mock('../src/constants', () => ({
  HOME_DIR: TEST_HOME_DIR,
  CONFIG_FILE: TEST_CONFIG_FILE,
  PLUGINS_DIR: path.join(TEST_HOME_DIR, 'plugins'),
  PID_FILE: path.join(TEST_HOME_DIR, '.claude-code-router.pid'),
  REFERENCE_COUNT_FILE: path.join(os.tmpdir(), 'claude-code-reference-count-test.txt'),
  DEFAULT_CONFIG: {
    LOG: false,
    OPENAI_API_KEY: "",
    OPENAI_BASE_URL: "",
    OPENAI_MODEL: "",
  }
}));

// Setup test environment before each test
beforeEach(async () => {
  // Create test directory
  await fs.mkdir(TEST_HOME_DIR, { recursive: true });
  
  // Clean up any existing test files
  try {
    await fs.unlink(TEST_CONFIG_FILE);
  } catch (error) {
    // File doesn't exist, that's fine
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clean up test directory
  try {
    await fs.rm(TEST_HOME_DIR, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, that's fine
  }
});

// Global mocks
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};