# SEWASETU - Citizen Portal

Citizen-facing application for the AI-Powered Civic Issue Reporting Platform.

## About SEWASETU

SEWASETU is a comprehensive civic issue reporting platform that enables citizens to easily report municipal issues such as infrastructure problems, safety concerns, and public service issues.

## Getting Started

To run the citizen portal locally:

```sh
# Step 1: Navigate to the citizen portal directory
cd citizen-portal

# Step 2: Install dependencies
npm install

# Step 3: Start the development server
npm run dev
```

The citizen portal will be available at `http://localhost:5174`

## Features

- **Issue Reporting**: Easy-to-use form for reporting civic issues
- **Interactive Map**: Select exact location of issues on a map
- **Photo Upload**: Attach images to reports for better documentation
- **Report Tracking**: Track the status of submitted reports
- **User Authentication**: Secure login and registration
- **Category Selection**: Organized issue categories (Infrastructure, Safety, Public Service, Other)

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React-Leaflet
- **Forms**: React Hook Form with Zod validation
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

This citizen portal connects to:
- Backend API (FastAPI) running on port 8000
- AI Model Server for automated issue categorization
- Supabase for data storage and user authentication
