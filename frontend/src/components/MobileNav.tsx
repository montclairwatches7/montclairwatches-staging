import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Heart, User, LayoutGrid } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, cart, searchOpen, setSearchOpen } = useStore();
  const cartCount = cart.length;

  const items = [
    { icon: LayoutGrid, label: 'Shop', href: '/collection', type: 'link' },
    { icon: Search, label: 'Search', type: 'button', onClick: () => { setSearchOpen(!searchOpen); if (!searchOpen) window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', type: 'link', badge: wishlist.length },
    { icon: ShoppingBag, label: 'Cart', href: '/cart', type: 'link', badge: cartCount },
    { icon: User, label: 'Profile', href: user ? '/profile' : '/auth', type: 'link' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around h-14 sm:h-16">
        {items.map((item) => {
          const active = location.pathname === item.href;
          
          const Content = (
            <div className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full relative transition-all duration-300",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}>
              <div className="relative">
                <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] font-label font-bold uppercase tracking-widest">
                {item.label}
              </span>
              {active && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
            </div>
          );

          if (item.type === 'button') {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex-1 h-full"
              >
                {Content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href || '#'}
              className="flex-1 h-full"
            >
              {Content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
