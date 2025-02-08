import { execSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface ICommandOptions {
  logging?: boolean;
  stdio?: 'inherit' | 'pipe' | 'ignore';
}

export function runCommand(command: string, { logging = true, ...options }: ICommandOptions = { stdio: 'inherit' }): void {
  try {
    if (logging) {
      console.log(`Running command: ${command}`);
    } else {
      console.log('Running command: [REDACTED]');
    }
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`, (error as Error).message);
    process.exit(1);
  }
}

export interface ICliArgs {
  _: Array<string | number>;
  $0: string;
  projectName: string;
  template: string;
  [key: string]: unknown;
}

export function setupYargs() {
  return yargs(hideBin(process.argv))
    .command<ICliArgs>(
      'create <projectName>',
      'Create a new project with GitHub template',
      (yargsInstance) => {
        return yargsInstance
          .positional('projectName', {
            demandOption: true,
            describe: 'Name of the new project',
            type: 'string',
          })
          .option('template', {
            alias: 't',
            demandOption: true,
            description: 'GitHub repository template name in owner/repo format',
            type: 'string',
          });
      },
      (argv) => {
        if (!argv.projectName || !argv.template) {
          console.error('Error: projectName and template are required.');
          process.exit(1);
        }
      }
    )
    .help()
    .alias('help', 'h')
    .parseSync();
}
