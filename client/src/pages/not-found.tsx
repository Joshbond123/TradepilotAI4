import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-crypto-dark">
      <Card className="w-full max-w-md mx-4 bg-crypto-card border-gray-700">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 text-crypto-blue mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">404</h1>
            <h2 className="text-xl text-gray-300 mb-4">Page Not Found</h2>
            <p className="text-gray-400">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full crypto-gradient"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-dashboard"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button 
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
