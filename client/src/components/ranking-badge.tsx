import { Loader2, TrendingUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RankingBadgeProps {
  score: number;
  confidence: number;
  reasoning: string;
  isLoading?: boolean;
}

export default function RankingBadge({ score, confidence, reasoning, isLoading }: RankingBadgeProps) {
  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <TrendingUp className={`h-4 w-4 ${getScoreColor(score)}`} />
            <span className={`font-medium ${getScoreColor(score)}`}>
              {score}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-medium mb-1">AI Ranking Score</p>
            <p className="text-sm text-muted-foreground mb-2">{reasoning}</p>
            <p className="text-xs text-muted-foreground">
              Confidence: {Math.round(confidence * 100)}%
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
