
import { Link, useNavigate } from "react-router-dom";
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
import { Loader2, LogOut, Plus, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";

type Bundle = {
  id: string;
  name: string;
  created_at: string;
};

type SidebarProps = {
  bundles: Bundle[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  newBundleName: string;
  setNewBundleName: (name: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createBundle: () => Promise<void>;
  deleteBundle: (bundleId: string) => Promise<void>;
  loading: boolean;
};

const Sidebar = ({
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
}: SidebarProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredBundles = bundles.filter((bundle) =>
    bundle.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
};

export default Sidebar;
