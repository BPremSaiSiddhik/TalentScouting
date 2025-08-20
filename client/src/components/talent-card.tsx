import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, TalentToken } from "@shared/schema";
import { Skeleton } from "./ui/skeleton";
import RankingBadge from "./ranking-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import SkillEndorsements from "./skill-endorsements";
import TokenStats from "@/components/token-stats";

interface TalentCardProps {
  talent: User;
  token?: TalentToken;
  ranking?: {
    score: number;
    confidence: number;
    reasoning: string;
  };
  isLoading?: boolean;
}

export default function TalentCard({ talent, token, ranking, isLoading }: TalentCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span>{talent.name || talent.username}</span>
            {ranking && (
              <RankingBadge
                score={ranking.score}
                confidence={ranking.confidence}
                reasoning={ranking.reasoning}
              />
            )}
          </div>
          <Badge variant="secondary">{token?.currentPrice} TLT</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Skills</p>
            <Accordion type="single" collapsible className="w-full">
              {talent.skills?.map((skill, i) => (
                <AccordionItem key={i} value={skill}>
                  <AccordionTrigger className="text-sm py-2">
                    {skill}
                  </AccordionTrigger>
                  <AccordionContent>
                    <SkillEndorsements talent={talent} skill={skill} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {token && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Token Stats</p>
              <TokenStats token={token} />
            </div>
          )}

          {talent.bio && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bio</p>
              <p className="text-sm">{talent.bio}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}