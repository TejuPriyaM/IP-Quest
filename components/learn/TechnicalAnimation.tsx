'use client';

import { useEffect, useRef, useState } from 'react';

type ModuleKey = 'patent' | 'copyright' | 'trademark' | 'trade-secret' | 'plagiarism';
type Setting = 'makerspace' | 'gallery' | 'book-market' | 'repair-shop' | 'planetarium';
type Pose = 'walk' | 'think' | 'point' | 'happy' | 'concerned';

type Character = {
  name: string;
  color: string;
};

type AnimationScene = {
  title: string;
  narration: string;
  dialogue: string;
  setting: Setting;
  object: string;
  objectLabel: string;
  characters: string[];
  pose: Pose;
};

type AnimationStory = {
  concept: string;
  characters: Character[];
  scenes: AnimationScene[];
};

const STORIES: Record<ModuleKey, AnimationStory> = {
  patent: {
    concept: 'Patent protection for qualifying inventions',
    characters: [
      { name: 'Leila', color: '#0f766e' },
      { name: 'Mr. Iqbal', color: '#2563eb' },
      { name: 'Fair seller', color: '#c2410c' },
    ],
    scenes: [
      { title: 'The blackout corner', narration: 'Leila builds a hand-crank reading lamp for the community room, where the lights sometimes go out.', dialogue: 'A few turns should keep our reading corner bright!', setting: 'makerspace', object: '🔦', objectLabel: 'Hand-crank lamp', characters: ['Leila', 'Mr. Iqbal'], pose: 'think' },
      { title: 'A copy appears', narration: 'At a school fair, Leila sees a seller offering a very similar lamp after seeing her demonstration.', dialogue: 'They copied the design I showed at the fair!', setting: 'book-market', object: '🔦', objectLabel: 'Similar lamp at the fair', characters: ['Leila', 'Fair seller'], pose: 'concerned' },
      { title: 'What a patent means', narration: 'Mr. Iqbal explains that patents may protect inventions that meet legal requirements. Having an idea does not automatically give someone a patent.', dialogue: 'A patent needs an application and review. It is not automatic.', setting: 'makerspace', object: '📘', objectLabel: 'Invention requirements', characters: ['Leila', 'Mr. Iqbal'], pose: 'point' },
      { title: 'Careful next steps', narration: 'Leila keeps dated sketches and test notes. With adult guidance, she learns whether applying for a patent is appropriate before sharing more details.', dialogue: 'Let us record the design and ask an expert what to do next.', setting: 'makerspace', object: '🗂️', objectLabel: 'Sketches and application', characters: ['Leila', 'Mr. Iqbal'], pose: 'walk' },
      { title: 'A reviewed application', narration: 'In this example, Leila’s application is reviewed and a patent is granted. Only then can she use the rights it provides under the applicable law.', dialogue: 'The review is complete. Now we understand the rights that were granted.', setting: 'makerspace', object: '📜', objectLabel: 'Patent decision', characters: ['Leila', 'Mr. Iqbal'], pose: 'happy' },
    ],
  },
  copyright: {
    concept: 'Copyright in original creative work',
    characters: [
      { name: 'Jules', color: '#be185d' },
      { name: 'Rafi', color: '#7c3aed' },
      { name: 'Gallery guide', color: '#0369a1' },
    ],
    scenes: [
      { title: 'A map takes shape', narration: 'Jules draws an original illustrated map showing a wheelchair-friendly path through the neighborhood nature trail.', dialogue: 'I want families to find the smooth path to the pond.', setting: 'gallery', object: '🗺️', objectLabel: 'Jules’s illustrated trail map', characters: ['Jules', 'Gallery guide'], pose: 'happy' },
      { title: 'The map is reused', narration: 'A nearby event prints Jules’s map on its flyers without asking and leaves Jules’s name off the page.', dialogue: 'That is my drawing, but nobody knows I made it.', setting: 'gallery', object: '📄', objectLabel: 'Flyer without creator credit', characters: ['Jules', 'Rafi'], pose: 'concerned' },
      { title: 'Recognizing the issue', narration: 'The gallery guide explains that copyright can apply to original creative expression, such as Jules’s particular drawing. Some uses may be allowed, so the details matter.', dialogue: 'The map is your original expression. Let us check what happened.', setting: 'gallery', object: '🖼️', objectLabel: 'Original artwork', characters: ['Jules', 'Gallery guide'], pose: 'point' },
      { title: 'Keep records and ask for help', narration: 'Jules saves the original drawing files and dated drafts. With a trusted adult, Jules contacts the event organizer and asks about credit and permission.', dialogue: 'Here are my working files. Can we ask them to correct the flyer?', setting: 'gallery', object: '💾', objectLabel: 'Original files and drafts', characters: ['Jules', 'Gallery guide'], pose: 'walk' },
      { title: 'A respectful resolution', narration: 'The organizer reviews the concern and updates the online flyer with Jules’s name. If a dispute continues, the right next step depends on the facts and applicable rules.', dialogue: 'The new flyer names you as the artist. Thank you for speaking up.', setting: 'gallery', object: '✅', objectLabel: 'Updated, credited flyer', characters: ['Jules', 'Rafi'], pose: 'happy' },
    ],
  },
  trademark: {
    concept: 'Trademarks identify the source of goods or services',
    characters: [
      { name: 'Kavi', color: '#b45309' },
      { name: 'Shop owner', color: '#047857' },
      { name: 'Customer', color: '#1d4ed8' },
    ],
    scenes: [
      { title: 'A book cart gets a name', narration: 'Kavi opens a weekend used-book cart called Northstar Pages and draws a star rising from an open book.', dialogue: 'A clear name and sign will help readers find my cart.', setting: 'book-market', object: '📚', objectLabel: 'Northstar Pages', characters: ['Kavi', 'Customer'], pose: 'happy' },
      { title: 'Customers get confused', narration: 'Another cart opens nearby using North Star Pages and a similar star-and-book sign. A customer asks if both carts belong to Kavi.', dialogue: 'Are these two book carts run by the same person?', setting: 'book-market', object: '🏷️', objectLabel: 'Similar names and signs', characters: ['Kavi', 'Shop owner'], pose: 'concerned' },
      { title: 'A mark identifies a source', narration: 'Kavi learns that a trademark can help customers identify which business or service a name or logo represents.', dialogue: 'The mark helps customers tell whose books and service they are choosing.', setting: 'book-market', object: '🔎', objectLabel: 'Recognizable source mark', characters: ['Kavi', 'Customer'], pose: 'point' },
      { title: 'Choose and check', narration: 'Kavi checks whether the name and design are distinctive and already in use in the places where the cart plans to operate. Kavi uses the chosen mark consistently.', dialogue: 'Let us check first, then use the same clear sign everywhere.', setting: 'book-market', object: '✅', objectLabel: 'Name check and consistent use', characters: ['Kavi', 'Shop owner'], pose: 'think' },
      { title: 'A clearer market', narration: 'Kavi asks a qualified adviser whether trademark registration is suitable under local rules. Customers can now more easily recognize Northstar Pages as Kavi’s cart.', dialogue: 'I know which cart is Northstar Pages now!', setting: 'book-market', object: '⭐', objectLabel: 'Northstar Pages sign', characters: ['Kavi', 'Customer'], pose: 'happy' },
    ],
  },
  'trade-secret': {
    concept: 'Confidential business information kept secret',
    characters: [
      { name: 'Rhea', color: '#6d28d9' },
      { name: 'Tomas', color: '#0f766e' },
      { name: 'Workshop owner', color: '#c2410c' },
    ],
    scenes: [
      { title: 'A clearer telescope', narration: 'Rhea works at a small telescope repair shop and develops a careful lens-alignment sequence that helps the team get reliable results.', dialogue: 'This order of tiny adjustments makes the image much clearer.', setting: 'repair-shop', object: '🔭', objectLabel: 'Lens-alignment method', characters: ['Rhea', 'Workshop owner'], pose: 'think' },
      { title: 'A private checklist is shared', narration: 'Tomas sends the shop’s detailed alignment checklist to a competing repair shop without permission.', dialogue: 'I sent them the checklist. I did not realize it was confidential.', setting: 'repair-shop', object: '📨', objectLabel: 'Shared private checklist', characters: ['Tomas', 'Workshop owner'], pose: 'concerned' },
      { title: 'Why secrecy matters', narration: 'The owner explains that a trade secret is valuable business information kept confidential with reasonable protective steps.', dialogue: 'The method helps our shop because it is not generally known.', setting: 'repair-shop', object: '🔐', objectLabel: 'Confidential method', characters: ['Rhea', 'Workshop owner'], pose: 'point' },
      { title: 'Limit access and secure it', narration: 'The shop reviews who needs the checklist, stores it securely, trains workers, and considers confidentiality agreements where appropriate.', dialogue: 'Only share the steps with people who need them for their work.', setting: 'repair-shop', object: '🗄️', objectLabel: 'Limited access and secure storage', characters: ['Rhea', 'Tomas'], pose: 'walk' },
      { title: 'Protect what remains secret', narration: 'The team records what was shared and gets qualified advice. Trade-secret protection depends on the information remaining secret and meeting applicable requirements.', dialogue: 'We have tightened access and are handling the disclosure carefully.', setting: 'repair-shop', object: '🛡️', objectLabel: 'Careful protection steps', characters: ['Rhea', 'Workshop owner'], pose: 'happy' },
    ],
  },
  plagiarism: {
    concept: 'Academic honesty and acknowledging sources',
    characters: [
      { name: 'Lian', color: '#0369a1' },
      { name: 'Teacher', color: '#7c3aed' },
      { name: 'Astronomer', color: '#be123c' },
    ],
    scenes: [
      { title: 'An inspiring talk', narration: 'At the planetarium, Lian hears an astronomer explain how moon dust moves like flour in a kitchen. Lian uses that idea in a science report.', dialogue: 'That comparison makes the moon dust easy to picture!', setting: 'planetarium', object: '🌙', objectLabel: 'Planetarium talk', characters: ['Lian', 'Astronomer'], pose: 'think' },
      { title: 'The source is missing', narration: 'Lian repeats the astronomer’s exact comparison in the report but forgets to identify the speaker or use quotation marks.', dialogue: 'I wrote it down, but I forgot where those words came from.', setting: 'planetarium', object: '📝', objectLabel: 'Uncredited sentence', characters: ['Lian', 'Teacher'], pose: 'concerned' },
      { title: 'Spotting plagiarism', narration: 'The teacher explains that presenting another person’s words or ideas without proper acknowledgment is plagiarism, an academic honesty issue.', dialogue: 'The idea can stay, but your reader needs to know its source.', setting: 'planetarium', object: '🔍', objectLabel: 'Find the source', characters: ['Lian', 'Teacher'], pose: 'point' },
      { title: 'Quote or paraphrase', narration: 'Lian either quotes the exact comparison with quotation marks and a citation, or explains the idea in new words and still cites the talk.', dialogue: 'I can use my own words and cite the astronomer’s talk.', setting: 'planetarium', object: '✏️', objectLabel: 'Revision with citation', characters: ['Lian', 'Teacher'], pose: 'walk' },
      { title: 'An honest report', narration: 'Lian submits a report that shows personal understanding and gives credit for the astronomer’s contribution. Plagiarism is not one of the five types of IP rights.', dialogue: 'Now my report is mine, and the source is clearly acknowledged.', setting: 'planetarium', object: '📖', objectLabel: 'Original, credited report', characters: ['Lian', 'Teacher'], pose: 'happy' },
    ],
  },
};

