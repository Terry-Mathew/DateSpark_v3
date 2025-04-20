import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, AlertTriangle, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PhotoFeedback {
  type: 'positive' | 'improvement';
  text: string;
}

interface BioFeedback {
  type: 'positive' | 'improvement';
  text: string;
}

interface FirstImpression {
  would_swipe: 'right' | 'left';
  reason: string;
}

interface ImprovementSuggestion {
  title: string;
  description: string;
  actionText: string;
}

interface LocalImage {
  url: string;
  name: string;
}

export interface AnalysisResult {
  score?: number;
  overallScore?: number; // New API format
  strengths?: string[]; // New API format
  weaknesses?: string[]; // New API format
  improvementSuggestions?: string[] | ImprovementSuggestion[]; // Can be either format
  detailedAnalysis?: {
    photoQuality?: { score: number, feedback: string },
    diversity?: { score: number, feedback: string },
    impression?: { score: number, feedback: string },
    bioFeedback?: { score: number, feedback: string }
  };
  firstImpression?: FirstImpression;
  photoFeedback?: PhotoFeedback[];
  bioFeedback?: BioFeedback[];
  photoUrls?: string[]; // URLs of uploaded images
  localImages?: LocalImage[]; // Local image references
}

interface ProfileAnalysisResultProps {
  results?: AnalysisResult[];
  isLoading?: boolean;
}

