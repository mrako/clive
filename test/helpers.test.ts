import { execSync } from 'child_process';
import { runCommand, setupYargs } from '../src/helpers.js';

jest.mock('child_process');
jest.mock('process', () => ({
  ...jest.requireActual('process'),
  exit: jest.fn()
}));

describe('runCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  test('executes command successfully with logging', () => {
    runCommand('test command');

    expect(execSync).toHaveBeenCalledWith('test command', { stdio: 'inherit' });
    expect(console.log).toHaveBeenCalledWith('Running command: test command');
  });
});

describe('setupYargs', () => {
  test('returns yargs instance with create command', () => {
    const argv = setupYargs();
    expect(argv).toBeDefined();
  });
});
