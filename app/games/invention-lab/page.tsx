'use client';

import dynamic from 'next/dynamic';
import { makeMission, type RegionMission, type RegionObject } from '@/components/Region3DGame';

const Region3DGame = dynamic(() => import('@/components/Region3DGame').then((mod) => mod.default), { ssr: false });

const inventionObjects: RegionObject[] = [
  { id: 'motor', label: 'Motor', position: [-8, 0.8, -6], color: '#93c5fd', size: [1, 1, 1], description: 'A compact motor needed for the irrigation machine.', kind: 'collect' },
  { id: 'sensor', label: 'Sensor', position: [-4, 0.8, 5], color: '#a5b4fc', size: [1, 1, 1], description: 'A smart sensor to measure soil moisture.', kind: 'collect' },
  { id: 'battery', label: 'Battery', position: [0, 0.8, -7], color: '#f9a8d4', size: [1, 1, 1], description: 'Power for the device.', kind: 'collect' },
  { id: 'solar', label: 'Solar Panel', position: [6, 0.8, 5], color: '#facc15', size: [1.2, 0.8, 1.2], description: 'Collects energy from sunlight.', kind: 'collect' },
  { id: 'controller', label: 'Controller', position: [8, 0.8, -3], color: '#34d399', size: [1, 1, 1], description: 'The control system for the machine.', kind: 'collect' },
  { id: 'bench', label: 'Workbench', position: [0, 0.8, 0], color: '#fbbf24', size: [2.2, 1.2, 2.2], description: 'Build the invention here.', kind: 'station' },
  { id: 'blueprint', label: 'Blueprint', position: [7, 0.8, 1], color: '#bfdbfe', size: [1.4, 0.8, 1.2], description: 'The invention plan and technical notes.', kind: 'station' },
  { id: 'old-machine', label: 'Old Irrigation Pump', position: [4, 0.8, -7], color: '#94a3b8', size: [1.4, 1, 1.4], description: 'Compare the old pump with Nova’s new sensor-controlled design.', kind: 'evidence' },
  { id: 'drawings', label: 'Design Drawings', position: [-5, 0.8, -2], color: '#38bdf8', size: [1.2, 0.8, 1.2], description: 'Study the diagrams to discover how the prototype is different.', kind: 'evidence' },
  { id: 'test', label: 'Test Irrigation Machine', position: [3, 0.8, 2], color: '#22c55e', size: [1.5, 1.2, 1.5], description: 'Run a test to see the sensor conserve water.', kind: 'station' },
  { id: 'terminal', label: 'Protection Station', position: [-8, 0.8, 2], color: '#c084fc', size: [1.5, 1.1, 1.5], description: 'Decide which IP protection fits the invention.', kind: 'station' },
];

const patentMissions: RegionMission[] = [
  makeMission('Find the parts', 'Collect the motor, sensor, and battery.', ['motor', 'sensor', 'battery'], 'Pick up the three parts marked by a subtle glow.', 'Each part has a job in the invention.'),
  makeMission('Build and test', 'Install the parts at the workbench, then test the machine.', ['bench', 'test'], 'Use the workbench to assemble the prototype. Then activate it and watch the sensor control watering.', 'The machine uses a technical mechanism to solve a real problem.'),
  makeMission('Review the invention', 'Compare the old pump, then file Nova’s invention.', ['old-machine', 'terminal'], 'See how the sensor changes the old pump’s operation, then take the technical file to the patent desk.', 'Patents may protect qualifying inventions, but legal requirements apply.'),
];

export default function InventionLabPage() {
  return (
    <Region3DGame
      title="PATENT LAB"
      subtitle="Build Nova's smart irrigation machine"
      description="Explore the lab, collect missing components, assemble the prototype, and decide what kind of IP protection best fits the invention."
      accent="from-sky-500 via-blue-500 to-cyan-600"
      mission="Collect the missing parts and help Professor Nova finish the prototype."
      intro="The prototype is incomplete. Explore the room and collect the missing components."
      objective="Find 3 missing components"
      objects={inventionObjects}
      missions={patentMissions}
      guide="Professor Nova"
      badge="Patent Pioneer"
      environment="lab"
      conceptsLearned={[
        'Technical inventions solve practical problems through mechanisms or processes.',
        'Patent protection depends on legal requirements; not every idea or improvement qualifies.',
        'Patents may exchange time-limited rights for public disclosure.',
      ]}
      onInteract={(item, context) => {
        if (item.kind === 'collect') {
          context.addInventory(item.label);
          context.setStatus(`${item.label} secured in the invention kit.`);
          return;
        }

        if (item.id === 'bench') {
          context.setStatus(`You installed ${context.inventory.length} components on the workbench. The irrigation prototype is assembled.`);
          return;
        }

        if (item.id === 'test') {
          context.setStatus('The moisture sensor detects dry soil and the pump sends water only where it is needed. The prototype is solving a practical technical problem.');
          return;
        }

        if (item.id === 'old-machine') {
          context.setStatus('The old pump runs continuously. Nova’s version uses a soil sensor to control when watering starts.');
          return;
        }

        if (item.id === 'drawings') {
          context.setStatus('The drawings show how the sensor, controller, and pump work together. A useful invention is more than a name or a sketch of an idea.');
          return;
        }

        if (item.id === 'blueprint') {
          context.addInventory('Technical invention file');
          context.setStatus('Technical invention file collected. Take it to the protection station.');
          return;
        }

        if (item.id === 'terminal') {
          context.setStatus('The invention file is placed at the patent desk. Patents may protect qualifying technical inventions; other IP protects different kinds of work.');
        }
      }}
    />
  );
}
