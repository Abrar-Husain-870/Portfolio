export const hero = {
  name: "Syed Abrar Husain",
  roles: ["Fullstack Developer", "Problem Solver", "Creative Thinker"],
  tagline: `I design and develop secure, scalable, and human-centered applications that bridge creativity with functionality. Every line of code I write aims to solve real problems while delivering memorable digital experiences.`,
  ctas: { primary: "#projects", secondary: "#contact" }
};

export const about = {
  story: [
    "I'm a passionate fullstack developer with a love for creating intuitive and performant web experiences. My journey began with curiosity about how websites work, and it's evolved into a mission to build digital products that make a difference.",
    "I believe in the power of clean code, thoughtful design, and user-centered development. Every project is an opportunity to solve real problems while pushing the boundaries of what's possible on the web.",
    "When I'm not coding, you'll find me exploring new technologies, contributing to open source, or sharing knowledge with the developer community."
  ],
  stats: [
    { label: "Projects Built", value: 10 },
    { label: "Hours Coded", value: 2500 },
    { label: "People Impacted", value: 1000 }
  ],
  skills: [
    // Languages
    { label: "Python", icon: "https://cdn.simpleicons.org/python", category: "Languages" },
    { label: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg", category: "Languages" },
    { label: "C", icon: "https://cdn.simpleicons.org/c", category: "Languages" },
    { label: "C++", icon: "https://cdn.simpleicons.org/cplusplus", category: "Languages" },
    { label: "HTML5", icon: "https://cdn.simpleicons.org/html5", category: "Languages" },
    { label: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg", category: "Languages" },
    { label: "JavaScript", icon: "https://cdn.simpleicons.org/javascript", category: "Languages" },
    { label: "SQL", icon: "https://cdn.simpleicons.org/sqlite", category: "Languages" },

    // Developer Tools
    { label: "VS Code", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg", category: "Developer Tools" },
    { label: "Git", icon: "https://cdn.simpleicons.org/git", category: "Developer Tools" },
    { label: "GitHub", icon: "https://cdn.simpleicons.org/github", category: "Developer Tools" },
    { label: "PostgreSQL", icon: "https://cdn.simpleicons.org/postgresql", category: "Developer Tools" },
    { label: "Postman", icon: "https://cdn.simpleicons.org/postman", category: "Developer Tools" },
    { label: "Deployment & Hosting", icon: "https://cdn.simpleicons.org/vercel", category: "Developer Tools" },

    // Technologies / Frameworks
    { label: "Linux", icon: "https://cdn.simpleicons.org/linux", category: "Technologies" },
    { label: "ReactJS", icon: "https://cdn.simpleicons.org/react", category: "Technologies" },
    { label: "REST API", icon: "https://cdn.simpleicons.org/openapiinitiative", category: "Technologies" },
    { label: "ExpressJS", icon: "https://cdn.simpleicons.org/express", category: "Technologies" },
    { label: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss", category: "Technologies" },

    // Python Libraries
    { label: "NumPy", icon: "https://cdn.simpleicons.org/numpy", category: "Python Libraries" },
    { label: "Pandas", icon: "https://cdn.simpleicons.org/pandas", category: "Python Libraries" },
    // Removed Matplotlib and Seaborn as requested
  ]
};

export type Project = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  image: string;
  repo?: string;
  demo?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  // Featured
  {
    id: "writify",
    title: "Writify",
    blurb: "University student assignment platform with Google OAuth, JWT sessions, and PostgreSQL. Responsive React + Tailwind UI with dark mode; streamlined flows for assignments, feedback, and author profiles to save up to 8 hours weekly.",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "TailwindCSS", "JWT", "OAuth"],
    image: "/projects/writify.png",
    repo: "https://github.com/Abrar-Husain-870/WritifyApp",
    demo: "https://writify-app-huxg.vercel.app/login",
    featured: true
  },
  {
    id: "jamaah-journal",
    title: "Jamā’ah Journal",
    blurb: "Multi-faith prayer & reflection tracker for 100+ users with privacy controls, streak analytics, leaderboard, and PWA (offline + install). Real-time data via Firebase with fast React 18 UX.",
    tags: ["React", "Firebase", "TailwindCSS", "PWA", "Analytics"],
    image: "/projects/jamaah%20journal.png",
    repo: "https://github.com/Abrar-Husain-870/PrayerTracker",
    demo: "https://prayer-tracker-tau.vercel.app/",
    featured: true
  },
  {
    id: "sahayak-ai",
    title: "Sahayak AI",
    blurb: "AI Teaching Assistant that generates weekly lesson plans, visual aids, and differentiated worksheets from textbook images. NextAuth-secured flows with Firestore history for reliable, repeatable results.",
    tags: [
      "Next.js",
      "React",
      "TypeScript",
      "TailwindCSS",
      "NextAuth",
      "Firebase",
      "Firestore",
      "Genkit",
      "Google AI",
      "Radix UI",
      "Markdown"
    ],
    image: "/projects/sahayak%20ai.png",
    featured: true
  },
  {
    id: "keeper",
    title: "Keeper",
    blurb:
      "A Google Keep clone built with React and Firebase. Real-time, user-specific notes via Firebase Auth + Firestore with full CRUD, responsive UI, and trash/archive flows.",
    tags: [
      "React",
      "Firebase",
      "JavaScript (ES6+)",
      "Vite",
      "CSS3"
    ],
    image: "/projects/keeper.png",
    repo: "https://github.com/Abrar-Husain-870/Keeper-Clone",
    demo: "https://keepon.netlify.app/",
    featured: false
  },
  {
    id: "move-it",
    title: "Move It (Landing Page)",
    blurb:
      "Transportation service landing page for movers and packers (furniture and goods). Built as a clean, responsive marketing site.",
    tags: ["HTML", "CSS", "Bootstrap", "Landing Page"],
    image: "/projects/MoveIt.png",
    repo: "https://github.com/Abrar-Husain-870/Move-It_website",
    demo: "https://abrar-husain-870.github.io/Move-It_website/",
    featured: false
  },
  {
    id: "ecommerce-store",
    title: "E‑Commerce Store",
    blurb:
      "Responsive single‑page storefront powered by React Router and Material UI. Browse products from the Fake Store API, view rich product detail pages, and manage a cart with quantity updates and removal. Built with idiomatic React + TypeScript for a fast, accessible UX.",
    tags: ["React", "TypeScript", "Material UI", "SPA"],
    image: "/projects/e-commerce.png",
    repo: "https://github.com/Abrar-Husain-870/E-Commerce-App",
    demo: "https://e-commerce-app-livid-three.vercel.app/products",
    featured: false
  },
  
];

export const contact = {
  email: "husainabrar870@gmail.com",
  social: {
    github: "https://github.com/Abrar-Husain-870",
    linkedin: "https://www.linkedin.com/in/abrar-husain-8833072b7/"
  }
};
