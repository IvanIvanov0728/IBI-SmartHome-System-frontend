# IBI SmartHome System - Frontend

A modern, responsive, and real-time dashboard for the IBI Smart Home System, built with React 19 and Tailwind CSS.

## 🚀 Overview

The IBI SmartHome frontend provides an intuitive user interface for monitoring and controlling smart home devices. It features real-time updates via SignalR, a sleek dashboard with data visualizations, and full administrative capabilities for managing the home hierarchy (Houses, Rooms, and Devices).

## 🛠 Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **State Management & Data Fetching**: TanStack Query (React Query)
- **Real-time Communication**: @microsoft/signalr (WebSockets)
- **Data Visualization**: Recharts
- **Animations**: Framer Motion
- **Forms & Validation**: React Hook Form + Zod
- **Routing**: Wouter (Lightweight alternative to React Router)
- **Local State/Schema**: Drizzle ORM (Integrated for structured local state management)

## 📡 Real-time Synchronization

The frontend leverages **SignalR** to maintain a persistent connection with the backend. This allows for:
- **Instant Device Feedback**: When a device is toggled or changed, the UI updates immediately across all connected clients.
- **Live Monitoring**: Real-time graphs and alerts for temperature changes or security events.
- **Low Latency**: Reduced overhead compared to polling, ensuring a responsive user experience.

## 🗃 Drizzle ORM in the Frontend

Drizzle ORM is used on the frontend to provide a robust and typed schema for local data handling. This approach was chosen over traditional state management for:
- **Consistency**: Sharing schema definitions between layers if needed.
- **Structured State**: Using SQL-like syntax to query and manage complex local state or cached data.
- **Performance**: Efficient management of relational data structures on the client side.

## 🏗 Key Features

- **Dynamic Dashboard**: Overview of system health, active devices, and quick controls.
- **Admin Panel**: Complete management of the home structure (adding houses, rooms, and assigning devices).
- **Security Hub**: Real-time camera feeds (simulated) and security log monitoring.
- **Climate Control**: Interactive scheduling and manual temperature adjustments.
- **Energy Analytics**: Visualized consumption data and battery storage monitoring.

## 🐳 Docker & Production

The frontend is containerized using a multi-stage Docker build:
1.  **Build Stage**: Uses Node.js 20 to compile the TypeScript code into a highly optimized production build.
2.  **Production Stage**: Uses a lightweight **Nginx** image to serve the static assets.
3.  **Reverse Proxy**: The Nginx configuration is optimized for Single Page Applications (SPA) and includes a reverse proxy for API and SignalR traffic to bypass CORS issues in production.

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation
1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment**:
    Create a `.env` file or set the following variable:
    `VITE_API_URL=http://localhost:8080` (Point to your running backend)

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```
