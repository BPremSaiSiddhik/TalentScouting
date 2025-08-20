import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">TimeLock Talent</span>
            </Link>
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link href="/marketplace">
                  <Button variant="ghost">Marketplace</Button>
                </Link>
                {user.role === "talent" && (
                  <Link href="/talent">
                    <Button variant="ghost">Talent Dashboard</Button>
                  </Link>
                )}
                {user.role === "investor" && (
                  <Link href="/investor">
                    <Button variant="ghost">Investor Dashboard</Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarFallback>
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.username}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
