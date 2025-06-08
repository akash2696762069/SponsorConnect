import { useLocation, Link } from "wouter";
import { 
  Home, 
  User, 
  Megaphone, 
  Link as LinkIcon, 
  CreditCard 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Sponsorships", href: "/sponsorships", icon: Megaphone },
  { name: "Platforms", href: "/platforms", icon: LinkIcon },
  { name: "Payment", href: "/payment", icon: CreditCard },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:text-primary"
              }`}>
                <Icon size={24} />
                <span className="text-xs mt-1">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
