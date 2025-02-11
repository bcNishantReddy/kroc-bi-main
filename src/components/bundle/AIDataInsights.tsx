
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type Bundle = {
  id: string;
  name: string;
  raw_data: any[];
  columns_info: Record<string, any>;
  summary_stats: Record<string, any>;
};

const AIDataInsights = ({ bundle }: { bundle: Bundle }) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: bundle.raw_data.slice(0, 100), // Send first 100 rows for analysis
          columns: Object.keys(bundle.raw_data[0] || {}),
        }),
      });

      if (!response.ok) throw new Error('Failed to generate insights');
      
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate insights",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, [bundle.id]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI Data Insights</h2>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="prose max-w-none">
            {insights ? (
              <div dangerouslySetInnerHTML={{ __html: insights }} />
            ) : (
              <p>No insights generated yet.</p>
            )}
          </div>
          <Button onClick={generateInsights}>
            Regenerate Insights
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AIDataInsights;
