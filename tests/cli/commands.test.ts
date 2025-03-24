import { jest } from '@jest/globals';
import { createCommand } from '../../src/cli/commands.js';
import { createProject } from '../../src/commands/create.js';

jest.mock('../../src/commands/create.js', () => ({
  createProject: jest.fn()
}));

describe('CLI Commands', () => {
  const mockCreateProject = createProject as jest.MockedFunction<typeof createProject>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have correct command structure', () => {
    expect(createCommand.command).toBe('create <projectName>');
    expect(createCommand.describe).toBeDefined();
  });

  it('should call createProject with correct arguments', async () => {
    const argv = {
      projectName: 'test-project',
      template: 'test-template',
      $0: 'test',
      _: []
    };

    await createCommand.handler(argv);

    expect(mockCreateProject).toHaveBeenCalledWith(argv);
  });
});
