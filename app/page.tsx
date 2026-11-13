'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Gamepad2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import StudentTopicCard from '@/components/StudentTopicCard';
import SectionHeader from '@/components/SectionHeader';
import { listTopics, type TopicRow } from '@/lib/topics';

export default function HomePage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [topicError, setTopicError] = useState('');

  useEffect(() => {
    listTopics()
      .then((rows) => setTopics(rows.filter((topic) => topic.is_published === true)))
      .catch((error) => setTopicError(error instanceof Error ? error.message : 'Unable to load learning topics.'))
      .finally(() => setIsLoadingTopics(false));
  }, []);

  return (
    <main>
      <section className="home-hero">
        <div className="section-shell home-hero-inner">
          <div className="home-copy">
            <p className="home-eyebrow"><Sparkles size={15} aria-hidden="true" /> Learn · Create · Protect</p>
            <h1>IP Quest</h1>
            <p className="home-lede">Big ideas start here. Discover how inventions, stories, names, and creative work are protected.</p>
            <div className="home-actions">
              <Link href="/learn" className="btn-primary">Start learning <ArrowRight size={17} aria-hidden="true" /></Link>
              <Link href="/games" className="btn-secondary"><Gamepad2 size={17} aria-hidden="true" /> Play an adventure</Link>
            </div>
            <div className="home-pill-row" aria-label="Explore the learning journey">
              <span><BookOpen size={15} aria-hidden="true" /> Real-world lessons</span>
              <span><Gamepad2 size={15} aria-hidden="true" /> Interactive games</span>
            </div>
          </div>

          <div className="home-visual" aria-label="IP Quest: Explore, learn, build a safer tomorrow">
            <div className="home-visual-top"><span>THE CREATOR TOOLKIT</span><span>01 / IDEAS</span></div>
            <Image src="/logo-mark.png" alt="IP Quest compass and lightbulb mark" width={430} height={300} priority className="home-logo-art" />
            <div className="home-visual-bottom">
              <p>Think it up. Make it yours.</p>
              <span>Learn to respect the ideas around you.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell home-learning-section">
        <SectionHeader level={2} eyebrow="Published modules" title="Find your next big idea" description="Explore lessons and practice with the topics published by your learning community." />
        {topicError && <p className="status-error" role="alert">{topicError}</p>}
        {isLoadingTopics ? (
          <p className="glass-card p-6 text-sm text-slate-600" role="status" aria-busy="true">Loading published topics...</p>
        ) : topics.length > 0 ? (
          <div className="home-topic-grid">
            {topics.map((topic) => <StudentTopicCard key={topic.$id} topic={topic} />)}
          </div>
        ) : !topicError ? (
          <div className="empty-state">
            <BookOpen size={22} aria-hidden="true" />
            <p>No published learning topics are available yet.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