const ProfileAnalysisResult = ({ 
  results = [],
  isLoading = false 
}: ProfileAnalysisResultProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="animate-pulse bg-muted h-7 w-48 rounded"></CardTitle>
              <CardDescription className="animate-pulse bg-muted h-5 w-32 rounded mt-2"></CardDescription>
            </div>
            <div className="animate-pulse bg-muted h-24 w-24 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="animate-pulse bg-muted h-20 w-full rounded"></div>
            <div className="animate-pulse bg-muted h-28 w-full rounded"></div>
            <div className="animate-pulse bg-muted h-28 w-full rounded"></div>
            <div className="animate-pulse bg-muted h-40 w-full rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Analysis Results</CardTitle>
          <CardDescription>
            Upload your profile photos to get an analysis
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If only one result, display the original format
  if (results.length === 1) {
    const result = results[0];
    return renderSingleResult(result);
  }

  // For multiple results, use tabs
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Profile Analysis</CardTitle>
        <CardDescription>
          AI-powered feedback on your dating profile photos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="0" className="w-full">
          <TabsList className="mb-4">
            {results.map((_, index) => (
              <TabsTrigger key={index} value={index.toString()} className="transition-transform hover:scale-105">
                Photo {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {results.map((result, index) => (
            <TabsContent key={index} value={index.toString()} className="animate-fade-in">
              {renderTabContent(result)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

const renderSingleResult = (result: AnalysisResult) => {
  // Get the score (handling both old and new API formats)
  const score = result.score || result.overallScore || 0;
  
  // Convert strengths and weaknesses to photoFeedback format if using new API
  const photoFeedback = result.photoFeedback || [
    ...(result.strengths || []).map(strength => ({ type: 'positive' as 'positive', text: strength })),
    ...(result.weaknesses || []).map(weakness => ({ type: 'improvement' as 'improvement', text: weakness }))
  ];
  
  // Format improvement suggestions
  const formattedSuggestions = Array.isArray(result.improvementSuggestions) 
    ? typeof result.improvementSuggestions[0] === 'string'
      ? (result.improvementSuggestions as string[]).map(suggestion => ({
          title: 'Improvement Suggestion',
          description: suggestion,
          actionText: 'Apply This Change'
        }))
      : result.improvementSuggestions as ImprovementSuggestion[]
    : [];
  
  // Extract bio feedback from detailed analysis if available
  const bioFeedback = result.bioFeedback || (
    result.detailedAnalysis?.bioFeedback 
      ? [{ 
          type: result.detailedAnalysis.bioFeedback.score >= 7 ? 'positive' as 'positive' : 'improvement' as 'improvement', 
          text: result.detailedAnalysis.bioFeedback.feedback 
        }] 
      : []
  );
  
  // Display images if available
  const hasImages = !!(result.localImages && result.localImages.length > 0);
  
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Analysis</CardTitle>
            <CardDescription>
              AI-powered feedback on your dating profile
            </CardDescription>
          </div>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-3xl font-bold text-primary-foreground animate-pulse">
              {score}/10
            </div>
            <Badge 
              className={`absolute -bottom-2 right-0 ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'} animate-bounce`}
            >
              {score >= 7 ? 'Good' : score >= 5 ? 'Average' : 'Needs Work'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display analyzed images if available */}
        {hasImages && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Analyzed Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {result.localImages!.map((image, index) => (
                <div 
                  key={index} 
                  className="aspect-square rounded-lg overflow-hidden border transition-all duration-300 hover:shadow-md hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img 
                    src={image.url} 
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* First Impression Section */}
        {result.firstImpression && (
          <div className="border rounded-lg p-4 hover:border-primary/60 transition-colors">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              First Impression (2-second swipe)
            </h3>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${result.firstImpression.would_swipe === 'right' ? 'bg-green-100' : 'bg-red-100'} transition-transform hover:scale-110`}>
                {result.firstImpression.would_swipe === 'right' ? (
                  <ThumbsUp className="h-5 w-5 text-green-600 animate-pulse" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600 animate-pulse" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  Would swipe {result.firstImpression.would_swipe}
                </p>
                <p className="text-muted-foreground text-sm">
                  {result.firstImpression.reason}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Photo Feedback Section */}
        {photoFeedback.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Photo Feedback</h3>
            <div className="space-y-2">
              {photoFeedback.map((feedback, index) => (
                <div 
                  key={index} 
                  className="flex gap-3 animate-slideUp hover:bg-muted/30 p-2 rounded-md transition-colors"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {feedback.type === 'positive' ? (
                    <div className="mt-0.5 transition-transform hover:scale-110">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5 transition-transform hover:scale-110">
                      <div className="bg-amber-100 p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                    </div>
                  )}
                  <p>{feedback.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Bio Feedback Section */}
        {bioFeedback.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Bio & Prompt Feedback</h3>
            <div className="space-y-2">
              {bioFeedback.map((feedback, index) => (
                <div key={index} className="flex gap-3 animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
                  {feedback.type === 'positive' ? (
                    <div className="mt-0.5">
                      <div className="bg-green-100 p-1 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-0.5">
                      <div className="bg-amber-100 p-1 rounded-full">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                    </div>
                  )}
                  <p>{feedback.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Improvement Suggestions */}
        {formattedSuggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Top Improvement Suggestions</h3>
            <div className="space-y-3">
              {formattedSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-md"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-muted-foreground text-sm mb-3">{suggestion.description}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-accent hover:text-accent hover:bg-accent/10 transition-transform hover:scale-105"
                  >
                    {suggestion.actionText}
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Detailed Analysis Section (if available) */}
        {result.detailedAnalysis && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
            <div className="space-y-4">
              {result.detailedAnalysis.photoQuality && (
                <div className="border rounded-lg p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Photo Quality</h4>
                    <Badge className="animate-pulse">{result.detailedAnalysis.photoQuality.score}/10</Badge>
                  </div>
                  <p className="text-sm">{result.detailedAnalysis.photoQuality.feedback}</p>
                </div>
              )}
              
              {result.detailedAnalysis.diversity && (
                <div className="border rounded-lg p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Photo Diversity</h4>
                    <Badge className="animate-pulse">{result.detailedAnalysis.diversity.score}/10</Badge>
                  </div>
                  <p className="text-sm">{result.detailedAnalysis.diversity.feedback}</p>
                </div>
              )}
              
              {result.detailedAnalysis.impression && (
                <div className="border rounded-lg p-4 transition-all hover:border-primary/40 hover:shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">First Impression</h4>
                    <Badge className="animate-pulse">{result.detailedAnalysis.impression.score}/10</Badge>
                  </div>
                  <p className="text-sm">{result.detailedAnalysis.impression.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const renderTabContent = (result: AnalysisResult) => {
  // Similar updates as renderSingleResult, but for tab content
  const score = result.score || result.overallScore || 0;
  
  // Rest of the existing function...
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Overall Score</h3>
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xl font-bold text-primary-foreground">
            {score}/10
          </div>
        </div>
      </div>
      
      {result.localImages && result.localImages[0] && (
        <div className="rounded-lg overflow-hidden border">
          <img 
            src={result.localImages[0].url} 
            alt={result.localImages[0].name}
            className="w-full aspect-video object-cover"
          />
        </div>
      )}
      
      {/* Additional tab content can be adapted as needed */}
    </div>
  );
};

export default ProfileAnalysisResult;

