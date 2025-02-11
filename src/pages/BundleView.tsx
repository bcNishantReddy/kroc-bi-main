
import { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSummary from "@/components/bundle/DataSummary";
import Visualizations from "@/components/bundle/Visualizations";
import AIChat from "@/components/bundle/AIChat";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

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
        
        // Ensure raw_data is parsed as an array
        const parsedData = {
          ...data,
          raw_data: Array.isArray(data.raw_data) ? data.raw_data : [],
        };

        setBundle(parsedData as Bundle);
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Bundle not found</h2>
        <Button onClick={() => navigate("/dashboard/overview")}>
          Return to Overview
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/overview")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{bundle.name}</h1>
        </div>
      </div>

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
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
    </motion.div>
  );
};

export default BundleView;