const WORLD_COLORS: Record<Setting, { sky: string; floor: string; accent: string }> = {
  makerspace: { sky: '#dff4f2', floor: '#c5e0dc', accent: '#1d8f85' },
  gallery: { sky: '#f4e8f4', floor: '#e8d7e6', accent: '#b44b83' },
  'book-market': { sky: '#fef0d7', floor: '#ead6af', accent: '#d67832' },
  'repair-shop': { sky: '#e0edf5', floor: '#c9d6df', accent: '#477897' },
  planetarium: { sky: '#172554', floor: '#263864', accent: '#8b9fe8' },
};

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawBackground(context: CanvasRenderingContext2D, setting: Setting, time: number) {
  const colors = WORLD_COLORS[setting];
  const background = context.createLinearGradient(0, 0, 0, 540);
  background.addColorStop(0, colors.sky);
  background.addColorStop(1, colors.floor);
  context.fillStyle = background;
  context.fillRect(0, 0, 960, 540);

  if (setting === 'planetarium') {
    context.fillStyle = '#ffffff';
    for (let index = 0; index < 32; index += 1) {
      const x = (index * 137 + 43) % 960;
      const y = (index * 71 + 28) % 345;
      const sparkle = 0.45 + Math.sin(time * 0.002 + index) * 0.35;
      context.globalAlpha = sparkle;
      context.beginPath();
      context.arc(x, y, index % 4 === 0 ? 2.5 : 1.3, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    context.fillStyle = '#384873';
    context.beginPath();
    context.arc(480, 430, 250, Math.PI, 0);
    context.fill();
    context.fillStyle = '#172554';
    context.fillRect(0, 430, 960, 110);
    return;
  }

  context.fillStyle = colors.floor;
  context.fillRect(0, 380, 960, 160);
  context.strokeStyle = 'rgba(255,255,255,0.6)';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 380);
  context.lineTo(960, 380);
  context.stroke();

  if (setting === 'makerspace') {
    context.fillStyle = 'rgba(255,255,255,0.75)';
    roundedRect(context, 76, 66, 210, 170, 18);
    context.fill();
    context.strokeStyle = '#83bcb7';
    context.lineWidth = 8;
    context.strokeRect(88, 78, 186, 145);
    context.beginPath();
    context.moveTo(181, 78);
    context.lineTo(181, 223);
    context.moveTo(88, 151);
    context.lineTo(274, 151);
    context.stroke();
    context.fillStyle = '#5a716e';
    context.fillRect(560, 220, 250, 18);
    context.fillRect(584, 238, 18, 142);
    context.fillRect(770, 238, 18, 142);
  } else if (setting === 'gallery') {
    context.fillStyle = '#fffaf4';
    context.fillRect(72, 76, 290, 215);
    context.strokeStyle = '#c49a66';
    context.lineWidth = 12;
    context.strokeRect(72, 76, 290, 215);
    context.fillStyle = '#d7e8d9';
    context.beginPath();
    context.arc(218, 172, 58, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = '#748ab4';
    roundedRect(context, 621, 90, 230, 165, 16);
    context.fill();
    context.fillStyle = '#fff';
    roundedRect(context, 643, 111, 186, 122, 10);
    context.fill();
  } else if (setting === 'book-market') {
    context.fillStyle = '#9b4c3c';
    context.fillRect(0, 102, 960, 16);
    for (let index = 0; index < 10; index += 1) {
      context.fillStyle = index % 2 === 0 ? colors.accent : '#fff4db';
      context.beginPath();
      context.moveTo(index * 96, 118);
      context.lineTo(index * 96 + 96, 118);
      context.lineTo(index * 96 + 78, 170);
      context.lineTo(index * 96 + 18, 170);
      context.closePath();
      context.fill();
    }
    context.fillStyle = '#8b5e3c';
    context.fillRect(581, 280, 266, 18);
    context.fillRect(606, 298, 20, 82);
    context.fillRect(803, 298, 20, 82);
    for (let index = 0; index < 6; index += 1) {
      context.fillStyle = ['#357a6b', '#d88655', '#5075a4'][index % 3];
      context.fillRect(603 + index * 36, 234 + (index % 2) * 12, 27, 46);
    }
  } else if (setting === 'repair-shop') {
    context.fillStyle = '#f7fbfd';
    context.fillRect(54, 62, 852, 264);
    context.strokeStyle = '#b5ccd8';
    context.lineWidth = 6;
    context.strokeRect(54, 62, 852, 264);
    context.beginPath();
    context.moveTo(480, 62);
    context.lineTo(480, 326);
    context.moveTo(54, 195);
    context.lineTo(906, 195);
    context.stroke();
    context.fillStyle = '#647d8b';
    context.fillRect(72, 348, 816, 16);
  }

  context.fillStyle = 'rgba(255,255,255,0.8)';
  context.beginPath();
  context.arc(840, 78, 28, 0, Math.PI * 2);
  context.fill();
  const drift = (time * 0.018) % 1100 - 80;
  context.fillStyle = 'rgba(255,255,255,0.5)';
  context.beginPath();
  context.ellipse(drift, 52, 37, 13, 0, 0, Math.PI * 2);
  context.ellipse(drift + 24, 49, 27, 18, 0, 0, Math.PI * 2);
  context.ellipse(drift + 48, 54, 33, 12, 0, 0, Math.PI * 2);
  context.fill();
}

function drawCharacter(context: CanvasRenderingContext2D, character: Character, index: number, count: number, pose: Pose, time: number) {
  const baseX = count === 1 ? 275 : index === 0 ? 195 : 765;
  const walk = pose === 'walk' ? Math.sin(time * 0.006 + index) * 18 : Math.sin(time * 0.003 + index) * 4;
  const bob = Math.sin(time * 0.008 + index * 2) * (pose === 'happy' ? 8 : 3);
  const x = baseX + walk;
  const y = 346 + bob;

  context.save();
  context.translate(x, y);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.strokeStyle = '#283746';
  context.lineWidth = 12;
  context.beginPath();
  const legSwing = pose === 'walk' ? Math.sin(time * 0.008 + index) * 12 : 0;
  context.moveTo(-11, 46);
  context.lineTo(-17 + legSwing, 82);
  context.moveTo(11, 46);
  context.lineTo(17 - legSwing, 82);
  context.stroke();

  context.fillStyle = character.color;
  roundedRect(context, -27, -18, 54, 72, 18);
  context.fill();

  context.strokeStyle = '#d48b69';
  context.lineWidth = 10;
  const armSwing = pose === 'point' ? -17 : pose === 'happy' ? Math.sin(time * 0.01) * 15 - 12 : Math.sin(time * 0.006 + index) * 12;
  context.beginPath();
  context.moveTo(-24, -2);
  context.lineTo(-42, 22 + armSwing);
  context.moveTo(24, -2);
  context.lineTo(42, 22 - armSwing);
  context.stroke();

  context.fillStyle = '#d99976';
  context.beginPath();
  context.arc(0, -51, 29, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#3b302d';
  context.beginPath();
  context.arc(0, -60, 29, Math.PI, Math.PI * 2);
  context.lineTo(28, -49);
  context.quadraticCurveTo(17, -67, 4, -56);
  context.quadraticCurveTo(-12, -43, -28, -50);
  context.fill();

  context.fillStyle = '#263238';
  context.beginPath();
  context.arc(-10, -51, 2.5, 0, Math.PI * 2);
  context.arc(10, -51, 2.5, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#8a463d';
  context.lineWidth = 2.5;
  context.beginPath();
  if (pose === 'concerned') {
    context.moveTo(-7, -36);
    context.quadraticCurveTo(0, -43, 7, -36);
  } else {
    context.moveTo(-8, -39);
    context.quadraticCurveTo(0, pose === 'happy' ? -28 : -32, 8, -39);
  }
  context.stroke();

  context.fillStyle = 'rgba(255,255,255,0.92)';
  roundedRect(context, -62, 99, 124, 31, 13);
  context.fill();
  context.fillStyle = '#1e293b';
  context.font = '600 16px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(character.name, 0, 120, 116);
  context.restore();
}

function drawAnimationFrame(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scene: AnimationScene, characters: Character[], time: number, transition: number) {
  context.setTransform(canvas.width / 960, 0, 0, canvas.height / 540, 0, 0);
  context.clearRect(0, 0, 960, 540);
  drawBackground(context, scene.setting, time);

  const eased = Math.min(1, Math.max(0, transition));
  context.save();
  context.globalAlpha = eased;
  context.translate((1 - eased) * 26, 0);

  const objectFloat = Math.sin(time * 0.004) * 8;
  context.fillStyle = 'rgba(255,255,255,0.92)';
  context.shadowColor = 'rgba(15, 23, 42, 0.15)';
  context.shadowBlur = 20;
  context.beginPath();
  context.arc(480, 274 + objectFloat, 66, 0, Math.PI * 2);
  context.fill();
  context.shadowBlur = 0;
  context.font = '64px "Segoe UI Emoji", sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(scene.object, 480, 270 + objectFloat);

  context.fillStyle = '#1f2937';
  roundedRect(context, 359, 327 + objectFloat, 242, 34, 17);
  context.fill();
  context.fillStyle = '#fff';
  context.font = '600 15px Arial, sans-serif';
  context.fillText(scene.objectLabel, 480, 344 + objectFloat, 225);

  const visibleCharacters = scene.characters
    .map((name) => characters.find((character) => character.name === name))
    .filter((character): character is Character => Boolean(character));
  visibleCharacters.forEach((character, index) => drawCharacter(context, character, index, visibleCharacters.length, scene.pose, time));
  context.restore();

  context.fillStyle = 'rgba(15, 23, 42, 0.78)';
  roundedRect(context, 28, 24, 904, 45, 16);
  context.fill();
  context.fillStyle = '#fff';
  context.font = '700 19px Arial, sans-serif';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(scene.title, 50, 47);
}

export default function TechnicalAnimation({ moduleKey, moduleTitle }: { moduleKey: string; moduleTitle: string }) {
  const key = (moduleKey in STORIES ? moduleKey : 'patent') as ModuleKey;
  const story = STORIES[key];
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationTimeRef = useRef(0);
  const sceneChangedAtRef = useRef(0);
  const scene = story.scenes[sceneIndex];

  useEffect(() => {
    sceneChangedAtRef.current = performance.now();
  }, [key, sceneIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const resizeCanvas = () => {
      const width = canvas.getBoundingClientRect().width;
      if (width === 0) {
        return;
      }
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round((width * 9 / 16) * pixelRatio);
    };

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);

    let frameId = 0;
    let previousFrameAt = performance.now();
    const render = (now: number) => {
      if (isPlaying) {
        animationTimeRef.current += Math.min(now - previousFrameAt, 50);
      }
      previousFrameAt = now;
      const transition = (now - sceneChangedAtRef.current) / 420;
      drawAnimationFrame(context, canvas, scene, story.characters, animationTimeRef.current, transition);
      frameId = window.requestAnimationFrame(render);
    };
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [isPlaying, scene, story.characters]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (sceneIndex === story.scenes.length - 1) {
        setIsPlaying(false);
      } else {
        setSceneIndex((index) => index + 1);
      }
    }, 5600);

    return () => window.clearTimeout(timer);
  }, [isPlaying, sceneIndex, story.scenes.length]);

  const goToScene = (nextIndex: number) => {
    setIsPlaying(false);
    setSceneIndex(Math.max(0, Math.min(story.scenes.length - 1, nextIndex)));
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (sceneIndex === story.scenes.length - 1) {
      setSceneIndex(0);
    }
    setIsPlaying(true);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6" aria-labelledby="animation-video-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="animation-video-title" className="text-xl font-bold text-slate-900">🎬 Animation Video</h2>
          <p className="mt-1 text-sm text-slate-600">{moduleTitle}: {story.concept}</p>
        </div>
        <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-900">Scene {sceneIndex + 1} of {story.scenes.length}</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          role="img"
          aria-label={`Animated scene: ${scene.title}. ${scene.narration}`}
          className="block h-auto w-full"
        />
      </div>

      <div aria-live="polite" className="mt-4">
        <h3 className="text-lg font-bold text-slate-900">{scene.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{scene.narration}</p>
        <blockquote className="mt-3 rounded-xl border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-sm font-medium leading-6 text-slate-800">
          “{scene.dialogue}”
        </blockquote>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" className="btn-secondary px-4 py-2" disabled={sceneIndex === 0} onClick={() => goToScene(sceneIndex - 1)}>
          Previous scene
        </button>
        <button type="button" className="btn-primary px-4 py-2" onClick={togglePlayback}>
          {isPlaying ? 'Pause animation' : 'Play animation'}
        </button>
        <button type="button" className="btn-secondary px-4 py-2" disabled={sceneIndex === story.scenes.length - 1} onClick={() => goToScene(sceneIndex + 1)}>
          Next scene
        </button>
        <span className="text-sm text-slate-500">The characters and scene animate during playback.</span>
      </div>
    </section>
  );
}