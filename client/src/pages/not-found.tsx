import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold">Page non trouvée</h1>
          </div>

          <p className="mt-4 text-muted-foreground">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button className="gap-2">
              <Home size={18} />
              Retour à l'accueil
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
