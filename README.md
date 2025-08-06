# Fantasy DCI Backend

A comprehensive backend system for Fantasy Drum Corps International (DCI) draft leagues. Users can create leagues, draft corps for different sections (brass, percussion, guard, visual, general effect), and compete with friends.

## Features

- **User Management**: Registration, authentication, and profile management
- **League Management**: Create, join, and manage fantasy leagues
- **Draft System**: Real-time drafting with multiple sections
- **Corps Management**: DCI corps data with scores and rankings
- **Team Management**: Fantasy teams with roster management
- **Real-time Updates**: Socket.io integration for live draft updates
- **Scoring System**: Automatic score calculation and rankings
- **Admin Panel**: Administrative functions for managing corps data

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fantasy_dci
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fantasy-dci
   JWT_SECRET=your-super-secret-jwt-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh JWT token

### Corps

- `GET /api/corps` - Get all corps (with pagination)
- `GET /api/corps/:corpsId` - Get corps by ID
- `POST /api/corps` - Create new corps (admin only)
- `PUT /api/corps/:corpsId` - Update corps (admin only)
- `PUT /api/corps/:corpsId/scores` - Update corps scores (admin only)
- `GET /api/corps/rankings/:section` - Get corps rankings by section
- `GET /api/corps/division/:division` - Get corps by division
- `GET /api/corps/search` - Search corps

### Leagues

- `GET /api/league/public` - Get public leagues
- `GET /api/league/my-leagues` - Get user's leagues
- `GET /api/league/:leagueId` - Get league by ID
- `POST /api/league` - Create new league
- `PUT /api/league/:leagueId` - Update league (commissioner only)
- `POST /api/league/join` - Join league with invite code
- `POST /api/league/:leagueId/leave` - Leave league
- `DELETE /api/league/:leagueId/members/:userId` - Remove member (commissioner only)
- `POST /api/league/:leagueId/transfer-commissioner` - Transfer commissioner role
- `POST /api/league/:leagueId/invite-code` - Generate new invite code

### Draft

- `GET /api/draft/league/:leagueId` - Get draft by league
- `POST /api/draft/league/:leagueId` - Create draft (commissioner only)
- `POST /api/draft/:draftId/start` - Start draft (commissioner only)
- `POST /api/draft/:draftId/pick` - Make a pick
- `POST /api/draft/:draftId/auto-pick` - Auto-pick
- `GET /api/draft/:draftId/available/:section` - Get available corps for section
- `GET /api/draft/:draftId/board` - Get draft board
- `POST /api/draft/:draftId/pause` - Pause draft (commissioner only)
- `POST /api/draft/:draftId/cancel` - Cancel draft (commissioner only)

### Users

- `GET /api/user/:userId` - Get user profile
- `GET /api/user/:userId/teams` - Get user's teams
- `GET /api/user/:userId/teams/:leagueId` - Get user's team for league
- `POST /api/user/:userId/teams` - Create team for user
- `PUT /api/user/:userId/teams/:teamId` - Update team
- `POST /api/user/:userId/teams/:teamId/calculate-scores` - Calculate team scores
- `GET /api/user/:userId/standings` - Get league standings
- `GET /api/user/:userId/stats` - Get user statistics
- `GET /api/user/search` - Search users

## Database Models

### User
- Authentication and profile information
- League memberships
- Admin privileges

### League
- League settings and configuration
- Member management
- Draft settings

### Corps
- DCI corps information
- Section scores and rankings
- Performance data

### Draft
- Draft state and progress
- Pick history
- Real-time draft management

### Team
- User's fantasy team
- Roster management
- Score calculations

## Real-time Features

The application uses Socket.io for real-time communication during drafts:

- **Join Draft**: `socket.emit('join-draft', draftId)`
- **Leave Draft**: `socket.emit('leave-draft', draftId)`
- **Draft Started**: `socket.on('draft-started', data)`
- **Pick Made**: `socket.on('pick-made', data)`
- **Auto-pick Made**: `socket.on('auto-pick-made', data)`
- **Draft Paused**: `socket.on('draft-paused', data)`
- **Draft Cancelled**: `socket.on('draft-cancelled', data)`

## Draft System

The draft system supports:

- **Multiple Sections**: Brass, Percussion, Guard, Visual, General Effect
- **Configurable Rounds**: Set number of rounds per section
- **Snake Draft**: Reverse order every other round
- **Time Limits**: Configurable pick time limits
- **Auto-pick**: Automatic selection when time expires
- **Real-time Updates**: Live updates for all participants

## Scoring System

Scores are calculated based on:
- Individual section scores from corps
- Total team scores across all sections
- Rankings within leagues
- Historical performance tracking

## Admin Features

Admin users can:
- Create and manage corps data
- Update corps scores and rankings
- Manage user accounts
- Access system-wide statistics

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data
- `npm test` - Run tests

### Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on the repository. 