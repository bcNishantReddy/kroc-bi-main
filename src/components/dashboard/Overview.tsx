
import { BarChart3, Layers, MessageSquare } from "lucide-react";

const Overview = () => {
  return (
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
            Get insights from AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default Overview;
