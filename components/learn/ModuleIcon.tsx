import {
  BookOpen,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

const moduleIcons: Record<string, LucideIcon> = {
  patent: Lightbulb,
  copyright: BookOpen,
  trademark: ShieldCheck,
  'trade-secret': LockKeyhole,
  plagiarism: GraduationCap,
};

export default function ModuleIcon({ moduleKey, className = 'h-5 w-5' }: { moduleKey: string; className?: string }) {
  const Icon = moduleIcons[moduleKey] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.8} />;
}