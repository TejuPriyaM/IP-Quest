'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const academyObjects: RegionObject[] = [
  { id: 'assignment', label: 'Student Assignment', position: [-8, 0.8, -5], color: '#fbbf24', size: [1.2, 1.1, 1.2], description: 'The assignment under investigation.', kind: 'evidence' },
  { id: 'source', label: 'Source Book', position: [-2, 0.8, 5], color: '#93c5fd', size: [1, 1, 1], description: 'The original source that should be credited.', kind: 'collect' },
  { id: 'notes', label: 'Research Notes', position: [5, 0.8, -5], color: '#a5b4fc', size: [1, 1, 1], description: 'Notes showing where copied wording appears.', kind: 'collect' },
  { id: 'lib', label: 'Library Desk', position: [0, 0.8, 0], color: '#34d399', size: [2.1, 1.2, 2.1], description: 'The place to organise original and cited material.', kind: 'station' },
  { id: 'report', label: 'Originality Report', position: [8, 0.8, 3], color: '#f9a8d4', size: [1.4, 1.1, 1.4], description: 'A visual report showing original, copied, and attributed work.', kind: 'station' },
  { id: 'teacher', label: 'Teacher Office', position: [-8, 0.8, 3], color: '#fca5a5', size: [1.4, 1.1, 1.4], description: 'The final submission check with the teacher.', kind: 'station' },
];

const academyMissions: RegionMission[] = [
  makeMission('Review the assignment', 'Open the assignment and find the source material.', ['assignment', 'source'], 'Compare the assignment with the source book and look for similar wording.', 'A source helps you check where an idea or phrase came from.'),
  makeMission('Check your notes', 'Compare the research notes with the source.', ['notes'], 'Look at the notes and identify which ideas need credit.', 'Noticing borrowed ideas helps keep authorship clear.'),
  makeMission('Fix and submit', 'Rewrite the assignment, add the source, and submit it.', ['lib', 'report', 'teacher'], 'Revise the copied wording in your own words, cite the source, then submit the report.', 'Plagiarism involves using another person’s work or ideas improperly as your own.'),
];
const academyActivities = [{ objectIds: ['lib'], type: 'document' as const }];

export default function OriginalityAcademyPage() {
  return (
    <Region3DGame
      title="ORIGINALITY ACADEMY"
      subtitle="Find the copied sections and fix the assignment"
      description="Inspect the assignment, compare source material, add proper attribution, and build an honest originality report before submission."
      accent="from-amber-400 via-yellow-500 to-orange-600"
      mission="Investigate a suspicious assignment and repair the missing citations."
      intro="The teacher suspects copied material in the student assignment. Explore the school and examine the evidence."
      objective="Collect the sources and check the assignment for copied material"
      objects={academyObjects}
      missions={academyMissions}
      guide="Ms. Rowan, research mentor"
      badge="Originality Champion"
      environment="school"
      conceptsLearned={[
        'Compare suspicious text with a source before drawing conclusions.',
        'Credit borrowed ideas and distinguish them from original work.',
        'Plagiarism involves improper use of another person’s work or ideas as one’s own.',
      ]}
      activities={academyActivities}
      onInteract={(item, context) => {
        if (item.kind === 'collect') {
          context.addInventory(item.label);
          context.setStatus(`${item.label} collected as evidence for your investigation.`);
          return;
        }

        if (item.id === 'assignment') {
          context.setStatus('You found wording that needs checking. Compare it with the source before deciding how to repair the assignment.');
          return;
        }

        if (item.id === 'lib') {
          context.setStatus('The work is repaired: borrowed ideas are credited and the student’s original ideas are clearly separated.');
          return;
        }

        if (item.id === 'report') {
          context.setStatus('The report distinguishes original work, copied sections, attributed material, and anything that still needs correction.');
          return;
        }

        if (item.id === 'teacher') {
          context.setStatus('The corrected assignment is submitted. You have checked the sources and made the authorship clear.');
        }
      }}
    />
  );
}
