
import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import Overview from "@/components/dashboard/Overview";
import BundleView from "./BundleView";
import { useBundles } from "@/hooks/useBundles";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newBundleName, setNewBundleName] = useState("");
  const [fileData, setFileData] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { bundles, loading, createBundle, deleteBundle } = useBundles();
  const { toast } = useToast();

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

  const handleCreateBundle = async () => {
    if (fileData && newBundleName) {
      await createBundle(newBundleName, fileData);
      setNewBundleName("");
      setFileData(null);
      setIsDialogOpen(false);
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
    createBundle: handleCreateBundle,
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
