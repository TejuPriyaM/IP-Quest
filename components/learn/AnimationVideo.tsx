'use client';

import { useEffect, useState } from 'react';

const ANIMATION_VIDEO_SRC = '/media/animations/moonfin.mp4';
const ANIMATION_VIDEO_POSTER = '/media/animations/moonfin-poster.jpg';
const ANIMATION_VIDEO_CAPTIONS = '/media/animations/moonfin.vtt';

export default function AnimationVideo() {
  const [availableAssets, setAvailableAssets] = useState({ video: false, poster: false, captions: false });

  useEffect(() => {
    let isActive = true;

    async function checkAsset(path: string) {
      try {
        const response = await fetch(path, { method: 'HEAD', cache: 'no-store' });
        return response.ok;
      } catch {
        return false;
      }
    }

    void Promise.all([
      checkAsset(ANIMATION_VIDEO_SRC),
      checkAsset(ANIMATION_VIDEO_POSTER),
      checkAsset(ANIMATION_VIDEO_CAPTIONS),
    ]).then(([video, poster, captions]) => {
      if (isActive) {
        setAvailableAssets({ video, poster, captions });
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  const videoType = ANIMATION_VIDEO_SRC.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6" aria-labelledby="animated-story-video-title">
      <h2 id="animated-story-video-title" className="text-xl font-bold text-slate-900">Animated Story Video</h2>
      {availableAssets.video ? (
        <video
          controls
          playsInline
          preload="metadata"
          poster={availableAssets.poster ? ANIMATION_VIDEO_POSTER : undefined}
          className="mt-4 block aspect-video w-full rounded-xl bg-slate-950 object-contain"
        >
          <source src={ANIMATION_VIDEO_SRC} type={videoType} />
          {availableAssets.captions && <track kind="captions" src={ANIMATION_VIDEO_CAPTIONS} srcLang="en" label="English" default />}
          Your browser does not support HTML5 video.
        </video>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">Animated story coming soon.</p>
      )}
    </section>
  );
}