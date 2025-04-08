// User types
export interface User {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
}

// Election types
export interface ElectionPeriod {
  id: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

export interface CandidateTeam {
  id: number;
  electionId: number;
  presidentId: string;
  firstModeratorId: string;
  motto: string | null;
  presentation: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface Vote {
  id: number;
  electionId: number;
  userId: string;
  candidateTeamId: number;
  votedAt: string;
}

export interface Government {
  id: number;
  electionId: number;
  candidateTeamId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface ModRole {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface ModTeamMember {
  id: number;
  governmentId: number;
  userId: string;
  roleId: number;
}

// Extended types with relationships
export interface CandidateTeamWithDetails {
  id: number;
  president: User;
  firstModerator: User;
  motto: string | null;
  presentation: string | null;
  imageUrl: string | null;
  voteCount: number;
}

export interface ModeratorWithRole {
  user: User;
  role: ModRole;
}

export interface GovernmentWithDetails {
  government: Government;
  president: User;
  firstModerator: User;
  moderationTeam: ModeratorWithRole[];
  electionDate: string;
  endDate: string;
  daysLeft: number;
}

export interface ElectionWithResults {
  id: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  candidateTeams: CandidateTeamWithDetails[];
  totalVotes: number;
}

export interface PreviousElection {
  season: number;
  date: string;
  president: User;
  firstModerator: User;
  votes: number;
}

export interface ElectionStatus {
  isElectionPeriod: boolean;
  election?: ElectionWithResults;
  government?: GovernmentWithDetails;
}

// Form types
export interface CandidateFormData {
  presidentId: string;
  firstModeratorId: string;
  motto: string;
  presentation: string;
  imageUrl?: string;
}

export interface VoteFormData {
  candidateTeamId: number;
}

export interface AuthStatus {
  authenticated: boolean;
  user?: User;
}

export interface VoteStatus {
  hasVoted: boolean;
  vote: Vote | null;
}
