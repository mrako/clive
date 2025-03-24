import { jest } from '@jest/globals';
import { createProject } from '../../src/commands/create.js';
import { runCommand } from '../../src/helpers.js';

jest.mock('../../src/config.js', () => ({
  getCliveConfig: jest.fn().mockReturnValue({
    name: 'test-config',
    environment: 'test'
  })
}));

jest.mock('../../src/helpers.js', () => ({
  runCommand: jest.fn()
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

  afterAll(() => {
    mockChdir.mockRestore();
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
    expect(mockChdir).toHaveBeenCalledWith('test-project');
  });
});
