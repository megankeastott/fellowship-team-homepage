// ============================================================
// TEAM DATA — edit here, then rebuild to update the site.
// ============================================================
// This holds the hard-coded content that used to live in Code.gs:
// team leads, the LOD schedule, the roster, incentives, and superlatives.

import type { RealmColor } from './site';

export interface Person {
  name: string;
  role: 'Team Lead' | 'Senior Specialist';
  color: RealmColor;
  medallion?: string;
  bio?: string[];
  funFact?: string;
  link?: { text: string; url: string };
}

export const TEAM_LEADS: Person[] = [
  {
    name: 'Megan',
    role: 'Team Lead',
    color: 'shire',
    medallion: 'https://i.imgur.com/QKYlfoy.png',
    bio: [
      'I am Megan. My focus is all things tutor support and tutor support related projects.',
      'I am constantly doing something, but my DMs and Google Meets are available. If you need to discuss something, have a question, or concern — feel free to reach out.',
    ],
    link: { text: 'Book time with me', url: 'https://calendar.app.google/Khen98WJU9yC1koz5' },
  },
  {
    name: 'Gus',
    role: 'Team Lead',
    color: 'evenstar',
    medallion: 'https://i.imgur.com/GU50Mlg.png',
    bio: [
      'Lead with a major focus on Platform Support and all things tech. Jack of all trades, master of none.',
      'I do things outside of work that do not include my computer.',
    ],
    funFact: 'I was an extra in the movie Hitch and Indiana Jones.',
  },
  {
    name: 'Andrezza',
    role: 'Senior Specialist',
    color: 'twilight',
    medallion: 'https://i.imgur.com/h2aJ4wL.png',
    bio: [
      'I am a Senior Operations Support Specialist (from Brazil), Buffy expert, mother of four beautiful cats, and retired musician.',
      'If you ever need me my DMs are open and so is my Google Meets!',
    ],
  },
  {
    name: 'Erika',
    role: 'Senior Specialist',
    color: 'hearth',
    medallion: 'https://i.imgur.com/0kgXhBw.png',
    bio: [
      "Hi team! I'm Erika, Senior Operations Support Specialist—an anxious person at heart, but actively trying not to be.",
      "If you need me, I'm usually on Slack—maybe overthinking something, maybe trying not to drown, or just checking for updates. Either way, feel free to reach out anytime.",
    ],
  },
];

export interface Slot {
  time: string;
  agent: string;
  agentKey: string;
}
export interface ScheduleDay {
  day: string;
  color: RealmColor;
  fullWidth?: boolean;
  slots: Slot[];
}

// LOD Schedule (anchored to America/Chicago). agentKey drives name color.
export const LOD_SCHEDULE: ScheduleDay[] = [
  {
    day: 'Sunday',
    color: 'shadow',
    slots: [
      { time: '07:00 – 11:00', agent: 'Andrezza', agentKey: 'andrezza' },
      { time: '11:00 – 15:00', agent: 'Joao', agentKey: 'joao' },
      { time: '15:00 – 19:00', agent: 'Andro', agentKey: 'andro' },
      { time: '19:00 – 21:00', agent: 'Megan', agentKey: 'megan' },
    ],
  },
  {
    day: 'Monday',
    color: 'twilight',
    slots: [
      { time: '07:00 – 11:00', agent: 'Andrezza', agentKey: 'andrezza' },
      { time: '11:00 – 14:00', agent: 'Megan', agentKey: 'megan' },
      { time: '14:00 – 16:00', agent: 'Andro', agentKey: 'andro' },
      { time: '16:00 – 21:00', agent: 'Joao', agentKey: 'joao' },
    ],
  },
  {
    day: 'Tuesday',
    color: 'evenstar',
    slots: [
      { time: '07:00 – 10:00', agent: 'Andrezza', agentKey: 'andrezza' },
      { time: '10:00 – 13:00', agent: 'Erika', agentKey: 'erika' },
      { time: '13:00 – 15:00', agent: 'Joao', agentKey: 'joao' },
      { time: '15:00 – 18:00', agent: 'Andro', agentKey: 'andro' },
      { time: '18:00 – 21:00', agent: 'Lu', agentKey: 'lu' },
    ],
  },
  {
    day: 'Wednesday',
    color: 'shire',
    slots: [
      { time: '07:00 – 11:00', agent: 'Erika', agentKey: 'erika' },
      { time: '11:00 – 14:00', agent: 'Andro', agentKey: 'andro' },
      { time: '14:00 – 16:00', agent: 'Lu', agentKey: 'lu' },
      { time: '16:00 – 21:00', agent: 'Andrezza', agentKey: 'andrezza' },
    ],
  },
  {
    day: 'Thursday',
    color: 'hearth',
    slots: [
      { time: '07:00 – 10:00', agent: 'Erika', agentKey: 'erika' },
      { time: '10:00 – 14:00', agent: 'Andrezza', agentKey: 'andrezza' },
      { time: '14:00 – 17:00', agent: 'Lu', agentKey: 'lu' },
      { time: '17:00 – 21:00', agent: 'Andro', agentKey: 'andro' },
    ],
  },
  {
    day: 'Friday',
    color: 'earthen',
    slots: [
      { time: '07:00 – 11:00', agent: 'Erika', agentKey: 'erika' },
      { time: '11:00 – 14:00', agent: 'Joao', agentKey: 'joao' },
      { time: '14:00 – 17:00', agent: 'Lu', agentKey: 'lu' },
      { time: '17:00 – 21:00', agent: 'Gus', agentKey: 'gus' },
    ],
  },
  {
    day: 'Saturday',
    color: 'shadow',
    fullWidth: true,
    slots: [
      { time: '07:00 – 10:00', agent: 'Gus', agentKey: 'gus' },
      { time: '10:00 – 14:00', agent: 'Joao', agentKey: 'joao' },
      { time: '14:00 – 18:00', agent: 'Lu', agentKey: 'lu' },
      { time: '18:00 – 21:00', agent: 'Erika', agentKey: 'erika' },
    ],
  },
];

