#!/usr/bin/env node

import { execSync } from 'child_process';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
const VERCEL_SCOPE = process.env.VERCEL_SCOPE;

const DOMAIN_NAME = process.env.DOMAIN_NAME;
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

if (!VERCEL_API_TOKEN) {
  console.error('Error: Vercel API token not found. Set VERCEL_API_TOKEN in .env file.');
  process.exit(1);
}

if (!VERCEL_SCOPE) {
  console.error('Error: Vercel SCOPE not found. Set VERCEL_SCOPE in .env file.');
  process.exit(1);
}

if (!REACT_APP_API_URL) {
  console.error('Error: Vercel SCOPE not found. Set REACT_APP_API_URL in .env file.');
  process.exit(1);
}

// Function to get the GitHub repository name
function getRepoName() {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
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

// Function to create the Vercel project
async function createVercelProject(repoName) {
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

async function addEnvironmentVariable(projectId, key, value, target = ['production']) {
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
        target: target, // e.g., ['production'], ['preview'], or ['development']
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

async function triggerDeployment(repoName, repoId) {
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

async function assignDomain(projectId, domain) {
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

// Main function to execute the script
(async function main() {
  const repoName = getRepoName();

  const { id: projectId , link: { repoId } } = await createVercelProject(repoName);

  if (DOMAIN_NAME) await assignDomain(projectId, DOMAIN_NAME);

  await addEnvironmentVariable(projectId, 'REACT_APP_API_URL', REACT_APP_API_URL, ['production', 'preview', 'development']);

  await triggerDeployment(repoName, repoId);
})();
