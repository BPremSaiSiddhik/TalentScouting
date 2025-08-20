import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TalentToken, Investment, insertUserSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TokenStats from "@/components/token-stats";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SkillRecommendations from "@/components/skill-recommendations";

const profileSchema = insertUserSchema.pick({
  name: true,
  bio: true,
  skills: true,
  portfolio: true,
});

export default function TalentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: token } = useQuery<TalentToken>({
    queryKey: [`/api/talents/${user?.id}/tokens`],
    enabled: !!user,
  });

  const { data: investments } = useQuery<Investment[]>({
    queryKey: [`/api/investments/${user?.id}`],
    enabled: !!user,
  });

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      skills: user?.skills || [],
      portfolio: user?.portfolio || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof form.getValues) => {
      const res = await apiRequest("PATCH", `/api/talents/${user?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalInvestment = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Talent Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(data => updateProfileMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value?.join(", ") || ""}
                          onChange={e => field.onChange(e.target.value.split(",").map(s => s.trim()))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <Input {...field} type="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={updateProfileMutation.isPending}>
                  Update Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {token && (
          <Card>
            <CardHeader>
              <CardTitle>Token Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <TokenStats token={token} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Skill Development</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRecommendations talent={user!} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Investment</p>
                <p className="text-2xl font-bold">{totalInvestment} TLT</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Investors</p>
                <p className="text-2xl font-bold">{investments?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}