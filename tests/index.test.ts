import { jest } from '@jest/globals';
import { main } from '../src/index.js';
import { setupCLI } from '../src/cli/index.js';

jest.mock('../src/cli/index.js', () => ({
  setupCLI: jest.fn()
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('CLI Entry Point', () => {
  const mockSetupCLI = setupCLI as jest.MockedFunction<typeof setupCLI>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize CLI', async () => {
    await main();
    expect(mockSetupCLI).toHaveBeenCalled();
  });
});
