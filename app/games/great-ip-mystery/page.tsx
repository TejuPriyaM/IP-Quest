'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const mysteryObjects: RegionObject[] = [
  { id: 'invention', label: 'Smart Irrigation Prototype', position: [-8, 0.8, -6], color: '#38bdf8', size: [1.5, 1.3, 1.5], description: 'A working technical device that solves a water-use problem.', kind: 'evidence' },
  { id: 'artwork', label: 'Original Studio Artwork', position: [-3, 0.8, 5], color: '#f472b6', size: [1.4, 1.2, 1.4], description: 'An original illustration created by the studio team.', kind: 'evidence' },
  { id: 'brand', label: 'Startup Brand Sign', position: [4, 0.8, -6], color: '#a78bfa', size: [1.5, 1.2, 0.5], description: 'A distinctive sign that identifies the startup’s services.', kind: 'sign' },
  { id: 'secret', label: 'Confidential Formula', position: [8, 0.8, 3], color: '#34d399', size: [1.1, 1.2, 1.1], description: 'Valuable information kept confidential behind access controls.', kind: 'evidence' },
  { id: 'research', label: 'Research Assignment', position: [0, 0.8, 0], color: '#fbbf24', size: [1.5, 1.1, 1.5], description: 'A report that includes another researcher’s ideas and needs source checking.', kind: 'evidence' },
];

const mysteryMissions: RegionMission[] = [
  makeMission('Investigate the lab', 'Inspect the startup’s working irrigation prototype.', ['invention'], 'Enter the lab and examine the device that solves a practical water-use problem.', 'Technical inventions may be relevant to patent protection if they satisfy applicable legal requirements.'),
  makeMission('Visit the design studio', 'Inspect the original artwork.', ['artwork'], 'Find the studio work and identify what kind of creation it is.', 'Copyright generally protects original creative expression, such as an illustration.'),
  makeMission('Check the brand office', 'Inspect the startup’s brand sign.', ['brand'], 'Look at the sign and consider how customers recognise the startup.', 'A trademark can distinguish one business’s goods or services from another’s.'),
  makeMission('Secure the confidential room', 'Inspect the access-controlled formula.', ['secret'], 'Check how the startup keeps its valuable formula confidential.', 'Trade secrets rely on secrecy and reasonable steps to keep information protected.'),
  makeMission('Review the research room', 'Investigate the assignment and its source.', ['research'], 'Compare the assignment with its source and make sure other people’s ideas are acknowledged.', 'Plagiarism involves improper use of another person’s work or ideas and presenting them as one’s own.'),
];

export default function GreatIpMysteryPage() {
  return (
    <Region3DGame
      title="THE GREAT IP MYSTERY"
      subtitle="Investigate the startup and protect every kind of IP"
      description="You investigated all five areas of the startup and identified the technical invention, creative work, brand identity, confidential information, and research sources."
      accent="from-indigo-600 via-violet-600 to-sky-700"
      mission="Explore the startup and gather evidence from every department."
      intro="A startup needs help sorting out five different kinds of intellectual property."
      objective="Investigate the startup’s lab, studio, brand office, vault, and research room"
      objects={mysteryObjects}
      missions={mysteryMissions}
      guide="Quinn, IP investigator"
      badge="IP Guardian"
      environment="startup"
      conceptsLearned={[
        'Patents may protect qualifying technical inventions.',
        'Copyright generally protects original creative expression.',
        'Trademarks distinguish businesses and their goods or services.',
        'Trade secrets rely on confidential information and reasonable protections.',
        'Research must acknowledge other people’s work and ideas.',
      ]}
      onInteract={(item, context) => {
        context.addInventory(item.label);
        const explanations: Record<string, string> = {
          invention: 'The prototype is a technical solution. Some qualifying inventions may be protected by patents.',
          artwork: 'The illustration is original creative expression, which copyright generally protects.',
          brand: 'The sign identifies the startup. Trademarks can help customers distinguish businesses.',
          secret: 'This valuable formula is kept confidential with access controls, which is important for trade-secret protection.',
          research: 'The report uses another researcher’s ideas. Check the source and give appropriate credit instead of presenting them as your own.',
        };
        context.setStatus(explanations[item.id] ?? `${item.label} added to your case file.`);
      }}
    />
  );
}
