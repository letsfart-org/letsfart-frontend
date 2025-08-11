"use client"

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button2";
import ConnectButton from "@/components/wallet/connect-button";
import { type MenuItem } from "./menu";

export default function MobileMenuBar ({ menus }: { menus: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const onLink = () => {
    setOpen(false)
  }
  return (
    <div className="flex-grow justify-end flex gap-2">
      <ConnectButton />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className="border-primary uppercase" variant='outline' size='icon'>
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <div className="flex flex-col gap-4 font-bold mt-4 capitalize" onClick={onLink}>
            {menus.map(menu => {
              if (menu.children) {
                return (
                  <div className="text-white" key={menu.title}>
                    <div className="text-muted-foreground cursor-default">{menu.title}</div>
                    <div className="flex flex-col gap-1 py-2 leading-10 pl-5">
                      {menu.children.map((subMenu:MenuItem) => {
                        return (
                          <Link key={subMenu.title} href={subMenu.path ?? ''} target={subMenu.target} className="flex items-center gap-1">
                            {subMenu.icon}{subMenu.title}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return (
                <Link key={menu.title} href={menu.path ?? ''} target='_self' className="text-white hover:text-primary">{menu.title}</Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}