import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchModuleData = async (moduleName: string) => {
  try {
    const { data } = await api.get(`/${moduleName}`);
    // Handle both plain array and { success, data: [...] } response shapes
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
  } catch {
    return [];
  }
};

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => fetchModuleData('banners'),
    placeholderData: [],
  });
};

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => fetchModuleData('testimonials'),
    placeholderData: [],
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => fetchModuleData('brands'),
    placeholderData: [],
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => fetchModuleData('services'),
    placeholderData: [],
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchModuleData('categories'),
    placeholderData: [],
  });
};