export const AGENT_COLORS: Record<string, string> = {
  andrezza: '#a898c0',
  joao: '#80b8b0',
  megan: '#8cc07a',
  erika: '#d4b060',
  andro: '#c07060',
  gus: '#8e9680',
  lu: '#d4a0b0',
};

export const AGENT_MEDALLIONS: Record<string, string> = {
  megan: 'https://i.imgur.com/QKYlfoy.png',
  gus: 'https://i.imgur.com/GU50Mlg.png',
  andrezza: 'https://i.imgur.com/h2aJ4wL.png',
  erika: 'https://i.imgur.com/0kgXhBw.png',
};

// ── Team Hub data ──────────────────────────────────────────

export interface RosterMember {
  name: string;
  title: string;
  team?: 'guardians' | 'wardens';
}

export const TEAM_ROSTER: {
  leadership: RosterMember[];
  fellowship: RosterMember[];
} = {
  leadership: [
    { name: 'Megan Keast-Ott', title: 'Team Lead — Tutor Support' },
    { name: 'Gus Duran', title: 'Team Lead — Platform Support' },
    { name: 'Andrezza Ribeiro', title: 'Senior Operations Support Specialist' },
    { name: 'Erika Sanchez', title: 'Senior Operations Support Specialist' },
  ],
  fellowship: [
    { name: 'Joao Pimenta', title: 'Operations Support Specialist', team: 'guardians' },
    { name: 'Luciana Zaracho', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Bianca Correia', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Marvin Beltre', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Yulennys Medina', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Rusking Gonzalez', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Nhadinne MenaYema', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Giovanna Capanema', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Rebeca Gardie', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Deivid Zatti', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Mariefaye Lat', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Beatriz Vinas', title: 'Operations Support Specialist', team: 'wardens' },
    { name: 'Dalia Agramonte', title: 'Operations Support Specialist', team: 'wardens' },
  ],
};

export const INCENTIVES: {
  period: string;
  items: { name: string; prize: string; detail: string }[];
} = {
  period: 'Monthly',
  items: [
    {
      name: 'End-of-Month Raffle',
      prize: '$50',
      detail:
        'Drawn from raffle entries earned across the month. Extra entries come from Bingo wins and superlative nominations.',
    },
    {
      name: 'Things Tutors Say — Bingo',
      prize: '$25 × 2 winners',
      detail: 'Five rounds. Win three out of five to claim a prize.',
    },
  ],
};

export const SUPERLATIVES: {
  round: number;
  prompt: string;
  winners: { tale: string; name: string }[];
} = {
  round: 4,
  prompt: 'Round 4 — nominated by the team via Slack thread.',
  winners: [],
};
