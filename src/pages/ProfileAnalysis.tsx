import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import ImageUploader from "@/components/ImageUploader";
import ProfileAnalysisResult from "@/components/ProfileAnalysisResult";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { ArrowUpRight, Camera, FileText, Clock, LightbulbIcon, Info } from "lucide-react";
import axios from "axios";
import { auth } from "@/firebase";

// Example photos from Unsplash
const examplePhotos = [
  {
    url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    title: "Fun outdoor activity",
    description: "Show yourself enjoying a hobby or sport you love"
  },
  {
    url: "https://images.unsplash.com/photo-1540331547168-8b63109225b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    title: "Group photo with friends",
    description: "Social photos show you're fun to be around"
  },
  {
    url: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    title: "Laughing/smiling portrait",
    description: "Natural, candid shots show your authentic personality"
  }
];

// Simulated AI analysis results - only used as a fallback
const sampleAnalysis = {
  title: "Your Profile Analysis",
  score: 7.5,
  firstImpression: {
    would_swipe: "right" as "right" | "left", // Fixed type
    reason: "Your profile stands out with an authentic smile and good lighting, though the background is slightly distracting."
  },
  photoFeedback: [
    {
      type: "positive" as "positive" | "improvement", // Fixed type
      text: "Your smile is authentic and creates a warm, approachable vibe."
    },
    {
      type: "positive" as "positive" | "improvement", // Fixed type
      text: "The lighting in your photo is excellent, highlighting your features well."
    },
    {
      type: "improvement" as "positive" | "improvement", // Fixed type
      text: "The background is cluttered, which can be distracting. Try a cleaner setting."
    },
    {
      type: "improvement" as "positive" | "improvement", // Fixed type
      text: "Your photo appears to be a selfie. Consider adding photos taken by others to show more natural poses."
    }
  ],
  bioFeedback: [
    {
      type: "positive" as "positive" | "improvement", // Fixed type
      text: "Your bio has a good balance of humor and sincerity."
    },
    {
      type: "improvement" as "positive" | "improvement", // Fixed type
      text: "The phrase 'work hard, play hard' is overused in dating profiles. Try something more unique."
    }
  ],
  improvementSuggestions: [
    {
      title: "Add a full-body photo",
      description: "This provides a more complete impression for potential matches.",
      actionText: "Upload new photo"
    },
    {
      title: "Show yourself engaged in a hobby",
      description: "Photos of you doing activities you enjoy showcase your personality and interests.",
      actionText: "Upload activity photo"
    },
    {
      title: "Revise your bio to remove clichés",
      description: "Replace common phrases with more specific and unique descriptions.",
      actionText: "Edit bio now"
    }
  ]
};

const ProfileAnalysis = () => {
  // Handle multiple images
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  
  // Handle image upload from ImageUploader
  const handleImageUpload = (uploadedFiles: File[]) => {
    setSelectedImages(uploadedFiles);
    setAnalysisResults([]);
  };
  
  // Analyze profile with multiple images
  const analyzeProfile = async () => {
    if (selectedImages.length === 0) {
      toast.error("Please upload at least one photo to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResults([]);
    const results = [];

    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const formData = new FormData();
        formData.append("photos", selectedImages[i]);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5002"}/api/analyze-profile`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data) {
          results.push({
            ...response.data,
            imageSrc: URL.createObjectURL(selectedImages[i]),
            imageFile: selectedImages[i].name,
          });
        }
      }

      setAnalysisResults(results);
    } catch (error) {
      console.error("Error analyzing profile:", error);
      toast.error("Failed to analyze your photos. Please try again later.");
      
      // Fallback to sample results if API fails
      const sampleResults = selectedImages.map((img, index) => ({
        description: "Sample analysis result due to API error.",
        verdict: "Needs Improvement",
        suggestion: "Please try again later when our service is back online.",
        imageSrc: URL.createObjectURL(img),
        imageFile: img.name,
      }));
      setAnalysisResults(sampleResults);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Rate My Profile</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your dating profile photos and get AI-powered feedback on what's working and how to improve.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5 text-primary" />
                    Upload Your Profile
                  </CardTitle>
                  <CardDescription>
                    Upload screenshots of your dating profile (photos, bio, prompts)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ImageUploader
                    onImageUpload={handleImageUpload}
                    title="Upload Profile Screenshots"
                    description="Drag and drop your profile screenshots here, or click to browse"
                  />
                  
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg mt-4">
                    <div className="flex items-start gap-2">
                      <LightbulbIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        <strong>Tip:</strong> Use clear, well-lit photos that show your personality. Authentic photos that represent who you are will attract better matches!
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> Please use authentic photos! Using smaller images (under 500KB) will help the app analyze your photos faster.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90" 
                    onClick={analyzeProfile} 
                    disabled={selectedImages.length === 0 || isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze My Profile"}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Example Photos Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Example Good Profile Photos:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {examplePhotos.map((photo, index) => (
                    <div key={index} className="rounded-lg border overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.title} 
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-2">
                        <h4 className="text-xs font-medium">{photo.title}</h4>
                        <p className="text-xs text-muted-foreground">{photo.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p className="font-medium mb-2">
                  How it works:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                      <Camera className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span>Upload screenshots of your dating profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span>Our AI analyzes your photos, bio, and prompts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-primary/20 p-1 rounded-full mr-2 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <span>Get detailed feedback and actionable suggestions in seconds</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Results Section */}
            <div>
              {isAnalyzing ? (
                <ProfileAnalysisResult 
                  isLoading={true} 
                />
              ) : analysisResults.length > 0 ? (
                <ProfileAnalysisResult 
                  results={analysisResults}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-muted/30 rounded-xl border border-dashed p-8 text-center">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Your analysis will appear here</h3>
                    <p className="text-muted-foreground">
                      Upload profile screenshots and click "Analyze My Profile" to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfileAnalysis;
