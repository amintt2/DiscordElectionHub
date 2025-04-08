import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, ensureAuthenticated } from "./auth";
import { 
  insertElectionPeriodSchema, 
  insertCandidateTeamSchema, 
  insertVoteSchema,
  insertGovernmentSchema,
  insertModTeamMemberSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Discord Interactions Endpoint - Responds to Discord's verification challenge
  app.post('/api/interactions', express.json(), async (req: Request, res: Response) => {
    const signature = req.headers['x-signature-ed25519'] as string;
    const timestamp = req.headers['x-signature-timestamp'] as string;
    
    // For Discord verification challenge
    if (req.body.type === 1) {
      console.log('Received Discord verification challenge');
      return res.status(200).json({ type: 1 });
    }
    
    // Log the interaction for debugging
    console.log('Received Discord interaction:', req.body.type);
    
    // Return a basic response for now
    res.status(200).json({
      type: 4,
      data: {
        content: "The Discord Election System has received your command. This feature is under development."
      }
    });
  });
  
  // Discord Linked Roles Verification endpoint
  app.get('/api/linked-roles/verify', (req: Request, res: Response) => {
    res.status(200).json({ message: "Linked Roles verification endpoint" });
  });
  
  // Terms of Service page
  app.get('/terms', (req: Request, res: Response) => {
    res.status(200).send(`
      <html>
        <head>
          <title>Discord Election System - Terms of Service</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #5865F2; }
          </style>
        </head>
        <body>
          <h1>Discord Election System - Terms of Service</h1>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          <p>By using the Discord Election System, you agree to these terms and conditions.</p>
          <h2>1. Usage</h2>
          <p>The Discord Election System is designed to facilitate democratic elections within Discord communities. Users may participate in elections, vote for candidates, and view election results.</p>
          <h2>2. User Conduct</h2>
          <p>Users must not attempt to manipulate elections, create fake accounts, or otherwise undermine the democratic process.</p>
          <h2>3. Privacy</h2>
          <p>We collect minimal data necessary for the functioning of the election system. See our Privacy Policy for details.</p>
          <h2>4. Modifications</h2>
          <p>We reserve the right to modify these terms at any time.</p>
        </body>
      </html>
    `);
  });
  
  // Privacy Policy page
  app.get('/privacy', (req: Request, res: Response) => {
    res.status(200).send(`
      <html>
        <head>
          <title>Discord Election System - Privacy Policy</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #5865F2; }
          </style>
        </head>
        <body>
          <h1>Discord Election System - Privacy Policy</h1>
          <p>Last updated: ${new Date().toLocaleDateString()}</p>
          <h2>1. Information We Collect</h2>
          <p>We collect your Discord ID, username, and avatar to identify you in the election system. We also record your votes in elections.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information solely for the purpose of operating the election system, including displaying candidate information and recording votes.</p>
          <h2>3. Data Security</h2>
          <p>We implement reasonable security measures to protect your data from unauthorized access.</p>
          <h2>4. Discord Data</h2>
          <p>We access your Discord information through OAuth2 authentication. We do not store your Discord password or authentication tokens.</p>
        </body>
      </html>
    `);
  });
  
  // Discord URLs configuration page
  app.get('/discord-urls', (req: Request, res: Response) => {
    // Get the base URL from the request
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.headers.host}`;
    
    res.status(200).send(`
      <html>
        <head>
          <title>Discord Election System - URL Configuration</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1, h2 { color: #5865F2; }
            .url-section { margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 8px; }
            .url-value { font-family: monospace; background: #2f3136; color: #ffffff; padding: 10px; border-radius: 4px; margin: 10px 0; word-break: break-all; }
            button { background: #5865F2; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
            button:hover { background: #4752C4; }
          </style>
          <script>
            function copyToClipboard(elementId) {
              const text = document.getElementById(elementId).innerText;
              navigator.clipboard.writeText(text)
                .then(() => {
                  const button = document.querySelector(\`button[data-for="\${elementId}"]\`);
                  const originalText = button.innerText;
                  button.innerText = 'Copié!';
                  setTimeout(() => {
                    button.innerText = originalText;
                  }, 2000);
                })
                .catch(err => {
                  console.error('Failed to copy: ', err);
                });
            }
          </script>
        </head>
        <body>
          <h1>Discord Election System - URL Configuration</h1>
          <p>Use these URLs to configure your Discord application in the Developer Portal</p>
          
          <div class="url-section">
            <h2>OAuth2 Redirect URL</h2>
            <p>Add this URL to the "Redirects" section in OAuth2 settings</p>
            <div id="oauth2-url" class="url-value">${baseUrl}/api/auth/discord/callback</div>
            <button data-for="oauth2-url" onclick="copyToClipboard('oauth2-url')">Copy URL</button>
          </div>
          
          <div class="url-section">
            <h2>Interactions Endpoint URL</h2>
            <p>Configure this URL in the "General Information" section</p>
            <div id="interactions-url" class="url-value">${baseUrl}/api/interactions</div>
            <button data-for="interactions-url" onclick="copyToClipboard('interactions-url')">Copy URL</button>
          </div>
          
          <div class="url-section">
            <h2>Linked Roles Verification URL</h2>
            <p>Configure this URL in the "Linked Roles" section</p>
            <div id="linked-roles-url" class="url-value">${baseUrl}/api/linked-roles/verify</div>
            <button data-for="linked-roles-url" onclick="copyToClipboard('linked-roles-url')">Copy URL</button>
          </div>
          
          <div class="url-section">
            <h2>Terms of Service URL</h2>
            <p>Configure this URL in the "General Information" section</p>
            <div id="terms-url" class="url-value">${baseUrl}/terms</div>
            <button data-for="terms-url" onclick="copyToClipboard('terms-url')">Copy URL</button>
          </div>
          
          <div class="url-section">
            <h2>Privacy Policy URL</h2>
            <p>Configure this URL in the "General Information" section</p>
            <div id="privacy-url" class="url-value">${baseUrl}/privacy</div>
            <button data-for="privacy-url" onclick="copyToClipboard('privacy-url')">Copy URL</button>
          </div>
        </body>
      </html>
    `);
  });
  
  // API routes
  // Get current active government
  app.get("/api/government/current", async (req: Request, res: Response) => {
    try {
      const government = await storage.getActiveGovernment();
      
      if (!government) {
        return res.status(404).json({ message: "No active government" });
      }
      
      res.json(government);
    } catch (error) {
      console.error("Error fetching current government:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get active election period
  app.get("/api/election/active", async (req: Request, res: Response) => {
    try {
      const election = await storage.getActiveElectionPeriod();
      
      if (!election) {
        return res.status(404).json({ message: "No active election" });
      }
      
      const electionWithDetails = await storage.getElectionWithResults(election.id);
      res.json(electionWithDetails);
    } catch (error) {
      console.error("Error fetching active election:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get election status (election active or government active)
  app.get("/api/election/status", async (req: Request, res: Response) => {
    try {
      const activeElection = await storage.getActiveElectionPeriod();
      const activeGovernment = await storage.getActiveGovernment();
      
      res.json({
        isElectionPeriod: !!activeElection,
        election: activeElection,
        government: activeGovernment
      });
    } catch (error) {
      console.error("Error fetching election status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get previous elections
  app.get("/api/election/history", async (req: Request, res: Response) => {
    try {
      const history = await storage.getElectionHistory();
      res.json(history);
    } catch (error) {
      console.error("Error fetching election history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Protected routes (require authentication)
  // Register as a candidate
  app.post("/api/protected/candidate", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const activeElection = await storage.getActiveElectionPeriod();
      
      if (!activeElection) {
        return res.status(400).json({ message: "No active election period" });
      }
      
      // Validate input
      const candidateData = insertCandidateTeamSchema.parse({
        ...req.body,
        electionId: activeElection.id
      });
      
      // Check if users exist
      const president = await storage.getUser(candidateData.presidentId);
      const firstModerator = await storage.getUser(candidateData.firstModeratorId);
      
      if (!president || !firstModerator) {
        return res.status(400).json({ message: "Invalid user IDs" });
      }
      
      // Check if either user is already in a candidate team for this election
      const candidateTeams = await storage.getCandidateTeamsForElection(activeElection.id);
      const isAlreadyCandidate = candidateTeams.some(team => 
        team.president.id === candidateData.presidentId || 
        team.firstModerator.id === candidateData.firstModeratorId
      );
      
      if (isAlreadyCandidate) {
        return res.status(400).json({ message: "One or both users are already candidates" });
      }
      
      // Create candidate team
      const candidateTeam = await storage.createCandidateTeam(candidateData);
      res.status(201).json(candidateTeam);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating candidate team:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Vote for a candidate
  app.post("/api/protected/vote", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const activeElection = await storage.getActiveElectionPeriod();
      
      if (!activeElection) {
        return res.status(400).json({ message: "No active election period" });
      }
      
      // Get user ID from session
      const userId = (req.user as any).id;
      
      // Check if user has already voted
      const existingVotes = await storage.getVotesByUser(userId, activeElection.id);
      
      if (existingVotes.length > 0) {
        return res.status(400).json({ message: "User has already voted in this election" });
      }
      
      // Validate input
      const voteData = insertVoteSchema.parse({
        ...req.body,
        electionId: activeElection.id,
        userId
      });
      
      // Check if candidate team exists
      const candidateTeam = await storage.getCandidateTeam(voteData.candidateTeamId);
      
      if (!candidateTeam) {
        return res.status(400).json({ message: "Invalid candidate team ID" });
      }
      
      // Create vote
      const vote = await storage.createVote(voteData);
      res.status(201).json(vote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating vote:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Check if user has voted
  app.get("/api/protected/vote/check", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const activeElection = await storage.getActiveElectionPeriod();
      
      if (!activeElection) {
        return res.status(200).json({ hasVoted: false });
      }
      
      // Get user ID from session
      const userId = (req.user as any).id;
      
      // Check if user has already voted
      const existingVotes = await storage.getVotesByUser(userId, activeElection.id);
      
      res.json({ 
        hasVoted: existingVotes.length > 0,
        vote: existingVotes[0] || null
      });
    } catch (error) {
      console.error("Error checking vote:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin routes - these would normally require admin authentication
  // but for this example, we'll just use them for testing
  
  // Create a new election period
  app.post("/api/admin/election", async (req: Request, res: Response) => {
    try {
      // Validate input
      const electionData = insertElectionPeriodSchema.parse(req.body);
      
      // Create election period
      const election = await storage.createElectionPeriod(electionData);
      
      // If marked as active, ensure it's the only active election
      if (electionData.isActive) {
        await storage.activateElectionPeriod(election.id);
      }
      
      res.status(201).json(election);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error creating election period:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Close an election and form government from the winner
  app.post("/api/admin/election/:id/close", async (req: Request, res: Response) => {
    try {
      const electionId = parseInt(req.params.id);
      
      // Get election
      const election = await storage.getElectionPeriod(electionId);
      
      if (!election) {
        return res.status(404).json({ message: "Election not found" });
      }
      
      // Close election
      await storage.closeElectionPeriod(electionId);
      
      // Get results
      const results = await storage.getElectionWithResults(electionId);
      
      if (!results) {
        return res.status(404).json({ message: "Election results not found" });
      }
      
      // Find winner (team with most votes)
      const sortedTeams = [...results.candidateTeams].sort((a, b) => b.voteCount - a.voteCount);
      
      if (sortedTeams.length === 0) {
        return res.status(400).json({ message: "No candidates in this election" });
      }
      
      const winner = sortedTeams[0];
      
      // Create new government
      const now = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 6); // 6 months term
      
      const government = await storage.createGovernment({
        electionId,
        candidateTeamId: winner.id,
        startDate: now,
        endDate,
        isActive: true
      });
      
      // Return the winner and new government
      res.json({ 
        election: results,
        winner,
        government
      });
    } catch (error) {
      console.error("Error closing election:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Assign moderation role to user
  app.post("/api/admin/government/:id/moderation", async (req: Request, res: Response) => {
    try {
      const governmentId = parseInt(req.params.id);
      
      // Validate input
      const modTeamData = insertModTeamMemberSchema.parse({
        ...req.body,
        governmentId
      });
      
      // Check if government exists
      const governments = await storage.getAllGovernments();
      const government = governments.find(g => g.id === governmentId);
      
      if (!government) {
        return res.status(404).json({ message: "Government not found" });
      }
      
      // Check if user exists
      const user = await storage.getUser(modTeamData.userId);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if role exists
      const role = await storage.getModRole(modTeamData.roleId);
      
      if (!role) {
        return res.status(400).json({ message: "Invalid role ID" });
      }
      
      // Assign role
      const modTeamMember = await storage.assignModRole(modTeamData);
      res.status(201).json(modTeamMember);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      console.error("Error assigning moderation role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
