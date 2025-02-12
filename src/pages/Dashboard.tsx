
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import BundleView from "./BundleView";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "@/components/dashboard/Sidebar";
import Overview from "@/components/dashboard/Overview";

type Bundle = {
  id: string;
  name: string;
  created_at: string;
};

const Dashboard = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBundleName, setNewBundleName] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadBundles = async () => {
    try {
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

  useEffect(() => {
    loadBundles();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please upload a CSV file only",
        });
        event.target.value = '';
        return;
      }
      setFileData(file);
    }
  };

  const createBundle = async () => {
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
        user_id: user?.id,
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
      setNewBundleName("");
      setFileData(null);
      setIsDialogOpen(false);
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

  const sidebarProps = {
    bundles,
    searchQuery,
    setSearchQuery,
    isDialogOpen,
    setIsDialogOpen,
    newBundleName,
    setNewBundleName,
    handleFileUpload,
    createBundle,
    deleteBundle,
    loading,
  };

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-2 mt-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar {...sidebarProps} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar {...sidebarProps} />
      </div>

      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="bundle/:bundleId/*" element={<BundleView />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
