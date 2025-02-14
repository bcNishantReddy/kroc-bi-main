import { Button } from "@/components/ui/button";
import { BarChart3, Database, Bot, ArrowRight, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
const Index = () => {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const features = [{
    icon: <Database className="w-6 h-6" />,
    title: "Data Management",
    description: "Upload and organize your CSV datasets into bundles for easy access and analysis."
  }, {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Interactive Visualizations",
    description: "Create custom charts and graphs to uncover insights in your data."
  }, {
    icon: <Bot className="w-6 h-6" />,
    title: "AI-Powered Analysis",
    description: "Chat with Gemini 1.5 to get deep insights and answers about your data."
  }];
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="p-4 flex justify-end max-w-7xl mx-auto">
        {user ? <Button onClick={() => navigate("/dashboard")}>
            Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
          </Button> : <Button onClick={() => navigate("/auth")}>
            <LogIn className="mr-2 w-4 h-4" /> Sign In
          </Button>}
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 md:px-[48px]">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-accent text-accent-foreground">
            🚀 Welcome to the future of data analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Kroc-BI
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 px-4">
            Transform your data into actionable insights with AI-powered analytics
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? <Button size="lg" className="text-lg px-8" onClick={() => navigate("/dashboard")}>
                Go to Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button> : <>
                <Button size="lg" className="text-lg px-8" onClick={() => navigate("/auth")}>
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate("/auth?mode=signup")}>
                  Sign Up
                </Button>
              </>}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-accent/20 py-12 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for data analysis
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} className="p-6 rounded-lg bg-background shadow-lg">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>
    </div>;
};
export default Index;