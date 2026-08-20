# 🎨 SyncBoard — Real-Time Collaborative Whiteboard

A modern, high-performance, real-time collaborative whiteboard platform built with **Next.js**, **React-Konva**, **Yjs (CRDTs)**, **WebSockets**, and **Prisma ORM**.

---

## 🌟 Key Features

### 🖌️ Interactive Canvas & Drawing Tools
- **Vector & Freehand Drawing**: Create rectangles, circles/ellipses, freehand pencil sketches, and rich text elements.
- **Canvas Navigation**: Smooth infinite pan, zoom controls (zoom in/out, fit to screen, 100% reset), and coordinate snapping.
- **Element Property Customization**: Live customization of fill colors, stroke colors, stroke widths, corner radius, opacity, font size, and z-index layering (Bring to Front, Send to Back).
- **Selection & Transformations**: Move, scale, rotate, multi-select, and erase canvas elements effortlessly.

### ⚡ Real-Time Collaboration & CRDTs
- **Multi-User Live Cursors**: See collaborators' cursors move in real time with custom user color badges and name tags.
- **Conflict-Free Synchronization**: Powered by **Yjs CRDTs** and **y-websocket** for instant peer-to-peer style updates with zero merge conflicts.
- **Presence & Collaborator Bar**: Real-time indicators of who is active on the board.
- **Offline Resilience & Persistence**: Integrated with **y-indexeddb** for local caching and automatic debounced SQLite snapshot persistence on the server.

### 🛡️ Role-Based Access Control & Sharing
- **Roles**: Granular permissions for **OWNER**, **EDITOR**, and **VIEWER**.
- **Viewer Mode**: Read-only canvas safeguards with an intuitive notification banner.
- **Board Share Modal**: Invite collaborators by email and manage their access roles on the fly.

### 📁 Board Management Dashboard
- **Organization & Categories**: Group boards into **Active**, **Design**, and **Archive** categories.
- **Search & Filtering**: Quickly find boards by title or category.
- **Board CRUD**: Create new boards, edit descriptions, duplicate, and delete boards.
- **Export Options**: Export entire boards or selection snapshots to **PNG**, **SVG**, or **JSON**.

### 🔐 Authentication
- Secure authentication system with password hashing (`bcryptjs`) and session tokens.
- Pre-seeded demo accounts ready for testing multi-user collaboration out of the box.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/) |
| **Canvas Engine** | [Konva](https://konvajs.org/) & [React-Konva](https://github.com/konvajs/react-konva) |
| **Real-Time & CRDT** | [Yjs](https://yjs.dev/), [y-websocket](https://github.com/yjs/y-websocket), [y-indexeddb](https://github.com/yjs/y-indexeddb), [Zustand](https://github.com/pmndrs/zustand) |
| **Backend & APIs** | [Next.js API Routes](https://nextjs.org/), [Node.js](https://nodejs.org/), [ws](https://github.com/websockets/ws), [tsx](https://github.com/privatenumber/tsx) |
| **Database & ORM** | [Prisma ORM](https://www.prisma.io/), [SQLite](https://www.sqlite.org/) |
| **Auth & Security** | [NextAuth.js](https://next-auth.js.org/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [Zod](https://zod.dev/) |

---

## 📂 Project Structure

```text
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema (User, Board, BoardMember)
│   │   ├── seed.ts             # Database seeder with demo users & boards
│   │   └── dev.db              # SQLite local database
│   ├── src/
│   │   ├── app/api/            # Next.js backend API routes (auth, boards)
│   │   ├── lib/                # Database and auth helpers
│   │   └── server/
│   │       └── ws-server.ts    # Standalone Yjs WebSocket server with DB persistence
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/                # Next.js pages (dashboard, board, login, signup)
│   │   ├── components/
│   │   │   ├── auth/           # Login / Signup forms
│   │   │   ├── board/          # Canvas, toolbar, property bar, cursors, modals
│   │   │   ├── dashboard/      # Board cards, search, filters, create modal
│   │   │   └── ui/             # Reusable UI primitives
│   │   ├── lib/                # API clients, Yjs provider & utilities
│   │   ├── store/              # Zustand state stores (canvas, board, auth)
│   │   └── types/              # TypeScript type declarations
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or later (Node 20+ recommended)
- **npm**, **pnpm**, or **yarn**

---

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (a default `.env` is pre-configured):
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:4000"
   NEXTAUTH_SECRET="syncboard_super_secret_local_jwt_key_2026"
   WS_PORT="1234"
   ```

4. Initialize the Prisma database and seed demo data:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```

5. Start the backend services (runs both REST API on port `4000` and WebSocket Server on port `1234` concurrently):
   ```bash
   npm run dev
   ```

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend Next.js development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 👥 Demo Credentials

The database seeder pre-populates several test accounts to test multi-user collaboration across multiple browser windows:

| Name | Email | Password | Role / Details |
| :--- | :--- | :--- | :--- |
| **John Doe** | `john@example.com` | `password123` | Owner of "Q3 Product Roadmap" |
| **Alice Smith** | `alice@example.com` | `password123` | Owner of "Design System Core" |
| **Alex** | `alex@example.com` | `password123` | Editor |
| **Rahul** | `rahul@example.com` | `password123` | Editor |

> 💡 **Tip:** Open an Incognito window or a second browser profile to log in as a second user and test live cursor tracking and concurrent drawing in real time!

---

## 🔧 Available Scripts

### Backend (`/backend`)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs both Next.js API server (`:4000`) and Yjs WebSocket server (`:1234`) concurrently |
| `npm run dev:api` | Starts only the Next.js API server on port 4000 |
| `npm run dev:ws` | Starts only the Yjs WebSocket server with SQLite snapshot sync on port 1234 |
| `npm run prisma:push` | Pushes schema changes directly to SQLite database |
| `npm run prisma:seed` | Seeds database with demo users and collaborative boards |
| `npm run prisma:studio`| Opens Prisma Studio GUI in browser for inspecting database records |
| `npm run build` | Generates Prisma client and builds Next.js production bundle |

### Frontend (`/frontend`)

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on `http://localhost:3000` |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Starts production server |
| `npm run lint` | Runs ESLint checks |

---

## 📡 Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                     Frontend (Next.js)                      │
 │                                                             │
 │   ┌──────────────────────┐      ┌────────────────────────┐  │
 │   │  React-Konva Canvas  │◄────►│  Zustand + Yjs Doc     │  │
 │   └──────────────────────┘      └───────────┬────────────┘  │
 └─────────────────┬───────────────────────────┼───────────────┘
                   │ HTTP                      │ WebSocket
                   ▼                           ▼
 ┌─────────────────────────────────┐   ┌────────────────────────┐
 │   Backend REST API (Port 4000)  │   │  Yjs WS Server (:1234) │
 │  - Auth & Session Verification  │   │  - Live Cursors Sync   │
 │  - Board Management CRUD        │   │  - CRDT Room Updates   │
 │  - Member Permissions           │   │  - Debounced Auto-Save │
 └────────────────┬────────────────┘   └───────────┬────────────┘
                  │                                │
                  └───────────────┬────────────────┘
                                  ▼
                    ┌───────────────────────────┐
                    │       Prisma ORM          │
                    │   (SQLite Database DB)    │
                    └───────────────────────────┘
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
