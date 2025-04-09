# Deployment Guide for Coolify

This document provides detailed instructions for deploying the Discord Election System application using Coolify with Nixpacks.

## Nixpacks Configuration

The application includes a `nixpacks.json` file that configures how the application is built and run in Coolify. Here's what it does:

```json
{
  "providers": [
    "nodejs"
  ],
  "buildImage": "node:18-slim",
  "variables": {
    "NODE_ENV": "production",
    "PORT": "3000",
    "HOST": "0.0.0.0"
  },
  "phases": {
    "install": {
      "cmds": [
        "npm ci"
      ]
    },
    "build": {
      "dependsOn": ["install"],
      "cmds": [
        "chmod +x ./build.sh",
        "./build.sh"
      ]
    }
  },
  "start": {
    "cmd": "node dist/server/index.js"
  }
}
```

- **providers**: Tells Nixpacks to use Node.js
- **buildImage**: Uses Node.js 18 for building
- **variables**: Sets default environment variables
- **phases**: Defines the build process:
  - **install**: Installs dependencies with `npm ci`
  - **build**: Runs our custom build script
- **start**: How to start the application after building

## Environment Variables

Configure these environment variables in Coolify:

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | The port the server will listen on | 5000 |
| HOST | The host address to bind to | 0.0.0.0 |
| NODE_ENV | Environment mode | production |
| DISCORD_CLIENT_ID | Your Discord application client ID | 123456789012345678 |
| DISCORD_CLIENT_SECRET | Your Discord application client secret | abcdefghijklmnopqrstuvwxyz1234567890 |
| DISCORD_REDIRECT_URI | OAuth2 callback URL | https://your-app.example.com/api/auth/discord/callback |
| DISCORD_GUILD_ID | Optional: ID of your main Discord server | 123456789012345678 |
| SESSION_SECRET | Secret for session encryption | random_secure_string_here |
| AUTH_COOKIE_SECURE | Whether cookies require HTTPS | true |
| AUTH_COOKIE_SAME_SITE | Cookie SameSite policy | lax |

## Coolify Setup Steps

1. **Create a new service**:
   - Connect your Git repository
   - Select Nixpacks as the build method

2. **Configure build settings**:
   - Port: 5000
   - No need to modify build commands as they're in nixpacks.json

3. **Set environment variables**:
   - Add all required variables from the table above

4. **Deploy**:
   - Click "Deploy" to build and start your application

5. **Set up domain**:
   - Configure your domain in Coolify
   - Make sure to update your DISCORD_REDIRECT_URI to match this domain

## Updating Discord Developer Portal

After deployment, update your Discord application configuration:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Update the OAuth2 redirect URL to your new domain
4. Update other URLs as needed (interactions, linked roles, etc.)

## Troubleshooting

- **Application can't connect to Discord**: Verify your DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET
- **OAuth2 redirects fail**: Make sure DISCORD_REDIRECT_URI matches exactly what's in your Discord Developer Portal
- **Session issues**: Check SESSION_SECRET is set and AUTH_COOKIE_* settings match your domain configuration