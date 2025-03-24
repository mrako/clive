import { jest } from '@jest/globals';
import { setupCLI } from '../../src/cli/index.js';

const mockYargsInstance = {
  command: jest.fn().mockReturnThis(),
  demandCommand: jest.fn().mockReturnThis(),
  strict: jest.fn().mockReturnThis(),
  help: jest.fn().mockReturnThis(),
  alias: jest.fn().mockReturnThis(),
  parse: jest.fn()
};

jest.mock('yargs', () => ({
  __esModule: true,
  default: jest.fn(() => mockYargsInstance)
}));

jest.mock('yargs/helpers', () => ({
  hideBin: jest.fn((args) => args)
}));

describe('CLI Setup', () => {
  it('should configure yargs with expected options', () => {
    setupCLI();

    expect(mockYargsInstance.command).toHaveBeenCalled();
    expect(mockYargsInstance.help).toHaveBeenCalled();
    expect(mockYargsInstance.alias).toHaveBeenCalledWith('help', 'h');
    expect(mockYargsInstance.parse).toHaveBeenCalled();
  });
});
