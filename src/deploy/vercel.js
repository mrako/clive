import fetch from 'node-fetch';

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

export async function createVercelProject(repoName) {
  const projectName = repoName.split('/')[1]; // Use the repo name as the project name
  const apiUrl = `https://api.vercel.com/v9/projects?teamId=${VERCEL_SCOPE}`;

  const payload = {
    name: projectName,
    gitRepository: {
      type: 'github',
      repo: repoName,
      sourceless: false
    },
    rootDirectory: 'frontend'
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create project: ${errorData.error.message}`);
    }

    const data = await response.json();

    console.log(`Project '${data.id}' with repo id '${data.link.repoId}' created successfully on Vercel.`);

    return data;
  } catch (error) {
    console.error('Error creating Vercel project:', error.message);
  }
}

export async function assignDomain(projectId, domain) {
    const apiUrl = `https://api.vercel.com/v10/projects/${projectId}/domains?teamId=${VERCEL_SCOPE}`;

  const payload = {
    name: domain
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    // const data = await response.json();

    if (!response.ok) {
      const error = await response.json();
      console.error('Error adding domain:', error);
      return;
    }

    console.log(`Domain ${domain} added successfully`);
  } catch (error) {
    console.error('Error triggering deployment:', error.message);
  }
}

export async function addEnvironmentVariable(projectId, key, value, environments) {
  try {
    const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?teamId=${VERCEL_SCOPE}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: key,
        value: value,
        target: environments, // e.g., ['production'], ['preview'], or ['development']
        type: 'plain' // Type can be 'plain', 'secret', or 'encrypted'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Environment variable ${key} added successfully.`);
    } else {
      console.error(`Failed to add environment variable: ${data.error.message}`);
    }
  } catch (error) {
    console.error('Error adding environment variable:', error.message);
  }
}

export async function triggerDeployment(repoName, repoId) {
  const projectName = repoName.split('/')[1];
  const apiUrl = `https://api.vercel.com/v13/deployments?teamId=${VERCEL_SCOPE}`;

  const payload = {
    name: projectName,
    gitSource: {
      type: 'github',
      repoId: repoId,
      ref: 'main',
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    console.log(`Deployment triggered successfully to: https://${data.alias[0]}`);
  } catch (error) {
    console.error('Error triggering deployment:', error.message);
  }
}
