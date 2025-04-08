import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import AuthModal from "@/components/AuthModal";
import { fetchAuthStatus, submitCandidacy } from "@/lib/auth";
import { User } from "@/lib/types";

// Form schema
const candidacySchema = z.object({
  motto: z.string().min(5, {
    message: "Motto must be at least 5 characters.",
  }).max(100, {
    message: "Motto must be less than 100 characters."
  }),
  presentation: z.string().min(20, {
    message: "Presentation must be at least 20 characters.",
  }).max(500, {
    message: "Presentation must be less than 500 characters."
  }),
  firstModeratorId: z.string().min(1, {
    message: "Please enter the Discord ID of your First Moderator partner."
  })
});

type FormData = z.infer<typeof candidacySchema>;

export default function Candidacy() {
  const [, navigate] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form
  const form = useForm<FormData>({
    resolver: zodResolver(candidacySchema),
    defaultValues: {
      motto: "",
      presentation: "",
      firstModeratorId: ""
    }
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await fetchAuthStatus();
      setAuthenticated(authStatus.authenticated);
      setUser(authStatus.user || null);
      
      if (!authStatus.authenticated) {
        setShowAuthModal(true);
      }
    };
    
    checkAuth();
  }, []);

  // Candidacy mutation
  const candidacyMutation = useMutation({
    mutationFn: (data: FormData) => 
      submitCandidacy(
        user?.id || "", 
        data.firstModeratorId, 
        data.motto, 
        data.presentation
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/election/active'] });
      toast({
        title: "Candidacy submitted!",
        description: "Your candidate team has been registered for the election.",
        variant: "default",
      });
      navigate("/vote");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit candidacy. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (!authenticated || !user) {
      setShowAuthModal(true);
      return;
    }
    
    candidacyMutation.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-discord-dark rounded-lg shadow-lg border border-discord-light border-opacity-20 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-heading font-bold text-white">
            🏆 Become a Candidate
          </CardTitle>
          <CardDescription className="text-discord-muted">
            Register your candidacy for server President. You'll need to specify a First Moderator partner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authenticated && user ? (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Presidential Candidate</h3>
              <div className="flex items-center bg-discord-darker p-3 rounded-md">
                <Avatar className="h-10 w-10 mr-3 border-2 border-discord-darker">
                  <AvatarImage 
                    src={user.avatar || undefined} 
                    alt={user.username} 
                  />
                  <AvatarFallback className="bg-discord-blurple text-white">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white">{user.username}</p>
                  <p className="text-sm text-discord-muted">You will be the Presidential candidate</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center py-4 text-discord-muted">
              Please login to continue
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="firstModeratorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">First Moderator Discord ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your partner's Discord ID (e.g. 123456789012345678)" 
                        className="bg-discord-darker border-discord-light text-discord-text"
                        {...field} 
                      />
                    </FormControl>
                    <p className="text-xs text-discord-muted">
                      This is your running mate who will become First Moderator if elected.
                      Make sure they are a member of the server.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Campaign Motto</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="A short slogan for your campaign" 
                        className="bg-discord-darker border-discord-light text-discord-text"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presentation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Presentation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your vision for the server and why people should vote for you" 
                        className="bg-discord-darker border-discord-light text-discord-text min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-discord-blurple hover:bg-opacity-80 text-white"
                  disabled={!authenticated || candidacyMutation.isPending}
                >
                  {candidacyMutation.isPending ? "Submitting..." : "Submit Candidacy"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-discord-light border-opacity-10 pt-4">
          <Button variant="link" onClick={() => navigate("/")} className="text-discord-muted hover:text-discord-text">
            Cancel and Return to Home
          </Button>
        </CardFooter>
      </Card>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Login to Register Candidacy"
        description="You need to connect with your Discord account to register as a candidate."
      />
    </div>
  );
}
