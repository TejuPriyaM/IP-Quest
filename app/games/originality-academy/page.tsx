'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const academyObjects: RegionObject[] = [
  { id: 'assignment', label: 'Garden Project Draft', position: [-8, 0.8, -5], color: '#fbbf24', size: [1.2, 1.1, 1.2], description: 'A draft sentence to compare with the research source.', kind: 'evidence' },
  { id: 'source', label: 'School Garden Guide', position: [-2, 0.8, 5], color: '#93c5fd', size: [1, 1, 1], description: 'The guide the student used for the garden project.', kind: 'collect' },
  { id: 'notes', label: 'Research Notes', position: [5, 0.8, -5], color: '#a5b4fc', size: [1, 1, 1], description: 'Notes remind the student which garden ideas came from the guide.', kind: 'evidence' },
  { id: 'lib', label: 'Writing Desk', position: [0, 0.8, 0], color: '#34d399', size: [2.1, 1.2, 2.1], description: 'Revise the draft and add a citation to the source.', kind: 'station' },
  { id: 'report', label: 'Submission Checklist', position: [8, 0.8, 3], color: '#f9a8d4', size: [1.4, 1.1, 1.4], description: 'Check that ideas from sources are credited and exact words are marked as quotes.', kind: 'station' },
  { id: 'teacher', label: 'Teacher Submission Desk', position: [-8, 0.8, 3], color: '#fca5a5', size: [1.4, 1.1, 1.4], description: 'Hand in the checked and corrected assignment.', kind: 'station' },
];

const academyMissions: RegionMission[] = [
  makeMission('Compare draft and source', 'Check the draft sentence against the School Garden Guide.', ['assignment', 'source'], 'The draft uses a sentence from the guide. Decide how the student can use the source fairly.', 'Direct words need quotation marks and a citation; a paraphrased idea still needs a citation.'),
  makeMission('Check your research notes', 'Decide whether a paraphrased idea still needs a source.', ['notes'], 'The student wrote the guide’s idea in different words. Choose what to do before handing in the work.', 'A source is still needed when you explain someone else’s idea in your own words.'),
  makeMission('Revise and cite', 'Write a paraphrase or a correctly marked quote, then cite the guide.', ['lib'], 'Choose a genuine paraphrase or an exact quote in quotation marks. Name the School Garden Guide either way.', 'Ideas from a source need credit, even when you explain them in your own words.'),
  makeMission('Proofread your assignment', 'Use the submission checklist before handing in your work.', ['report'], 'Check that the guide is credited and any exact words have quotation marks.', 'A final check helps readers tell source material from your own writing.'),
  makeMission('Hand in your work', 'Submit the corrected assignment to your teacher.', ['teacher'], 'You have checked the draft, revised it, and credited its source. Hand it in.', 'Clear source credit is an important part of honest school work.'),
];
const academyActivities = [
  { objectIds: ['assignment', 'notes'], type: 'source-check' as const },
  { objectIds: ['lib'], type: 'document' as const },
];

export default function OriginalityAcademyPage() {
  return (
    <Region3DGame
      title="ORIGINALITY ACADEMY"
      subtitle="Check a source, revise your draft, and give credit"
      description="Compare a school-garden project with its guide, learn when ideas need a citation, and practice paraphrasing or quoting fairly."
      accent="from-amber-400 via-yellow-500 to-orange-600"
      mission="Help a student prepare an honest garden-project assignment."
      intro="A student is writing a project about the school garden. Compare the draft with its guide, add credit, and check each step before handing it in."
      objective="Compare the draft sentence with its source"
      objects={academyObjects}
      missions={academyMissions}
      guide="Ms. Rowan, research mentor"
      badge="Originality Champion"
      environment="school"
      conceptsLearned={[
        'Use quotation marks for exact words and cite the source.',
        'Cite ideas from a source even when you paraphrase them in your own words.',
        'Check the assignment before handing it in so the reader can tell which ideas came from a source.',
      ]}
      activities={academyActivities}
      onInteract={(item, context) => {
        if (item.kind === 'collect') {
          context.addInventory(item.label);
          context.setStatus(`${item.label} added to your research materials.`);
          return;
        }

        if (item.id === 'assignment') {
          context.setStatus('You found wording that needs checking. Compare it with the source before deciding how to repair the assignment.');
          return;
        }

        if (item.id === 'lib') {
          context.setStatus('The sentence has been revised and the School Garden Guide is named as its source.');
          return;
        }

        if (item.id === 'report') {
          context.setStatus('Checklist: the source is named, borrowed ideas are credited, and any exact words appear in quotation marks.');
          return;
        }

        if (item.id === 'teacher') {
          context.setStatus('The checked assignment is handed in with its source credited and the student’s own writing clearly presented.');
        }
      }}
    />
  );
}
