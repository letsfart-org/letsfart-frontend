import Header from '@/components/Header';
import { cn } from '@/lib/utils';
import Footer from "@/components/layout/footer";
import SeoInfo from '@/components/seo';

interface IProps {
  containerClassName?: string;
  pageClassName?: string;
}

const Page: React.FC<React.PropsWithChildren<IProps>> = ({
  containerClassName,
  children,
  pageClassName,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col justify-between bg-black text-white',
        pageClassName
      )}
    >
      <SeoInfo />
      <Header />
      <div
        className={cn(
          'flex flex-1 flex-col items-center px-1 md:px-3 pt-4 pb-8',
          containerClassName
        )}
      >
        <div className="lg:max-w-7xl w-full">{children}</div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
