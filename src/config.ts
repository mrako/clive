import { execSync } from 'child_process';
import yaml from 'js-yaml';

export function getCliveConfig(owner: string, repo: string) {
  try {
    console.log('Fetching clive-config.yml using gh api');
    const command = `gh api repos/${owner}/${repo}/contents/clive-config.yml -q .content`;
    const base64Content = execSync(command, { encoding: 'utf8' }).trim();
    const cliveConfig = Buffer.from(base64Content, 'base64').toString('utf8');
    console.log('Successfully fetched clive-config.yml');

    return yaml.load(cliveConfig);
  } catch (err) {
    console.error('Error fetching or parsing clive-config.yml:', (err as Error).message);
    process.exit(1);
  }
}
