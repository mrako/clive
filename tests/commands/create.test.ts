import { jest } from '@jest/globals';
import { createProject } from '../../src/commands/create.js';
import { runCommand } from '../../src/utils/helpers.js';
import { execSync } from 'child_process';

jest.mock('../../src/utils/config.js', () => ({
  getCliveConfig: jest.fn().mockReturnValue({})
}));

jest.mock('../../src/utils/helpers.js', () => ({
  runCommand: jest.fn()
}));

jest.mock('child_process', () => ({
  execSync: jest.fn().mockReturnValue('git@github.com:mrako/clive.git')
}));

const mockChdir = jest.spyOn(process, 'chdir').mockImplementation(() => undefined);

describe('Create Command', () => {
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
    await createProject({
      _: [],
      $0: 'test',
      projectName: 'test-project',
      template: 'test-template'
    });

    expect(executedCommands).toEqual([
      'gh repo create test-project --template test-template --public',
      'gh repo clone test-project'
    ]);
  });
});
