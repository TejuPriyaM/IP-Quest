'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import DashboardCard from '@/components/DashboardCard';
import ProgressCard from '@/components/ProgressCard';
import SectionHeader from '@/components/SectionHeader';
import { createCurrentUserJWT } from '@/lib/auth';
import { DASHBOARD_DATA_CHANGED_EVENT } from '@/lib/dashboard-events';

type DashboardAttempt = {
  attemptId: string;
  topicId: string;
  topicTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
} & (
  | { kind: 'quiz' }
  | { kind: 'level'; level: number; passed: boolean }
  | { kind: 'teacher'; passed: boolean }
  | { kind: 'assessment'; lessonId: string; lessonTitle: string }
);

type DashboardData = {
  profile: { displayName: string | null; email: string; gradeLevel: number | null; createdAt: string | null; totalPoints: number | null };
  progress: Array<{ topicId: string; topicTitle: string; completionPercentage: number; bestScore: number | null; lastAccessedAt: string | null }>;
  averageCompletion: number | null;
  completedTopics: number;
  quizAttempts: DashboardAttempt[];
  levelAttempts: DashboardAttempt[];
  teacherQuizAttempts: DashboardAttempt[];
  lessonAssessments: DashboardAttempt[];
  recentAttempts: DashboardAttempt[];
  currentQuizStreakDays: number;
  recommendedTopic: { id: string; title: string } | null;
  achievementGoals: Array<{ id: string; name: string; description: string; icon: string; xpReward: number | null; requirementType: string; requirementValue: number | null }>;
  earnedAchievements: null;
  lessonReadingCompletion: null;
};

<<<<<<< Updated upstream
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}

function getAttemptLabel(attempt: DashboardAttempt) {
  if (attempt.kind === 'quiz') return `${attempt.topicTitle} quiz`;
  if (attempt.kind === 'level') return `${attempt.topicTitle} · Level ${attempt.level}`;
  if (attempt.kind === 'teacher') return `${attempt.topicTitle} · Teacher Quiz`;
  return `${attempt.topicTitle} · ${attempt.lessonTitle}`;
=======
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
  quizAttempts: number;
  moduleQuizScores: Record<string, number>;
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
  quizAttempts: 0,
  moduleQuizScores: {},
  activities: [],
  streak: 1,
  lastActiveDate: '',
  challengeDate: '',
  challengeCompleted: false,
  earnedBadges: [],
};

function getModuleXP(completedLessons: number[]) {
  return lessons.reduce(
    (total, lesson) => total + (completedLessons.includes(lesson.id) ? lesson.xp : 0),
    0,
  );
}

