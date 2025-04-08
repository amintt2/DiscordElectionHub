import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { loginWithDiscord } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose,
  title = "Login Required",
  description = "You need to connect with your Discord account to access this feature."
}: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-discord-dark border-discord-light text-discord-text">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white font-heading font-bold text-xl">{title}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-discord-muted hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-discord-muted">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center">
          <Button 
            className="discord-button bg-discord-blurple hover:bg-opacity-80 text-white px-6 py-3 rounded-md font-medium transition duration-200 flex items-center space-x-3" 
            onClick={() => {
              loginWithDiscord();
              onClose();
            }}
          >
            <i className="fab fa-discord text-2xl"></i>
            <span>Connect with Discord</span>
          </Button>
        </div>
        
        <p className="text-discord-muted text-sm mt-6 text-center">
          We only request access to your basic profile information to verify your identity.
        </p>
      </DialogContent>
    </Dialog>
  );
}
