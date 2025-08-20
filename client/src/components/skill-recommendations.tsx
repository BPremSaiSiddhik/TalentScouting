import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface SkillRecommendation {
  skill: string;
  reason: string;
  confidence: number;
}

export default function SkillRecommendations({ talent }: { talent: User }) {
  const { toast } = useToast();
  const { data: recommendations, isLoading, isError, error, refetch } = useQuery<SkillRecommendation[]>({
    queryKey: [`/api/talents/${talent.id}/recommendations`],
    enabled: !!talent,
    retry: 1, // Only retry once to avoid too many API calls
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">Failed to load recommendations</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            toast({
              title: "Retrying...",
              description: "Fetching new skill recommendations",
            });
            refetch();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground">
          No skill recommendations available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="font-medium">Recommended Skills</h3>
      </div>

      <div className="grid gap-2">
        {recommendations.map((rec, i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Badge variant="outline" className="px-2 py-1">
                    {rec.skill}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">{rec.reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}