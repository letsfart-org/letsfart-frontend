"use client"

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/use-media-query";
import TwitterIcon from "@/components/icons/twitter";
import TelegramIcon from "@/components/icons/telegram";
import { LINKS } from "@/lib/constant";

const MobileMenuBar = dynamic(() => import('./mobile-menu'), { ssr: false })
const DesktopMenuBar = dynamic(() => import('./desktop-menu'), { ssr: false })

export type MenuItem = {
  title: string;
  path?:string;
  target?:string;
  icon?: any;
  children?: MenuItem[],
}

const menus: MenuItem[] = [
  { title: 'Explore', path: '/'  },
  { title: 'Launch', path: '/launch'  },
  { title: 'Docs', path: 'https://docs.letsfart.org/'  },

  {
    title: 'Community',
    children: [
      { title: LINKS.twitter.label, icon: <TwitterIcon className='mr-2 h-4 w-4' />,  target: '_blank', path: LINKS.twitter.link },
      { title: LINKS.telegram.label, icon: <TelegramIcon className='mr-2 h-4 w-4' />, target: '_blank', path: LINKS.telegram.link },
    ],
  },
]

export default function Menu () {
  
  const isDesktop = useMediaQuery("(min-width: 1000px)")

  if (isDesktop === undefined) return null
  if (isDesktop) return <DesktopMenuBar menus={menus} />
  return <MobileMenuBar menus={menus} />
}