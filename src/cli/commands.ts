import type { CommandModule } from 'yargs';
import { createProject, ICreateArgs } from '../commands/create.js';
import { deployToVercel } from '../utils/vercel.js';

export const createCommand: CommandModule<{}, ICreateArgs> = {
  command: 'create <projectName>',
  describe: 'Create a new project with GitHub template',
  builder: (yargs) => {
    return yargs
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
      })
      .option('domain', {
        alias: 'd',
        demandOption: false,
        description: 'Deploy the application after creation (e.g., vercel)',
        type: 'string'
      });
  },
  handler: async (argv) => {
    const repoName = await createProject(argv);

    if (argv.domain) {
      await deployToVercel(repoName, argv.domain);
    }
  }
};
