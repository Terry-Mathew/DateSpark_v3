import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"; // Added missing import
import ImageUploader from "@/components/ImageUploader";
import ConversationStarter from "@/components/ConversationStarter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { MessageCircle, ThumbsUp, Lightbulb, Camera, Clock } from "lucide-react";
import axios from "axios";
import { auth } from "@/firebase";

interface ProfileSummary {
  vibe: string;
  swipeAppeal: number;
  standoutPoints: string[];
}

interface StarterMessage {
  type: "playful" | "sincere" | "specific";
  message: string;
}

const sampleProfileSummary: ProfileSummary = {
  vibe: "Wave-riding taco enthusiast with an adventurous spirit.",
  swipeAppeal: 7,
  standoutPoints: ["Surfing passion", "Foodie (tacos)", "Outdoor activities"]
};

const sampleMessages: StarterMessage[] = [
  {
    type: "playful",
    message: "Surf's up—tacos later? I know a place that would make a wave-rider like you approve."
  },
  {
    type: "sincere",
    message: "Your surf vibe really caught my attention. What's your favorite spot to catch waves?"
  },
  {
    type: "specific",
    message: "I noticed you're into tacos and surfing - have you tried the food trucks at Sunset Beach? Perfect post-surf meal!"
  }
];

const ConversationStarters = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [profileSummary, setProfileSummary] = useState<ProfileSummary | null>(null);
  const [starterMessages, setStarterMessages] = useState<StarterMessage[] | null>(null);
  
  const handleImageUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setProfileSummary(null);
    setStarterMessages(null);
  };
  
  const generateStarters = async () => {
    if (!file) {
      toast.error("Please upload a screenshot of your crush's profile");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append("profileImage", file);
      
      // Get authentication token if the user is logged in
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Call the backend API to process the image
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5002"}/api/process-image`,
        formData,
        { headers }
      );
      
      // Process the response
      if (response.data && response.data.success) {
        // Create profile summary from results
        const { results } = response.data;
        
        // Extract key points from the response for ProfileSummary
        const summaryPoints = results.tips ? results.tips.slice(0, 3) : [];
        
        const summary: ProfileSummary = {
          vibe: results.messages[0] || "No profile information detected",
          swipeAppeal: 7, // Default value
          standoutPoints: summaryPoints
        };
        
        // Format messages into the expected structure
        const messages: StarterMessage[] = [];
        
        if (results.messages && results.messages.length > 0) {
          messages.push({
            type: "playful",
            message: results.messages[0]
          });
          
          if (results.messages.length > 1) {
            messages.push({
              type: "sincere",
              message: results.messages[1]
            });
          }
          
          if (results.messages.length > 2) {
            messages.push({
              type: "specific",
              message: results.messages[2]
            });
          }
        }
        
        setProfileSummary(summary);
        setStarterMessages(messages);
        toast.success("Conversation starters generated!");
      } else {
        throw new Error(response.data?.error || "Failed to generate starters");
      }
    } catch (error) {
      console.error("Error generating starters:", error);
      toast.error("Failed to generate conversation starters. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Help Me Message Someone</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload a screenshot of their dating profile and get personalized conversation starters to help you break the ice.
            </p>
          </div>
          
          {/* Upload Section */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                Upload Their Profile
              </CardTitle>
              <CardDescription>
                Share a screenshot of the profile you're interested in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader
                onImageUpload={handleImageUpload}
                title="Upload Profile Screenshot"
                description="Make sure the bio and prompts are clearly visible"
              />
              
              <Button 
                className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={generateStarters} 
                disabled={!file || isGenerating}
              >
                {isGenerating ? "Generating Ideas..." : "Generate Conversation Starters"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Results Section */}
          {isGenerating ? (
            <div className="space-y-6">
              <div className="animate-pulse bg-muted h-48 rounded-lg w-full"></div>
              <div className="space-y-4">
                <div className="animate-pulse bg-muted h-24 rounded-lg w-full"></div>
                <div className="animate-pulse bg-muted h-24 rounded-lg w-full"></div>
                <div className="animate-pulse bg-muted h-24 rounded-lg w-full"></div>
              </div>
            </div>
          ) : profileSummary && starterMessages ? (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                  <CardDescription>
                    Based on the text in their profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">OVERALL VIBE</h3>
                      <p className="text-lg">{profileSummary.vibe}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">SWIPE APPEAL</h3>
                      <div className="flex items-center gap-4">
                        <Progress value={profileSummary.swipeAppeal * 10} className="h-2 w-48" />
                        <span className="font-bold">{profileSummary.swipeAppeal}/10</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">WHAT STANDS OUT</h3>
                      <div className="flex flex-wrap gap-2">
                        {profileSummary.standoutPoints.map((point, index) => (
                          <Badge key={index} variant="secondary" className="font-normal">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <h2 className="text-2xl font-bold mb-6">Your Conversation Starters</h2>
              <div className="space-y-4">
                {starterMessages.map((starter, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="bg-gradient-to-r from-secondary/30 to-secondary/10 py-2 px-4 border-b">
                      <div className="flex items-center">
                        {starter.type === "playful" && (
                          <>
                            <ThumbsUp className="h-4 w-4 mr-2 text-accent" />
                            <span className="font-medium">Playful Opener</span>
                          </>
                        )}
                        {starter.type === "sincere" && (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">Sincere Approach</span>
                          </>
                        )}
                        {starter.type === "specific" && (
                          <>
                            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
                            <span className="font-medium">Detail-Specific Message</span>
                          </>
                        )}
                      </div>
                    </div>
                    <CardContent className="py-4">
                      <div className="flex justify-between">
                        <p>{starter.message}</p>
                        <Button variant="ghost" size="sm" className="ml-2" onClick={() => {
                          navigator.clipboard.writeText(starter.message);
                          toast.success("Copied to clipboard!");
                        }}>
                          Copy
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-8 bg-muted/30 rounded-lg p-4 border">
                <h3 className="font-medium mb-2">Pro Tips:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Personalize these starters further by adding your own voice</li>
                  <li>Choose the message style that feels most natural to you</li>
                  <li>Ask follow-up questions to keep the conversation flowing</li>
                  <li>Be authentic - don't copy messages that don't sound like you</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-xl border border-dashed p-8 text-center">
              <div>
                <h3 className="text-lg font-medium mb-2">Your conversation starters will appear here</h3>
                <p className="text-muted-foreground">
                  Upload a screenshot and click "Generate Conversation Starters" to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConversationStarters;
