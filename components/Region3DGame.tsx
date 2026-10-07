'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import * as THREE from 'three';

export type RegionObject = {
  id: string;
  label: string;
  position: [number, number, number];
  color: string;
  size?: [number, number, number];
  description: string;
  kind?: 'collect' | 'station' | 'door' | 'evidence' | 'sign';
  icon?: string;
};

export type RegionMission = {
  title: string;
  objective: string;
  objectIds: string[];
  briefing: string;
  why: string;
};

export type RegionActivity = {
  objectIds: string[];
  type: 'art' | 'brand' | 'document' | 'sort' | 'security';
};

export type RegionEnvironment = 'lab' | 'studio' | 'city' | 'vault' | 'school' | 'startup';

export type RegionGameContext = {
  inventory: string[];
  addInventory: (item: string) => void;
  setMission: (value: string) => void;
  setStatus: (value: string) => void;
  setPrompt: (value: string) => void;
  setObjective: (value: string) => void;
  objective: string;
};

export type Region3DGameProps = {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  mission: string;
  intro: string;
  objective: string;
  objects: RegionObject[];
  missions: RegionMission[];
  guide: string;
  badge: string;
  environment: RegionEnvironment;
  conceptsLearned: string[];
  activities?: RegionActivity[];
  onInteract: (item: RegionObject, context: RegionGameContext) => void;
};

type GamePhase = 'tutorial' | 'playing' | 'paused' | 'complete';
type InteractiveMesh = RegionObject & { mesh: THREE.Mesh };
type SavedGameSession = {
  version: number;
  missionIndex: number;
  completedObjects: string[];
  completedMissions: number;
  inventory: string[];
  xp: number;
};
type SavedGameProgress = Record<string, {
  complete?: boolean;
  xp?: number;
  session?: SavedGameSession;
}>;

const makeMission = (title: string, objective: string, objectIds: string[], briefing: string, why: string): RegionMission => ({
  title,
  objective,
  objectIds,
  briefing,
  why,
});
const sourcePassage = 'The moisture sensor activates the irrigation pump only when the soil is dry.';

