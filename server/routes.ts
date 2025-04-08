import type { Express, Request, Response } from "express";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
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
