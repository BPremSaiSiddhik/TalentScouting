import { useQuery } from "@tanstack/react-query";
import { User, TalentToken } from "@shared/schema";
import TalentCard from "@/components/talent-card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface RankingScore {
  score: number;
  confidence: number;
  reasoning: string;
}

interface Rankings {
  [key: number]: RankingScore;
}

export default function Marketplace() {
  const [search, setSearch] = useState("");

  const { data: talents, isLoading } = useQuery<User[]>({
    queryKey: ["/api/talents"],
  });

  const { data: tokens } = useQuery<{ [key: number]: TalentToken }>({
    queryKey: ["/api/talents/tokens"],
    enabled: !!talents,
    queryFn: async () => {
      if (!talents) return {};
      const tokenPromises = talents.map(talent =>
        fetch(`/api/talents/${talent.id}/tokens`).then(res => res.json())
      );
      const tokenResults = await Promise.all(tokenPromises);
      return tokenResults.reduce((acc, token, i) => ({
        ...acc,
        [talents[i].id]: token
      }), {});
    }
  });

  const { data: rankings } = useQuery<Rankings>({
    queryKey: ["/api/talents/ranked"],
    enabled: !!talents,
  });

  const filteredTalents = talents?.filter(talent =>
    talent.username.toLowerCase().includes(search.toLowerCase()) ||
    talent.skills?.some(skill =>
      skill.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Sort talents by ranking score if available
  const sortedTalents = filteredTalents?.sort((a, b) => {
    if (!rankings) return 0;
    return (rankings[b.id]?.score || 0) - (rankings[a.id]?.score || 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Talent Marketplace</h1>
        <Input
          type="search"
          placeholder="Search by name or skills..."
          className="max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!talents && isLoading
          ? Array(6).fill(0).map((_, i) => (
              <TalentCard key={i} talent={{} as User} isLoading />
            ))
          : sortedTalents?.map(talent => (
              <TalentCard
                key={talent.id}
                talent={talent}
                token={tokens?.[talent.id]}
                ranking={rankings?.[talent.id]}
              />
            ))}
      </div>
    </div>
  );
}