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

export interface AnalysisResult {
  score: number;
  firstImpression?: FirstImpression;
  photoFeedback?: PhotoFeedback[];
  bioFeedback?: BioFeedback[];
  improvementSuggestions?: ImprovementSuggestion[];
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
    <Card className="animate-fadeIn">
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
              <TabsTrigger key={index} value={index.toString()}>
                Photo {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {results.map((result, index) => (
            <TabsContent key={index} value={index.toString()}>
              {renderTabContent(result)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

const renderSingleResult = (result: AnalysisResult) => {
  const { score = 0, firstImpression, photoFeedback = [], bioFeedback = [], improvementSuggestions = [] } = result;
  
  return (
    <Card className="animate-fadeIn">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Analysis</CardTitle>
            <CardDescription>
              AI-powered feedback on your dating profile
            </CardDescription>
          </div>
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {score}/10
            </div>
            <Badge 
              className={`absolute -bottom-2 right-0 ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
            >
              {score >= 7 ? 'Good' : score >= 5 ? 'Average' : 'Needs Work'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* First Impression Section */}
        {firstImpression && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              First Impression (2-second swipe)
            </h3>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${firstImpression.would_swipe === 'right' ? 'bg-green-100' : 'bg-red-100'}`}>
                {firstImpression.would_swipe === 'right' ? (
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">
                  Would swipe {firstImpression.would_swipe}
                </p>
                <p className="text-muted-foreground text-sm">
                  {firstImpression.reason}
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
        {improvementSuggestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Top Improvement Suggestions</h3>
            <div className="space-y-3">
              {improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <p className="text-muted-foreground text-sm mb-3">{suggestion.description}</p>
                  <Button variant="outline" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                    {suggestion.actionText}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const renderTabContent = (result: AnalysisResult) => {
  const { score = 0, firstImpression, photoFeedback = [], bioFeedback = [], improvementSuggestions = [] } = result;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-3xl font-bold text-primary-foreground">
            {score}/10
          </div>
          <Badge 
            className={`absolute -bottom-2 right-0 ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
          >
            {score >= 7 ? 'Good' : score >= 5 ? 'Average' : 'Needs Work'}
          </Badge>
        </div>
      </div>
      
      {/* First Impression Section */}
      {firstImpression && (
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            First Impression (2-second swipe)
          </h3>
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${firstImpression.would_swipe === 'right' ? 'bg-green-100' : 'bg-red-100'}`}>
              {firstImpression.would_swipe === 'right' ? (
                <ThumbsUp className="h-5 w-5 text-green-600" />
              ) : (
                <ThumbsDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">
                Would swipe {firstImpression.would_swipe}
              </p>
              <p className="text-muted-foreground text-sm">
                {firstImpression.reason}
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
      {improvementSuggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Top Improvement Suggestions</h3>
          <div className="space-y-3">
            {improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <h4 className="font-medium">{suggestion.title}</h4>
                <p className="text-muted-foreground text-sm mb-3">{suggestion.description}</p>
                <Button variant="outline" size="sm" className="text-accent hover:text-accent hover:bg-accent/10">
                  {suggestion.actionText}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAnalysisResult;
