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

    try {
      const results = [];
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
      
      // Get authentication token
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("You must be logged in to analyze your profile");
      }

      // First, upload all images and get their URLs
      const imageUrls = [];
      for (let i = 0; i < selectedImages.length; i++) {
        const formData = new FormData();
        formData.append("file", selectedImages[i]);
        
        try {
          // Upload the image to get a URL
          const uploadResponse = await axios.post(
            `${baseUrl}/api/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Bearer ${idToken}`
              },
            }
          );
          
          if (uploadResponse.data && uploadResponse.data.url) {
            imageUrls.push(uploadResponse.data.url);
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error(`Failed to upload image ${selectedImages[i].name}`);
        }
      }
      
      if (imageUrls.length === 0) {
        throw new Error("Could not upload any images. Please try again.");
      }
      
      // Now analyze the profile with the image URLs
      const analysisResponse = await axios.post(
        `${baseUrl}/api/analyze-profile`,
        { 
          photos: imageUrls,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
        }
      );

      if (analysisResponse.data) {
        // Create a result that includes both the analysis data and references to the local images
        const result = {
          ...analysisResponse.data,
          photoUrls: imageUrls,
          localImages: selectedImages.map(img => ({
            url: URL.createObjectURL(img),
            name: img.name
          }))
        };
        
        results.push(result);
        setAnalysisResults(results);
      }
    } catch (error) {
      console.error("Error analyzing profile:", error);
      toast.error("Failed to analyze your photos. Please try again later.");
      setAnalysisResults([]);
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
