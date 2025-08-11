"use client"

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConnectButton from "@/components/wallet/connect-button";
import { cn } from "@/lib/utils";

import { type MenuItem } from "./menu";

export default function DesktopMenuBar({ menus }: { menus: MenuItem[] }) {
  const path = usePathname()
  return (<>
    <div className="flex items-center gap-1 xl:gap-2 text-base uppercase flex-grow leading-10">
      {menus.map((menu) => {
        if (menu.children) {
          return (
            <DropdownMenu key={menu.title}>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-1 leading-10 uppercase text-base cursor-default hover:bg-secondary px-2 rounded-md">
                    {menu.title}<ChevronDown className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-neutral-850">
                {menu.children.map(subMenu=> {
                  return (
                    <DropdownMenuItem className="text-white" key={subMenu.title} asChild>
                      <Link href={subMenu.path ?? ''} target={subMenu.target ?? '_self'}>
                      {subMenu.icon}
                      {subMenu.title}
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
                </DropdownMenuContent>
            </DropdownMenu>
          )
        }
        return <Link
          href={menu.path ?? ''} key={menu.title}
          className={cn('hover:bg-secondary px-2 lg:px-3 rounded')}>
            <span className={cn('', { 'font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent': path === menu.path })}>{menu.title}</span>
          </Link>
      })}
    </div>
    <ConnectButton />
  </>)
}