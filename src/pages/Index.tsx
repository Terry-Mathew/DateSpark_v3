import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Upload, MessageCircle, Camera, Heart, Sparkles, Users, Edit, Zap, MessageSquare, Star, PenLine, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { AnimatePresence, motion } from "framer-motion";

const ProcessCard = ({ 
  icon: Icon, 
  title, 
  description, 
  iconPosition = 'left' 
}: { 
  icon: LucideIcon;
  title: string;
  description: string;
  iconPosition?: 'left' | 'right';
}) => (
  <div className="p-6 bg-gray-50/70 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gray-50/90 transition-all duration-300 shadow-sm hover:shadow-md transform hover:translate-y-[-2px]">
    <div className={`flex items-start gap-6 ${iconPosition === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        <div className="p-4 rounded-xl bg-white shadow-sm border border-gray-100">
          <Icon className="h-10 w-10 text-primary" /> {/* Increased by 20% from h-8 w-8 */}
        </div>
      </div>
      <div className={`flex-1 ${iconPosition === 'right' ? 'text-right' : 'text-left'}`}>
        <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
      {/* Hero Section */}
        <section className="relative py-12 md:py-24 overflow-hidden bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-[85rem] mx-auto">
              {/* Main Headline - With Animation */}
              <motion.h1 
                className="text-[32px] md:text-[52px] font-bold tracking-tight leading-tight mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Find Your Perfect Match
                </span>
              </motion.h1>
              
              {/* Subheadline - With Animation */}
              <motion.h2 
                className="text-xl md:text-[26px] font-semibold text-foreground/90 max-w-3xl mx-auto mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Transform Your Dating Profile and Attract Better Matches with AI-Powered Insights
              </motion.h2>
              
              {/* Lead Text - With Animation */}
              <motion.p 
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 md:mb-14 px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Get personalized insights, engaging bios, and conversation starters that make you stand out.
              </motion.p>
              
              {/* CTA Buttons - With Animation */}
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto px-6 py-6 text-lg bg-primary text-white hover:bg-primary/90 shadow-md transition-all duration-300 hover:shadow-lg"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <Link to="/profile-analysis">
                <FeatureCard
                  icon={Camera}
                  title="Profile Analysis"
                  description="Get expert AI feedback on your photos to make your profile more attractive."
                />
              </Link>
              
              <Link to="/build-profile">
                <FeatureCard
                  icon={Heart}
                  title="Build My Profile"
                  description="Create an engaging bio that captures attention and shows your authentic self."
                />
              </Link>
              
              <Link to="/prompt-punch-up">
                <FeatureCard
                  icon={Zap}
                  title="Prompt Punch-Up"
                  description="Craft standout prompt responses that spark meaningful conversations."
                />
              </Link>
              
              <Link to="/conversation-starters">
                <FeatureCard
                  icon={MessageSquare}
                  title="Conversation Starters"
                  description="Get personalized opening messages that lead to real connections."
                />
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary mb-1 group-hover:scale-105 transition-transform duration-300">
                  50K+
                </div>
                <div className="text-sm text-muted-foreground">
                  Profiles Analyzed
                </div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors duration-300">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-secondary mb-1 group-hover:scale-105 transition-transform duration-300">
                  85%
                </div>
                <div className="text-sm text-muted-foreground">
                  Match Rate Increase
                </div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                    <Star className="h-6 w-6 text-accent" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-accent mb-1 group-hover:scale-105 transition-transform duration-300">
                  4.9/5
                </div>
                <div className="text-sm text-muted-foreground">
                  User Rating
                </div>
              </div>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
        <section className="py-20 mt-10 bg-gradient-to-b from-background to-gray-50/50">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-[32px] md:text-[36px] font-bold mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                DateSpark uses advanced AI to help you stand out in the dating world.
              </p>
            </div>
            
            <div className="grid gap-6">
              <ProcessCard
              icon={Camera}
              title="Upload Your Profile"
              description="Share your dating profile photos and get personalized feedback on how to improve them."
                iconPosition="left"
            />
              
              <ProcessCard
                icon={PenLine}
              title="Build Your Bio"
              description="Create a witty, unique dating profile bio that captures your personality in seconds."
                iconPosition="right"
            />
              
              <ProcessCard
              icon={Zap}
              title="Punch Up Your Prompts"
              description="Generate quirky, funny one-liners for your dating app prompts that will make you stand out."
                iconPosition="left"
            />
              
              <ProcessCard
              icon={Sparkles}
              title="AI Analysis"
              description="Our AI analyzes your photos and provides specific suggestions to make your profile more attractive."
                iconPosition="right"
            />
              
              <ProcessCard
                icon={MessageSquare}
              title="Get Conversation Starters"
              description="Receive tailored conversation starters based on their interests and profile content."
                iconPosition="left"
            />
              
              <ProcessCard
              icon={Heart}
              title="Find Better Matches"
              description="With an optimized profile, you'll attract more quality matches and meaningful connections."
                iconPosition="right"
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
        <section className="py-20 mt-10 bg-[#F8F0EA] border-t border-b border-amber-100/30">
          <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-[32px] md:text-[36px] font-bold mb-6">Success Stories</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from people who've improved their dating lives with DateSpark.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <TestimonialCard 
              quote="I was struggling to get matches until I used the profile analysis. The suggestions were **spot on** and my matches **increased by 300%**!"
              author="Alex" 
              location="New York, USA"
              image="https://source.unsplash.com/random/100x100/?portrait,man"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <TestimonialCard 
              quote="The bio generator created a profile that **actually sounds like me**! It helped me showcase my **personality** in a way I couldn't do myself."
              author="Priya"
              location="Mumbai, India"
              image="https://source.unsplash.com/random/100x100/?portrait,woman,indian"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <TestimonialCard 
              quote="The prompt punch-up feature gave me **hilarious responses** that got people **messaging me first**. Absolute game changer!"
              author="Rahul"
              location="Bangalore, India"
              image="https://source.unsplash.com/random/100x100/?portrait,man,indian"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <TestimonialCard 
              quote="The conversation starters helped me break the ice with meaningful messages. Now I'm dating someone I **connected with instantly**!"
              author="Maria"
              location="Madrid, Spain"
              image="https://source.unsplash.com/random/100x100/?portrait,woman,spanish"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <TestimonialCard 
              quote="As someone over 50, I was skeptical about dating apps. DateSpark helped me create a profile that attracts people who **appreciate my life experience**."
              author="James"
              location="Toronto, Canada"
              image="https://source.unsplash.com/random/100x100/?portrait,man,older"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <TestimonialCard 
              quote="The profile analysis gave me confidence in my photos. I'm getting **quality matches** with people who are interested in the **real me**."
              author="Zoe"
              location="Sydney, Australia"
              image="https://source.unsplash.com/random/100x100/?portrait,woman"
            />
          </motion.div>
        </div>
      </div>
    </section>
      
        {/* Updated Section - Simplified with only Sign Up */}
        <section className="py-16 md:py-24 bg-background border-t">
          <div className="container px-4 md:px-6 text-center">
            <motion.h2 
              className="text-[32px] md:text-[36px] font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Ready to Transform Your Dating Life?
            </motion.h2>
            <motion.p 
              className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Start attracting better matches and meaningful connections today.
            </motion.p>
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/signup">
                <Button 
                  size="lg"
                  className="px-8 py-6 text-lg font-medium bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
