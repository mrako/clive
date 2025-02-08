#!/usr/bin/env node

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .command('create <projectName>', 'Create a new project with GitHub template', (yargs) => {
    return yargs.positional('projectName', {
      describe: 'Name of the new project',
      type: 'string',
      demandOption: true
    })
    .option('template', {
      alias: 't',
      description: 'GitHub repository template name',
      type: 'string',
      demandOption: true
    });
  }, (argv) => {
    if (!argv.projectName || !argv.template) {
      console.error('Error: projectName and template are required.');
      process.exit(1);
    }
  })
  .help()
  .alias('help', 'h')
  .argv;

const projectName = argv.projectName;
const templateName = argv.template;

function runCommand(command, { logging = true, ...options } = { stdio: 'inherit' }) {
  try {
    if (logging) {
      console.log(`Running command: ${command}`);
    } else {
      console.log('Running command: [REDACTED]');
    }
    execSync(command, { ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error.message);
    process.exit(1);
  }
}

(async function main() {
  if (!projectName || !templateName) {
    console.error('Error: projectName and template are required.');
    process.exit(1);
  }

  runCommand(`gh repo create ${projectName} --template ${templateName} --public`);

  runCommand(`gh repo clone ${projectName}`);
  process.chdir(projectName);

  runCommand(`gh secret set AWS_BUCKET_NAME --body "${process.env.AWS_BUCKET_NAME}"`, { logging: false });
  runCommand(`gh secret set AWS_ACCESS_KEY_ID --body "${process.env.AWS_ACCESS_KEY_ID}"`, { logging: false });
  runCommand(`gh secret set AWS_SECRET_ACCESS_KEY --body "${process.env.AWS_SECRET_ACCESS_KEY}"`, { logging: false });
  runCommand(`gh secret set AWS_SESSION_TOKEN --body "${process.env.AWS_SESSION_TOKEN}"`, { logging: false });
  runCommand(`gh secret set AWS_DEFAULT_REGION --body "${process.env.AWS_DEFAULT_REGION}"`, { logging: false });

  runCommand('gh workflow run cd.yml');
  // runCommand('git commit --allow-empty -m "Trigger GitHub Actions" && git push');

  console.log(`Project created, follow deployment here: https://github.com/mrako/${projectName}/actions`);
})();
