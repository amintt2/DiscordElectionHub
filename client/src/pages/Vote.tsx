import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import { checkHasVoted, submitVote } from "@/lib/auth";
import { fetchAuthStatus } from "@/lib/auth";
import { ElectionWithResults, CandidateTeamWithDetails, VoteStatus } from "@/lib/types";

export default function Vote() {
  const [location, navigate] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await fetchAuthStatus();
      setAuthenticated(authStatus.authenticated);
      
      // If authenticated, check if user has voted
      if (authStatus.authenticated) {
        const voteStatus = await checkHasVoted();
        setHasVoted(voteStatus.hasVoted);
        setVotedFor(voteStatus.vote?.candidateTeamId || null);
      }
    };
    
    checkAuth();
  }, []);

  // Fetch active election
  const { 
    data: election,
    isLoading,
    isError
  } = useQuery<ElectionWithResults>({
    queryKey: ['/api/election/active'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: (candidateId: number) => submitVote(candidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/election/active'] });
      setHasVoted(true);
      setVotedFor(voteMutation.variables as number);
      toast({
        title: "Vote submitted!",
        description: "Your vote has been recorded.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle vote
  const handleVote = async (candidateId: number) => {
    if (!authenticated) {
      setShowAuthModal(true);
      return;
    }
    
    if (hasVoted) {
      toast({
        title: "Already voted",
        description: "You have already cast your vote in this election.",
        variant: "default",
      });
      return;
    }
    
    voteMutation.mutate(candidateId);
  };

  // If no active election, show message
  if (!isLoading && (!election || !election.isActive)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-discord-dark text-discord-text shadow-lg border border-discord-light border-opacity-20">
          <CardContent className="pt-6">
            <div className="text-center p-8">
              <h1 className="text-2xl font-heading font-bold text-white mb-4">No Active Election</h1>
              <p className="text-discord-muted mb-6">
                There is no active election at the moment. Check back later or view the current government.
              </p>
              <Link href="/">
                <Button className="bg-discord-blurple hover:bg-opacity-80 text-white">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-discord-dark rounded-lg p-6 shadow-lg border border-discord-light border-opacity-20 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white mb-2">
              🗳️ Server Election
            </h1>
            <p className="text-discord-muted">
              {isLoading ? "Loading election info..." : 
                `Vote for the next server President and First Moderator. Voting ends on ${new Date(election?.endDate || "").toLocaleDateString()}.`
              }
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            {hasVoted ? (
              <div className="bg-discord-green bg-opacity-20 text-discord-green px-4 py-2 rounded-md">
                ✓ You have already voted
              </div>
            ) : (
              <div className="text-discord-yellow">
                Select a candidate team below to vote
              </div>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-discord-muted">Loading candidates...</div>
          </div>
        ) : isError ? (
          <div className="text-center text-discord-red py-6">
            Failed to load election data. Please try again later.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-discord-muted mb-2">
                <span>{election?.totalVotes || 0} total votes</span>
                <span>Election progress</span>
              </div>
              <Progress 
                value={calculateElectionProgress(election?.startDate, election?.endDate)} 
                className="h-2 bg-discord-darker"
              />
            </div>
            
            <div className="space-y-4">
              {election?.candidateTeams.sort((a, b) => b.voteCount - a.voteCount).map((team, index) => (
                <CandidateCard 
                  key={team.id}
                  team={team}
                  rank={index + 1}
                  totalVotes={election?.totalVotes || 0}
                  onVote={handleVote}
                  isVoted={votedFor === team.id}
                  disabled={hasVoted || voteMutation.isPending}
                />
              ))}
              
              {election?.candidateTeams.length === 0 && (
                <div className="text-center py-8 text-discord-muted">
                  <p>No candidates have registered for this election yet.</p>
                  <Link href="/candidater">
                    <Button className="mt-4 bg-discord-blurple hover:bg-opacity-80 text-white">
                      Become a Candidate
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
      
      <div className="flex justify-center">
        <Link href="/">
          <Button variant="outline" className="bg-discord-dark hover:bg-discord-light text-white border border-discord-light border-opacity-30">
            Back to Home
          </Button>
        </Link>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Vote"
        description="You need to connect with your Discord account to cast your vote."
      />
    </div>
  );
}

// Helper component for candidate cards
function CandidateCard({ 
  team, 
  rank, 
  totalVotes, 
  onVote, 
  isVoted, 
  disabled 
}: { 
  team: CandidateTeamWithDetails; 
  rank: number;
  totalVotes: number;
  onVote: (id: number) => void;
  isVoted: boolean;
  disabled: boolean;
}) {
  const votePercentage = totalVotes > 0 ? Math.round((team.voteCount / totalVotes) * 100) : 0;
  
  return (
    <Card className={`bg-discord-darker border ${isVoted ? 'border-discord-green' : 'border-discord-light border-opacity-20'} rounded-lg overflow-hidden`}>
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center mb-2 md:mb-0">
            <div className={`text-lg font-bold ${rank === 1 ? 'text-discord-yellow' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-discord-muted'} mr-3`}>
              #{rank}
            </div>
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 border-2 border-discord-darker">
                <AvatarImage 
                  src={team.president.avatar || undefined} 
                  alt={team.president.username} 
                />
                <AvatarFallback className="bg-discord-blurple text-white">
                  {team.president.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-medium">{team.president.username}</h3>
                <p className="text-sm text-discord-muted">Presidential Candidate</p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 mx-4 bg-discord-light bg-opacity-20 hidden md:block" />
            <div className="flex items-center mt-2 md:mt-0">
              <Avatar className="h-10 w-10 mr-3 border-2 border-discord-darker">
                <AvatarImage 
                  src={team.firstModerator.avatar || undefined} 
                  alt={team.firstModerator.username} 
                />
                <AvatarFallback className="bg-discord-green text-white">
                  {team.firstModerator.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-medium">{team.firstModerator.username}</h3>
                <p className="text-sm text-discord-muted">First Moderator Candidate</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 w-full md:w-auto">
            {isVoted ? (
              <Button className="w-full md:w-auto bg-discord-green text-white" disabled>
                ✓ Voted
              </Button>
            ) : (
              <Button 
                className="w-full md:w-auto bg-discord-blurple hover:bg-opacity-80 text-white" 
                onClick={() => onVote(team.id)}
                disabled={disabled}
              >
                Vote for Team
              </Button>
            )}
          </div>
        </div>
        
        {team.motto && (
          <div className="bg-discord-dark p-3 rounded-md mb-3 italic text-discord-muted">
            "{team.motto}"
          </div>
        )}
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-discord-muted">{team.voteCount} votes</span>
            <span className="text-discord-muted">{votePercentage}%</span>
          </div>
          <div className="w-full bg-discord-dark rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${rank === 1 ? 'bg-discord-yellow' : 'bg-discord-blurple'}`}
              style={{ width: `${votePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Helper function to calculate election progress percentage
function calculateElectionProgress(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  
  if (now <= start) return 0;
  if (now >= end) return 100;
  
  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}
