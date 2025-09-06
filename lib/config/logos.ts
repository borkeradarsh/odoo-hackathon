// lib/config/logos.ts

export const logoConfig = {
  // Main brand logo
  brand: {
    src: '/synergysphere.svg',
    alt: 'SynergySphere',
    width: 120,
    height: 40,
  },

  // Authentication background image
  authBackground: {
    src: '/login.png',
    alt: 'Authentication background',
    // CSS background style for better performance
    backgroundStyle: {
      backgroundImage: 'url(/login.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },

  // App metadata
  app: {
    name: 'SynergySphere',
    tagline: {
      login: 'Welcome to SynergySphere',
      signup: "You're one click away from less busywork",
    },
    subtitle: {
      login: 'To get started, please sign in',
      signup: '',
    },
  },
} as const;

export type LogoConfig = typeof logoConfig;
