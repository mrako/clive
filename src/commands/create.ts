import { execSync } from 'child_process';

import { runCommand } from '../utils/helpers.js';

export interface ICreateArgs {
  _: (string | number)[];
  $0: string;
  projectName: string;
  template: string;
  domain?: string;
  private?: boolean;
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
    console.error('Error retrieving repository name:', (error as Error).message);
    process.exit(1);
  }
}

export async function createProject({ projectName, template, private: isPrivate }: ICreateArgs): Promise<string> {
  const visibilityFlag = isPrivate ? '--private' : '--public';
  runCommand(`gh repo create ${projectName} --template ${template} ${visibilityFlag}`);
  runCommand(`gh repo clone ${projectName}`);

  return getRepoName({ cwd: `./${projectName}` });
}
