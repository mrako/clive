import { runCommand } from '../utils/helpers.js';
import dotenv from 'dotenv';

dotenv.config();

export interface IDestroyArgs {
  projectName: string;
  owner: string;
}

const VERCEL_SCOPE = process.env.VERCEL_SCOPE;

export async function destroyProject({ projectName, owner }: IDestroyArgs): Promise<void> {
  runCommand(`gh repo delete ${owner}/${projectName} --yes`);
  if (VERCEL_SCOPE) {
    runCommand(`vercel project rm ${projectName} --scope ${VERCEL_SCOPE}`);
  }
}
