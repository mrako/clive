#!/usr/bin/env node

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config();

/*
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

if (!REACT_APP_API_URL) {
  console.error('Error: Vercel SCOPE not found. Set REACT_APP_API_URL in .env file.');
  process.exit(1);
}
*/

const argv = yargs(hideBin(process.argv))
  .command('create <projectName>', 'Create a new project with GitHub template', (yargs) => {
    return yargs.positional('projectName', {
      describe: 'Name of the new project',
      type: 'string',
      demandOption: true
    });
  }, (argv) => {
    if (!argv.projectName || !argv.template) {
      console.error('Error: projectName and template are required.');
      process.exit(1);
    }
  })
  .option('template', {
    alias: 't',
    description: 'GitHub repository template name',
    type: 'string',
    demandOption: true
  })
  .option('domain', {
    alias: 'd',
    description: 'Target domain name for the project',
    type: 'string',
    demandOption: true
  })
  .help()
  .alias('help', 'h')
  .argv;


const projectName = argv.projectName;
const templateName = argv.template;
const domainName = argv.domain;


function runCommand(command, options = {}) {
  try {
    console.log(`Running command: ${command}`);
    execSync(command, { ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error.message);
    process.exit(1);
  }
}


function getRepoName(options = {}) {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { ...options }).toString().trim();
    const repoMatch = remoteUrl.match(/github\.com[:/](.+\/.+)\.git$/);
    if (repoMatch) {
      return repoMatch[1]; // Returns 'username/repository'
    } else {
      throw new Error('Not a GitHub repository or invalid remote URL');
    }
  } catch (error) {
    console.error('Error retrieving repository name:', error.message);
    process.exit(1);
  }
}


(async function main() {
  runCommand(`gh repo create ${projectName} --template ${templateName} --public`);

  runCommand(`gh repo clone ${projectName}`);

  const repoName = getRepoName({ cwd: `./${projectName}` });

  // const { id: projectId , link: { repoId } } = await createVercelProject(repoName);
  // if (domainName) await assignDomain(projectId, domainName);
  // await addEnvironmentVariable(projectId, 'REACT_APP_API_URL', REACT_APP_API_URL, ['production', 'preview', 'development']);
  // await triggerDeployment(repoName, repoId);

  console.log(`Application deployed to: https://${domainName}`);
})();
