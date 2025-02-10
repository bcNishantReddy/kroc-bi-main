
import { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSummary from "@/components/bundle/DataSummary";
import Visualizations from "@/components/bundle/Visualizations";
import AIChat from "@/components/bundle/AIChat";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

const BundleView = () => {
  const { bundleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBundle = async () => {
      try {
        const { data, error } = await supabase
          .from("bundles")
          .select("*")
          .eq("id", bundleId)
          .single();

        if (error) throw error;
        setBundle(data);
      } catch (error) {
        console.error("Error loading bundle:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load bundle data",
        });
      } finally {
        setLoading(false);
      }
    };

    if (bundleId) {
      loadBundle();
    }
  }, [bundleId, toast]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!bundle) {
    return <div className="p-6">Bundle not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{bundle.name}</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard/overview")}>
          Back to Overview
        </Button>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger 
            value="summary" 
            onClick={() => navigate(`/dashboard/bundle/${bundleId}/summary`)}
          >
            Data Summary
          </TabsTrigger>
          <TabsTrigger 
            value="visualizations"
            onClick={() => navigate(`/dashboard/bundle/${bundleId}/visualizations`)}
          >
            Visualizations
          </TabsTrigger>
          <TabsTrigger 
            value="chat"
            onClick={() => navigate(`/dashboard/bundle/${bundleId}/chat`)}
          >
            AI Chat
          </TabsTrigger>
        </TabsList>

        <Routes>
          <Route
            index
            element={<Navigate to="summary" replace />}
          />
          <Route
            path="summary"
            element={<DataSummary bundle={bundle} />}
          />
          <Route
            path="visualizations"
            element={<Visualizations bundle={bundle} />}
          />
          <Route
            path="chat"
            element={<AIChat bundle={bundle} />}
          />
        </Routes>
      </Tabs>
    </div>
  );
};

export default BundleView;
