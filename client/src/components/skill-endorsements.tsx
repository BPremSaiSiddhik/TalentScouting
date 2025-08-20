import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SkillEndorsement, User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface SkillEndorsementsProps {
  talent: User;
  skill: string;
}

export default function SkillEndorsements({ talent, skill }: SkillEndorsementsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  const { data: endorsements } = useQuery<SkillEndorsement[]>({
    queryKey: [`/api/talents/${talent.id}/endorsements/${skill}`],
  });

  const endorseMutation = useMutation({
    mutationFn: async (data: { skill: string; comment: string }) => {
      const res = await apiRequest("POST", `/api/talents/${talent.id}/endorsements`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/talents/${talent.id}/endorsements/${skill}`],
      });
      toast({
        title: "Skill Endorsed",
        description: `You've endorsed ${talent.name || talent.username}'s ${skill} skill.`,
      });
      setComment("");
      setShowCommentForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Endorsement Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const endorsementCount = endorsements?.length || 0;
  const canEndorse = user && user.id !== talent.id;
  const hasEndorsed = endorsements?.some(e => e.endorserId === user?.id);

  const handleEndorse = () => {
    if (!showCommentForm) {
      setShowCommentForm(true);
    } else {
      endorseMutation.mutate({ skill, comment });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="px-3 py-1">
          {skill} ({endorsementCount})
        </Badge>
        {canEndorse && !hasEndorsed && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleEndorse}
            disabled={endorseMutation.isPending}
          >
            {showCommentForm ? "Submit Endorsement" : "Endorse"}
          </Button>
        )}
      </div>

      {showCommentForm && canEndorse && !hasEndorsed && (
        <div className="space-y-2">
          <Textarea
            placeholder="What makes this person skilled in Python? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="h-20"
          />
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowCommentForm(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              onClick={handleEndorse}
              disabled={endorseMutation.isPending}
            >
              Submit
            </Button>
          </div>
        </div>
      )}

      {endorsements && endorsements.length > 0 ? (
        <div className="space-y-2">
          {endorsements.map((endorsement) => (
            <div
              key={endorsement.id}
              className="p-3 rounded-lg bg-muted text-sm"
            >
              {endorsement.comment && (
                <p className="mb-2">{endorsement.comment}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Endorsed on{" "}
                {new Date(endorsement.timestamp).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {canEndorse 
            ? "Be the first to endorse this skill!"
            : "No endorsements yet."
          }
        </p>
      )}
    </div>
  );
}