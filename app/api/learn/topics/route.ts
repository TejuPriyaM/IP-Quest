import { NextResponse } from 'next/server';
import { Client, Query, TablesDB, type Models } from 'node-appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { getLearnModuleBySlug } from '@/lib/learn';
import { LevelQuizError, verifyQuizRole } from '@/lib/server/level-quiz';

const topicsTableId = 'topics';

type TopicRow = Models.Row & {
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  difficulty?: string;
  is_published?: boolean;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);
  return match?.[1] ?? null;
}

async function verifyLearnRole(jwt: string) {
  try {
    return await verifyQuizRole(jwt, 'student');
  } catch (error) {
    if (error instanceof LevelQuizError && error.statusCode === 403) {
      return verifyQuizRole(jwt, 'teacher');
    }
    throw error;
  }
}

function getPrivilegedTables() {
  const apiKey = process.env.APPWRITE_QUIZ_API_KEY?.trim();
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId || !apiKey) {
    throw new Error('Server-side Appwrite configuration is incomplete.');
  }

  return new TablesDB(new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId).setKey(apiKey));
}

export async function GET(request: Request) {
  const jwt = getBearerToken(request);
  if (!jwt) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  try {
    await verifyLearnRole(jwt);
    const tablesDb = getPrivilegedTables();
    const rows: TopicRow[] = [];
    let cursor: string | undefined;
    while (true) {
      const response = await tablesDb.listRows<TopicRow>({
        databaseId: appwriteConfig.databaseId,
        tableId: topicsTableId,
        queries: [Query.limit(100), ...(cursor ? [Query.cursorAfter(cursor)] : [])],
      });
      rows.push(...response.rows);
      if (response.rows.length < 100) break;
      cursor = response.rows[response.rows.length - 1].$id;
    }

    const topics = rows
      .filter((topic) => topic.is_published === true && Boolean(getLearnModuleBySlug(topic.slug ?? topic.title ?? '')))
      .map((topic) => ({
        $id: topic.$id,
        title: topic.title ?? '',
        slug: topic.slug ?? '',
        description: topic.description ?? '',
        icon: topic.icon ?? '',
        difficulty: topic.difficulty ?? '',
        is_published: true,
      }));

    return NextResponse.json({ topics }, { status: 200 });
  } catch (error) {
    const status = error instanceof LevelQuizError ? error.statusCode : 500;
    const message = status === 401 ? 'Authentication failed. Please sign in again.' : 'Unable to load published learning topics.';
    return NextResponse.json({ error: message }, { status });
  }
}