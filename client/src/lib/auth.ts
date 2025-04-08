import { apiRequest } from "./queryClient";
import { User, AuthStatus } from "./types";

// Default fetch function for auth status
export async function fetchAuthStatus(): Promise<AuthStatus> {
  try {
    const response = await fetch("/api/auth/status", {
      credentials: "include"
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch auth status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return { authenticated: false };
  }
}

// Function to initiate Discord login
export function loginWithDiscord() {
  window.location.href = "/api/auth/discord";
}

// Function to logout
export function logout() {
  window.location.href = "/api/auth/logout";
}

// Function to check if user can vote (is authenticated)
export async function checkCanVote(): Promise<boolean> {
  const authStatus = await fetchAuthStatus();
  return authStatus.authenticated;
}

// Function to check if user has already voted in the active election
export async function checkHasVoted(): Promise<{ hasVoted: boolean, vote: any }> {
  try {
    const response = await fetch("/api/protected/vote/check", {
      credentials: "include"
    });
    
    if (response.status === 401) {
      // Not authenticated
      return { hasVoted: false, vote: null };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to check vote status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking vote status:", error);
    return { hasVoted: false, vote: null };
  }
}

// Function to submit a vote
export async function submitVote(candidateTeamId: number): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/protected/vote", { candidateTeamId });
    return await response.json();
  } catch (error) {
    console.error("Error submitting vote:", error);
    throw error;
  }
}

// Function to submit a candidacy
export async function submitCandidacy(
  presidentId: string,
  firstModeratorId: string,
  motto: string,
  presentation: string,
  imageUrl?: string
): Promise<any> {
  try {
    const response = await apiRequest("POST", "/api/protected/candidate", {
      presidentId,
      firstModeratorId,
      motto,
      presentation,
      imageUrl
    });
    return await response.json();
  } catch (error) {
    console.error("Error submitting candidacy:", error);
    throw error;
  }
}
