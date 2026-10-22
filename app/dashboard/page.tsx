'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentProfile } from '@/lib/auth';

const STORAGE_KEY = 'ipquest-student-progress';

type Lesson = {
  id: number;
  title: string;
  topic: string;
  xp: number;
  reading: string;
  question: string;
  options: string[];
  answer: number;
};

const lessons: Lesson[] = [
  {
    id: 1,
    title: 'Introduction to Intellectual Property',
    topic: 'Basics',
    xp: 20,
    reading: 'Intellectual property (IP) refers to creations of the mind, such as inventions, writing, music, and designs. IP rights can help creators protect and share their work.',
    question: 'What does IP stand for?',
    options: ['Internet Protocol', 'Intellectual Property', 'Internal Process'],
    answer: 1,
  },
  {
    id: 2,
    title: 'Copyrights and Creative Works',
    topic: 'Copyright',
    xp: 25,
    reading: 'Copyright protects many original creative works, including songs, stories, films, and artwork. It gives creators rights over how their work is used, subject to applicable laws and exceptions.',
    question: 'Which right protects an original song?',
    options: ['Traffic rules', 'Copyright', 'School ID'],
    answer: 1,
  },
  {
    id: 3,
    title: 'Trademarks and Brand Identity',
    topic: 'Trademarks',
    xp: 25,
    reading: 'A trademark helps people recognize and distinguish the goods or services of one business from another. It may include a brand name, logo, or other distinctive sign.',
    question: 'What does a trademark protect?',
    options: ['Brand names and logos', 'New inventions', 'Books only'],
    answer: 0,
  },
  {
    id: 4,
    title: 'Patents and Inventions',
    topic: 'Patents',
    xp: 25,
    reading: 'A patent may protect a qualifying new invention. Patent rules and requirements vary, but the protection can give an inventor control over certain uses of the invention for a limited time.',
    question: 'What can a patent protect?',
    options: ['A new invention', 'A brand logo', 'A song'],
    answer: 0,
  },
  {
    id: 5,
    title: 'Industrial Designs',
    topic: 'Designs',
    xp: 25,
    reading: 'An industrial design concerns the appearance of a product, such as its shape, pattern, or decoration. Design protection is about how a product looks, not how it works.',
    question: 'What does an industrial design protect?',
    options: ['Product appearance', 'A song', 'A business name'],
    answer: 0,
  },
  {
    id: 6,
    title: 'Trade Secrets',
    topic: 'Trade Secrets',
    xp: 25,
    reading: 'A trade secret is valuable business information that is kept confidential. Examples can include a recipe, process, or customer list. Businesses use reasonable steps to keep this information from becoming public.',
    question: 'What is a trade secret?',
    options: ['Public information', 'Confidential business information', 'A trademark'],
    answer: 1,
  },
];

const questions = [
  {
    question: 'What does a patent protect?',
    options: ['An invention', 'A song playlist', 'A school timetable'],
    answer: 0,
    explanation: 'A patent can protect a qualifying invention.',
  },
  {
    question: 'Which right protects an original song?',
    options: ['Traffic rules', 'Copyright', 'A school ID'],
    answer: 1,
    explanation: 'Copyright protects original creative works such as songs.',
  },
  {
    question: 'What helps people identify a brand?',
    options: ['A trademark', 'A weather report', 'A calculator'],
    answer: 0,
    explanation: 'A trademark helps distinguish a brand’s goods or services.',
  },
  {
    question: 'Should you copy another person’s work and claim it as yours?',
    options: ['Yes, always', 'Only at school', 'No, respect their work'],
    answer: 2,
    explanation: 'Always respect other people’s creativity and rights.',
  },
  {
    question: 'Why is intellectual property important?',
    options: [
      'It protects creativity and innovation',
      'It stops all learning',
      'It makes every idea public',
    ],
    answer: 0,
    explanation: 'Intellectual property can help protect creative work and inventions.',
  },
];

type Activity = {
  id: string;
  text: string;
  date: string;
  detail: string;
};

type Progress = {
  completedLessons: number[];
  xp: number;
  quizScores: number[];
  activities: Activity[];
  streak: number;
  lastActiveDate: string;
  challengeDate: string;
  challengeCompleted: boolean;
  earnedBadges: string[];
};

const initialProgress: Progress = {
  completedLessons: [],
  xp: 0,
  quizScores: [],
  activities: [],
  streak: 1,
  lastActiveDate: '',
  challengeDate: '',
  challengeCompleted: false,
  earnedBadges: [],
};

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createActivity(text: string, detail: string): Activity {
  return {
    id: `${Date.now()}-${Math.random()}`,
    text,
    detail,
    date: new Date().toLocaleString(),
  };
}

