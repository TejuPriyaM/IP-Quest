import { NextResponse } from 'next/server';
import {
  getPublishedLesson,
  LearningContentError,
  listPublishedLessons,
  listPublishedTopics,
} from '@/lib/server/learning-content';

export async function GET(request: Request) {
  const parameters = new URL(request.url).searchParams;
  const resource = parameters.get('resource');

  try {
    if (resource === 'topics') {
      return NextResponse.json({ topics: await listPublishedTopics() });
    }
    if (resource === 'lessons') {
      const lessonId = parameters.get('lessonId');
      if (lessonId) return NextResponse.json({ lesson: await getPublishedLesson(lessonId) });
      const topicId = parameters.get('topicId') ?? '';
      return NextResponse.json({ lessons: await listPublishedLessons(topicId) });
    }
    return NextResponse.json({ error: 'A valid learning content resource is required.' }, { status: 400 });
  } catch (error) {
    if (error instanceof LearningContentError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Unable to load published learning content.' }, { status: 500 });
  }
}