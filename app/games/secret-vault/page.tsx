'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const vaultObjects: RegionObject[] = [
  { id: 'recipe', label: 'Bakery Recipe', position: [-8, 0.8, -5], color: '#34d399', size: [1, 1, 1], description: 'A recipe the bakery has not shared outside the team.', kind: 'collect' },
  { id: 'plan', label: 'Team Project Plan', position: [-2, 0.8, 5], color: '#93c5fd', size: [1, 1, 1], description: 'An internal plan containing private project details.', kind: 'collect' },
  { id: 'computer', label: 'File Server', position: [5, 0.8, -5], color: '#fbbf24', size: [1.2, 1.2, 1.2], description: 'Choose a strong passphrase to protect the team’s files.', kind: 'station' },
  { id: 'cabinet', label: 'Document Cabinet', position: [8, 0.8, 3], color: '#a78bfa', size: [1.4, 1.1, 1.4], description: 'Lock away the team’s private paper documents.', kind: 'station' },
  { id: 'alarm', label: 'Information Sorting Desk', position: [0, 0.8, 0], color: '#f97316', size: [1.8, 1.2, 1.8], description: 'Sort private business information from material already shared publicly.', kind: 'station' },
  { id: 'visitor', label: 'Visitor Request', position: [-8, 0.8, 3], color: '#fca5a5', size: [1.2, 1.1, 1.2], description: 'A visitor asks to enter but has no work-related need for the project files.', kind: 'evidence' },
  { id: 'door', label: 'Side Door', position: [5, 0.8, 4], color: '#fb7185', size: [1.2, 2, 0.5], description: 'Secure the side door to keep the document room protected.', kind: 'door' },
  { id: 'advertisement', label: 'Public Website Advert', position: [7, 0.8, -7], color: '#facc15', size: [1.4, 1, 0.5], description: 'This advert is already public, so it is not a confidential secret.', kind: 'evidence' },
  { id: 'access-panel', label: 'Access Control Panel', position: [-5, 0.8, -8], color: '#38bdf8', size: [1.3, 1.2, 0.6], description: 'Give access to the project engineer and block the visitor.', kind: 'station' },
  { id: 'vault-seal', label: 'Secure File Room', position: [0, 0.8, 8], color: '#22c55e', size: [1.6, 1.2, 1.2], description: 'Finish the security check after files and access are protected.', kind: 'station' },
];

const vaultMissions: RegionMission[] = [
  makeMission('Sort private from public', 'Inspect the recipe, team plan, and public advert, then sort them.', ['recipe', 'plan', 'advertisement', 'alarm'], 'Decide what is still private and what has already been shared with everyone.', 'Information that is already public cannot be kept secret.'),
  makeMission('Lock up the files', 'Choose a strong passphrase, lock the paper files, and secure the side door.', ['computer', 'cabinet', 'door'], 'Protect both digital files and paper documents. Check that the room is physically secure too.', 'Good security uses practical steps to keep private information confidential.'),
  makeMission('Check who needs access', 'Review the visitor request and update the access panel.', ['visitor', 'access-panel'], 'Let the engineer in to do their job and block the visitor who does not need the files.', 'Give access only to people who need the information for their work.'),
  makeMission('Finish the security check', 'Secure the file room after checking the files and access rules.', ['vault-seal'], 'Make sure the private information is protected before you finish.', 'Trade-secret protection depends on keeping valuable information confidential.'),
];
const vaultActivities = [
  { objectIds: ['alarm'], type: 'classify' as const },
  { objectIds: ['computer'], type: 'password' as const },
  { objectIds: ['access-panel'], type: 'security' as const },
];

export default function SecretVaultPage() {
  return (
    <Region3DGame
      title="SECRET VAULT"
      subtitle="Sort, secure, and protect a small business’s secrets"
      description="Sort private information from public information, choose a stronger passphrase, lock the documents, and set sensible access rules."
      accent="from-emerald-500 via-teal-500 to-cyan-700"
      mission="Help a bakery team protect the information it has not shared."
      intro="A bakery team wants to protect its private recipe and project plan. Sort those from its public advert, then secure the files and choose who can enter."
      objective="Sort the private recipe and plan from the public advert"
      objects={vaultObjects}
      missions={vaultMissions}
      guide="Officer Vale, security lead"
      badge="Secret Keeper"
      environment="vault"
      conceptsLearned={[
        'A trade secret is valuable because it is confidential and not already public.',
        'Passwords, locked storage, and secure doors are practical ways to protect private information.',
        'Access should be limited to people with a legitimate need.',
      ]}
      activities={vaultActivities}
      onInteract={(item, context) => {
        if (item.kind === 'collect') {
          context.addInventory(item.label);
          context.setStatus(`${item.label} identified. Decide whether it is confidential or already public.`);
          return;
        }

        if (item.id === 'advertisement') {
          context.setStatus('This advertisement is public, so it cannot be kept secret. Protect confidential know-how rather than information already shared openly.');
          return;
        }

        if (item.id === 'computer') {
          context.setStatus('A longer, unique passphrase is selected for the file server. Real accounts should always use unique passwords.');
          return;
        }

        if (item.id === 'cabinet') {
          context.setStatus('The private paper documents are locked away. Digital and paper files both need sensible protection.');
          return;
        }

        if (item.id === 'door') {
          context.setStatus('The side entrance is secured. Physical access controls are one practical way to reduce disclosure risk.');
          return;
        }

        if (item.id === 'alarm') {
          context.setStatus('The information is sorted. A public advert is not a secret; keep the private recipe and internal plan protected.');
          return;
        }

        if (item.id === 'visitor') {
          context.setStatus('The visitor has no work-related reason to see the files. Check the access panel before allowing anyone in.');
          return;
        }

        if (item.id === 'access-panel') {
          context.setStatus('The access panel now permits the project team member who needs the information and blocks the unverified visitor.');
          return;
        }

        if (item.id === 'vault-seal') {
          context.setStatus('Security check complete: private information is protected, and access is limited to people who need it for their work.');
        }
      }}
    />
  );
}
