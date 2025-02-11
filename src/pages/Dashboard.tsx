import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  Layers, 
  LogOut,
  MessageSquare, 
  Plus,
  Search,
  Menu,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import BundleView from "./BundleView";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const { user, signOut } = useAuth();
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
        .filter(line => line.trim()) // Skip empty lines
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

  const filteredBundles = bundles.filter((bundle) =>
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Sidebar = () => (
    <div className="w-64 bg-accent/20 p-4 flex flex-col h-full">
      <div className="mb-6">
        <Link to="/" className="flex items-center mb-8 text-xl font-bold">
          Kroc-BI
        </Link>
        
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            if (!user && open) {
              toast({
                title: "Authentication required",
                description: "Please sign in to create a bundle",
              });
              navigate("/auth");
              return;
            }
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="mr-2 h-4 w-4" /> New Bundle
            </Button>
          </DialogTrigger>
          <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Create New Bundle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Bundle Name"
                value={newBundleName}
                onChange={(e) => setNewBundleName(e.target.value)}
              />
              <Input
                type="file"
                onChange={handleFileUpload}
                accept=".csv"
              />
              <Button 
                onClick={createBundle} 
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </div>
                ) : (
                  "Create Bundle"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
        {filteredBundles.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            No bundles yet. Create one to get started!
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBundles.map((bundle) => (
              <div
                key={bundle.id}
                className="flex items-center justify-between"
              >
                <button
                  onClick={() => navigate(`/dashboard/bundle/${bundle.id}`)}
                  className={cn(
                    "flex-1 text-left p-3 rounded-lg hover:bg-accent",
                    "transition-colors duration-200"
                  )}
                >
                  <div className="font-medium">{bundle.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(bundle.created_at).toLocaleDateString()}
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => deleteBundle(bundle.id)}
                >
                  <span className="sr-only">Delete bundle</span>
                  ×
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        {user ? (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        )}
      </div>
    </div>
  );

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
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

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
                      Get insights from AI
                    </p>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="bundle/:bundleId/*" element={<BundleView />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
