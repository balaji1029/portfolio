import { parse } from "yaml";
import profileRaw from "../data/profile.yaml?raw";
import experienceRaw from "../data/experience.yaml?raw";
import achievementsRaw from "../data/achievements.yaml?raw";
import toysRaw from "../data/toys.yaml?raw";
import skillsRaw from "../data/skills.yaml?raw";
import extracurricularsRaw from "../data/extracurriculars.yaml?raw";

export type Thread = "compilers" | "systems" | "graphics" | "security" | "ml";

/** Display names, in page order. */
export const THREADS: Record<Thread, string> = {
  compilers: "compilers & program analysis",
  systems: "systems & performance",
  graphics: "graphics",
  security: "architecture & security",
  ml: "ml / rl",
};

export interface Profile { name: string; tagline: string; now: string; github: string; linkedin: string; bio: string[] }
export interface Experience { id: string; role: string; org: string; location: string; period: string; start: string; summary: string }
export interface Achievement { group: "scholastic" | "olympiads"; text: string; year: string }
export interface Toy { name: string; description: string; repo: string }
export interface Skills { languages: string[]; tools: string[]; libraries: string[] }
export interface Extracurricular { name: string; text: string; year: string }

export const profile = (): Profile => parse(profileRaw);
export const experience = (): Experience[] => parse(experienceRaw);
export const achievements = (): Achievement[] => parse(achievementsRaw);
export const toys = (): Toy[] => parse(toysRaw);
export const skills = (): Skills => parse(skillsRaw);
export const extracurriculars = (): Extracurricular[] => parse(extracurricularsRaw);
