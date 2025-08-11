import Link from 'next/link';
import Menus from "./layout/menu";
import Image from "next/image";
import { Press_Start_2P } from 'next/font/google'
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constant";
import Container from "./layout/container";

const pressStart2p = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
})

export const Header = () => {
  return (
    <header className="backdrop-blur-lg w-full flex items-center justify-center">
      <Container className="flex items-center gap-4 h-14">
        <Link href='/' className="flex items-center gap-2 mr-4">
          <Image
            src="/logo.png"
            alt="Letsfart Logo"
            width={32}
            height={32}
            className="block mb-0.5"
          />
          <h1 className={cn('uppercase', pressStart2p.className)}>{APP_NAME}</h1>
        </Link>
        <Menus />
      </Container>
    </header>
  );
};

export default Header;
