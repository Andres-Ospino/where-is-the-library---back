// Global test setup
import { config } from "dotenv"

// Load test environment variables
config({ path: ".env.test" })

// Set test timeout
jest.setTimeout(30000)

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}
