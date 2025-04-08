import { User } from "@/lib/types";
import { getDiscordUserTag } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: User;
  role: "president" | "firstModerator";
  motto?: string | null;
}

export default function UserCard({ user, role, motto }: UserCardProps) {
  const isPresident = role === "president";
  
  const gradientClass = isPresident 
    ? "from-discord-blurple to-discord-pink" 
    : "from-discord-green to-discord-blurple";
  
  const titleColor = isPresident 
    ? "text-discord-yellow" 
    : "text-discord-green";
  
  const title = isPresident 
    ? "👑 President" 
    : "🤝 First Moderator";

  return (
    <div className="bg-discord-dark rounded-lg overflow-hidden shadow-lg border border-discord-light border-opacity-20 flex-1">
      <div className={cn("bg-gradient-to-r p-1", gradientClass)}></div>
      <div className="p-4 text-center">
        <h3 className={cn("font-bold mb-2 text-lg", titleColor)}>
          {title}
        </h3>
        <div className="flex justify-center mb-3">
          <div className="avatar-border">
            <img 
              src={user.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} 
              alt={`${user.username} Avatar`} 
              className="h-24 w-24 rounded-full object-cover border-2 border-discord-darker"
            />
          </div>
        </div>
        <h4 className="text-white font-medium text-xl">{user.username}</h4>
        <p className="text-discord-muted">#{user.discriminator}</p>
        
        {motto && (
          <div className="mt-4 px-3 py-2 bg-discord-darker rounded-md">
            <p className="italic text-sm">{motto}</p>
          </div>
        )}
      </div>
    </div>
  );
}
