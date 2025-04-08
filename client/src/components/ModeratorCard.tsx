import { ModeratorWithRole } from "@/lib/types";
import { getDiscordUserTag } from "@/lib/utils";

interface ModeratorCardProps {
  moderator: ModeratorWithRole;
}

export default function ModeratorCard({ moderator }: ModeratorCardProps) {
  const { user, role } = moderator;

  return (
    <div className="bg-discord-dark rounded-lg overflow-hidden shadow-md border border-discord-light border-opacity-20 flex flex-row p-4">
      <div className="mr-4">
        <div className="avatar-border">
          <img 
            src={user.avatar || `https://cdn.discordapp.com/embed/avatars/0.png`} 
            alt={`${user.username} Avatar`} 
            className="h-14 w-14 rounded-full object-cover border-2 border-discord-darker"
          />
        </div>
      </div>
      <div>
        <div className="flex items-center">
          <i className={`${role.icon} text-[${role.color}] mr-2`}></i>
          <h4 className="font-bold" style={{ color: role.color }}>{role.name}</h4>
        </div>
        <p className="text-white font-medium">
          {user.username}
          <span className="text-discord-muted">#{user.discriminator}</span>
        </p>
        <p className="text-sm text-discord-muted mt-1">{role.description}</p>
      </div>
    </div>
  );
}
