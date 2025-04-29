import type { CommandModule } from 'yargs';
import { createProject, ICreateArgs } from '../commands/create.js';
import { deployToVercel } from '../utils/vercel.js';
import { destroyProject, IDestroyArgs } from '../commands/destroy.js';

export const createCommand: CommandModule<{}, ICreateArgs> = {
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
      })
      .option('private', {
        alias: 'p',
        demandOption: false,
        description: 'Create the repository as private',
        type: 'boolean',
      });
  },
  command: 'create <projectName>',
  describe: 'Create a new project with GitHub template',
  handler: async (argv) => {
    const repoName = await createProject(argv);

    if (argv.domain) {
      await deployToVercel(repoName, argv.domain);
    }
  }
};

export const destroyCommand: CommandModule<{}, { projectName: string }> = {
  builder: (yargs) => {
    return yargs
      .positional('projectName', {
        demandOption: true,
        describe: 'Name of the project to destroy',
        type: 'string',
      });
  },
  command: 'destroy <projectName>',
  describe: 'Destroy a project: delete GitHub repo',
  handler: async (argv) => {
    // Dynamically get the GitHub username
    const owner = (await import('child_process')).execSync('gh api user -q .login').toString().trim();
    await destroyProject({
      projectName: argv.projectName,
      owner
    });
  }
};
