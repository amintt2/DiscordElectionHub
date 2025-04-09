# Discord Election System

A web platform for managing democratic elections within Discord communities, featuring OAuth2 authentication, voting mechanics, and moderation team management.

## Features

- **Discord OAuth2 Integration**: Users authenticate using their Discord accounts
- **Election Management**: Create and manage election periods
- **Voting System**: Secure voting for registered candidates
- **Government Formation**: Automatically form governments from election winners
- **Moderation Team**: Assign custom Discord roles to moderation team members
- **Discord Bot Integration**: (Planned) Commands for interacting with the election system

## Technologies

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js
- **Authentication**: Discord OAuth2
- **State Management**: React Query
- **Routing**: Wouter

## Installation

### Local Development

1. Clone the repository
```bash
git clone https://github.com/yourusername/discord-election-leaderboard.git
cd discord-election-leaderboard
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with your Discord application credentials
```
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
```

4. Start the development server
```bash
npm run dev
```

### Deployment with Coolify

This application is configured for easy deployment with Coolify using Nixpacks.

1. In Coolify:
   - Create a new deployment
   - Select your repository
   - Select Nixpacks as the buildpack
   - Set port to 5000
   - Set the build command to: `npm run build`
   - Set the start command to: `node dist/server/index.js`

2. Configure the following Environment Variables:
   ```
   PORT=5000
   HOST=0.0.0.0
   NODE_ENV=production
   DISCORD_CLIENT_ID=1359176431698972874
   DISCORD_CLIENT_SECRET=your_discord_client_secret
   DISCORD_PUBLIC_KEY=e6fd95c5957c28afa6cc7a2aa00352151bf0a5b80167622264d9272fb9e68f56
   DISCORD_REDIRECT_URI=https://your-deployed-app-domain.com/api/auth/discord/callback
   SESSION_SECRET=your_random_secure_string
   AUTH_COOKIE_SECURE=true
   AUTH_COOKIE_SAME_SITE=lax
   USE_MEMORY_STORAGE=true
   ```

3. Important Configuration Notes:
   - Make sure to replace `your_discord_client_secret` with your actual Discord client secret
   - Update `your-deployed-app-domain.com` in the DISCORD_REDIRECT_URI to match your actual domain
   - Generate a random string for SESSION_SECRET (you can use a tool like [random.org](https://www.random.org/strings/))
   - The application will use in-memory storage by default. For production, you may want to set up a database

4. Deploy the application
   - The server will run on port 5000
   - The application will be available at your configured domain

## Discord Application Setup

To use this application, you'll need to create a Discord application in the [Discord Developer Portal](https://discord.com/developers/applications).

### Required URLs Configuration

Visit `/discord-urls` in your application to get all the necessary URLs for Discord configuration:

1. **OAuth2 Redirect URL**: Add to "Redirects" section in OAuth2 settings
2. **Interactions Endpoint URL**: Configure in "General Information" section
3. **Linked Roles Verification URL**: Configure in "Linked Roles" section
4. **Terms of Service URL**: Configure in "General Information" section
5. **Privacy Policy URL**: Configure in "General Information" section

### Required OAuth2 Scopes

- `identify`: To get basic user information
- `guilds`: To get the list of servers the user is in
- `guilds.members.read`: To get the user's roles in servers

## License

This project is licensed under the MIT License - see the LICENSE file for details.