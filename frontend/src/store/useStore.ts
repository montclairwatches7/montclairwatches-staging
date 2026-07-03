import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export interface CartItem {
  productId: string;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  wishlist: string[];
  searchQuery: string;
  searchOpen: boolean;
  setCart: (cart: CartItem[]) => void;
  setWishlist: (wishlist: string[]) => void;
  addToCart: (productId: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSearchOpen: (open: boolean) => void;
  coupon: {
    code: string;
    discount_amount: number;
  } | null;
  setCoupon: (coupon: { code: string; discount_amount: number } | null) => void;
  cartCount: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: (() => {
    const user = localStorage.getItem('user');
    if (user) return [];
    const guestCart = localStorage.getItem('guest_cart');
    return guestCart ? JSON.parse(guestCart) : [];
  })(),
  wishlist: [],
  searchQuery: '',
  searchOpen: false,
  coupon: null,
  setCart: (cart) => set({ cart }),
  setWishlist: (wishlist) => set({ wishlist }),
  setCoupon: (coupon) => set({ coupon }),
  addToCart: async (productId) => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
      try {
        await api.post('/store/cart/add', { productId });
        set((state) => {
          const existing = state.cart.find((i) => i.productId === productId);
          toast({ title: 'Logistics Updated', description: 'Item added to your distribution bag.' });
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { productId, quantity: 1 }] };
        });
      } catch (err: any) { 
        console.error(err); 
        const errMsg = err.response?.data?.message || 'Failed to update distribution bag.';
        toast({ title: 'Logistics Error', description: errMsg, variant: 'destructive' });
      }
    } else {
      set((state) => {
        const existing = state.cart.find((i) => i.productId === productId);
        let newCart;
        if (existing) {
          newCart = state.cart.map((i) =>
            i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newCart = [...state.cart, { productId, quantity: 1 }];
        }
        localStorage.setItem('guest_cart', JSON.stringify(newCart));
        toast({ title: 'Logistics Updated', description: 'Item added to your distribution bag.' });
        return { cart: newCart };
      });
    }
  },
  removeFromCart: async (productId) => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
      try {
        await api.delete(`/store/cart/${productId}`);
        set((state) => ({
          cart: state.cart.filter((i) => i.productId !== productId),
        }));
      } catch (err) { console.error(err); }
    } else {
      set((state) => {
        const newCart = state.cart.filter((i) => i.productId !== productId);
        localStorage.setItem('guest_cart', JSON.stringify(newCart));
        return { cart: newCart };
      });
    }
  },
  updateQuantity: async (productId, quantity) => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
      try {
        await api.put('/store/cart/quantity', { productId, quantity });
        set((state) => ({
          cart: quantity <= 0
            ? state.cart.filter((i) => i.productId !== productId)
            : state.cart.map((i) =>
                i.productId === productId ? { ...i, quantity } : i
              ),
        }));
      } catch (err) { console.error(err); }
    } else {
      set((state) => {
        const newCart = quantity <= 0
          ? state.cart.filter((i) => i.productId !== productId)
          : state.cart.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            );
        localStorage.setItem('guest_cart', JSON.stringify(newCart));
        return { cart: newCart };
      });
    }
  },
  clearCart: async () => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
      try {
        await api.delete('/store/cart');
        set({ cart: [] });
      } catch (err) { console.error(err); }
    } else {
      localStorage.removeItem('guest_cart');
      set({ cart: [] });
    }
  },
  toggleWishlist: async (productId) => {
    try {
      await api.post('/store/wishlist/toggle', { productId });
      set((state) => {
        const isWished = state.wishlist.includes(productId);
        toast({ 
          title: isWished ? 'Removed from Archive' : 'Archived Successfully', 
          description: isWished ? 'Item removed from your private gallery.' : 'Item safely stored in your private gallery.' 
        });
        return {
          wishlist: isWished
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        };
      });
    } catch (err: any) { 
      console.error(err); 
      const errMsg = err.response?.data?.message || 'Communication with central vault interrupted.';
      toast({ title: 'Archival Failed', description: errMsg, variant: 'destructive' });
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),
}));
