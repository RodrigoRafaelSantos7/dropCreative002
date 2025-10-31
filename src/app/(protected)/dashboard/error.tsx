"use client";

import { Home } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { dashboardPath } from "@/paths";

const Page = () => (
  <div className="flex w-full items-center justify-center">
    <div className="flex h-screen items-center border-x">
      <div>
        <div className="absolute inset-x-0 h-px bg-border" />
        <Empty className="md:m-24">
          <EmptyHeader>
            <EmptyTitle className="whitespace-pre font-mono text-[0.5rem] text-accent md:text-xl">
              {`
       _             _            _           
   _  /\\ \\         / /\\       _  /\\ \\         
  /\\_\\\\ \\ \\       / /  \\     /\\_\\\\ \\ \\        
 / / / \\ \\ \\     / / /\\ \\   / / / \\ \\ \\       
/ / /   \\ \\ \\   / / /\\ \\ \\ / / /   \\ \\ \\      
\\ \\ \\____\\ \\ \\ /_/ /  \\ \\ \\\\ \\ \\____\\ \\ \\     
 \\ \\________\\ \\\\ \\ \\   \\ \\ \\\\ \\________\\ \\    
  \\/________/\\ \\\\ \\ \\   \\ \\ \\/________/\\ \\   
            \\ \\ \\\\ \\ \\___\\ \\ \\         \\ \\ \\  
             \\ \\_\\\\ \\/____\\ \\ \\         \\ \\_\\ 
              \\/_/ \\_________\\/          \\/_/ 
                                              
          `}
            </EmptyTitle>
            <EmptyDescription className="text-nowrap">
              There was an error loading the dashboard.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <div className="flex gap-2">
              <Link
                className={buttonVariants({ variant: "link", size: "lg" })}
                href={dashboardPath()}
                prefetch={true}
              >
                <Home /> Go Dashboard
              </Link>
            </div>
          </EmptyContent>
        </Empty>
        <div className="absolute inset-x-0 h-px bg-border" />
      </div>
    </div>
  </div>
);

export default Page;
