import passport from "passport";
import session from "express-session";
import MemoryStore from "memorystore";
import express, { Request, Response, NextFunction } from "express";
import { Strategy as DiscordStrategy } from "passport-discord";
import { storage } from "./storage";
import { nanoid } from "nanoid";

const MemoryStoreSession = MemoryStore(session);

// Discord OAuth2 configuration
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.CALLBACK_URL || "";

// Check if environment variables are set
if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
  console.error("Missing Discord OAuth2 credentials. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET environment variables.");
}

// Get host domain based on environment
const getCallbackUrl = () => {
  if (CALLBACK_URL) return CALLBACK_URL;

  const domains = process.env.REPLIT_DOMAINS ? 
    process.env.REPLIT_DOMAINS.split(",")[0] : 
    "localhost:5000";
  
  const protocol = domains.includes("localhost") ? "http" : "https";
  return `${protocol}://${domains}/api/auth/discord/callback`;
};

// Set up passport for Discord OAuth2
export const setupAuth = (app: express.Express) => {
  // Set up session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || nanoid(32),
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // 24 hours
      })
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Set up Discord strategy
  try {
    passport.use(
      new DiscordStrategy(
        {
          clientID: DISCORD_CLIENT_ID,
          clientSecret: DISCORD_CLIENT_SECRET,
          callbackURL: getCallbackUrl(),
          scope: ["identify"]
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            // Find or create user
            let user = await storage.getUser(profile.id);
            
            if (!user) {
              user = await storage.createUser({
                id: profile.id,
                username: profile.username,
                avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
                discriminator: profile.discriminator,
                accessToken,
                refreshToken
              });
            } else {
              // Update existing user
              user = await storage.updateUser(profile.id, {
                username: profile.username,
                avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
                discriminator: profile.discriminator,
                accessToken,
                refreshToken,
                lastLogin: new Date()
              }) || user;
            }
            
            return done(null, user);
          } catch (error) {
            console.error("Error in Discord auth strategy:", error);
            return done(error, null);
          }
        }
      )
    );

    // Serialize user to session
    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await storage.getUser(id);
        done(null, user || null);
      } catch (error) {
        done(error, null);
      }
    });

    // Log successful setup
    console.log("Discord OAuth2 configured successfully");
  } catch (error) {
    console.error("Failed to set up Discord OAuth2:", error);
  }

  // Auth routes
  app.get(
    "/api/auth/discord",
    passport.authenticate("discord")
  );

  app.get(
    "/api/auth/discord/callback",
    passport.authenticate("discord", {
      failureRedirect: "/login?error=auth_failed"
    }),
    (req, res) => {
      res.redirect("/");
    }
  );

  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true, 
        user: req.user 
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Auth middleware
  app.use("/api/protected/*", ensureAuthenticated);
};

// Middleware to ensure user is authenticated
export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
