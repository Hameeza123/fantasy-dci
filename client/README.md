# Fantasy DCI Frontend

A modern React frontend for the Fantasy Drum Corps International application.

## Features

- **Modern UI/UX**: Beautiful, responsive design with dark theme
- **Real-time Updates**: Socket.io integration for live draft updates
- **Authentication**: Complete user registration and login system
- **Dashboard**: User overview with stats and quick actions
- **Corps Browser**: View and filter DCI corps with scores
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling and design system
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running (see main README)

### Installation

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingSpinner.js
│   └── Navbar.js
├── contexts/           # React contexts for state management
│   ├── AuthContext.js
│   └── SocketContext.js
├── pages/              # Page components
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Dashboard.js
│   ├── Corps.js
│   ├── Leagues.js
│   ├── LeagueDetail.js
│   ├── Draft.js
│   └── Profile.js
├── App.js              # Main app component with routing
├── index.js            # App entry point
└── index.css           # Global styles
```

## Key Components

### Authentication
- **Login/Register**: Complete authentication forms with validation
- **AuthContext**: Manages user state and authentication
- **Protected Routes**: Automatic redirection for unauthenticated users

### Navigation
- **Navbar**: Responsive navigation with user menu
- **Mobile Menu**: Collapsible mobile navigation
- **Active States**: Visual feedback for current page

### Dashboard
- **Stats Cards**: User statistics and achievements
- **League Overview**: Active leagues and teams
- **Quick Actions**: Common user actions

### Corps Browser
- **Search & Filter**: Find corps by name, division, or section
- **Score Display**: Visual representation of corps performance
- **Section Breakdown**: Individual section scores and rankings

## Styling

The app uses Tailwind CSS with a custom dark theme:

- **Primary Colors**: Blue gradient theme
- **Section Colors**: Unique colors for each DCI section
- **Dark Theme**: Consistent dark mode throughout
- **Responsive**: Mobile-first design approach

## API Integration

The frontend connects to the backend API with:

- **Axios**: HTTP requests with automatic token handling
- **Error Handling**: Toast notifications for API errors
- **Loading States**: Spinner components for async operations
- **Real-time**: Socket.io for live updates

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Environment Variables

The frontend automatically proxies API requests to the backend at `http://localhost:5000`.

## Deployment

1. **Build the app**
   ```bash
   npm run build
   ```

2. **Serve the build folder**
   The `build` folder contains the production-ready files.

## Contributing

1. Follow the existing code style
2. Use Tailwind CSS for styling
3. Add proper error handling
4. Test on mobile devices
5. Update documentation as needed

## Future Features

- Complete league management interface
- Real-time draft room
- Team management and roster views
- Advanced statistics and analytics
- Mobile app (React Native) 