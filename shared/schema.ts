import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Discord User
export const users = pgTable("users", {
  id: text("discord_id").primaryKey(), // Discord ID as string
  username: text("username").notNull(),
  avatar: text("avatar"), // Avatar URL
  discriminator: text("discriminator"), // Discord discriminator
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  lastLogin: timestamp("last_login").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ lastLogin: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Election Periods
export const electionPeriods = pgTable("election_periods", {
  id: serial("id").primaryKey(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  isClosed: boolean("is_closed").default(false),
});

export const insertElectionPeriodSchema = createInsertSchema(electionPeriods).omit({ id: true });
export type InsertElectionPeriod = z.infer<typeof insertElectionPeriodSchema>;
export type ElectionPeriod = typeof electionPeriods.$inferSelect;

// Candidate Teams (President + First Moderator)
export const candidateTeams = pgTable("candidate_teams", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  presidentId: text("president_id").notNull().references(() => users.id),
  firstModeratorId: text("first_moderator_id").notNull().references(() => users.id),
  motto: text("motto"),
  presentation: text("presentation"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCandidateTeamSchema = createInsertSchema(candidateTeams).omit({ id: true, createdAt: true });
export type InsertCandidateTeam = z.infer<typeof insertCandidateTeamSchema>;
export type CandidateTeam = typeof candidateTeams.$inferSelect;

// Votes 
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  candidateTeamId: integer("candidate_team_id").notNull().references(() => candidateTeams.id),
  votedAt: timestamp("voted_at").defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).omit({ id: true, votedAt: true });
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

// Government (Current elected team)
export const governments = pgTable("governments", {
  id: serial("id").primaryKey(), 
  electionId: integer("election_id").notNull(),
  candidateTeamId: integer("candidate_team_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

export const insertGovernmentSchema = createInsertSchema(governments).omit({ id: true });
export type InsertGovernment = z.infer<typeof insertGovernmentSchema>;
export type Government = typeof governments.$inferSelect;

// Moderation Team Members
export const moderationRoles = pgTable("moderation_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // FontAwesome icon class
  color: text("color").notNull(), // Color code for the role
});

export const insertModRoleSchema = createInsertSchema(moderationRoles).omit({ id: true });
export type InsertModRole = z.infer<typeof insertModRoleSchema>;
export type ModRole = typeof moderationRoles.$inferSelect;

export const moderationTeam = pgTable("moderation_team", {
  id: serial("id").primaryKey(),
  governmentId: integer("government_id").notNull().references(() => governments.id),
  userId: text("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => moderationRoles.id),
});

export const insertModTeamMemberSchema = createInsertSchema(moderationTeam).omit({ id: true });
export type InsertModTeamMember = z.infer<typeof insertModTeamMemberSchema>;
export type ModTeamMember = typeof moderationTeam.$inferSelect;

// Define response types for API endpoints
export type GovernmentWithDetails = {
  government: Government;
  president: User;
  firstModerator: User;
  moderationTeam: Array<{
    user: User;
    role: ModRole;
  }>;
  electionDate: string;
  endDate: string;
  daysLeft: number;
};

export type CandidateTeamWithDetails = {
  id: number;
  president: User;
  firstModerator: User;
  motto: string | null;
  presentation: string | null;
  imageUrl: string | null;
  voteCount: number;
};

export type ElectionWithResults = {
  id: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
  candidateTeams: CandidateTeamWithDetails[];
  totalVotes: number;
};

export type PreviousElection = {
  season: number;
  date: string;
  president: User;
  firstModerator: User;
  votes: number;
};
