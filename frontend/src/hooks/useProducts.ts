import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const normalizeProduct = (p: any) => {
  let images = p.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [];
    }
  }
  if (!Array.isArray(images)) {
    images = p.image ? [p.image] : [];
  }

  return {
    ...p,
    images,
    specs: {
      caseSize: p.caseSize || '40mm',
      movement: p.movement || 'Automatic',
      waterResistance: p.waterResistance || '5 ATM',
      powerReserve: p.powerReserve || '48 Hours',
      caseMaterial: p.caseMaterial || 'Steel',
    }
  };
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      // Handle both plain array and { success, data: [...] } response shapes
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      return list.map(normalizeProduct);
    },
    // Return empty array on error instead of crashing
    placeholderData: [],
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      const product = data?.data ?? data;
      return normalizeProduct(product);
    },
    enabled: !!id,
  });
};
