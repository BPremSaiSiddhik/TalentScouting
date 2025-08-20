import { TalentToken } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TokenStats({ token }: { token: TalentToken }) {
  const supplyProgress = (token.currentPrice / token.totalSupply) * 100;

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Supply</span>
                <span>{token.totalSupply.toLocaleString()} TLT</span>
              </div>
              <Progress value={supplyProgress} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Current Price: {token.currentPrice} TLT</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium mb-1">Goals</p>
          <ul className="text-sm space-y-1">
            {(token.goals as string[]).map((goal, i) => (
              <li key={i} className="text-muted-foreground">• {goal}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Milestones</p>
          <ul className="text-sm space-y-1">
            {(token.milestones as string[]).map((milestone, i) => (
              <li key={i} className="text-muted-foreground">✓ {milestone}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
