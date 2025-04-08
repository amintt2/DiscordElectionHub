import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import UserCard from "@/components/UserCard";
import ModeratorCard from "@/components/ModeratorCard";
import { formatDate } from "@/lib/utils";
import { ElectionStatus, PreviousElection } from "@/lib/types";

export default function Home() {
  // Fetch election status
  const { 
    data: electionStatus,
    isLoading: isLoadingStatus 
  } = useQuery({
    queryKey: ['/api/election/status'],
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch election history
  const { 
    data: electionHistory,
    isLoading: isLoadingHistory 
  } = useQuery({
    queryKey: ['/api/election/history'],
  });

  const isElectionPeriod = electionStatus?.isElectionPeriod || false;
  const government = electionStatus?.government;
  const daysRemaining = government?.daysLeft || 0;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Election Status Banner */}
      <Card className="bg-discord-dark rounded-lg p-4 mb-8 border border-discord-light border-opacity-20 shadow-lg">
        {isLoadingStatus ? (
          <div className="h-16 flex items-center justify-center">
            <div className="animate-pulse">Loading election status...</div>
          </div>
        ) : isElectionPeriod ? (
          // Election Period Banner
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-white font-heading font-bold text-xl">🗳️ Election in Progress!</h2>
              <p className="text-discord-muted">
                Voting ends in <span className="text-discord-pink font-medium">
                  {electionStatus?.election ? formatTimeRemaining(new Date(electionStatus.election.endDate)) : "soon"}
                </span>
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/vote">
                <Button className="bg-discord-pink hover:bg-opacity-80 text-white animate-pulse-slow">
                  Vote Now
                </Button>
              </Link>
              <Link href="/candidater">
                <Button variant="outline" className="bg-discord-dark hover:bg-discord-light text-white border border-discord-light border-opacity-30">
                  Become a Candidate
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Current Government Period
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-white font-heading font-bold text-xl">Current Government</h2>
              <p className="text-discord-muted">
                Mandate ends in <span className="text-discord-yellow font-medium">{daysRemaining} days</span>
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#government">
                <Button className="bg-discord-blurple hover:bg-opacity-80 text-white">
                  View Team
                </Button>
              </a>
              <Link href="/vote">
                <Button variant="outline" className="bg-discord-dark hover:bg-discord-light text-white border border-discord-light border-opacity-30">
                  Election History
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {!isElectionPeriod && government && (
        <section id="government" className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center">
            <i className="fas fa-crown text-discord-yellow mr-2"></i> Current Government
          </h2>
          
          {/* Leadership Team */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* President */}
            <UserCard 
              user={government.president} 
              role="president" 
              motto="Building a community where everyone feels welcome!"
            />
            
            {/* First Moderator */}
            <UserCard 
              user={government.firstModerator} 
              role="firstModerator" 
              motto="Let's make this server the best place to hang out!"
            />
          </div>
          
          {/* Moderation Team */}
          <h3 className="text-xl font-heading font-semibold text-white mb-4 flex items-center">
            <i className="fas fa-shield-alt text-discord-green mr-2"></i> Moderation Team
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {government.moderationTeam.map((moderator, index) => (
              <ModeratorCard key={index} moderator={moderator} />
            ))}
          </div>
        </section>
      )}

      {/* Previous Elections / Stats */}
      <section className="mb-12">
        <h2 className="text-2xl font-heading font-bold text-white mb-6 flex items-center">
          <i className="fas fa-history text-discord-muted mr-2"></i> Previous Elections
        </h2>
        
        <Card className="bg-discord-dark rounded-lg p-6 shadow-lg border border-discord-light border-opacity-20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-discord-light border-opacity-20">
                  <th className="text-left py-3 px-2 text-discord-muted font-medium">Season</th>
                  <th className="text-left py-3 px-2 text-discord-muted font-medium">Date</th>
                  <th className="text-left py-3 px-2 text-discord-muted font-medium">President</th>
                  <th className="text-left py-3 px-2 text-discord-muted font-medium">First Moderator</th>
                  <th className="text-right py-3 px-2 text-discord-muted font-medium">Votes</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-discord-muted">
                      Loading election history...
                    </td>
                  </tr>
                ) : electionHistory && electionHistory.length > 0 ? (
                  electionHistory.map((election: PreviousElection, index: number) => (
                    <tr key={index} className="border-b border-discord-light border-opacity-10 hover:bg-discord-darker">
                      <td className="py-3 px-2 text-white font-medium">Season {election.season}</td>
                      <td className="py-3 px-2 text-discord-muted">{formatDate(election.date)}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <img 
                            src={election.president.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} 
                            alt="President" 
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          <span className="text-white">{election.president.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center">
                          <img 
                            src={election.firstModerator.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} 
                            alt="First Moderator" 
                            className="h-6 w-6 rounded-full mr-2"
                          />
                          <span className="text-white">{election.firstModerator.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="bg-discord-blurple bg-opacity-30 text-discord-blurple px-2 py-1 rounded-md text-sm">
                          {election.votes} votes
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-discord-muted">
                      No previous elections found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
      
      {/* Call to Action / Next Steps */}
      <section className="mb-8">
        <div className="bg-gradient-to-r from-discord-blurple to-discord-pink rounded-lg p-6 shadow-lg text-white text-center">
          <h2 className="text-2xl font-heading font-bold mb-3">Ready to Get Involved?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            {isElectionPeriod 
              ? "Elections are in progress! Cast your vote or register as a candidate now."
              : `The next election period starts in ${daysRemaining} days. Prepare your campaign and gather support from the community to become the next leader of our Discord server!`
            }
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href={isElectionPeriod ? "/vote" : "/candidater"}>
              <Button className="discord-button bg-white text-discord-blurple hover:bg-opacity-90 px-6 py-3 font-bold">
                {isElectionPeriod ? "Vote Now" : "Prepare Your Candidacy"}
              </Button>
            </Link>
            <Link href={isElectionPeriod ? "/candidater" : "/vote"}>
              <Button variant="outline" className="discord-button bg-discord-dark hover:bg-discord-light text-white px-6 py-3 font-bold border border-white border-opacity-20">
                {isElectionPeriod ? "Become a Candidate" : "View Past Elections"}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

// Helper function to format time remaining
function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return "ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} days ${hours} hours`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hours ${minutes} minutes`;
  }
}