function getEarnedBadges(
  completedLessons: number[],
  moduleQuizScores: Record<string, number>,
) {
  const badges: string[] = [];

  if (
    lessons.slice(0, 3).every(
      (lesson) =>
        completedLessons.includes(lesson.id) &&
        (moduleQuizScores[String(lesson.id)] ?? 0) > 70,
    )
  ) {
    badges.push('Creative Explorer');
  }

  if (
    lessons.every(
      (lesson) =>
        completedLessons.includes(lesson.id) &&
        (moduleQuizScores[String(lesson.id)] ?? 0) > 70,
    )
  ) {
    badges.push('IP Champion');
  }

  if (Object.values(moduleQuizScores).some((score) => score > 70)) {
    badges.push('Quiz Star');
  }

  if (getModuleXP(completedLessons) >= 100) {
    badges.push('XP Collector');
  }

  return badges;
}

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
      const completedLessons = Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons.filter(
            (id): id is number =>
              Number.isInteger(id) && lessons.some((lesson) => lesson.id === id),
          )
        : [];
      const quizScores = Array.isArray(parsed.quizScores)
        ? parsed.quizScores.filter(
            (score): score is number =>
              typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100,
          )
        : [];
      const moduleQuizScores: Record<string, number> = {};

      if (
        parsed.moduleQuizScores &&
        typeof parsed.moduleQuizScores === 'object' &&
        !Array.isArray(parsed.moduleQuizScores)
      ) {
        for (const [id, score] of Object.entries(parsed.moduleQuizScores)) {
          if (
            lessons.some((lesson) => String(lesson.id) === id) &&
            typeof score === 'number' &&
            Number.isFinite(score) &&
            score >= 0 &&
            score <= 100
          ) {
            moduleQuizScores[id] = score;
          }
        }
      }

      for (const id of completedLessons) {
        moduleQuizScores[String(id)] ??= 100;
      }

      const restored: Progress = {
        ...initialProgress,
        ...parsed,
        completedLessons,
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        quizScores,
        quizAttempts:
          typeof parsed.quizAttempts === 'number' &&
          Number.isInteger(parsed.quizAttempts) &&
          parsed.quizAttempts >= 0
            ? parsed.quizAttempts
            : completedLessons.length,
        moduleQuizScores,
        activities: Array.isArray(parsed.activities) ? parsed.activities : [],
        streak: typeof parsed.streak === 'number' ? parsed.streak : 1,
        earnedBadges: getEarnedBadges(completedLessons, moduleQuizScores),
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

  useEffect(() => {
    if (currentLessonId !== null) {
      document.getElementById('lesson-panel')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [currentLessonId]);

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
      const moduleQuizScores = {
        ...previous.moduleQuizScores,
        [String(id)]: 100,
      };

      return {
        ...previous,
        completedLessons,
        xp: previous.xp + lesson.xp,
        quizAttempts: previous.quizAttempts + 1,
        moduleQuizScores,
        earnedBadges: getEarnedBadges(completedLessons, moduleQuizScores),
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
      setProgress((previous) => {
        const moduleQuizScores = {
          ...previous.moduleQuizScores,
          [String(lesson.id)]: 0,
        };

        return {
          ...previous,
          quizAttempts: previous.quizAttempts + 1,
          moduleQuizScores,
          earnedBadges: getEarnedBadges(previous.completedLessons, moduleQuizScores),
        };
      });
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

      return {
        ...previous,
        xp: previous.xp + 15,
        quizScores: [...previous.quizScores, 100],
        challengeDate: today,
        challengeCompleted: true,
        lastActiveDate: today,
        activities: [activity, ...previous.activities].slice(0, 50),
      };
    });
    setFeedback(`Correct! ${question.explanation} You earned 15 XP!`);
  }

  const completedCount = progress.completedLessons.length;
  const completionPercentage = Math.round((completedCount / lessons.length) * 100);
  const moduleQuizScoreValues = Object.values(progress.moduleQuizScores);
  const averageQuizScore = moduleQuizScoreValues.length
    ? Math.round(moduleQuizScoreValues.reduce((sum, score) => sum + score, 0) / moduleQuizScoreValues.length)
    : 0;
  const passedQuizzes = moduleQuizScoreValues.filter((score) => score > 70).length;
  const moduleXP = getModuleXP(progress.completedLessons);
  const earnedBadges = getEarnedBadges(progress.completedLessons, progress.moduleQuizScores);
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
          <h2>{earnedBadges.length}</h2>
          <p>Badges collected</p>
          {earnedBadges.length ? (
            <ul className="dashboard-badge-list">
              {earnedBadges.map((badge) => <li key={badge}>{badge}</li>)}
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

      <section className="dashboard-section" id="learning-modules">
        <h2>Your learning modules</h2>
        <div className="lesson-module-list">
          {lessons.map((lesson) => {
            const completed = progress.completedLessons.includes(lesson.id);
            const score = progress.moduleQuizScores[String(lesson.id)];

            return (
              <article className="lesson-module-item" key={lesson.id}>
                <div>
                  <p className="dashboard-eyebrow">{lesson.topic}</p>
                  <h3>{lesson.title}</h3>
                  <p>
                    {completed
                      ? `Completed · Quiz score: ${score ?? 100}%`
                      : score === undefined
                        ? 'Not completed yet'
                        : `Not completed · Last quiz score: ${score}%`}
                  </p>
                  <small>Reward: {lesson.xp} XP after passing the quiz</small>
                </div>
                {completed ? (
                  <span className="lesson-module-status is-complete">✓ Completed</span>
                ) : (
                  <button type="button" onClick={() => openLesson(lesson.id)}>
                    Start module
                  </button>
                )}
              </article>
            );
          })}
        </div>
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
            description: 'Complete your first three modules and pass their quizzes.',
            unlocked: earnedBadges.includes('Creative Explorer'),
          },
          {
            name: 'IP Champion',
            description: 'Complete all six modules and pass their quizzes.',
            unlocked: earnedBadges.includes('IP Champion'),
          },
          {
            name: 'Quiz Star',
            description: 'Score above 70% on a completed module quiz.',
            unlocked: earnedBadges.includes('Quiz Star'),
          },
          {
            name: 'XP Collector',
            description: 'Earn at least 100 XP from completed modules.',
            unlocked: earnedBadges.includes('XP Collector'),
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
          <p>Modules completed: <strong>{completedCount}/{lessons.length}</strong></p>
          <p>Module quiz attempts: <strong>{progress.quizAttempts}</strong></p>
          <p>Module quizzes passed (&gt;70%): <strong>{passedQuizzes}/{lessons.length}</strong></p>
          <p>Daily challenges completed: <strong>{progress.quizScores.length}</strong></p>
          <p>Average module quiz score: <strong>{averageQuizScore}%</strong></p>
          <p>Module XP earned: <strong>{moduleXP}</strong></p>
          <p>Total XP: <strong>{progress.xp}</strong></p>
          <p>Badges collected: <strong>{earnedBadges.length}</strong></p>
          <p>Current streak: <strong>{progress.streak} days</strong></p>
        </article>
        <nav className="dashboard-links" aria-label="More learning activities">
          <a href="#learning-modules">View modules</a>
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
>>>>>>> Stashed changes
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function loadDashboard() {
      const currentRequestId = ++requestId;
      setDashboard(null);
      setIsLoading(true);
      setError('');

      try {
        const jwt = await createCurrentUserJWT();
        const response = await fetch('/api/dashboard', {
          headers: { Authorization: `Bearer ${jwt}` },
          cache: 'no-store',
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to load current dashboard data.';
          throw new Error(message);
        }
        if (active && currentRequestId === requestId) setDashboard(payload as DashboardData);
      } catch (loadError) {
        if (active && currentRequestId === requestId) {
          setDashboard(null);
          setError(loadError instanceof Error ? loadError.message : 'Unable to load current dashboard data.');
        }
      } finally {
        if (active && currentRequestId === requestId) setIsLoading(false);
      }
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadDashboard();
    };
    const refreshOnDataChange = () => void loadDashboard();

    void loadDashboard();
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener(DASHBOARD_DATA_CHANGED_EVENT, refreshOnDataChange);
    return () => {
      active = false;
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener(DASHBOARD_DATA_CHANGED_EVENT, refreshOnDataChange);
    };
  }, []);

  const averageCompletion = dashboard?.averageCompletion;
  const trackedTopicDetail = dashboard
    ? dashboard.progress.length > 0 ? `${dashboard.progress.length} topics tracked` : 'No topic progress records yet'
    : '';

  return (
    <AuthGuard allowedRoles={['student']}>
      <main className="section-shell py-14 sm:py-16">
        <SectionHeader title="Student dashboard" description="Your saved learning progress, assessment results, and next topic." />

        {error && <section className="glass-card mt-8 p-6" role="alert"><p className="text-sm text-rose-800">{error}</p><button type="button" onClick={() => window.dispatchEvent(new Event(DASHBOARD_DATA_CHANGED_EVENT))} className="btn-secondary mt-4">Try again</button></section>}
        {isLoading && !dashboard && <p className="glass-card mt-8 p-6 text-sm text-slate-600" role="status">Loading your saved dashboard...</p>}

        {dashboard && (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]" aria-busy={isLoading}>
            <section className="space-y-6">
              <div className="glass-card p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Welcome back</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Hi, {dashboard.profile.displayName || 'there'}! Ready for today’s challenge?</h2>
                <p className="mt-3 max-w-2xl text-base text-slate-600">Your dashboard reflects records saved to your student account.</p>
                <dl className="mt-5 grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-slate-500">Email</dt>
                    <dd className="mt-1 break-all text-slate-800">{dashboard.profile.email || 'No email on record'}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Grade</dt>
                    <dd className="mt-1 text-slate-800">{dashboard.profile.gradeLevel === null ? 'Not recorded' : dashboard.profile.gradeLevel}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-500">Profile created</dt>
                    <dd className="mt-1 text-slate-800">{dashboard.profile.createdAt ? formatDate(dashboard.profile.createdAt) : 'Not recorded'}</dd>
                  </div>
                </dl>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <DashboardCard
                  title="Learning progress"
                  value={averageCompletion === null ? 'No data' : `${averageCompletion}%`}
                  change={trackedTopicDetail}
                  tone="blue"
                />
                <DashboardCard
                  title="Points earned"
                  value={dashboard.profile.totalPoints === null ? 'Not recorded' : `${dashboard.profile.totalPoints} XP`}
                  change="Saved profile total"
                  tone="green"
                />
                <DashboardCard
                  title="Quiz streak"
                  value={`${dashboard.currentQuizStreakDays} ${dashboard.currentQuizStreakDays === 1 ? 'day' : 'days'}`}
                  change="From completed quiz and assessment dates"
                  tone="amber"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ProgressCard
                  label="Topics completed"
                  value={`${dashboard.completedTopics}`}
                  detail={dashboard.progress.length > 0 ? `of ${dashboard.progress.length} topics with saved progress` : 'No topic progress records yet'}
                />
                <ProgressCard
                  label="Lesson assessments"
                  value={`${dashboard.lessonAssessments.length}`}
                  detail="Completed scored lesson assessments; lesson reading completion is not recorded"
                />
                <ProgressCard
                  label="Game progress"
                  value="Not tracked"
                  detail="Separate game sessions are not saved to the student database"
                />
              </div>

              <section className="glass-card p-5 sm:p-6" aria-labelledby="topic-progress-heading">
                <h3 id="topic-progress-heading" className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Topic progress</h3>
                {dashboard.progress.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No topic progress records yet. Your saved progress will appear here.</p>
                ) : (
                  <ul className="mt-4 divide-y divide-slate-100">
                    {dashboard.progress.map((item) => (
                      <li key={item.topicId} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">{item.topicTitle}</p>
                          <p className="text-sm font-semibold text-brand-700">{item.completionPercentage}% complete</p>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${item.topicTitle} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.completionPercentage}>
                          <div className="h-full rounded-full bg-brand-600" style={{ width: `${item.completionPercentage}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {item.bestScore === null ? 'No best score recorded' : `Best score: ${item.bestScore}`}
                          {item.lastAccessedAt ? ` · Last active ${formatDate(item.lastAccessedAt)}` : ''}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </section>

            <aside className="space-y-6">
              <div className="glass-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recommended topic</p>
                {dashboard.recommendedTopic ? (
                  <>
                    <h3 className="mt-4 text-2xl font-bold text-slate-900">{dashboard.recommendedTopic.title}</h3>
                    <a href={`/learn/${encodeURIComponent(dashboard.recommendedTopic.id)}`} className="btn-secondary mt-4 inline-flex">Open topic</a>
                  </>
                ) : <p className="mt-4 text-sm text-slate-600">No published topics are available.</p>}
              </div>

              <div className="glass-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recent activity</p>
                {dashboard.recentAttempts.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No saved quiz or assessment results yet.</p>
                ) : (
                  <ul className="mt-4 space-y-4">
                    {dashboard.recentAttempts.map((attempt) => (
                      <li key={attempt.attemptId} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-slate-800">{getAttemptLabel(attempt)}</p>
                          <span className="text-xs text-slate-400">{formatDate(attempt.completedAt)}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{attempt.score}/{attempt.totalQuestions} correct ({attempt.percentage}%)</p>
                      </li>
                    ))}
                  </ul>
                )}
                <a href="/progress" className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:text-brand-800">View full score history</a>
              </div>

              <div className="glass-card p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Achievement goals</p>
                {dashboard.achievementGoals.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-600">No active achievement goals are published.</p>
                ) : (
                  <ul className="mt-4 space-y-3">
                    {dashboard.achievementGoals.map((goal) => (
                      <li key={goal.id} className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                        <p className="font-semibold text-slate-900">{goal.name}</p>
                        {goal.description && <p className="mt-1 text-sm text-slate-600">{goal.description}</p>}
                        {goal.xpReward !== null && <p className="mt-2 text-xs font-semibold text-amber-800">{goal.xpReward} XP reward</p>}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-slate-500">Earned awards are not stored in a student-specific database record yet.</p>
              </div>
            </aside>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
