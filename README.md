# SoulScribe — AI-Powered Journaling App

> Your personal space to reflect, express, and grow — powered by AI.

SoulScribe is a full-stack AI journaling application that helps users write, reflect, and gain emotional insights from their daily entries. It works as a web app and can be installed as a native Android/iOS app via Capacitor.

---

## Features

- **AI-assisted journaling** — intelligent prompts and reflections powered by Supabase Edge Functions
- **Mood tracking** — log and visualize emotional patterns over time
- **Secure authentication** — user accounts with protected journal entries
- **Rich text journaling** — smooth writing experience with animations via Framer Motion
- **Installable PWA** — works offline and installs on Android/iOS like a native app
- **Responsive design** — mobile-first UI with Tailwind CSS and shadcn/ui components

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework with type safety |
| Vite | Fast build tool and dev server |
| Tailwind CSS | Utility-first styling |
| shadcn/ui + Radix UI | Accessible component library |
| React Router | Client-side navigation |
| TanStack Query | Server state and data fetching |
| Framer Motion | Smooth page and component animations |
| React Hook Form + Zod | Form handling and validation |
| Lucide React | Icon library |
| Sonner | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Supabase | Database, auth, file storage, edge functions |
| Supabase JS Client | Backend SDK |

### Mobile
| Technology | Purpose |
|---|---|
| Capacitor | Native Android/iOS wrapper |
| vite-plugin-pwa | Progressive Web App support |

---

## Screenshots

> _Add screenshots here once deployed — home screen, journal entry screen, mood tracker_

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/suprithas/soulscribe.git
cd soulscribe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase project URL and anon key

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Project Structure

```
soulscribe/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client, utilities
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── capacitor.config.ts   # Mobile app configuration
```

---

## What I Learned

- Integrating Supabase for auth, database, and serverless edge functions in a single project
- Building a PWA that installs as a native app on Android/iOS using Capacitor
- Managing server state efficiently with TanStack Query
- Designing accessible, animated UI using shadcn/ui and Framer Motion
- Type-safe form validation with React Hook Form + Zod

---

## Built By

**Supritha S**
M.Tech Integrated CSE (Business Analytics) — VIT Chennai
[LinkedIn]( linkedin.com/in/supritha-s-308968300
) · [GitHub](https://github.com/suprithasugumar)

---

## License

MIT
