/* ------------------------------------------------------------------
   ALL PORTFOLIO CONTENT LIVES IN THIS FILE.
   Edit text here and every scene and section updates.
   Nothing in this file is invented: it comes from the résumé and the
   assets Sagar shared. Sections with empty lists stay hidden.
------------------------------------------------------------------- */

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export interface PortfolioImage {
  src: string; // full-quality original, shown in the image viewer
  thumb?: string; // lighter version for in-page display
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export const IMAGES = {
  portrait: {
    src: asset('images/sagar-patil.jpg'),
    thumb: asset('images/sagar-patil-portrait.jpg'),
    alt: 'Portrait of Sagar Patil',
    caption: 'Sagar Patil',
    width: 1024,
    height: 1536,
  },
  campus: {
    src: asset('images/rcu-campus.jpg'),
    alt: 'Rani Channamma University campus, Vidyasangama, Belagavi',
    caption: 'Rani Channamma University, Vidyasangama, Belagavi',
    width: 597,
    height: 335,
  },
  rcuEmblem: {
    src: asset('images/rcu-emblem.png'),
    alt: 'Rani Channamma University emblem',
    caption: 'Rani Channamma University emblem',
    width: 527,
    height: 379,
  },
  mokshaLogo: {
    src: asset('images/moksha-softlabs-logo.jpg'),
    alt: 'Moksha Softlabs Private Limited logo',
    caption: 'Moksha Softlabs Private Limited',
    width: 1536,
    height: 1024,
  },
  mokshaIcon: {
    src: asset('images/moksha-icon.png'),
    alt: 'Moksha Softlabs icon',
    caption: 'Moksha Softlabs',
    width: 356,
    height: 360,
  },
} satisfies Record<string, PortfolioImage>;

export const PROFILE = {
  name: 'Sagar Patil',
  firstName: 'Sagar',
  title: 'Software Developer',
  focus: '.NET · C# · SQL Server',
  company: 'Moksha Softlabs Pvt Ltd',
  location: 'Belagavi, Karnataka, India',
  summary: [
    'I build .NET applications with C#, ASP.NET MVC, ADO.NET, SQL Server and Syncfusion, with responsive interfaces on top.',
    'My work so far sits in the banking and freight domains: transaction processing, invoice generation, data integration and performance optimisation.',
    'I also keep production healthy by monitoring services daily, analysing exceptions and resolving issues so systems run smoothly.',
  ],
  facts: [
    { label: 'Role', value: 'Jr Software Developer' },
    { label: 'Company', value: 'Moksha Softlabs, Mumbai' },
    { label: 'Home', value: 'Belagavi, Karnataka' },
    { label: 'Domains', value: 'Banking · Freight' },
  ],
  languages: ['English', 'Kannada', 'Hindi'],
  interests: ['Playing cricket', 'Watching movies'],
};

export const HOME = {
  city: 'Belagavi',
  state: 'Karnataka',
  country: 'India',
  lat: 15.8497,
  lon: 74.4977,
  timezone: 'IST · UTC+5:30',
};

export const JOURNEY_TIMELINE = [
  { year: '2020', title: 'BCA', detail: 'Rani Channamma University, Belagavi' },
  { year: '2023', title: 'MCA', detail: 'Rani Channamma University, Belagavi' },
  { year: '2024', title: 'Jr Software Developer', detail: 'Moksha Softlabs Pvt Ltd, Mumbai' },
];

export const EDUCATION = {
  university: 'Rani Channamma University',
  place: 'Vidyasangama, Belagavi, Karnataka',
  degrees: [
    { short: 'MCA', name: 'Master of Computer Applications', year: '2023' },
    { short: 'BCA', name: 'Bachelor of Computer Applications', year: '2020' },
  ],
  images: [IMAGES.campus, IMAGES.rcuEmblem] as PortfolioImage[],
};

export const EXPERIENCE = [
  {
    company: 'Moksha Softlabs Pvt Ltd',
    role: 'Jr Software Developer',
    period: 'Jul 2024 – Present',
    place: 'Mumbai',
    logo: IMAGES.mokshaLogo as PortfolioImage,
    icon: IMAGES.mokshaIcon as PortfolioImage,
    points: [
      'Developed web applications using C#, ASP.NET MVC, ADO.NET and SQL, ensuring strong backend logic and database integration.',
      'Implemented rich, user-friendly interfaces using Syncfusion UI components.',
      'Worked on Bank Card Service (BOB Cards) projects, contributing to card-related modules and system enhancements.',
      'Provided technical support for existing projects: resolving issues, improving system performance and supporting production environments.',
      'Monitored production services daily on the server, analysed exceptions and resolved issues.',
      'Handled manual testing, analysed Jira tickets and assigned tasks to developers.',
    ],
    stack: ['C#', 'ASP.NET Core MVC', 'ADO.NET', 'SQL Server', 'Oracle SQL Developer', 'Syncfusion', 'Git', 'Jira'],
  },
];

export interface Project {
  name: string;
  context: string;
  glyph: 'card' | 'ship' | 'sync';
  description: string;
  highlights: string[];
  tags: string[];
  images: PortfolioImage[]; // add screenshots here and they appear with the image viewer
}

export const PROJECTS: Project[] = [
  {
    name: 'Card Issuing Recon',
    context: 'BOB Cards · Banking',
    glyph: 'card',
    description:
      'A project that performs daily T+1 reconciliation by matching card issuing data with VisionPlus records.',
    highlights: [
      'Provided technical support to keep processing continuous',
      'Resolved data mismatches between systems',
      'Maintained smooth daily reconciliation operations',
    ],
    tags: ['T+1 Reconciliation', 'VisionPlus', 'Banking', 'Production Support'],
    images: [],
  },
  {
    name: 'MFreight',
    context: 'Sea Import / Export · Logistics',
    glyph: 'ship',
    description:
      'A sea import/export logistics system that manages HBL/MBL bookings and streamlines cargo movement through CFS operations.',
    highlights: [
      'Finance module for freight billing, invoicing and payment processing',
      'HBL / MBL booking management',
      'Cargo movement through CFS operations',
    ],
    tags: ['Logistics', 'HBL / MBL', 'CFS Operations', 'Freight Billing', 'Invoicing'],
    images: [],
  },
  {
    name: 'MTrack Replica',
    context: 'Data Replication · .NET',
    glyph: 'sync',
    description:
      'A data replication system that synchronises live production data to a replica database every 2 hours.',
    highlights: [
      'Built with a .NET Windows Service and SQL Server',
      'SQL Triggers and Stored Procedures for automated data sync',
      'Monitoring and production support',
    ],
    tags: ['.NET Windows Service', 'SQL Server', 'SQL Triggers', 'Stored Procedures'],
    images: [],
  },
];

export const SKILLS = [
  { group: 'Language', items: ['C#'] },
  { group: 'Frameworks & Technologies', items: ['ASP.NET Core MVC', 'ASP.NET MVC', 'ADO.NET', 'Syncfusion', '.NET Windows Services', 'API Integrations'] },
  { group: 'Databases', items: ['SQL Server', 'Oracle SQL Developer', 'Stored Procedures', 'SQL Triggers', 'Data Modeling'] },
  { group: 'UI & Web', items: ['Responsive UI', 'Web Application Development', 'UI Design'] },
  { group: 'Tools & Practices', items: ['Git', 'GitHub', 'Jira', 'Manual Testing', 'Production Monitoring'] },
  { group: 'Domains', items: ['Banking', 'Financial Services', 'Freight Management'] },
];

/* Leave these empty until there is real information to show.
   Add entries and the Research / Achievements sections (and their 3D
   objects) appear automatically. */
export interface ResearchItem {
  title: string;
  venue: string;
  year: string;
  summary: string;
  link?: string;
  images?: PortfolioImage[];
}
export const RESEARCH: ResearchItem[] = [];

export interface Achievement {
  title: string;
  detail: string;
  year?: string;
  images?: PortfolioImage[];
}
export const ACHIEVEMENTS: Achievement[] = [];

export const CONTACT = {
  email: 'patilsagar2309@gmail.com',
  phone: '+91 97396 06972',
  phoneHref: '+919739606972',
  linkedin: 'https://www.linkedin.com/in/sagar-patil-6a0a39216/',
  linkedinLabel: 'linkedin.com/in/sagar-patil-6a0a39216',
  github: 'https://github.com/sagarpatil199',
  githubLabel: 'github.com/sagarpatil199',
  location: 'Belagavi, Karnataka, India',
};

/* ------------------------------------------------------------------
   Sections shown as 3D objects around the Earth
------------------------------------------------------------------- */
export type SectionId =
  | 'about'
  | 'education'
  | 'experience'
  | 'projects'
  | 'research'
  | 'skills'
  | 'achievements'
  | 'contact';

export interface SectionMeta {
  id: SectionId;
  title: string;
  tagline: string;
  color: string;
  shape: 'icosa' | 'octa' | 'torus' | 'cube' | 'knot' | 'dodeca' | 'cone' | 'sphere';
}

const ALL_SECTIONS: SectionMeta[] = [
  { id: 'about', title: 'About Me', tagline: 'Who I am', color: '#6fe9ff', shape: 'icosa' },
  { id: 'education', title: 'Education', tagline: 'Rani Channamma University', color: '#8fb4ff', shape: 'octa' },
  { id: 'experience', title: 'Experience', tagline: 'Moksha Softlabs', color: '#5cc8ff', shape: 'torus' },
  { id: 'projects', title: 'Projects', tagline: 'What I have built', color: '#7da2ff', shape: 'cube' },
  { id: 'research', title: 'Research', tagline: 'Published work', color: '#a5b4ff', shape: 'knot' },
  { id: 'skills', title: 'Skills', tagline: 'My toolkit', color: '#66f0d9', shape: 'dodeca' },
  { id: 'achievements', title: 'Achievements', tagline: 'Milestones', color: '#9fd6ff', shape: 'cone' },
  { id: 'contact', title: 'Contact', tagline: "Let's connect", color: '#ffffff', shape: 'sphere' },
];

export const SECTIONS: SectionMeta[] = ALL_SECTIONS.filter((s) => {
  if (s.id === 'research') return RESEARCH.length > 0;
  if (s.id === 'achievements') return ACHIEVEMENTS.length > 0;
  return true;
});
