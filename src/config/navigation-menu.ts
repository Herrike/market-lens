import { ChartPieIcon, HomeIcon } from "@heroicons/react/24/outline";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string;
      titleId?: string;
    } & React.RefAttributes<SVGSVGElement>
  >;
  hidden?: boolean;
};

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "#", icon: HomeIcon },
  { name: "Stocks", href: "#", icon: ChartPieIcon, hidden: true },
];
export default navigation;
