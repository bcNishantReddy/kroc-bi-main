import { useState, useEffect } from "react";
import { Routes, Route, useParams, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataSummary from "@/components/bundle/DataSummary";
import Visualizations from "@/components/bundle/Visualizations";
import AIChat from "@/components/bundle/AIChat";
import AIDataInsights from "@/components/bundle/AIDataInsights";
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
  const {
    bundleId
  } = useParams();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadBundle = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from("bundles").select("*").eq("id", bundleId).single();
        if (error) throw error;
        const parsedData = {
          ...data,
          raw_data: Array.isArray(data.raw_data) ? data.raw_data : []
        };
        setBundle(parsedData as Bundle);
      } catch (error) {
        console.error("Error loading bundle:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load bundle data"
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
    return <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute top-2 left-2 w-16 h-16 border-4 border-primary/30 border-t-transparent rounded-full animate-spin-slow"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading bundle data...</p>
        </div>
      </div>;
  }
  if (!bundle) {
    return <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bundle not found</h2>
          <Button onClick={() => navigate("/dashboard/overview")}>
            Return to Overview
          </Button>
        </div>
      </div>;
  }
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} className="min-h-screen bg-background w-full">
      <div className="container mx-auto max-w-[1400px] px-4 py-8 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/overview")} className="hover:bg-accent/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">{bundle.name}</h1>
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full space-y-8 px-[240px]">
          <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2">
            <TabsTrigger value="summary" onClick={() => navigate(`/dashboard/bundle/${bundleId}/summary`)} className="text-sm py-3">
              Data Summary
            </TabsTrigger>
            <TabsTrigger value="visualizations" onClick={() => navigate(`/dashboard/bundle/${bundleId}/visualizations`)} className="text-sm py-3">
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="insights" onClick={() => navigate(`/dashboard/bundle/${bundleId}/insights`)} className="text-sm py-3">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={() => navigate(`/dashboard/bundle/${bundleId}/chat`)} className="text-sm py-3">
              AI Chat
            </TabsTrigger>
          </TabsList>

          <div className="w-full min-h-[calc(100vh-300px)]">
            <Routes>
              <Route index element={<Navigate to="summary" replace />} />
              <Route path="summary" element={<DataSummary bundle={bundle} />} />
              <Route path="visualizations" element={<Visualizations bundle={bundle} />} />
              <Route path="insights" element={<AIDataInsights bundle={bundle} />} />
              <Route path="chat" element={<AIChat bundle={bundle} />} />
            </Routes>
          </div>
        </Tabs>
      </div>
    </motion.div>;
};
export default BundleView;