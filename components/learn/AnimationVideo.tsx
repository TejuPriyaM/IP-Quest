const ANIMATION_VIDEOS: Record<string, { title: string; src: string }[]> = {
  patent: [
    { title: 'How Patents Protect New Inventions', src: '/media/How_Patents_Protect_New_Inventions.mp4' },
  ],
  trademark: [
    { title: 'How Trademarks Prevent Customer Confusion', src: '/media/How_Trademarks_Prevent_Customer_Confusion.mp4' },
  ],
  copyright: [
    { title: 'Who Owns Creativity?', src: '/media/Who_Owns_Creativity_.mp4' },
  ],
  'trade-secret': [
    { title: 'How Trade Secrets Protect Business Value', src: '/media/How_Trade_Secrets_Protect_Business_Value.mp4' },
    { title: 'How Trade Secrets Stay Secret', src: '/media/How_Trade_Secrets_Stay_Secret.mp4' },
  ],
  plagiarism: [
    { title: 'The Fine Line Between Research and Plagiarism', src: '/media/The_Fine_Line_Between_Research_and_Plagiarism.mp4' },
  ],
};

export default function AnimationVideo({ moduleKey }: { moduleKey: string }) {
  const videos = ANIMATION_VIDEOS[moduleKey] ?? [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6" aria-labelledby="animated-story-video-title">
      <h2 id="animated-story-video-title" className="text-xl font-bold text-slate-900">Animated Explainers</h2>
      {videos.length > 0 ? (
        <div className="mt-4 space-y-6">
          {videos.map(({ title, src }) => (
            <article key={src}>
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <video controls playsInline preload="metadata" className="mt-3 block aspect-video w-full rounded-xl bg-slate-950 object-contain">
                <source src={src} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-slate-600">No animated videos are available for this topic yet.</p>
      )}
    </section>
  );
}