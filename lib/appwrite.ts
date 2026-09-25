import { Client } from 'appwrite';

type AppwritePublicConfig = {
  endpoint: string;
  projectId: string;
  databaseId: string;
  isConfigured: boolean;
};

const readAppwritePublicConfig = (): AppwritePublicConfig => {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim() ?? '';
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim() ?? '';
  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID?.trim() ?? '';

  return {
    endpoint,
    projectId,
    databaseId,
    isConfigured: Boolean(endpoint && projectId && databaseId),
  };
};

export const appwriteConfig = readAppwritePublicConfig();

export function getAppwriteClient() {
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId) {
    return null;
  }

  const client = new Client();
  client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);

  return client;
}

export function getAppwriteDatabaseId() {
  return appwriteConfig.databaseId;
}
