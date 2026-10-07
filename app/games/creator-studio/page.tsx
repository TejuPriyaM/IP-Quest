'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const creatorObjects: RegionObject[] = [
  { id: 'paint', label: 'Paint Set', position: [-8, 0.8, -4], color: '#f9a8d4', size: [1, 1, 1], description: 'Choose colors and shapes to create a new picture.', kind: 'collect' },
  { id: 'gallery', label: 'Gallery Wall', position: [0, 0.8, 0], color: '#fbbf24', size: [2.2, 1.4, 2.2], description: 'Displays work that the student created.', kind: 'station' },
  { id: 'copied', label: 'Copied Artwork', position: [7, 0.8, 4], color: '#fb7185', size: [1.4, 1.1, 1.4], description: 'Artwork that was copied without credit.', kind: 'evidence' },
  { id: 'credit', label: 'Attribution Board', position: [-8, 0.8, 3], color: '#34d399', size: [1.6, 1.1, 1.6], description: 'Sort works and add attribution.', kind: 'station' },
];

const creatorActivities = [
  { objectIds: ['paint'], type: 'art' as const },
  { objectIds: ['credit'], type: 'sort' as const },
];
const creatorMissions: RegionMission[] = [
  makeMission('Create a picture', 'Draw an original picture at the studio desk.', ['paint'], 'Use the drawing canvas to make something of your own.', 'Copyright generally relates to original creative expression.'),
  makeMission('Compare the artwork', 'Look at the copied artwork beside your own.', ['copied'], 'Compare the two works and look for details that appear in both.', 'Looking closely at a source helps you understand what was copied.'),
  makeMission('Give credit', 'Sort the artwork and its credit at the attribution board.', ['credit'], 'Place your own work, another creator’s work, and the source credit in the right sections.', 'Credit identifies the creator, but does not always replace permission.'),
];

export default function CreatorStudioPage() {
  return (
    <Region3DGame
      title="CREATOR STUDIO"
      subtitle="Create, compare, and protect original work"
      description="Use the creative studio to make original work, compare it with copied material, and organise attribution so everyone receives credit."
      accent="from-pink-500 via-rose-500 to-orange-500"
      mission="Create original work and fix the copied project."
      intro="A student project is missing attribution. Explore the studio and find the original material."
      objective="Build an original piece and correct the copied work"
      objects={creatorObjects}
      missions={creatorMissions}
      guide="Mira, creative mentor"
      badge="Creative Protector"
      environment="studio"
      conceptsLearned={[
        'Copyright generally relates to original creative expression.',
        'Attribution identifies the creator but does not always replace permission.',
        'Compare work and sources before deciding how to repair a project.',
      ]}
      activities={creatorActivities}
      onInteract={(item, context) => {
        if (item.id === 'paint') {
          context.addInventory('Paint Set');
          context.setStatus('Your original picture is saved in the studio.');
          return;
        }
        if (item.kind === 'collect') {
          context.addInventory(item.label);
          context.setStatus(`${item.label} added to your creative collection.`);
          return;
        }

        if (item.id === 'gallery') {
          context.setStatus('Your creations are on display beside the photograph. Original expression can be protected by copyright.');
          return;
        }

        if (item.id === 'copied') {
          context.setStatus('The copied picture closely matches the gallery original. Record the source and do not present another creator’s work as your own.');
          return;
        }

        if (item.id === 'credit') {
          context.setStatus('The project separates your own work from the other creator’s work and records attribution. Credit and permission are distinct.');
        }
      }}
    />
  );
}
