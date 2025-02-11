import { jest } from '@jest/globals';

jest.mock('../src/helpers.js', () => ({
  runCommand: jest.fn(),
  setupYargs: jest.fn().mockReturnValue({
    projectName: 'test-project',
    template: 'test-template'
  })
}));

jest.mock('../src/config.js', () => ({
  getCliveConfig: jest.fn().mockReturnValue({
    environment: 'test',
    name: 'test-config',
  })
}));

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

import { runCommand } from '../src/helpers.js';
import { main } from '../src/index.js';

describe('CLI Integration', () => {
  const mockRunCommand = runCommand as jest.MockedFunction<typeof runCommand>;
  const executedCommands: string[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    executedCommands.length = 0;

    mockRunCommand.mockImplementation((command) => {
      executedCommands.push(command);
    });
  });

  it('should execute the expected commands in correct order', async () => {
    await main();

    expect(executedCommands).toEqual([
      'gh repo create test-project --template test-template --public',
      'gh repo clone test-project'
    ]);
  });
});
