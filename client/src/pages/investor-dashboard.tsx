import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Investment, User, TalentToken } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TokenStats from "@/components/token-stats";

export default function InvestorDashboard() {
  const { user } = useAuth();

  const { data: investments } = useQuery<Investment[]>({
    queryKey: [`/api/investments/${user?.id}`],
    enabled: !!user,
  });

  const { data: talents } = useQuery<User[]>({
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

  const totalInvestment = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const uniqueTalents = new Set(investments?.map(inv => inv.talentId)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Investor Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">{totalInvestment} TLT</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Talents Backed</p>
                <p className="text-2xl font-bold">{uniqueTalents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {investments?.map(investment => {
          const talent = talents?.find(t => t.id === investment.talentId);
          const token = tokens?.[investment.talentId];
          
          if (!talent || !token) return null;

          return (
            <Card key={investment.id}>
              <CardHeader>
                <CardTitle>{talent.name || talent.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenStats token={token} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Investment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments?.map(investment => {
                const talent = talents?.find(t => t.id === investment.talentId);
                return (
                  <TableRow key={investment.id}>
                    <TableCell>{talent?.name || talent?.username}</TableCell>
                    <TableCell>{investment.amount} TLT</TableCell>
                    <TableCell>{investment.tokenAmount}</TableCell>
                    <TableCell>
                      {new Date(investment.timestamp).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
