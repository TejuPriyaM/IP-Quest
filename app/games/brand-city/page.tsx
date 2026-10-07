'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const cityObjects: RegionObject[] = [
  { id: 'shop', label: 'Brand Workstation', position: [-7, 0.8, -6], color: '#c4b5fd', size: [1.4, 1.2, 1.4], description: 'Create a new brand name, logo, and slogan.', kind: 'station' },
  { id: 'bakery', label: 'Bakery Sign', position: [-3, 0.8, 5], color: '#f9a8d4', size: [1.3, 1.2, 1.3], description: 'A friendly bakery name and logo', kind: 'sign' },
  { id: 'sport', label: 'Sports Shop', position: [3, 0.8, 5], color: '#93c5fd', size: [1.3, 1.2, 1.3], description: 'A sports store with a distinct symbol', kind: 'sign' },
  { id: 'rival', label: 'Rival Branding', position: [8, 0.8, -3], color: '#fbbf24', size: [1.4, 1.1, 1.4], description: 'Confusing branding that creates customer confusion.', kind: 'evidence' },
  { id: 'studio', label: 'Design Studio', position: [0, 0.8, 0], color: '#34d399', size: [2.2, 1.2, 2.2], description: 'Fix the confusing brand identity.', kind: 'station' },
  { id: 'office', label: 'IP Office', position: [-8, 0.8, 3], color: '#a78bfa', size: [1.5, 1.1, 1.5], description: 'Place the brand file in the protection area.', kind: 'station' },
];

const brandMissions: RegionMission[] = [
  makeMission('Name your shop', 'Create a name and sign for your shop.', ['shop'], 'Choose a name and symbol, then save the new storefront sign.', 'A consistent name and symbol help people recognise a business.'),
  makeMission('Explore the street', 'Find the bakery, sports shop, and similar-looking rival.', ['bakery', 'sport', 'rival'], 'Walk along the street and compare the shop signs.', 'Distinctive signs help customers tell businesses apart.'),
  makeMission('Make your brand distinct', 'Redesign the sign and submit it to the IP office.', ['studio', 'office'], 'Change the shop identity so it is easier to distinguish, then visit the office.', 'Trademarks can distinguish one business’s goods or services from another’s.'),
];
const brandActivities = [{ objectIds: ['shop', 'studio'], type: 'brand' as const }];

export default function BrandCityPage() {
  return (
    <Region3DGame
      title="BRAND CITY"
      subtitle="Build a brand and stop the market confusion"
      description="Open a new shop, design a brand identity, investigate rival branding, and protect the brand in the correct IP space."
      accent="from-violet-500 via-purple-500 to-indigo-700"
      mission="Create a clear, memorable brand and repair confusing shop signs."
      intro="Customers are confused between two stores. Explore Brand City and compare the visual identities."
      objective="Create a clear brand and fix the confusing shop identity"
      objects={cityObjects}
      missions={brandMissions}
      guide="Ari, brand designer"
      badge="Brand Builder"
      environment="city"
      conceptsLearned={[
        'Names and symbols help customers recognize a business.',
        'Similar marks for related goods or services can create confusion.',
        'Trademarks can distinguish one business’s goods or services from another’s.',
      ]}
      activities={brandActivities}
      onInteract={(item, context) => {
        if (item.id === 'shop') {
          context.addInventory('Brand Identity');
          context.setStatus('The new storefront identity is saved. Customers can now begin to recognise this shop.');
          return;
        }

        if (item.id === 'bakery' || item.id === 'sport') {
          context.setStatus(`${item.label} identified by its storefront sign. The symbol and name help customers recognise what the business offers.`);
          return;
        }

        if (item.id === 'rival') {
          context.setStatus('The rival shop uses a similar name and colours. Customers are mixing up the stores.');
          return;
        }

        if (item.id === 'studio') {
          context.setStatus('The shop sign is redesigned with a clearer name and distinct symbol. The businesses are easier to tell apart.');
          return;
        }

        if (item.id === 'office') {
          context.setStatus('The brand identity file is submitted. Trademarks can help distinguish one business’s goods or services from another’s.');
        }
      }}
    />
  );
}
