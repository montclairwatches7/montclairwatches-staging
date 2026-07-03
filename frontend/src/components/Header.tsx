import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart, ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';
import { useCategories } from '@/hooks/useModules';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Collection', href: '/collection' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { data: categories = [], isLoading } = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { searchOpen, setSearchOpen } = useStore();
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const cartTotal = cart.length;

  useEffect(() => {
    setSearchOpen(false);
  }, [location, setSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-[60] bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
              <img src={logo} alt="Montclair" className="h-11 sm:h-14 w-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-[10px] font-label font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-primary transition-all hover:translate-y-[-1px]"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center bg-secondary/30 border border-border/50 rounded-full px-4 py-1.5 focus-within:border-primary/30 transition-all">
              <Search size={14} className="text-muted-foreground" />
              <form onSubmit={handleSearch} noValidate>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-[10px] uppercase tracking-widest font-bold px-3 w-32 focus:w-48 transition-all"
                />
              </form>
            </div>

            <button onClick={() => setSearchOpen(!searchOpen)} className="hidden lg:flex text-foreground hover:text-primary transition-colors p-2">
              <Search size={18} />
            </button>

            <Link to="/wishlist" className="hidden lg:flex relative text-foreground hover:text-primary transition-colors p-2">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="hidden lg:flex relative text-foreground hover:text-primary transition-colors p-2">
              <ShoppingBag size={18} />
              {cartTotal > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center rounded-full">
                  {cartTotal}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border border-border hover:border-primary transition-all active:scale-95">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                </Link>
                <button onClick={logout} className="hidden sm:block text-muted-foreground hover:text-red-500 transition-colors p-2">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden lg:flex text-foreground hover:text-primary transition-colors p-2">
                <User size={18} />
              </Link>
            )}

            <button className="lg:hidden text-foreground p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden border-t border-border py-4 animate-in slide-in-from-top duration-300 bg-background">
            <div className="container">
              <div className="flex items-center bg-secondary/30 border border-border/50 rounded-full px-4 py-2.5 focus-within:border-primary/30 transition-all">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <form onSubmit={handleSearch} noValidate className="flex-1 flex items-center">
                  <input
                    autoFocus
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full bg-transparent border-none outline-none text-[10px] uppercase tracking-widest font-bold px-3 py-0 leading-none"
                  />
                </form>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999] bg-white overflow-y-auto pt-16">
          <div className="container py-8 flex flex-col gap-8">
            {/* Close button */}
            <button
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>

            <div className="space-y-6">
              <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/60 px-4 flex items-center gap-2">
                Navigation
              </h3>
              <nav className="flex flex-col gap-2">
                {navLinks.map((l) => (
                  <Link
                    key={l.label}
                    to={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-secondary/10 text-sm font-label font-bold uppercase tracking-wider text-foreground hover:bg-secondary/20 transition-all group"
                  >
                    {l.label}
                    <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary/60">
                  Collections
                </h3>
                {isLoading && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
              </div>
              <nav className="flex flex-col gap-2">
                <Link
                  to="/collection"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-primary/10 text-primary border border-primary/10 text-sm font-label font-bold uppercase tracking-wider shadow-sm"
                >
                  <span>All Masterpieces</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                </Link>

                <div className="grid grid-cols-1 gap-2">
                  {Array.isArray(categories) && categories.length > 0 ? (
                    categories.map((c: any) => (
                      <Link
                        key={c.id}
                        to={`/collection?category=${c.slug || c.id}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-secondary/10 text-sm font-label font-bold uppercase tracking-wider text-foreground/70 hover:text-foreground hover:bg-secondary/20 transition-all group border border-transparent hover:border-border"
                      >
                        <span>{c.name}</span>
                        <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))
                  ) : !isLoading && (
                    <div className="px-5 py-4 text-xs text-muted-foreground italic font-light">
                      No collections currently available.
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {user && (
              <div className="pt-6 border-t border-border mt-4">
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-500 py-4 rounded-xl text-[10px] font-label font-bold uppercase tracking-[0.2em] hover:bg-red-100 transition-all"
                >
                  <LogOut size={16} /> Secure Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
