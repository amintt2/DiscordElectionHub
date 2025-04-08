import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-discord-darker py-6 border-t border-discord-light border-opacity-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center space-x-2 mb-2">
              <img 
                src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" 
                alt="Discord Logo" 
                className="h-6 w-6" 
              />
              <h3 className="text-white font-heading font-bold">Discord Election</h3>
            </div>
            <p className="text-discord-muted text-sm">Democracy for your Discord community</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 md:gap-12">
            <div>
              <h4 className="text-white font-medium mb-2">Links</h4>
              <ul className="text-discord-muted text-sm space-y-1">
                <li><Link href="/"><a className="hover:text-discord-blurple transition">Home</a></Link></li>
                <li><Link href="/vote"><a className="hover:text-discord-blurple transition">Vote</a></Link></li>
                <li><Link href="/candidater"><a className="hover:text-discord-blurple transition">Become a Candidate</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Resources</h4>
              <ul className="text-discord-muted text-sm space-y-1">
                <li><Link href="/"><a className="hover:text-discord-blurple transition">Election History</a></Link></li>
                <li><a href="#" className="hover:text-discord-blurple transition">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Legal</h4>
              <ul className="text-discord-muted text-sm space-y-1">
                <li><a href="#" className="hover:text-discord-blurple transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-discord-blurple transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-discord-light border-opacity-10 text-center text-discord-muted text-sm">
          <p>© {new Date().getFullYear()} Discord Election System. Not affiliated with Discord Inc.</p>
          <p className="mt-1">Developed for online communities.</p>
        </div>
      </div>
    </footer>
  );
}
