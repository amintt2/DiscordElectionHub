import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchAuthStatus, loginWithDiscord, logout } from "@/lib/auth";
import { User } from "@/lib/types";
import { getDiscordUserTag } from "@/lib/utils";

export default function Header() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [location] = useLocation();
  
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await fetchAuthStatus();
      setAuthenticated(authStatus.authenticated);
      setUser(authStatus.user || null);
    };
    
    checkAuth();
  }, [location]); // Re-check auth when location changes

  return (
    <header className="bg-discord-darker py-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img 
            src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" 
            alt="Discord Logo" 
            className="h-8 w-8" 
          />
          <Link href="/">
            <span className="text-white font-heading font-bold text-xl md:text-2xl cursor-pointer">
              Discord Election
            </span>
          </Link>
        </div>
        
        {authenticated && user ? (
          <div className="flex items-center space-x-3">
            <span className="text-discord-text font-medium hidden md:block">
              {getDiscordUserTag(user)}
            </span>
            <div className="avatar-border">
              <Avatar className="h-10 w-10 border-2 border-discord-darker">
                <AvatarImage 
                  src={user.avatar || undefined} 
                  alt={user.username} 
                />
                <AvatarFallback className="bg-discord-blurple text-white">
                  {user.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Button 
            className="discord-button bg-discord-blurple hover:bg-opacity-80 text-white flex items-center space-x-2 transition duration-200"
            onClick={loginWithDiscord}
          >
            <i className="fab fa-discord"></i>
            <span>Login with Discord</span>
          </Button>
        )}
      </div>
    </header>
  );
}