function DashboardContent() {
  const [displayName, setDisplayName] = useState('Student');
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [ready, setReady] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [readingFinished, setReadingFinished] = useState(false);
  const [lessonSelectedAnswer, setLessonSelectedAnswer] = useState<number | null>(null);
  const [lessonFeedback, setLessonFeedback] = useState('');

  const today = getLocalDate();
  const dateSeed = today.split('-').reduce((total, part) => total + Number(part), 0);
  const question = questions[dateSeed % questions.length];

  useEffect(() => {
    let isMounted = true;

    getCurrentProfile()
      .then((currentProfile) => {
        const name = currentProfile?.profile.display_name;
        if (isMounted && typeof name === 'string' && name.trim()) {
          setDisplayName(name);
        }
      })
      .catch(() => undefined);

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as Partial<Progress>) : {};
      const restored: Progress = {
        ...initialProgress,
        ...parsed,
        completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        quizScores: Array.isArray(parsed.quizScores) ? parsed.quizScores : [],
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
        streak: typeof parsed.streak === 'number' ? parsed.streak : 1,
        earnedBadges: Array.isArray(parsed.earnedBadges) ? parsed.earnedBadges : [],
      };

      if (restored.challengeDate !== today) {
        restored.challengeDate = today;
        restored.challengeCompleted = false;
      }

      if (restored.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = [
          yesterday.getFullYear(),
          String(yesterday.getMonth() + 1).padStart(2, '0'),
          String(yesterday.getDate()).padStart(2, '0'),
        ].join('-');

        restored.streak = restored.lastActiveDate === yesterdayString
          ? Math.max(1, restored.streak) + 1
          : 1;
        restored.lastActiveDate = today;
      }

      setProgress(restored);
    } catch (error) {
      console.error('Could not load saved student progress:', error);
      setProgress({ ...initialProgress });
    } finally {
      setReady(true);
    }

    return () => {
      isMounted = false;
    };
  }, [today]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Could not save student progress:', error);
    }
  }, [progress, ready]);

  function completeLesson(id: number) {
    const lesson = lessons.find((item) => item.id === id);

    if (!lesson) {
      return;
    }

    const activity = createActivity(`Completed: ${lesson.title}`, `+${lesson.xp} XP earned`);

    setProgress((previous) => {
      if (previous.completedLessons.includes(id)) {
        return previous;
      }

      const completedLessons = [...previous.completedLessons, id];
      const earnedBadges = [...previous.earnedBadges];

      if (completedLessons.length >= 3 && !earnedBadges.includes('Creative Explorer')) {
        earnedBadges.push('Creative Explorer');
      }

      if (completedLessons.length === lessons.length && !earnedBadges.includes('IP Champion')) {
        earnedBadges.push('IP Champion');
      }

      if (previous.xp + lesson.xp >= 100 && !earnedBadges.includes('XP Collector')) {
        earnedBadges.push('XP Collector');
      }

      return {
        ...previous,
        completedLessons,
        xp: previous.xp + lesson.xp,
        earnedBadges,
        lastActiveDate: today,
        activities: [activity, ...previous.activities].slice(0, 50),
      };
    });
  }

  function openLesson(id: number) {
    setCurrentLessonId(id);
    setReadingFinished(false);
    setLessonSelectedAnswer(null);
    setLessonFeedback('');
  }

  function submitLesson() {
    const lesson = lessons.find((item) => item.id === currentLessonId);

    if (!lesson) {
      return;
    }

    if (!readingFinished) {
      setLessonFeedback('Please finish reading the lesson first.');
      return;
    }

    if (lessonSelectedAnswer === null) {
      setLessonFeedback('Please select an answer.');
      return;
    }

    if (lessonSelectedAnswer !== lesson.answer) {
      setLessonFeedback('Incorrect answer. Try again!');
      return;
    }

    completeLesson(lesson.id);
    setCurrentLessonId(null);
    setLessonFeedback(`Lesson completed successfully! You earned ${lesson.xp} XP.`);
  }

  function submitChallenge() {
    if (selectedAnswer === null) {
      setFeedback('Choose an answer first!');
      return;
    }

    if (progress.challengeCompleted) {
      setFeedback('You have already completed today’s challenge. Come back tomorrow!');
      return;
    }

    if (selectedAnswer !== question.answer) {
      setFeedback(`Not quite! ${question.explanation} Try again!`);
      return;
    }

    const activity = createActivity('Completed daily challenge', 'Score: 1/1 · +15 XP');
    setProgress((previous) => {
      if (previous.challengeCompleted) {
        return previous;
      }

      const earnedBadges = previous.earnedBadges.includes('Quiz Star')
        ? previous.earnedBadges
        : [...previous.earnedBadges, 'Quiz Star'];
      const updatedBadges = previous.xp + 15 >= 100 && !earnedBadges.includes('XP Collector')
        ? [...earnedBadges, 'XP Collector']
        : earnedBadges;

      return {
        ...previous,
        xp: previous.xp + 15,
        quizScores: [...previous.quizScores, 100],
        challengeDate: today,
        challengeCompleted: true,
        earnedBadges: updatedBadges,
        lastActiveDate: today,
        activities: [activity, ...previous.activities].slice(0, 50),
      };
    });
    setFeedback(`Correct! ${question.explanation} You earned 15 XP!`);
  }

  const completedCount = progress.completedLessons.length;
  const completionPercentage = Math.round((completedCount / lessons.length) * 100);
  const averageQuizScore = progress.quizScores.length
    ? Math.round(progress.quizScores.reduce((sum, score) => sum + score, 0) / progress.quizScores.length)
    : 0;
  const nextLesson = lessons.find((lesson) => !progress.completedLessons.includes(lesson.id));
  const currentLesson = lessons.find((lesson) => lesson.id === currentLessonId) ?? null;
  const nextMilestone = Math.ceil((progress.xp + 1) / 100) * 100;
  const xpRemaining = nextMilestone - progress.xp;

  if (!ready) {
    return <main className="dashboard-page dashboard-loading" aria-live="polite">Loading your learning progress...</main>;
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-heading">
        <p className="dashboard-eyebrow">YOUR LEARNING ADVENTURE</p>
        <h1>Welcome back, {displayName}! <span aria-hidden="true">👋</span></h1>
        <p>Learn something new, collect rewards, and become an IP Quest champion.</p>
      </header>

      <section className="dashboard-stats" aria-label="Your learning statistics">
        <article className="dashboard-stat stat-progress">
          <span aria-hidden="true">📚</span>
          <h2>{completionPercentage}%</h2>
          <p>Learning progress</p>
          <progress value={completedCount} max={lessons.length} aria-label="Lessons completed" />
          <small>{completedCount} of {lessons.length} lessons completed</small>
        </article>
        <article className="dashboard-stat stat-xp">
          <span aria-hidden="true">⭐</span>
          <h2>{progress.xp} XP</h2>
          <p>Total points earned</p>
          <small>{xpRemaining} XP until your next 100-point milestone</small>
        </article>
        <article className="dashboard-stat stat-streak">
          <span aria-hidden="true">🔥</span>
          <h2>{progress.streak} {progress.streak === 1 ? 'day' : 'days'}</h2>
          <p>Learning streak</p>
          <small>Keep learning every day!</small>
        </article>
        <article className="dashboard-stat stat-badges">
          <span aria-hidden="true">🏅</span>
          <h2>{progress.earnedBadges.length}</h2>
          <p>Badges collected</p>
          {progress.earnedBadges.length ? (
            <ul className="dashboard-badge-list">
              {progress.earnedBadges.map((badge) => <li key={badge}>{badge}</li>)}
            </ul>
          ) : (
            <small>No badges earned yet. Keep learning!</small>
          )}
        </article>
      </section>

      <section className="dashboard-section">
        <h2>Your next mission</h2>
        {nextLesson ? (
          <article className="mission-card">
            <p className="dashboard-eyebrow">UP NEXT · {nextLesson.topic}</p>
            <h3>{nextLesson.title}</h3>
            <p>Complete this lesson and earn {nextLesson.xp} XP!</p>
            <div className="dashboard-actions">
              <button type="button" onClick={() => openLesson(nextLesson.id)}>Start lesson</button>
              <Link href="/learn">Explore learning resources</Link>
            </div>
          </article>
        ) : (
          <article className="mission-card">
            <h3>You completed every lesson!</h3>
            <p>You are an IP Quest learning champion. Revisit a topic or try a game.</p>
            <Link href="/games">Play learning games</Link>
          </article>
        )}
        {lessonFeedback && !currentLesson && (
          <p className="lesson-feedback" role="status">{lessonFeedback}</p>
        )}
        {currentLesson && (
          <article className="lesson-panel" id="lesson-panel" aria-labelledby="lesson-panel-title">
            <p className="dashboard-eyebrow">LEARNING MODULE · {currentLesson.topic}</p>
            <h3 id="lesson-panel-title">{currentLesson.title}</h3>
            <p className="lesson-reading">{currentLesson.reading}</p>
            <button
              type="button"
              onClick={() => {
                setReadingFinished(true);
                setLessonFeedback('');
              }}
              disabled={readingFinished}
            >
              {readingFinished ? 'Reading complete' : 'I have finished reading'}
            </button>
            {readingFinished && (
              <>
                <fieldset className="challenge-options lesson-quiz-options">
                  <legend className="lesson-question">{currentLesson.question}</legend>
                  {currentLesson.options.map((option, index) => (
                    <label key={option} className="challenge-option">
                      <input
                        type="radio"
                        name="lesson-answer"
                        value={index}
                        checked={lessonSelectedAnswer === index}
                        onChange={() => {
                          setLessonSelectedAnswer(index);
                          setLessonFeedback('');
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
                <button type="button" onClick={submitLesson}>Submit and complete lesson</button>
              </>
            )}
            {lessonFeedback && (
              <p className={`challenge-feedback${lessonFeedback.startsWith('Incorrect') || lessonFeedback.startsWith('Please') ? ' is-error' : ''}`} role="status">
                {lessonFeedback}
              </p>
            )}
            <button
              className="text-button lesson-close-button"
              type="button"
              onClick={() => {
                setCurrentLessonId(null);
                setLessonFeedback('');
              }}
            >
              Close lesson
            </button>
          </article>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Daily brain challenge</h2>
        <p>Answer correctly to earn 15 XP. You can retry if your answer is incorrect.</p>
        <article className="challenge-card">
          <p className="dashboard-eyebrow">QUESTION OF THE DAY</p>
          <h3 id="daily-question">{question.question}</h3>
          <fieldset className="challenge-options" aria-labelledby="daily-question">
            {question.options.map((option, index) => (
              <label key={option} className="challenge-option">
                <input
                  type="radio"
                  name="daily-challenge"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={() => {
                    setSelectedAnswer(index);
                    setFeedback('');
                  }}
                  disabled={progress.challengeCompleted}
                />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
          <button type="button" onClick={submitChallenge} disabled={progress.challengeCompleted}>
            {progress.challengeCompleted ? 'Challenge completed' : 'Check my answer'}
          </button>
          {feedback && <p className="challenge-feedback" role="status">{feedback}</p>}
        </article>
      </section>

      <section className="dashboard-section">
        <h2>Achievements and rewards</h2>
        {[
          {
            name: 'Creative Explorer',
            description: 'Complete your first three lessons.',
            unlocked: progress.completedLessons.length >= 3,
          },
          {
            name: 'IP Champion',
            description: 'Complete all six lessons.',
            unlocked: progress.completedLessons.length === lessons.length,
          },
          {
            name: 'Quiz Star',
            description: 'Answer the daily challenge correctly.',
            unlocked: progress.earnedBadges.includes('Quiz Star'),
          },
          {
            name: 'XP Collector',
            description: 'Earn 100 XP.',
            unlocked: progress.xp >= 100,
          },
        ].map((badge) => (
          <article className={`achievement-item${badge.unlocked ? ' is-unlocked' : ''}`} key={badge.name}>
            <span className="achievement-mark" aria-hidden="true">{badge.unlocked ? '🏅' : '🔒'}</span>
            <div>
              <h3>{badge.name}</h3>
              <p>{badge.description}</p>
              <small>{badge.unlocked ? 'Unlocked!' : 'Keep learning to unlock'}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-section">
        <h2>Your learning summary</h2>
        <article className="summary-card">
          <p>Lessons completed: <strong>{completedCount}/{lessons.length}</strong></p>
          <p>Quiz attempts: <strong>{progress.quizScores.length}</strong></p>
          <p>Average quiz score: <strong>{averageQuizScore}%</strong></p>
          <p>Current XP: <strong>{progress.xp}</strong></p>
          <p>Current streak: <strong>{progress.streak} days</strong></p>
        </article>
        <nav className="dashboard-links" aria-label="More learning activities">
          <Link href="/learn">Continue learning</Link>
          <Link href="/games">Play games</Link>
          <Link href="/progress">View progress</Link>
        </nav>
      </section>

      <section className="dashboard-section">
        <h2>Recent activity</h2>
        {progress.activities.length === 0 ? (
          <p>Your adventure starts here! Complete a lesson or challenge to see your activity.</p>
        ) : (
          <>
            {(showAllActivities ? progress.activities : progress.activities.slice(0, 5)).map((activity) => (
              <article className="activity-item" key={activity.id}>
                <h3>{activity.text}</h3>
                <p>{activity.detail}</p>
                <small>{activity.date}</small>
              </article>
            ))}
            {progress.activities.length > 5 && (
              <button className="text-button" type="button" onClick={() => setShowAllActivities(!showAllActivities)}>
                {showAllActivities ? 'Show less' : 'View all activity'}
              </button>
            )}
          </>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Recommended next</h2>
        <article className="recommendation-card">
          <h3>{nextLesson ? nextLesson.topic : 'Explore more IP topics'}</h3>
          <p>
            {nextLesson
              ? `Continue your journey with ${nextLesson.title}.`
              : 'You have completed this learning path. Explore more activities and games!'}
          </p>
          <Link href="/learn">Explore topics</Link>
        </article>
      </section>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard allowedRoles={['student']}>
      <DashboardContent />
    </AuthGuard>
  );
}