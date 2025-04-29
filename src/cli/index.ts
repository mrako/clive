import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createCommand, destroyCommand } from './commands.js';

export function setupCLI(): void {
  yargs(hideBin(process.argv))
    .command(createCommand)
    .command(destroyCommand)
    .demandCommand(1, 'You need to specify a command')
    .strict()
    .help()
    .alias('help', 'h')
    .parse();
}
