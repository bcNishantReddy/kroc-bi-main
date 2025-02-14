
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type Bundle = {
  id: string;
  name: string;
  created_at: string;
};

export const useBundles = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadBundles = async () => {
    try {
      if (!user) {
        setBundles([]);
        return;
      }

      const { data, error } = await supabase
        .from("bundles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBundles(data || []);
    } catch (error) {
      console.error("Error loading bundles:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load bundles",
      });
    }
  };

  const createBundle = async (
    newBundleName: string,
    fileData: File
  ): Promise<void> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a bundle",
      });
      navigate("/auth");
      return;
    }

    if (!fileData || !newBundleName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide both a name and a CSV file",
      });
      return;
    }

    try {
      setLoading(true);
      const fileContent = await fileData.text();
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
          });
          return row;
        });

      if (data.length === 0) {
        throw new Error("No valid data found in CSV file");
      }

      const { error } = await supabase.from("bundles").insert({
        name: newBundleName,
        user_id: user.id,
        raw_data: data,
        columns_info: {},
        summary_stats: {},
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bundle created successfully",
      });
      
      loadBundles();
    } catch (error) {
      console.error("Error creating bundle:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create bundle",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteBundle = async (bundleId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("bundles")
        .delete()
        .eq("id", bundleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bundle deleted successfully",
      });
      
      loadBundles();
    } catch (error) {
      console.error("Error deleting bundle:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete bundle",
      });
    }
  };

  useEffect(() => {
    loadBundles();
  }, [user]); // Added user dependency to reload when auth state changes

  return {
    bundles,
    loading,
    createBundle,
    deleteBundle,
  };
};
