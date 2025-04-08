import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { fetchAuthStatus, loginWithDiscord } from "@/lib/auth";

export default function Login() {
  const [, navigate] = useLocation();
  
  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await fetchAuthStatus();
      if (authStatus.authenticated) {
        // If already authenticated, redirect to home
        navigate("/");
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md bg-discord-dark text-discord-text shadow-lg border border-discord-light border-opacity-20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" 
              alt="Discord Logo" 
              className="h-16 w-16" 
            />
          </div>
          <CardTitle className="text-2xl font-heading font-bold text-white">
            Welcome to Discord Election
          </CardTitle>
          <CardDescription className="text-discord-muted">
            Connect with your Discord account to vote and participate in server elections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="bg-discord-darker rounded-md p-4 text-sm text-discord-muted">
              <h4 className="font-medium text-white mb-2">Why connect with Discord?</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Securely verify your identity</li>
                <li>Vote in server elections</li>
                <li>Run for presidency with a partner</li>
                <li>Help shape the server's future</li>
              </ul>
            </div>
            
            <Button 
              className="discord-button bg-discord-blurple hover:bg-opacity-80 text-white flex items-center justify-center space-x-2 py-6 text-lg"
              onClick={loginWithDiscord}
            >
              <i className="fab fa-discord text-2xl"></i>
              <span>Login with Discord</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-center text-xs text-discord-muted">
          <p>We only request access to your basic profile information to verify your identity. We don't post on your behalf.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
