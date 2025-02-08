import { execSync } from 'child_process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface CommandOptions {
  logging?: boolean;
  stdio?: 'inherit' | 'pipe' | 'ignore';
}

export function runCommand(command: string, { logging = true, ...options }: CommandOptions = { stdio: 'inherit' }): void {
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

export interface CliArgs {
  projectName: string;
  template: string;
  _: (string | number)[];
  $0: string;
  [key: string]: unknown;
}

export function setupYargs() {
  return yargs(hideBin(process.argv))
    .command<CliArgs>(
      'create <projectName>',
      'Create a new project with GitHub template',
      (yargs) => {
        return yargs
          .positional('projectName', {
            describe: 'Name of the new project',
            type: 'string',
            demandOption: true,
          })
          .option('template', {
            alias: 't',
            description: 'GitHub repository template name in owner/repo format',
            type: 'string',
            demandOption: true,
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
