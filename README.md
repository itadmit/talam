# תל״מ Anywhere

פורטל ידע ופעולות לקצינים — מבוסס Next.js

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Auth.js (NextAuth v5) with OTP
- **Email**: Resend
- **Storage**: Vercel Blob
- **UI**: Tailwind CSS + shadcn/ui + Lucide React
- **Validation**: Zod + React Hook Form
- **Deploy**: Vercel

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `RESEND_API_KEY` - Resend API key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

### 3. Set up database

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/          # Login page (OTP)
│   ├── (portal)/              # Main portal (protected)
│   │   ├── page.tsx           # Dashboard
│   │   ├── knowledge/         # Knowledge hub
│   │   ├── tickets/           # Ticketing system
│   │   ├── forms/             # Forms catalog & submission
│   │   ├── contacts/          # Contact directory
│   │   ├── links/             # Links library
│   │   ├── community/         # Community health dashboard
│   │   ├── search/            # Smart search
│   │   ├── notifications/     # Notifications
│   │   └── admin/             # Admin panel
│   │       ├── users/         # User management
│   │       ├── departments/   # Department management
│   │       ├── categories/    # Category management
│   │       ├── knowledge/     # Knowledge CMS
│   │       ├── tickets/       # Ticket management
│   │       ├── forms/         # Form management + Builder
│   │       ├── contacts/      # Contact management
│   │       ├── links/         # Link management
│   │       └── audit/         # Audit logs
│   └── api/
│       ├── auth/              # NextAuth routes
│       └── upload/            # File upload (Vercel Blob)
├── actions/                   # Server actions
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── layout/                # App shell, sidebar, header
│   └── forms/                 # Dynamic form renderer
└── lib/
    ├── db/                    # Drizzle schema & connection
    ├── auth/                  # Auth config & helpers
    ├── validators.ts          # Zod schemas
    └── email.ts               # Resend integration
```

## Features

- **OTP Authentication** - Email-based login with one-time passwords
- **Knowledge Hub** - Categorized information with status indicators
- **Ticketing System** - Open tickets, message threads, status tracking
- **Form Builder** - Drag-and-drop form creation with conditional logic
- **Digital Signature** - Canvas-based signature for form submissions
- **Smart Search** - Cross-module search (knowledge, forms, contacts, links)
- **Community Dashboard** - Department health indicators, Q&A transparency
- **Notifications** - In-app notifications for ticket responses and status changes
- **Admin Panel** - Full CMS with user, department, and content management
- **Audit Logging** - Track all system actions
- **RTL & Dark Mode** - Full Hebrew RTL support with dark/light theme
- **Mobile First** - Responsive design optimized for mobile

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Make sure to set all environment variables in the Vercel dashboard.
