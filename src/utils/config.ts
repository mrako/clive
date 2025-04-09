import { execSync } from 'child_process';
import yaml from 'js-yaml';

export interface ICliveConfig {
  [key: string]: unknown;
}

export function getCliveConfig(owner: string, repo: string): ICliveConfig {
  try {
    const command = `gh api repos/${owner}/${repo}/contents/clive-config.yml -q .content`;
    const base64Content = execSync(command, { stdio: 'ignore' }).toString().trim();
    const cliveConfig = Buffer.from(base64Content, 'base64').toString('utf8');

    return yaml.load(cliveConfig) as ICliveConfig;
  } catch {
    return {};
  }
}