export default function Region3DGame({
  title,
  subtitle,
  description,
  accent,
  mission,
  intro,
  objective,
  objects,
  missions,
  guide,
  badge,
  environment,
  conceptsLearned,
  activities,
  onInteract,
}: Region3DGameProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRootRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState(intro);
  const [activeMission, setMission] = useState(mission);
  const [activeObjective, setObjective] = useState(objective);
  const [activePrompt, setPrompt] = useState('[E] Explore');
  const [inventory, setInventory] = useState<string[]>([]);
  const [phase, setPhase] = useState<GamePhase>('tutorial');
  const [missionIndex, setMissionIndex] = useState(0);
  const [completedObjects, setCompletedObjects] = useState<string[]>([]);
  const [completedMissions, setCompletedMissions] = useState(0);
  const [isTouchMode, setIsTouchMode] = useState(false);
  const [hint, setHint] = useState('');
  const [xp, setXp] = useState(0);
  const [tutorialPanelOpen, setTutorialPanelOpen] = useState(true);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [artColor, setArtColor] = useState('#f97316');
  const [brandName, setBrandName] = useState('STARBITES');
  const [brandSymbol, setBrandSymbol] = useState('✦');
  const [documentText, setDocumentText] = useState(sourcePassage);
  const [documentSource, setDocumentSource] = useState('');
  const [draggedCreditCard, setDraggedCreditCard] = useState<string | null>(null);
  const [creditPlacements, setCreditPlacements] = useState<Record<string, string>>({});
  const [accessRules, setAccessRules] = useState({ engineer: false, guest: true });
  const artworkCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const interactiveMeshesRef = useRef<InteractiveMesh[]>([]);
  const activeActivityRef = useRef(activeActivity);
  const isTouchModeRef = useRef(isTouchMode);
  const pointerKeys = useRef<Record<string, boolean>>({});
  const touchAxis = useRef({ x: 0, y: 0 });
  const context = useMemo<RegionGameContext>(
    () => ({
      inventory,
      addInventory: (item) => setInventory((current) => current.includes(item) ? current : [...current, item]),
      setMission,
      setStatus,
      setPrompt,
      setObjective,
      objective: activeObjective,
    }),
    [activeObjective, inventory],
  );
  const phaseRef = useRef(phase);
  const missionIndexRef = useRef(missionIndex);
  const completedObjectsRef = useRef(completedObjects);
  const contextRef = useRef<RegionGameContext>(context);
  const onInteractRef = useRef(onInteract);
  phaseRef.current = phase;
  missionIndexRef.current = missionIndex;
  completedObjectsRef.current = completedObjects;
  contextRef.current = context;
  onInteractRef.current = onInteract;
  activeActivityRef.current = activeActivity;
  isTouchModeRef.current = isTouchMode;
  const triggerInteract = useCallback(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE', bubbles: true }));
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const update = () => setIsTouchMode(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const priorOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = priorOverflow;
    };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ip-quest-game-progress') ?? '{}') as SavedGameProgress;
      const game = saved[title];
      const session = game?.session;
      if (session?.version === 2 && Array.isArray(session.completedObjects) && Array.isArray(session.inventory)) {
        const restoredMissionIndex = Math.min(Math.max(session.missionIndex, 0), Math.max(missions.length - 1, 0));
        const restoredObjects = session.completedObjects.filter((item): item is string => typeof item === 'string');
        setMissionIndex(restoredMissionIndex);
        setCompletedObjects(restoredObjects);
        setCompletedMissions(Math.min(Math.max(session.completedMissions, 0), missions.length));
        setInventory(session.inventory.filter((item): item is string => typeof item === 'string'));
        setXp(typeof session.xp === 'number' ? session.xp : 0);
        setMission(missions[restoredMissionIndex]?.title ?? mission);
        setObjective(missions[restoredMissionIndex]?.objective ?? objective);
        setTutorialPanelOpen(false);
        setPhase(game.complete ? 'complete' : 'playing');
        setStatus(game.complete ? `${badge} earned! Your progress is saved.` : `Welcome back. Your progress in ${title} has been restored.`);
      } else if (game) {
        localStorage.setItem('ip-quest-game-progress', JSON.stringify({
          ...saved,
          [title]: { ...game, complete: false, xp: 0, session: undefined },
        }));
      }
    } catch (error) {
      console.error('Unable to restore game progress.', error);
    } finally {
      setProgressLoaded(true);
    }
  }, [badge, mission, missions, objective, title]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const palettes: Record<RegionEnvironment, { sky: string; floor: string; wall: string }> = {
      lab: { sky: '#dbeafe', floor: '#c7f0ff', wall: '#bfdbfe' },
      studio: { sky: '#fce7f3', floor: '#fbcfe8', wall: '#fda4af' },
      city: { sky: '#bae6fd', floor: '#cbd5e1', wall: '#94a3b8' },
      vault: { sky: '#0f172a', floor: '#1e293b', wall: '#334155' },
      school: { sky: '#fef3c7', floor: '#e2e8f0', wall: '#fde68a' },
      startup: { sky: '#c7d2fe', floor: '#cbd5e1', wall: '#a5b4fc' },
    };
    const palette = palettes[environment] ?? palettes.lab;
    scene.background = new THREE.Color(palette.sky);
    scene.fog = new THREE.Fog(palette.sky, 22, 48);

    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 120);
    camera.position.set(0, 7, 12);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-label', `${title} 3D game world`);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 1.65));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(7, 15, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 28),
      new THREE.MeshStandardMaterial({ color: palette.floor, roughness: 0.92 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMaterial = new THREE.MeshStandardMaterial({ color: palette.wall, roughness: 0.88 });
    const walls = [
      { position: [0, 1.6, -13.5], size: [28, 3.2, 0.6] },
      { position: [0, 1.6, 13.5], size: [28, 3.2, 0.6] },
      { position: [-13.5, 1.6, 0], size: [0.6, 3.2, 28] },
      { position: [13.5, 1.6, 0], size: [0.6, 3.2, 28] },
    ];
    walls.filter(() => environment !== 'city').forEach(({ position, size }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), wallMaterial);
      wall.position.set(position[0], position[1], position[2]);
      wall.receiveShadow = true;
      scene.add(wall);
    });

    if (environment === 'city') {
      const roadMaterial = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.96 });
      const road = new THREE.Mesh(new THREE.PlaneGeometry(28, 3.2), roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.position.y = 0.015;
      scene.add(road);
      const crossing = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 28), roadMaterial);
      crossing.rotation.x = -Math.PI / 2;
      crossing.position.y = 0.016;
      scene.add(crossing);
    }

    const player = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.7 }),
    );
    body.position.y = 0.9;
    body.castShadow = true;
    player.add(body);
    const playerClothing = new THREE.MeshStandardMaterial({ color: '#2563eb', roughness: 0.82 });
    const playerLegMaterial = new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.9 });
    [[-0.2, 0], [0.2, 0]].forEach(([x]) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.43, 3, 6), playerLegMaterial);
      leg.position.set(x, 0.28, 0);
      leg.castShadow = true;
      player.add(leg);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.42, 3, 6), playerClothing);
      arm.position.set(x * 2.7, 0.94, 0);
      arm.rotation.z = x < 0 ? -0.12 : 0.12;
      arm.castShadow = true;
      player.add(arm);
    });
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd3ad }),
    );
    head.position.set(0, 1.65, 0);
    head.castShadow = true;
    player.add(head);
    scene.add(player);

    const npc = new THREE.Group();
    const npcBody = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.42, 0.9, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.7 }),
    );
    npcBody.position.y = 0.9;
    npcBody.castShadow = true;
    npc.add(npcBody);
    const npcHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 14, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd3ad }),
    );
    npcHead.position.y = 1.65;
    npcHead.castShadow = true;
    npc.add(npcHead);
    npc.position.set(0, 0, -10);
    scene.add(npc);

    const makeSignMaterial = (text: string, background: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Unable to prepare a storefront sign.');
      context.fillStyle = background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#172033';
      context.font = 'bold 42px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text.toUpperCase().slice(0, 18), canvas.width / 2, canvas.height / 2, canvas.width - 32);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.82 });
    };
    const addPart = (
      parent: THREE.Object3D,
      geometry: THREE.BufferGeometry,
      color: THREE.ColorRepresentation,
      position: [number, number, number],
      rotation?: [number, number, number],
    ) => {
      const part = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.78 }));
      part.position.set(...position);
      if (rotation) part.rotation.set(...rotation);
      part.castShadow = true;
      part.receiveShadow = true;
      parent.add(part);
      return part;
    };
    const pumpAnimations = new Map<string, { wheel: THREE.Group; drops: THREE.Mesh[] }>();
    const interactives: InteractiveMesh[] = objects.map((item) => {
      const size = item.size ?? [1, 1, 1];
      const signColors: Record<string, string> = {
        shop: '#fef3c7',
        studio: '#dcfce7',
        bakery: '#ffe4e6',
        sport: '#dbeafe',
        rival: '#fef9c3',
        brand: '#ede9fe',
      };
      const isSign = item.kind === 'sign' || Boolean(signColors[item.id]);
      const material = isSign
        ? makeSignMaterial(item.label.replace(' Sign', '').replace(' Branding', ''), signColors[item.id] ?? '#f8fafc')
        : new THREE.MeshStandardMaterial({
        color: item.color,
        emissive: item.color,
        emissiveIntensity: 0.01,
        roughness: 0.82,
      });
      const isPaper = ['blueprint', 'recipe', 'plan', 'source', 'notes', 'assignment', 'report'].includes(item.id);
      const isBook = item.id === 'source' || item.id === 'recipe';
      const isDesk = item.kind === 'station' && !['shop', 'studio', 'computer', 'alarm', 'test', 'access-panel', 'vault-seal'].includes(item.id);
      let geometry: THREE.BufferGeometry;
      if (isSign) {
        geometry = new THREE.BoxGeometry(size[0] * 1.25, Math.max(size[1] * 0.42, 0.42), 0.14);
      } else if (isBook) {
        geometry = new THREE.BoxGeometry(size[0] * 0.92, 0.18, size[2] * 0.7);
      } else if (isPaper) {
        geometry = new THREE.BoxGeometry(size[0], 0.12, size[2] * 0.78);
      } else if (['motor', 'alarm', 'vault-seal', 'old-machine', 'test'].includes(item.id)) {
        geometry = new THREE.CylinderGeometry(size[0] * 0.42, size[0] * 0.46, size[1] * 0.72, 20);
      } else if (item.id === 'sensor') {
        geometry = new THREE.CylinderGeometry(size[0] * 0.24, size[0] * 0.32, size[1] * 0.9, 16);
      } else if (['battery', 'controller', 'computer', 'access-panel'].includes(item.id)) {
        geometry = new THREE.BoxGeometry(size[0] * 0.8, size[1] * 0.74, size[2] * 0.64);
      } else if (['solar', 'solar-panel'].includes(item.id)) {
        geometry = new THREE.BoxGeometry(size[0], 0.12, size[2]);
      } else if (item.id === 'door') {
        geometry = new THREE.BoxGeometry(size[0], size[1], Math.max(size[2], 0.18));
      } else if (['cabinet', 'vault', 'secret'].includes(item.id)) {
        geometry = new THREE.BoxGeometry(size[0], size[1], size[2] * 0.72);
      } else if (['artwork', 'gallery', 'copied'].includes(item.id)) {
        geometry = new THREE.BoxGeometry(size[0] * 1.2, size[1] * 0.82, 0.18);
      } else if (isDesk) {
        geometry = new THREE.BoxGeometry(size[0], 0.14, size[2]);
      } else {
        geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      }
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(item.position[0], item.position[1], item.position[2]);
      if (item.kind === 'collect') mesh.position.y = isPaper || isBook ? 0.12 : size[1] * 0.42;
      if (isDesk) mesh.position.y = 0.85;
      if (isSign) mesh.position.y = item.position[1] + 0.4;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      if (isDesk) {
        const legColor = environment === 'city' ? '#475569' : '#795548';
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([x, z]) => {
          addPart(mesh, new THREE.BoxGeometry(0.12, 0.76, 0.12), legColor, [x * size[0] * 0.4, -0.43, z * size[2] * 0.4]);
        });
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.38, 0.035, size[2] * 0.32), '#f8fafc', [-size[0] * 0.17, 0.1, 0]);
        addPart(mesh, new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), '#64748b', [size[0] * 0.3, 0.28, size[2] * 0.2], [0, 0, Math.PI / 2]);
      }
      if (isSign) {
        addPart(mesh, new THREE.BoxGeometry(0.09, 0.62, 0.09), '#6b7280', [-size[0] * 0.36, -0.45, 0]);
        addPart(mesh, new THREE.BoxGeometry(0.09, 0.62, 0.09), '#6b7280', [size[0] * 0.36, -0.45, 0]);
        if (environment === 'city') {
          addPart(mesh, new THREE.BoxGeometry(size[0] * 1.65, 1.1, 0.5), '#e2e8f0', [0, -0.55, -0.35]);
          addPart(mesh, new THREE.BoxGeometry(size[0] * 0.36, 0.58, 0.08), '#93c5fd', [-size[0] * 0.48, -0.72, -0.06]);
          addPart(mesh, new THREE.BoxGeometry(size[0] * 0.36, 0.58, 0.08), '#bfdbfe', [size[0] * 0.48, -0.72, -0.06]);
        }
      }
      if (item.id === 'motor') {
        addPart(mesh, new THREE.CylinderGeometry(0.08, 0.08, 0.42, 12), '#94a3b8', [0, 0, 0.34], [Math.PI / 2, 0, 0]);
        addPart(mesh, new THREE.CylinderGeometry(0.22, 0.22, 0.07, 20), '#475569', [0, 0.26, 0]);
      }
      if (item.id === 'sensor') {
        addPart(mesh, new THREE.SphereGeometry(0.12, 14, 10), '#22c55e', [0, size[1] * 0.42, 0]);
        addPart(mesh, new THREE.BoxGeometry(0.34, 0.12, 0.34), '#475569', [0, -size[1] * 0.34, 0]);
      }
      if (item.id === 'battery') {
        addPart(mesh, new THREE.CylinderGeometry(0.09, 0.09, 0.12, 12), '#94a3b8', [-0.18, size[1] * 0.34, 0]);
        addPart(mesh, new THREE.CylinderGeometry(0.09, 0.09, 0.12, 12), '#94a3b8', [0.18, size[1] * 0.34, 0]);
      }
      if (item.id === 'solar' || item.id === 'solar-panel') {
        mesh.rotation.x = -0.18;
        for (let index = 1; index < 5; index += 1) {
          addPart(mesh, new THREE.BoxGeometry(0.025, 0.025, size[2] * 0.92), '#dbeafe', [-size[0] / 2 + index * size[0] / 5, 0.09, 0]);
        }
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.92, 0.025, 0.025), '#dbeafe', [0, 0.09, 0]);
      }
      if (['controller', 'computer', 'access-panel'].includes(item.id)) {
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.54, size[1] * 0.34, 0.035), '#0f172a', [0, 0.04, size[2] * 0.34]);
        addPart(mesh, new THREE.BoxGeometry(0.12, 0.12, 0.06), '#22c55e', [size[0] * 0.28, -size[1] * 0.23, size[2] * 0.35]);
        addPart(mesh, new THREE.BoxGeometry(0.12, 0.12, 0.06), '#ef4444', [size[0] * 0.05, -size[1] * 0.23, size[2] * 0.35]);
      }
      if (item.id === 'computer') {
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.72, 0.14, size[2] * 0.48), '#334155', [0, -size[1] * 0.5, size[2] * 0.55]);
      }
      if (item.id === 'cabinet' || item.id === 'vault-seal') {
        addPart(mesh, new THREE.BoxGeometry(0.12, 0.12, 0.09), '#fbbf24', [size[0] * 0.3, 0, size[2] * 0.39]);
      }
      if (item.id === 'door') {
        addPart(mesh, new THREE.SphereGeometry(0.07, 12, 10), '#fbbf24', [size[0] * 0.32, 0, size[2] * 0.55]);
      }
      if (isPaper) {
        for (let row = 0; row < 4; row += 1) {
          addPart(mesh, new THREE.BoxGeometry(size[0] * 0.72, 0.012, 0.012), '#94a3b8', [0, 0.08, -size[2] * 0.27 + row * 0.11]);
        }
        if (isBook) addPart(mesh, new THREE.BoxGeometry(0.045, 0.2, size[2] * 0.7), '#b91c1c', [-size[0] * 0.46, 0, 0]);
      }
      if (['artwork', 'gallery', 'copied'].includes(item.id)) {
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.88, size[1] * 0.59, 0.035), item.id === 'copied' ? '#fca5a5' : '#fef3c7', [0, 0, 0.11]);
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.28, 0.22, 0.025), '#38bdf8', [-size[0] * 0.18, 0.08, 0.14]);
        addPart(mesh, new THREE.SphereGeometry(0.13, 12, 10), '#f97316', [size[0] * 0.17, -0.1, 0.15]);
        addPart(mesh, new THREE.BoxGeometry(size[0] * 0.82, 0.08, 0.08), '#8b5e3c', [0, -size[1] * 0.55, 0]);
      }
      if (item.id === 'test') {
        addPart(mesh, new THREE.CylinderGeometry(0.25, 0.32, 0.78, 18), '#64748b', [0, -0.15, 0]);
        addPart(mesh, new THREE.CylinderGeometry(0.13, 0.13, 0.72, 14), '#38bdf8', [0.24, 0.3, 0.12], [0, 0, -Math.PI / 2]);
        addPart(mesh, new THREE.TorusGeometry(0.23, 0.055, 8, 18), '#94a3b8', [0, 0.28, 0], [Math.PI / 2, 0, 0]);
      }
      if (item.id === 'old-machine') {
        addPart(mesh, new THREE.CylinderGeometry(0.28, 0.34, 0.92, 16), '#64748b', [0, -0.05, 0]);
        addPart(mesh, new THREE.CylinderGeometry(0.11, 0.11, 0.7, 12), '#94a3b8', [0.35, -0.1, 0.12], [0, 0, -Math.PI / 2]);
        addPart(mesh, new THREE.SphereGeometry(0.13, 12, 10), '#38bdf8', [0.49, -0.1, 0.12]);
      }
      if (item.id === 'invention') {
        addPart(mesh, new THREE.CylinderGeometry(0.27, 0.32, 0.82, 18), '#64748b', [0, -0.05, 0]);
        addPart(mesh, new THREE.CylinderGeometry(0.1, 0.1, 0.62, 12), '#38bdf8', [0.35, -0.12, 0.12], [0, 0, -Math.PI / 2]);
        addPart(mesh, new THREE.SphereGeometry(0.1, 12, 10), '#22c55e', [-0.18, 0.45, 0]);
      }
      if (item.id === 'secret') {
        addPart(mesh, new THREE.BoxGeometry(0.16, 0.28, 0.12), '#fbbf24', [0, -0.05, size[2] * 0.4]);
      }
      if (item.id === 'alarm') {
        addPart(mesh, new THREE.CylinderGeometry(0.16, 0.2, 0.1, 16), '#475569', [0, 0.38, 0]);
        addPart(mesh, new THREE.SphereGeometry(0.14, 14, 10), '#ef4444', [0, 0.55, 0]);
      }
      if (item.id === 'test' || item.id === 'old-machine') {
        const wheel = new THREE.Group();
        wheel.position.set(-0.34, 0.16, 0.22);
        addPart(wheel, new THREE.TorusGeometry(0.22, 0.045, 8, 20), '#cbd5e1', [0, 0, 0]);
        [0, 1].forEach((spoke) => {
          addPart(wheel, new THREE.BoxGeometry(0.04, 0.36, 0.04), '#94a3b8', [0, 0, 0], [0, 0, spoke * Math.PI / 2]);
        });
        mesh.add(wheel);
        const drops = [0, 1, 2].map((index) => {
          const drop = addPart(mesh, new THREE.SphereGeometry(0.065, 10, 8), '#38bdf8', [0.48, 0.1 - index * 0.13, 0.14]);
          drop.visible = item.id === 'old-machine';
          return drop;
        });
        pumpAnimations.set(item.id, { wheel, drops });
      }
      if (item.id === 'paint' || item.id === 'gallery' || item.id === 'copied') {
        addPart(mesh, new THREE.BoxGeometry(0.12, 0.45, 0.12), '#64748b', [0, -size[1] * 0.55, -0.04]);
      }
      return { ...item, mesh };
    });
    interactiveMeshesRef.current = interactives;

    const keys = pointerKeys.current;
    let interactPressed = false;
    let yaw = 0;
    let pitch = 0.25;
    let pointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    const playerPosition = new THREE.Vector3(0, 0, 7);
    const cameraTarget = new THREE.Vector3();
    let lastFrameTime = performance.now();
    let animationFrame = 0;
    let lastNearbyId = '';
    let lastProgressTime = performance.now();
    let hasShownHint = false;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)
        || (event.ctrlKey || event.metaKey) && ['Equal', 'Minus', 'Digit0', 'NumpadAdd', 'NumpadSubtract'].includes(event.code)
      ) event.preventDefault();
      keys[event.code] = true;
      if (event.code === 'KeyE' && !event.repeat) interactPressed = true;
      if (event.code === 'Escape' && !event.repeat) setPhase((current) => current === 'paused' ? 'playing' : 'paused');
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys[event.code] = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      pointerDown = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!pointerDown) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      yaw -= dx * 0.004;
      pitch = THREE.MathUtils.clamp(pitch + dy * 0.003, -0.05, 0.7);
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
    };
    const onPointerUp = () => {
      pointerDown = false;
    };
    const onWheel = (event: WheelEvent) => event.preventDefault();
    const onResize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    const tick = () => {
      animationFrame = window.requestAnimationFrame(tick);
      const now = performance.now();
      const delta = Math.min((now - lastFrameTime) / 1000, 0.04);
      lastFrameTime = now;
      const currentPhase = phaseRef.current;
      if (currentPhase !== 'paused' && currentPhase !== 'complete') {
        pumpAnimations.forEach(({ wheel, drops }, id) => {
          const flow = id === 'old-machine' || completedObjectsRef.current.includes('test');
          wheel.rotation.z += delta * (id === 'old-machine' ? 2.5 : 3.5);
          drops.forEach((drop, index) => {
            drop.visible = flow;
            if (flow) drop.position.y = 0.1 - ((now * 0.001 * 1.2 + index * 0.22) % 0.55);
          });
        });
      }
      if ((currentPhase === 'playing' || currentPhase === 'tutorial') && !activeActivityRef.current) {
        let forwardInput = Number(Boolean(keys.KeyW || keys.ArrowUp)) - Number(Boolean(keys.KeyS || keys.ArrowDown));
        let sideInput = Number(Boolean(keys.KeyD || keys.ArrowRight)) - Number(Boolean(keys.KeyA || keys.ArrowLeft));
        if (touchAxis.current.x !== 0 || touchAxis.current.y !== 0) {
          forwardInput = -touchAxis.current.y;
          sideInput = touchAxis.current.x;
        }

        const movement = new THREE.Vector3(
          Math.sin(yaw) * forwardInput + Math.cos(yaw) * sideInput,
          0,
          -Math.cos(yaw) * forwardInput + Math.sin(yaw) * sideInput,
        );
        if (movement.lengthSq() > 0) {
          movement.normalize();
          const speed = 3.5;
          const nextX = THREE.MathUtils.clamp(playerPosition.x + movement.x * speed * delta, -11.5, 11.5);
          const nextZ = THREE.MathUtils.clamp(playerPosition.z + movement.z * speed * delta, -11.5, 11.5);
          const blocked = interactives.some((entry) => {
            if (!entry.mesh.visible) return false;
            if (entry.kind === 'door' && completedObjectsRef.current.includes(entry.id)) return false;
            const halfWidth = (entry.size?.[0] ?? 1) / 2 + 0.55;
            const halfDepth = (entry.size?.[2] ?? 1) / 2 + 0.55;
            return Math.abs(nextX - entry.position[0]) < halfWidth && Math.abs(nextZ - entry.position[2]) < halfDepth;
          });
          const nearGuide = Math.abs(nextX - npc.position.x) < 0.75 && Math.abs(nextZ - npc.position.z) < 0.75;
          if (!blocked && !nearGuide) {
            playerPosition.x = nextX;
            playerPosition.z = nextZ;
            lastProgressTime = performance.now();
            hasShownHint = false;
            setHint('');
          }
          player.rotation.y = Math.atan2(movement.x, movement.z) + Math.PI;
          body.position.y = 0.9 + Math.sin(performance.now() * 0.012) * 0.035;
        } else {
          body.position.y = THREE.MathUtils.lerp(body.position.y, 0.9, 0.15);
        }
        npc.position.y = Math.sin(now * 0.002) * 0.04;
        player.position.x = playerPosition.x;
        player.position.z = playerPosition.z;

        cameraTarget.set(playerPosition.x, 1.2, playerPosition.z);
        const distance = 9;
        const horizontal = distance * Math.cos(pitch);
        const cameraPosition = new THREE.Vector3(
          playerPosition.x + Math.sin(yaw) * horizontal,
          playerPosition.y + 3 + distance * Math.sin(pitch),
          playerPosition.z + Math.cos(yaw) * horizontal,
        );
        camera.position.lerp(cameraPosition, 0.12);
        camera.lookAt(cameraTarget);

        const currentMissionIndex = missionIndexRef.current;
        const completedIds = completedObjectsRef.current;
        const missionNow = missions[currentMissionIndex];
        const validIds = missionNow?.objectIds.filter((id) => !completedIds.includes(id)) ?? [];
        const nearest = interactives.reduce<InteractiveMesh | null>((closest, entry) => {
          const dist = Math.hypot(playerPosition.x - entry.position[0], playerPosition.z - entry.position[2]);
          const eligible = validIds.includes(entry.id);
          const material = entry.mesh.material as THREE.MeshStandardMaterial;
          const isGuideTarget = eligible && entry.mesh.visible;
          material.emissiveIntensity = isGuideTarget ? 0.18 : 0.03;
          if (!eligible || dist >= 2.5) return closest;
          if (!closest) return entry;
          const closestDistance = Math.hypot(playerPosition.x - closest.position[0], playerPosition.z - closest.position[2]);
          return dist < closestDistance ? entry : closest;
        }, null);

        const nearestId = nearest?.id ?? '';
        if (nearestId !== lastNearbyId) {
          setPrompt(nearest ? `[E] ${nearest.kind === 'collect' ? 'PICK UP' : 'INTERACT'} · ${nearest.label}` : '[E] Explore');
          lastNearbyId = nearestId;
        }

        if (interactPressed && nearest) {
          const target = nearest;
          if (currentPhase === 'playing' && missionNow?.objectIds.includes(target.id) && !completedIds.includes(target.id)) {
            if (activities?.some((entry) => entry.objectIds.includes(target.id))) {
              setActiveActivity(target.id);
              setStatus(`${guide}: Use the work area to complete this task, then save your changes.`);
            } else {
              onInteractRef.current(target, contextRef.current);
              completedObjectsRef.current = [...completedIds, target.id];
              setCompletedObjects(completedObjectsRef.current);
              if (target.kind === 'collect') {
                target.mesh.visible = false;
              } else {
                const material = target.mesh.material as THREE.MeshStandardMaterial;
                material.color.set('#34d399');
                material.emissive.set('#10b981');
                material.emissiveIntensity = 0.65;
                target.mesh.scale.multiplyScalar(1.08);
                if (target.kind === 'door') target.mesh.rotation.y = Math.PI / 2;
                if (target.id === 'bench') {
                  const assembledMachine = new THREE.Group();
                  addPart(assembledMachine, new THREE.BoxGeometry(1.35, 0.12, 0.7), '#334155', [0, 0.08, 0]);
                  addPart(assembledMachine, new THREE.CylinderGeometry(0.25, 0.3, 0.62, 18), '#64748b', [-0.3, 0.44, 0]);
                  addPart(assembledMachine, new THREE.CylinderGeometry(0.1, 0.1, 0.68, 14), '#38bdf8', [0.2, 0.52, 0], [0, 0, -Math.PI / 2]);
                  addPart(assembledMachine, new THREE.CylinderGeometry(0.08, 0.08, 0.42, 12), '#94a3b8', [0.48, 0.52, 0]);
                  addPart(assembledMachine, new THREE.BoxGeometry(0.22, 0.4, 0.22), '#1e293b', [-0.52, 0.4, -0.18]);
                  addPart(assembledMachine, new THREE.SphereGeometry(0.1, 12, 10), '#22c55e', [-0.52, 0.65, -0.18]);
                  assembledMachine.position.set(0, 0.15, 0);
                  target.mesh.add(assembledMachine);
                }
              }
              setXp((current) => current + 10);
            }
            lastProgressTime = performance.now();
            setHint('');
            hasShownHint = false;
          }
          interactPressed = false;
        }
        if (interactPressed && !nearest) {
          interactPressed = false;
          keys.KeyE = false;
        }

        if (currentPhase === 'playing') {
          const target = interactives.find((entry) => missionNow?.objectIds.includes(entry.id) && !completedIds.includes(entry.id));
          const idleTime = performance.now() - lastProgressTime;
          if (target && idleTime >= 10000 && !hasShownHint) {
            setHint(`${target.label}: ${target.description}`);
            hasShownHint = true;
          }
        }
      } else {
        interactPressed = false;
        keys.KeyE = false;
        camera.lookAt(cameraTarget.set(playerPosition.x, 1.2, playerPosition.z));
      }
      renderer.render(scene, camera);
    };
    animationFrame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      interactives.forEach((entry) => {
        entry.mesh.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if ('map' in material && material.map) material.map.dispose();
            material.dispose();
          });
        });
      });
      interactiveMeshesRef.current = [];
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      [player, npc].forEach((character) => {
        character.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
          (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => material.dispose());
        });
      });
    };
  }, [activities, environment, guide, mission, missions, objective, objects, title]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const current = missions[missionIndex];
    if (!current || current.objectIds.some((id) => !completedObjects.includes(id))) return;
    const nextCompletedCount = completedMissions + 1;
    setCompletedMissions(nextCompletedCount);
    setXp((value) => value + 40);
    setStatus(`${guide}: Mission complete! ${current.why}`);
    setHint('');
    if (missionIndex + 1 >= missions.length) {
      setPhase('complete');
      setXp((value) => value + 50);
      setStatus(`${guide}: ${badge} earned! ${description}`);
      try {
        const key = 'ip-quest-game-progress';
        const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as SavedGameProgress;
        localStorage.setItem(key, JSON.stringify({ ...saved, [title]: { ...saved[title], complete: true, xp: (saved[title]?.xp ?? 0) + xp + 90 } }));
      } catch (error) {
        console.error('Unable to save game completion progress.', error);
      }
      return;
    }
    setMission(missions[missionIndex + 1].title);
    setObjective(missions[missionIndex + 1].objective);
    setMissionIndex((value) => value + 1);
    setPhase('playing');
    setStatus(intro);
  }, [badge, completedMissions, completedObjects, description, guide, intro, missionIndex, missions, phase, title, xp]);

  useEffect(() => {
    const root = gameRootRef.current;
    if (!root) return;
    const onTouchStart = (event: TouchEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('[data-game-control]')) return;
      if (event.touches.length === 1) root.dataset.touchX = String(event.touches[0].clientX);
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('[data-game-control]')) return;
      if (event.touches.length === 1) event.preventDefault();
    };
    root.addEventListener('touchstart', onTouchStart, { passive: false });
    root.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!progressLoaded || phase === 'tutorial' && completedObjects.length === 0 && inventory.length === 0) return;
    try {
      const saved = JSON.parse(localStorage.getItem('ip-quest-game-progress') ?? '{}') as SavedGameProgress;
      localStorage.setItem('ip-quest-game-progress', JSON.stringify({
        ...saved,
        [title]: {
          ...saved[title],
          session: { version: 2, missionIndex, completedObjects, completedMissions, inventory, xp },
        },
      }));
    } catch (error) {
      console.error('Unable to save game progress.', error);
    }
  }, [completedMissions, completedObjects, inventory, missionIndex, phase, progressLoaded, title, xp]);

  useEffect(() => {
    interactiveMeshesRef.current.forEach((entry) => {
      if (!completedObjects.includes(entry.id)) return;
      if (entry.kind === 'collect') {
        entry.mesh.visible = false;
        return;
      }
      const material = entry.mesh.material as THREE.MeshStandardMaterial;
      material.color.set('#34d399');
      material.emissive.set('#10b981');
      material.emissiveIntensity = 0.65;
      if (entry.kind === 'door') entry.mesh.rotation.y = Math.PI / 2;
    });
  }, [completedObjects]);

  const currentMission = missions[Math.min(missionIndex, missions.length - 1)];
  const missionProgress = currentMission
    ? currentMission.objectIds.filter((id) => completedObjects.includes(id)).length
    : 0;

  const drawOnCanvas = (event: ReactPointerEvent<HTMLCanvasElement>, start = false) => {
    const canvas = event.currentTarget;
    const drawingContext = canvas.getContext('2d');
    if (!drawingContext) return;
    const bounds = canvas.getBoundingClientRect();
    const x = (event.clientX - bounds.left) * (canvas.width / bounds.width);
    const y = (event.clientY - bounds.top) * (canvas.height / bounds.height);
    if (start) {
      canvas.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      if (!hasDrawnRef.current) {
        drawingContext.fillStyle = '#ffffff';
        drawingContext.fillRect(0, 0, canvas.width, canvas.height);
        hasDrawnRef.current = true;
      }
      drawingContext.beginPath();
      drawingContext.moveTo(x, y);
      return;
    }
    if (!isDrawingRef.current) return;
    drawingContext.strokeStyle = artColor;
    drawingContext.lineWidth = 8;
    drawingContext.lineCap = 'round';
    drawingContext.lineTo(x, y);
    drawingContext.stroke();
  };

  const activeActivityDefinition = activities?.find((entry) => entry.objectIds.includes(activeActivity ?? ''));

  const finishActivity = () => {
    if (!activeActivity || !activeActivityDefinition) return;
    const item = objects.find((object) => object.id === activeActivity);
    if (!item) return;

    if (activeActivityDefinition.type === 'art') {
      const canvas = artworkCanvasRef.current;
      const drawingContext = canvas?.getContext('2d');
      if (!canvas || !drawingContext || !hasDrawnRef.current || drawingContext.getImageData(0, 0, canvas.width, canvas.height).data.every((pixel, index) => index % 4 !== 3 || pixel === 0)) {
        setStatus('Add a few lines or shapes to your canvas before saving your original artwork.');
        return;
      }
      const gallery = interactiveMeshesRef.current.find((entry) => entry.id === 'gallery');
      if (gallery) {
        const texture = new THREE.CanvasTexture(canvas);
        const material = gallery.mesh.material as THREE.MeshStandardMaterial;
        material.map?.dispose();
        material.map = texture;
        material.color.set('#ffffff');
        material.needsUpdate = true;
      }
      contextRef.current.addInventory('Original artwork');
      onInteractRef.current(item, contextRef.current);
      contextRef.current.setStatus('Your original artwork is saved and displayed in the gallery. Copyright generally protects original creative expression.');
    } else if (activeActivityDefinition.type === 'brand') {
      const trimmedName = brandName.trim();
      if (!trimmedName) {
        setStatus('Enter a shop name before saving the brand identity.');
        return;
      }
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 512;
      signCanvas.height = 256;
      const signContext = signCanvas.getContext('2d');
      if (!signContext) {
        setStatus('The brand sign could not be updated. Please try again.');
        return;
      }
      signContext.fillStyle = '#f8fafc';
      signContext.fillRect(0, 0, signCanvas.width, signCanvas.height);
      signContext.fillStyle = '#312e81';
      signContext.font = 'bold 120px Arial';
      signContext.textAlign = 'center';
      signContext.textBaseline = 'middle';
      signContext.fillText(brandSymbol, signCanvas.width / 2, 86);
      signContext.font = 'bold 52px Arial';
      signContext.fillText(trimmedName.toUpperCase().slice(0, 18), signCanvas.width / 2, 194);
      const texture = new THREE.CanvasTexture(signCanvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      interactiveMeshesRef.current
        .filter((entry) => entry.id === 'shop' || entry.id === 'studio')
        .forEach((entry) => {
          const material = entry.mesh.material as THREE.MeshStandardMaterial;
          material.map?.dispose();
          material.map = texture.clone();
          material.color.set('#ffffff');
          material.needsUpdate = true;
        });
      texture.dispose();
      contextRef.current.addInventory(`Brand: ${trimmedName}`);
      onInteractRef.current(item, contextRef.current);
      contextRef.current.setStatus(`The ${trimmedName} storefront now displays ${brandSymbol}. The redesigned identity helps customers recognise the shop.`);
    } else if (activeActivityDefinition.type === 'document') {
      const editedText = documentText.trim();
      const source = documentSource.trim();
      if (editedText.length < 30 || !source || editedText.toLocaleLowerCase() === sourcePassage.toLocaleLowerCase()) {
        setStatus('Rewrite the source idea in your own words and add its source before saving the repair.');
        return;
      }
      contextRef.current.addInventory('Corrected assignment');
      onInteractRef.current(item, contextRef.current);
      contextRef.current.setStatus(`Assignment repaired and attributed to ${source}. The student’s ideas are now separated from the source material.`);
    } else if (activeActivityDefinition.type === 'sort') {
      const expectedPlacements: Record<string, string> = {
        own: 'my-work',
        borrowed: 'other-creator',
        citation: 'attribution',
      };
      if (Object.keys(expectedPlacements).some((card) => !creditPlacements[card])) {
        setStatus('Move each project item into a section before saving the presentation.');
        return;
      }
      if (Object.entries(expectedPlacements).some(([card, zone]) => creditPlacements[card] !== zone)) {
        setStatus('Review who created each item, then place the creator’s work and its credit in the matching sections.');
        return;
      }
      contextRef.current.addInventory('Repaired project');
      onInteractRef.current(item, contextRef.current);
      contextRef.current.setStatus('The presentation now separates your work, the other creator’s work, and its attribution.');
    } else {
      if (!accessRules.engineer || accessRules.guest) {
        setStatus('Apply access only to team members who need the information for their work, and block visitors without a legitimate need.');
        return;
      }
      onInteractRef.current(item, contextRef.current);
      contextRef.current.setStatus('Access controls are active: the project engineer can enter, while the visitor is denied access.');
    }

    completedObjectsRef.current = [...completedObjectsRef.current, item.id];
    setCompletedObjects(completedObjectsRef.current);
    setXp((current) => current + 10);
    setActiveActivity(null);
  };

  const placeCreditCard = (zone: string) => {
    if (!draggedCreditCard) return;
    setCreditPlacements((current) => ({ ...current, [draggedCreditCard]: zone }));
    setDraggedCreditCard(null);
  };

  const moveJoystick = (event: ReactPointerEvent<HTMLDivElement>, active = true) => {
    if (!active) {
      touchAxis.current = { x: 0, y: 0 };
      setJoystickPosition({ x: 0, y: 0 });
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const radius = bounds.width * 0.34;
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(x, y);
    const scale = distance > radius ? radius / distance : 1;
    const position = {
      x: THREE.MathUtils.clamp((x * scale) / radius, -1, 1),
      y: THREE.MathUtils.clamp((y * scale) / radius, -1, 1),
    };
    touchAxis.current = position;
    setJoystickPosition(position);
  };

  return (
    <main ref={gameRootRef} className="fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col overflow-hidden bg-slate-950 text-white">
      <header className="relative z-20 flex min-h-14 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/85 px-3 py-2 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-sky-300">{title}</p>
          <p className="truncate text-sm font-semibold">{phase === 'complete' ? 'Complete' : `Task ${Math.min(missionIndex + 1, missions.length)} of ${missions.length}`}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs sm:text-sm">
          <button type="button" onClick={() => setPhase((current) => current === 'paused' ? 'playing' : 'paused')} className="rounded-lg border border-white/20 px-3 py-2 font-semibold hover:bg-white/10" aria-label="Pause or resume game">Ⅱ</button>
          <Link href="/games" className="rounded-lg bg-white/10 px-3 py-2 font-semibold hover:bg-white/20">Exit</Link>
        </div>
      </header>

      <section className={`relative min-h-0 flex-1 overflow-hidden bg-gradient-to-br ${accent}`}>
        <div ref={mountRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between gap-3 p-3 sm:p-5">
          <div className="max-w-lg rounded-2xl border border-white/20 bg-slate-950/65 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200">{phase === 'tutorial' ? 'Your guide' : 'Current objective'}</p>
            <p className="mt-1 text-sm font-bold sm:text-base">{phase === 'tutorial' ? status : currentMission?.objective ?? activeObjective}</p>
            {phase === 'playing' && (
              <>
                <p className="mt-1 text-xs text-slate-200">Progress {missionProgress}/{currentMission?.objectIds.length ?? 0} · {currentMission?.title}</p>
                {currentMission?.why && (
                  <p className="mt-2 border-t border-white/15 pt-2 text-xs leading-5 text-sky-100"><span className="font-bold">What to notice: </span>{currentMission.why}</p>
                )}
                {status !== intro && (
                  <p className="mt-2 rounded-lg bg-white/10 px-2 py-1.5 text-xs leading-5 text-white">{status.replace(`${guide}: `, '')}</p>
                )}
              </>
            )}
          </div>
          {inventory.length > 0 && (
            <div className="max-w-[38%] rounded-2xl border border-white/20 bg-slate-950/65 px-3 py-2 text-right shadow-lg backdrop-blur sm:max-w-xs sm:px-4 sm:py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200">Collected</p>
              <p className="mt-1 line-clamp-2 text-xs font-medium sm:text-sm">{inventory.join(' · ')}</p>
            </div>
          )}
        </div>

        {activePrompt !== '[E] Explore' && (phase === 'playing' || phase === 'tutorial' && !tutorialPanelOpen) && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-slate-950/80 px-4 py-2 text-center text-sm font-black shadow-lg">
            {activePrompt}
          </div>
        )}

        {hint && phase === 'playing' && (
          <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-xl border border-sky-200/40 bg-slate-950/85 px-4 py-3 text-sm shadow-lg">
            <span className="font-bold text-sky-200">{guide}:</span> {hint.replace(`${guide}: `, '')}
          </div>
        )}

        {isTouchMode && (phase === 'playing' || phase === 'tutorial') && (
          <div className="absolute inset-x-3 bottom-4 z-20 flex items-end justify-between sm:hidden">
            <div
              data-game-control
              className="relative h-28 w-28 touch-none rounded-full border border-white/45 bg-slate-950/35 shadow-lg"
              onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); moveJoystick(event); }}
              onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveJoystick(event); }}
              onPointerUp={(event) => { moveJoystick(event, false); event.currentTarget.releasePointerCapture(event.pointerId); }}
              onPointerCancel={(event) => moveJoystick(event, false)}
              aria-label="Virtual movement joystick"
            >
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 rounded-full bg-white/85 shadow transition-transform" style={{ transform: `translate(calc(-50% + ${joystickPosition.x * 32}px), calc(-50% + ${joystickPosition.y * 32}px))` }} />
            </div>
            <div className="flex gap-2" data-game-control>
              <button type="button" onClick={triggerInteract} className="h-14 rounded-2xl bg-brand-600 px-5 text-lg font-black shadow-lg">E</button>
            </div>
          </div>
        )}

        {activeActivity && activeActivityDefinition && phase === 'playing' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <section className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/15 bg-slate-900 p-5 shadow-2xl sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">
                {activeActivityDefinition.type === 'art' ? 'Creator workstation' : activeActivityDefinition.type === 'brand' ? 'Brand design workstation' : activeActivityDefinition.type === 'document' ? 'Assignment editor' : activeActivityDefinition.type === 'sort' ? 'Attribution board' : 'Security access console'}
              </p>
              <h2 className="mt-2 text-2xl font-black">
                {activeActivityDefinition.type === 'art' ? 'Create an original picture' : activeActivityDefinition.type === 'brand' ? 'Design the storefront identity' : activeActivityDefinition.type === 'document' ? 'Repair and attribute the assignment' : activeActivityDefinition.type === 'sort' ? 'Sort the creative project' : 'Set the access controls'}
              </h2>
              {activeActivityDefinition.type === 'art' && (
                <>
                  <p className="mt-2 text-sm text-slate-300">Draw something original, then save it to the gallery.</p>
                  <canvas
                    ref={artworkCanvasRef}
                    width={720}
                    height={400}
                    onPointerDown={(event) => drawOnCanvas(event, true)}
                    onPointerMove={(event) => drawOnCanvas(event)}
                    onPointerUp={() => { isDrawingRef.current = false; }}
                    onPointerCancel={() => { isDrawingRef.current = false; }}
                    className="mt-4 h-56 w-full touch-none rounded-2xl bg-white sm:h-72"
                    aria-label="Drawing canvas"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <span className="mr-1 text-xs font-bold text-slate-300">Brush</span>
                    {['#f97316', '#2563eb', '#16a34a', '#7c3aed', '#0f172a'].map((color) => (
                      <button key={color} type="button" onClick={() => setArtColor(color)} className={`h-8 w-8 rounded-full border-2 ${artColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} aria-label={`Select brush color ${color}`} />
                    ))}
                  </div>
                </>
              )}
              {activeActivityDefinition.type === 'brand' && (
                <div className="mt-4 space-y-4">
                  <label className="block text-sm font-bold text-slate-200">
                    Shop name
                    <input value={brandName} onChange={(event) => setBrandName(event.target.value)} maxLength={24} className="mt-2 w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-white outline-none focus:border-sky-400" />
                  </label>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Choose a symbol for your brand</p>
                    <div className="mt-2 flex gap-2">
                      {['✦', '☀', '◆', '●', '✿'].map((symbol) => (
                        <button key={symbol} type="button" onClick={() => setBrandSymbol(symbol)} className={`h-12 w-12 rounded-xl text-xl ${brandSymbol === symbol ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-200'}`}>{symbol}</button>
                      ))}
                    </div>
                  </div>
                  <p className="rounded-xl bg-indigo-400/10 p-3 text-sm text-indigo-100">Your choices update the physical shop sign when you save.</p>
                </div>
              )}
              {activeActivityDefinition.type === 'document' && (
                <div className="mt-4 space-y-4">
                  <p className="rounded-xl bg-amber-300/10 p-3 text-sm text-amber-100">Rewrite in your own words and identify the source used for the idea.</p>
                  <blockquote className="rounded-xl border-l-4 border-sky-400 bg-slate-800 p-4 text-sm italic text-slate-200">
                    Source excerpt: “{sourcePassage}”
                  </blockquote>
                  <label className="block text-sm font-bold text-slate-200">
                    Revised assignment
                    <textarea value={documentText} onChange={(event) => setDocumentText(event.target.value)} rows={5} className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-white outline-none focus:border-sky-400" />
                  </label>
                  <label className="block text-sm font-bold text-slate-200">
                    Source or creator
                    <input value={documentSource} onChange={(event) => setDocumentSource(event.target.value)} placeholder="e.g. School Garden Research Guide" className="mt-2 w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-white outline-none focus:border-sky-400 placeholder:text-slate-500" />
                  </label>
                </div>
              )}
              {activeActivityDefinition.type === 'sort' && (
                <div className="mt-4">
                  <p className="mb-3 text-sm text-slate-300">Drag each item to its section, or tap an item and then tap a section.</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-2">
                      {[
                        { id: 'own', label: 'My original sketch' },
                        { id: 'borrowed', label: 'Illustration by N. Rao' },
                        { id: 'citation', label: 'Credit: N. Rao, Garden Art' },
                      ].map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          draggable
                          onDragStart={() => setDraggedCreditCard(card.id)}
                          onClick={() => setDraggedCreditCard(card.id)}
                          className={`w-full rounded-xl border p-3 text-left text-sm font-semibold ${draggedCreditCard === card.id ? 'border-sky-300 bg-sky-500/20' : 'border-white/10 bg-slate-800'}`}
                        >
                          {creditPlacements[card.id] ? '✓ ' : ''}{card.label}
                        </button>
                      ))}
                    </div>
                    {[
                      { id: 'my-work', label: 'MY WORK' },
                      { id: 'other-creator', label: 'OTHER CREATOR' },
                      { id: 'attribution', label: 'ATTRIBUTION' },
                    ].map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => { event.preventDefault(); placeCreditCard(zone.id); }}
                        onClick={() => placeCreditCard(zone.id)}
                        className="min-h-28 rounded-2xl border-2 border-dashed border-slate-500 bg-slate-800/60 p-3 text-left text-xs font-black tracking-wide text-sky-200"
                      >
                        {zone.label}
                        <span className="mt-2 block text-xs font-medium tracking-normal text-slate-200">
                          {Object.entries(creditPlacements)
                            .filter(([, category]) => category === zone.id)
                            .map(([card]) => card === 'own' ? 'My original sketch' : card === 'borrowed' ? 'Illustration by N. Rao' : 'Credit: N. Rao, Garden Art')
                            .join(', ') || 'Drop or tap an item here'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {activeActivityDefinition.type === 'security' && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-slate-300">Set the physical access panel for two people requesting entry.</p>
                  <button type="button" onClick={() => setAccessRules((current) => ({ ...current, engineer: !current.engineer }))} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${accessRules.engineer ? 'border-emerald-400 bg-emerald-400/15' : 'border-white/10 bg-slate-800'}`}>
                    <span><strong className="block">Project engineer</strong><span className="text-xs text-slate-300">Needs access to maintain the confidential process</span></span>
                    <span className="font-black">{accessRules.engineer ? 'ACCESS GRANTED' : 'BLOCKED'}</span>
                  </button>
                  <button type="button" onClick={() => setAccessRules((current) => ({ ...current, guest: !current.guest }))} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${!accessRules.guest ? 'border-emerald-400 bg-emerald-400/15' : 'border-white/10 bg-slate-800'}`}>
                    <span><strong className="block">Unverified visitor</strong><span className="text-xs text-slate-300">Has no work-related need to enter the vault</span></span>
                    <span className="font-black">{accessRules.guest ? 'ALLOWED' : 'DENIED'}</span>
                  </button>
                  <p className="rounded-xl bg-emerald-400/10 p-3 text-sm text-emerald-100">Use the toggles as real access controls: give access only when there is a legitimate need.</p>
                </div>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => setActiveActivity(null)} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-slate-200">Cancel</button>
                <button type="button" onClick={finishActivity} className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-black hover:bg-sky-400">
                  {activeActivityDefinition.type === 'art' ? 'Save artwork' : activeActivityDefinition.type === 'brand' ? 'Update storefront' : activeActivityDefinition.type === 'document' ? 'Save corrected work' : activeActivityDefinition.type === 'sort' ? 'Save repaired project' : 'Apply access rules'}
                </button>
              </div>
            </section>
          </div>
        )}

        {(phase === 'tutorial' && tutorialPanelOpen || phase === 'paused' || phase === 'complete') && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
            <section className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">{phase === 'tutorial' ? `Welcome · ${guide}` : phase === 'paused' ? 'Paused' : 'Complete'}</p>
              <h1 className="mt-2 text-2xl font-bold">{phase === 'tutorial' ? title : phase === 'paused' ? 'Take a break' : badge}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-200">{phase === 'tutorial'
                ? isTouchMode
                  ? `${intro} Use the joystick to move, drag the scene to look around, and tap E near an object.`
                  : `${intro} Use WASD to move, drag the scene to look around, and press E near an object.`
                : phase === 'paused'
                  ? 'Your progress is saved as you play. Resume when you are ready.'
                  : description}</p>
              {phase === 'complete' && (
                <div className="mt-4 rounded-2xl bg-emerald-400/10 p-4">
                  <p className="text-sm font-bold text-emerald-200">Concepts learned</p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-100">
                    {conceptsLearned.map((concept) => <li key={concept}>{concept}</li>)}
                  </ul>
                  <p className="mt-3 text-xs font-semibold text-slate-300">{completedMissions} tasks completed</p>
                </div>
              )}
              {phase === 'tutorial' && (
                <p className="mt-4 rounded-xl bg-sky-400/10 px-4 py-3 text-sm font-semibold text-sky-100">
                  {currentMission?.objective}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                {phase === 'tutorial' && <button type="button" onClick={() => { setPhase('playing'); phaseRef.current = 'playing'; setTutorialPanelOpen(false); setMission(missions[0]?.title ?? mission); setObjective(missions[0]?.objective ?? objective); }} className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold hover:bg-sky-400">Start game</button>}
                {phase === 'paused' && <button type="button" onClick={() => setPhase('playing')} className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold">Resume</button>}
                {phase === 'complete' && <Link href="/games" className="rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold">World map</Link>}
              </div>
            </section>
          </div>
        )}
      </section>

      <footer className="relative z-20 flex min-h-12 items-center justify-between gap-3 bg-slate-950/90 px-3 py-2 text-xs text-slate-200 sm:px-6 sm:text-sm">
        <p className="min-w-0 truncate"><span className="font-bold text-sky-200">{guide}:</span> {status}</p>
        <p className="hidden shrink-0 text-slate-400 sm:block">WASD move · Drag to look · E interact</p>
      </footer>
    </main>
  );
}

export { makeMission };
