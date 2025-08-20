import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-8">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(data => loginMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    Login
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(data => registerMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="talent">Talent</SelectItem>
                            <SelectItem value="investor">Investor</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    Register
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="hidden lg:flex flex-col justify-center p-8 bg-primary text-primary-foreground">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">TimeLock Talent</h1>
          <p className="text-lg mb-8">
            Join the next generation of talent scouting and investment. Whether you're a talented individual looking to tokenize your potential or an investor seeking the next big opportunity, TimeLock Talent connects you to a world of possibilities.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              ✨ AI-powered talent ranking
            </li>
            <li className="flex items-center gap-2">
              💎 Tokenized talent investment
            </li>
            <li className="flex items-center gap-2">
              📈 Transparent milestone tracking
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
