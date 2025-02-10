
import { Button } from "@/components/ui/button";
import { BarChart3, Database, Bot, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Management",
      description: "Upload and organize your CSV datasets into bundles for easy access and analysis.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Interactive Visualizations",
      description: "Create custom charts and graphs to uncover insights in your data.",
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI-Powered Analysis",
      description: "Chat with Gemini 1.5 to get deep insights and answers about your data.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-padding flex flex-col items-center justify-center min-h-[80vh] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-accent text-accent-foreground">
            🚀 Welcome to the future of data analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Kroc-BI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Transform your data into actionable insights with AI-powered analytics
          </p>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => navigate("/dashboard")}
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-accent/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for data analysis
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-lg bg-background shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
