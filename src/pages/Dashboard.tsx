
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Layers, 
  MessageSquare, 
  Plus,
  Search
} from "lucide-react";

type Bundle = {
  id: string;
  name: string;
  createdAt: Date;
};

const Dashboard = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-accent/20 p-4 flex flex-col">
        <div className="mb-6">
          <Button className="w-full" variant="default">
            <Plus className="mr-2 h-4 w-4" /> New Bundle
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search bundles..."
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {bundles.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No bundles yet. Create one to get started!
            </div>
          ) : (
            <div className="space-y-2">
              {bundles.map((bundle) => (
                <button
                  key={bundle.id}
                  className={cn(
                    "w-full text-left p-3 rounded-lg hover:bg-accent",
                    "transition-colors duration-200"
                  )}
                >
                  <div className="font-medium">{bundle.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {bundle.createdAt.toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route
            path="overview"
            element={
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-lg bg-accent/20">
                    <Layers className="h-8 w-8 mb-2" />
                    <h2 className="text-lg font-semibold">Data Summary</h2>
                    <p className="text-muted-foreground">
                      View your dataset statistics
                    </p>
                  </div>
                  <div className="p-6 rounded-lg bg-accent/20">
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <h2 className="text-lg font-semibold">Visualizations</h2>
                    <p className="text-muted-foreground">
                      Create custom charts and graphs
                    </p>
                  </div>
                  <div className="p-6 rounded-lg bg-accent/20">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <h2 className="text-lg font-semibold">AI Chat</h2>
                    <p className="text-muted-foreground">
                      Get insights from Gemini AI
                    </p>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="visualizations" element={<div>Visualizations</div>} />
          <Route path="chat" element={<div>AI Chat</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
