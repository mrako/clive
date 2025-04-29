import { jest } from '@jest/globals';
import { destroyProject } from '../../src/commands/destroy.js';
import { runCommand } from '../../src/utils/helpers.js';

jest.mock('../../src/utils/helpers.js', () => ({
  runCommand: jest.fn()
}));

describe('Destroy Command', () => {
  const mockRunCommand = runCommand as jest.MockedFunction<typeof runCommand>;
  const executedCommands: string[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    executedCommands.length = 0;
    mockRunCommand.mockImplementation((command) => {
      executedCommands.push(command);
    });
  });

  it('should execute both GitHub and Vercel destroy commands if VERCEL_SCOPE is set', async () => {
    await destroyProject({
      projectName: 'test-project',
      owner: 'mrako'
    });

    expect(executedCommands).toEqual([
      'gh repo delete mrako/test-project --yes',
      'vercel project rm test-project --scope team_123 --yes'
    ]);
  });
});
