import {
  users, User, InsertUser,
  electionPeriods, ElectionPeriod, InsertElectionPeriod,
  candidateTeams, CandidateTeam, InsertCandidateTeam,
  votes, Vote, InsertVote,
  governments, Government, InsertGovernment,
  moderationRoles, ModRole, InsertModRole,
  moderationTeam, ModTeamMember, InsertModTeamMember,
  GovernmentWithDetails, CandidateTeamWithDetails, ElectionWithResults, PreviousElection
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Election periods 
  createElectionPeriod(period: InsertElectionPeriod): Promise<ElectionPeriod>;
  getElectionPeriod(id: number): Promise<ElectionPeriod | undefined>;
  getActiveElectionPeriod(): Promise<ElectionPeriod | undefined>;
  activateElectionPeriod(id: number): Promise<ElectionPeriod | undefined>;
  closeElectionPeriod(id: number): Promise<ElectionPeriod | undefined>;
  getAllElectionPeriods(): Promise<ElectionPeriod[]>;
  
  // Candidate teams
  createCandidateTeam(team: InsertCandidateTeam): Promise<CandidateTeam>;
  getCandidateTeam(id: number): Promise<CandidateTeam | undefined>;
  getCandidateTeamsForElection(electionId: number): Promise<CandidateTeamWithDetails[]>;
  
  // Votes 
  createVote(vote: InsertVote): Promise<Vote>;
  getVotesByUser(userId: string, electionId: number): Promise<Vote[]>;
  getVoteCountForCandidate(candidateTeamId: number): Promise<number>;
  
  // Government
  createGovernment(government: InsertGovernment): Promise<Government>;
  getActiveGovernment(): Promise<GovernmentWithDetails | undefined>;
  getAllGovernments(): Promise<Government[]>;
  deactivateGovernment(id: number): Promise<Government | undefined>;
  
  // Moderation team
  createModRole(role: InsertModRole): Promise<ModRole>;
  getModRole(id: number): Promise<ModRole | undefined>;
  getAllModRoles(): Promise<ModRole[]>;
  assignModRole(member: InsertModTeamMember): Promise<ModTeamMember>;
  getModTeamForGovernment(governmentId: number): Promise<Array<{user: User, role: ModRole}>>;
  
  // Election results
  getElectionWithResults(electionId: number): Promise<ElectionWithResults | undefined>;
  getElectionHistory(): Promise<PreviousElection[]>;
  
  // Initialize default data (mod roles, etc.)
  initializeDefaultData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private electionPeriods: Map<number, ElectionPeriod>;
  private candidateTeams: Map<number, CandidateTeam>;
  private votes: Map<number, Vote>;
  private governments: Map<number, Government>;
  private modRoles: Map<number, ModRole>;
  private modTeam: Map<number, ModTeamMember>;
  
  private electionIdCounter: number;
  private candidateTeamIdCounter: number;
  private voteIdCounter: number;
  private governmentIdCounter: number;
  private modRoleIdCounter: number;
  private modTeamIdCounter: number;

  constructor() {
    this.users = new Map();
    this.electionPeriods = new Map();
    this.candidateTeams = new Map();
    this.votes = new Map();
    this.governments = new Map();
    this.modRoles = new Map();
    this.modTeam = new Map();
    
    this.electionIdCounter = 1;
    this.candidateTeamIdCounter = 1;
    this.voteIdCounter = 1;
    this.governmentIdCounter = 1;
    this.modRoleIdCounter = 1;
    this.modTeamIdCounter = 1;
  }

  // User Management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user: User = { 
      ...userData, 
      lastLogin: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Election Periods
  async createElectionPeriod(data: InsertElectionPeriod): Promise<ElectionPeriod> {
    const id = this.electionIdCounter++;
    const period: ElectionPeriod = { ...data, id };
    this.electionPeriods.set(id, period);
    return period;
  }

  async getElectionPeriod(id: number): Promise<ElectionPeriod | undefined> {
    return this.electionPeriods.get(id);
  }

  async getActiveElectionPeriod(): Promise<ElectionPeriod | undefined> {
    return Array.from(this.electionPeriods.values()).find(p => p.isActive);
  }

  async activateElectionPeriod(id: number): Promise<ElectionPeriod | undefined> {
    // First deactivate any currently active period
    for (const period of this.electionPeriods.values()) {
      if (period.isActive) {
        period.isActive = false;
        this.electionPeriods.set(period.id, period);
      }
    }
    
    const period = this.electionPeriods.get(id);
    if (!period) return undefined;
    
    period.isActive = true;
    this.electionPeriods.set(id, period);
    return period;
  }

  async closeElectionPeriod(id: number): Promise<ElectionPeriod | undefined> {
    const period = this.electionPeriods.get(id);
    if (!period) return undefined;
    
    period.isActive = false;
    period.isClosed = true;
    this.electionPeriods.set(id, period);
    return period;
  }

  async getAllElectionPeriods(): Promise<ElectionPeriod[]> {
    return Array.from(this.electionPeriods.values());
  }

  // Candidate Teams
  async createCandidateTeam(team: InsertCandidateTeam): Promise<CandidateTeam> {
    const id = this.candidateTeamIdCounter++;
    const candidateTeam: CandidateTeam = { 
      ...team, 
      id,
      createdAt: new Date()
    };
    this.candidateTeams.set(id, candidateTeam);
    return candidateTeam;
  }

  async getCandidateTeam(id: number): Promise<CandidateTeam | undefined> {
    return this.candidateTeams.get(id);
  }

  async getCandidateTeamsForElection(electionId: number): Promise<CandidateTeamWithDetails[]> {
    const teams = Array.from(this.candidateTeams.values())
      .filter(team => team.electionId === electionId);
    
    return Promise.all(
      teams.map(async (team) => {
        const president = this.users.get(team.presidentId);
        const firstModerator = this.users.get(team.firstModeratorId);
        const voteCount = await this.getVoteCountForCandidate(team.id);
        
        if (!president || !firstModerator) {
          throw new Error(`Missing user data for team ID ${team.id}`);
        }
        
        return {
          id: team.id,
          president,
          firstModerator,
          motto: team.motto,
          presentation: team.presentation,
          imageUrl: team.imageUrl,
          voteCount
        };
      })
    );
  }

  // Votes
  async createVote(vote: InsertVote): Promise<Vote> {
    const id = this.voteIdCounter++;
    const newVote: Vote = { 
      ...vote, 
      id,
      votedAt: new Date()
    };
    this.votes.set(id, newVote);
    return newVote;
  }

  async getVotesByUser(userId: string, electionId: number): Promise<Vote[]> {
    return Array.from(this.votes.values())
      .filter(vote => vote.userId === userId && vote.electionId === electionId);
  }

  async getVoteCountForCandidate(candidateTeamId: number): Promise<number> {
    return Array.from(this.votes.values())
      .filter(vote => vote.candidateTeamId === candidateTeamId)
      .length;
  }

  // Government
  async createGovernment(government: InsertGovernment): Promise<Government> {
    // Deactivate any currently active government
    for (const gov of this.governments.values()) {
      if (gov.isActive) {
        gov.isActive = false;
        this.governments.set(gov.id, gov);
      }
    }
    
    const id = this.governmentIdCounter++;
    const newGovernment: Government = { ...government, id };
    this.governments.set(id, newGovernment);
    return newGovernment;
  }

  async getActiveGovernment(): Promise<GovernmentWithDetails | undefined> {
    const activeGov = Array.from(this.governments.values()).find(g => g.isActive);
    if (!activeGov) return undefined;
    
    const team = this.candidateTeams.get(activeGov.candidateTeamId);
    if (!team) return undefined;
    
    const president = this.users.get(team.presidentId);
    const firstModerator = this.users.get(team.firstModeratorId);
    if (!president || !firstModerator) return undefined;
    
    const moderationTeam = await this.getModTeamForGovernment(activeGov.id);
    
    // Calculate days left
    const now = new Date();
    const endDate = new Date(activeGov.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    return {
      government: activeGov,
      president,
      firstModerator,
      moderationTeam,
      electionDate: new Date(activeGov.startDate).toISOString(),
      endDate: endDate.toISOString(),
      daysLeft: daysLeft > 0 ? daysLeft : 0
    };
  }

  async getAllGovernments(): Promise<Government[]> {
    return Array.from(this.governments.values());
  }

  async deactivateGovernment(id: number): Promise<Government | undefined> {
    const government = this.governments.get(id);
    if (!government) return undefined;
    
    government.isActive = false;
    this.governments.set(id, government);
    return government;
  }

  // Moderation Roles
  async createModRole(role: InsertModRole): Promise<ModRole> {
    const id = this.modRoleIdCounter++;
    const newRole: ModRole = { ...role, id };
    this.modRoles.set(id, newRole);
    return newRole;
  }

  async getModRole(id: number): Promise<ModRole | undefined> {
    return this.modRoles.get(id);
  }

  async getAllModRoles(): Promise<ModRole[]> {
    return Array.from(this.modRoles.values());
  }

  // Moderation Team
  async assignModRole(member: InsertModTeamMember): Promise<ModTeamMember> {
    const id = this.modTeamIdCounter++;
    const newMember: ModTeamMember = { ...member, id };
    this.modTeam.set(id, newMember);
    return newMember;
  }

  async getModTeamForGovernment(governmentId: number): Promise<Array<{user: User, role: ModRole}>> {
    const teamMembers = Array.from(this.modTeam.values())
      .filter(member => member.governmentId === governmentId);
    
    return teamMembers.map(member => {
      const user = this.users.get(member.userId);
      const role = this.modRoles.get(member.roleId);
      
      if (!user || !role) {
        throw new Error(`Missing user or role data for mod team member ID ${member.id}`);
      }
      
      return { user, role };
    });
  }

  // Election Results
  async getElectionWithResults(electionId: number): Promise<ElectionWithResults | undefined> {
    const election = this.electionPeriods.get(electionId);
    if (!election) return undefined;
    
    const candidateTeams = await this.getCandidateTeamsForElection(electionId);
    const totalVotes = Array.from(this.votes.values())
      .filter(vote => vote.electionId === electionId)
      .length;
    
    return {
      id: election.id,
      startDate: election.startDate.toISOString(),
      endDate: election.endDate.toISOString(),
      isActive: election.isActive,
      isClosed: election.isClosed,
      candidateTeams,
      totalVotes
    };
  }

  async getElectionHistory(): Promise<PreviousElection[]> {
    const allGovernments = Array.from(this.governments.values())
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    return Promise.all(
      allGovernments.map(async (gov, index) => {
        const team = this.candidateTeams.get(gov.candidateTeamId);
        if (!team) throw new Error(`Missing candidate team data for government ID ${gov.id}`);
        
        const president = this.users.get(team.presidentId);
        const firstModerator = this.users.get(team.firstModeratorId);
        if (!president || !firstModerator) {
          throw new Error(`Missing user data for team ID ${team.id}`);
        }
        
        const election = this.electionPeriods.get(gov.electionId);
        if (!election) throw new Error(`Missing election data for government ID ${gov.id}`);
        
        // Count votes for this candidate team
        const votes = Array.from(this.votes.values())
          .filter(vote => vote.candidateTeamId === team.id)
          .length;
        
        return {
          season: allGovernments.length - index,
          date: new Date(gov.startDate).toISOString(),
          president,
          firstModerator,
          votes
        };
      })
    );
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Create default moderation roles if they don't exist
    if (this.modRoles.size === 0) {
      const defaultRoles: InsertModRole[] = [
        {
          name: "Moderator of Interior", 
          description: "Manages channels and rules",
          icon: "fas fa-lock",
          color: "#ED4245" // Discord red
        },
        {
          name: "Borders Moderator",
          description: "Manages newcomers & verification",
          icon: "fas fa-globe",
          color: "#FEE75C" // Discord yellow
        },
        {
          name: "NSFW Moderator",
          description: "Supervises sensitive channels",
          icon: "fas fa-exclamation-circle",
          color: "#EB459E" // Discord pink
        },
        {
          name: "Ambiance Moderator",
          description: "Keeps the mood positive & fun",
          icon: "fas fa-comments",
          color: "#57F287" // Discord green
        },
        {
          name: "Tech Moderator",
          description: "Manages bots & technical issues",
          icon: "fas fa-robot",
          color: "#5865F2" // Discord blurple
        }
      ];
      
      for (const role of defaultRoles) {
        await this.createModRole(role);
      }
    }
  }
}

export const storage = new MemStorage();
// Initialize default data
storage.initializeDefaultData();
