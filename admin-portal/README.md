# SEWASETU - Admin Portal

Admin dashboard for the AI-Powered Civic Issue Reporting Platform.

## About SEWASETU

SEWASETU is a comprehensive civic issue reporting platform that allows citizens to report municipal issues and enables administrators to track, manage, and resolve these issues efficiently.

## Getting Started

To run the admin portal locally:

```sh
# Step 1: Navigate to the admin portal directory
cd admin-portal

# Step 2: Install dependencies
npm install

# Step 3: Start the development server
npm run dev
```

The admin portal will be available at `http://localhost:5173`

## Features

- **Dashboard**: Overview of reports, KPIs, and analytics
- **Reports Management**: View, filter, and update report status
- **Interactive Maps**: Visualize report locations on maps
- **Analytics**: Charts and insights on report trends
- **User Management**: Administrative functions

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React-Leaflet
- **Charts**: Recharts
- **State Management**: TanStack Query
- **Routing**: React Router DOM

## Configuration

Ensure your environment variables are set up correctly:

```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Development

For development with hot reload:
```sh
npm run dev
```

For production build:
```sh
npm run build
```

## Integration

This admin portal connects to:
- Backend API (FastAPI) running on port 8000
- AI Model Server for automated categorization
- Supabase for data storage and authentication
