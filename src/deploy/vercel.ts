import axios, { AxiosError } from 'axios';

interface IVercelProject {
  id: string;
  link: {
    repoId: string;
    type: string;
  };
  name: string;
}

interface IVercelError {
  error: {
    message: string;
  };
}

type Environment = 'production' | 'preview' | 'development';

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_SCOPE = process.env.VERCEL_SCOPE;

if (!VERCEL_API_TOKEN) {
  console.error('Error: Vercel API token not found. Set VERCEL_API_TOKEN in .env file.');
  process.exit(1);
}

if (!VERCEL_SCOPE) {
  console.error('Error: Vercel SCOPE not found. Set VERCEL_SCOPE in .env file.');
  process.exit(1);
}

const axiosInstance = axios.create({
  headers: {
    'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

export async function createVercelProject(repoName: string): Promise<IVercelProject | void> {
  const projectName = repoName.split('/')[1];
  const apiUrl = `https://api.vercel.com/v9/projects?teamId=${VERCEL_SCOPE}`;

  try {
    const { data } = await axiosInstance.post<IVercelProject>(apiUrl, {
      name: projectName,
      repository: {
        repo: repoName,
        sourceless: false,
        type: 'github'
      },
      rootDirectory: 'frontend'
    });

    console.log(`Project '${data.id}' with repo id '${data.link.repoId}' created successfully on Vercel.`);
    return data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as IVercelError;
      console.error('Error creating Vercel project:', errorData.error.message);
    } else {
      console.error('Error creating Vercel project:', (error as Error).message);
    }
  }
}

export async function assignDomain(projectId: string, domain: string): Promise<void> {
  const apiUrl = `https://api.vercel.com/v10/projects/${projectId}/domains?teamId=${VERCEL_SCOPE}`;

  try {
    await axiosInstance.post(apiUrl, { name: domain });
    console.log(`Domain ${domain} added successfully`);
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      console.error('Error adding domain:', error.response.data);
    } else {
      console.error('Error adding domain:', (error as Error).message);
    }
  }
}

export async function addEnvironmentVariable(
  projectId: string,
  key: string,
  value: string,
  environments: Environment[]
): Promise<void> {
  try {
    await axiosInstance.post(
      `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${VERCEL_SCOPE}`,
      {
        key,
        target: environments,
        type: 'plain',
        value
      }
    );

    console.log(`Environment variable ${key} added successfully.`);
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data) {
      const errorData = error.response.data as IVercelError;
      console.error('Error adding environment variable:', errorData.error.message);
    } else {
      console.error('Error adding environment variable:', (error as Error).message);
    }
  }
}

export async function triggerDeployment(repoName: string, repoId: string): Promise<void> {
  const projectName = repoName.split('/')[1];
  const apiUrl = `https://api.vercel.com/v13/deployments?teamId=${VERCEL_SCOPE}`;

  try {
    const { data } = await axiosInstance.post(apiUrl, {
      name: projectName,
      source: {
        ref: 'main',
        repoId,
        type: 'github'
      }
    });

    console.log(`Deployment triggered successfully to: https://${data.alias[0]}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Error triggering deployment:', error.response?.statusText || error.message);
    } else {
      console.error('Error triggering deployment:', (error as Error).message);
    }
  }
}
