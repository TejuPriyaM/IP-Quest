'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const vaultObjects: RegionObject[] = [
  { id: 'recipe', label: 'Secret Recipe', position: [-8, 0.8, -5], color: '#34d399', size: [1, 1, 1], description: 'Confidential formula that must stay private.', kind: 'collect' },
  { id: 'plan', label: 'Business Plan', position: [-2, 0.8, 5], color: '#93c5fd', size: [1, 1, 1], description: 'A sensitive project proposal for internal use only.', kind: 'collect' },
  { id: 'computer', label: 'Server Console', position: [5, 0.8, -5], color: '#fbbf24', size: [1.2, 1.2, 1.2], description: 'A secure system that needs controlled access.', kind: 'station' },
  { id: 'cabinet', label: 'Locked Cabinet', position: [8, 0.8, 3], color: '#a78bfa', size: [1.4, 1.1, 1.4], description: 'Store the confidential material safely.', kind: 'station' },
  { id: 'alarm', label: 'Security Alarm', position: [0, 0.8, 0], color: '#f97316', size: [1.8, 1.2, 1.8], description: 'Detects a breach and starts the access control challenge.', kind: 'station' },
  { id: 'visitor', label: 'Visitor Access', position: [-8, 0.8, 3], color: '#fca5a5', size: [1.2, 1.1, 1.2], description: 'A person without a legitimate need tries to enter the vault.', kind: 'evidence' },
  { id: 'door', label: 'Side Entrance', position: [5, 0.8, 4], color: '#fb7185', size: [1.2, 2, 0.5], description: 'This side entrance was left unlocked during the security breach.', kind: 'door' },
  { id: 'advertisement', label: 'Public Advertisement', position: [7, 0.8, -7], color: '#facc15', size: [1.4, 1, 0.5], description: 'This information is already public and is not a confidential secret.', kind: 'evidence' },
  { id: 'access-panel', label: 'Access Control Panel', position: [-5, 0.8, -8], color: '#38bdf8', size: [1.3, 1.2, 0.6], description: 'Set access rules for the project engineer and an unverified visitor.', kind: 'station' },
  { id: 'vault-seal', label: 'Vault Lock', position: [0, 0.8, 8], color: '#22c55e', size: [1.6, 1.2, 1.2], description: 'Engage the final vault lock after securing information and access.', kind: 'station' },
];

const vaultMissions: RegionMission[] = [
  makeMission('Find what is secret', 'Inspect the recipe, business plan, and public advert.', ['recipe', 'plan', 'advertisement'], 'Decide which information is confidential and which has already been made public.', 'A trade secret must retain value from being secret.'),
  makeMission('Secure the information', 'Protect the server and lock the cabinet.', ['computer', 'cabinet'], 'Set a password and put confidential papers away.', 'Reasonable steps help keep valuable information confidential.'),
  makeMission('Limit access', 'Allow the engineer and deny the visitor, then lock the vault.', ['access-panel', 'vault-seal'], 'Set the access panel for people who need the information, then secure the vault.', 'Access should be limited to people with a legitimate need.'),
];
const vaultActivities = [{ objectIds: ['access-panel'], type: 'security' as const }];

export default function SecretVaultPage() {
  return (
    <Region3DGame
      title="SECRET VAULT"
      subtitle="Protect the confidential information"
      description="Explore the secure facility, lock away confidential documents, block unauthorized access, and keep the valuable secrets safe."
      accent="from-emerald-500 via-teal-500 to-cyan-700"
      mission="Secure the important information before the breach begins."
      intro="A breach has started. Move through the facility and protect the sensitive information before it is stolen."
      objective="Collect the secret materials and secure the vault"
      objects={vaultObjects}
      missions={vaultMissions}
      guide="Officer Vale, security lead"
      badge="Secret Keeper"
      environment="vault"
      conceptsLearned={[
        'A trade secret is valuable because it is confidential.',
        'Reasonable security steps help preserve secrecy.',
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
          context.setStatus('A strong password now limits access to the confidential files.');
          return;
        }

        if (item.id === 'cabinet') {
          context.setStatus(`The cabinet is locked with ${context.inventory.length} confidential items protected inside.`);
          return;
        }

        if (item.id === 'door') {
          context.setStatus('The side entrance is secured. Physical access controls are one practical way to reduce disclosure risk.');
          return;
        }

        if (item.id === 'alarm') {
          context.setStatus('Alarm active! A security breach is in progress. Find the unauthorized visitor before they reach the vault.');
          return;
        }

        if (item.id === 'visitor') {
          context.setStatus('Access denied because the visitor has no legitimate need to enter. Trade secret protection depends on secrecy and reasonable protective steps.');
          return;
        }

        if (item.id === 'access-panel') {
          context.setStatus('The access panel now permits the project team member who needs the information and blocks the unverified visitor.');
          return;
        }

        if (item.id === 'vault-seal') {
          context.setStatus('The vault is sealed. Confidential information is secured, and access is limited to people with a legitimate need.');
        }
      }}
    />
  );
}
