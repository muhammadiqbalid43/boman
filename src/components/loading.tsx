import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);
