import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const fetchModuleData = async (moduleName: string) => {
  const { data } = await api.get(`/${moduleName}`);
  return data?.data || [];
};

export const useBanners = () => {
  return useQuery({
    queryKey: ['banners'],
    queryFn: () => fetchModuleData('banners'),
  });
};

export const useTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: () => fetchModuleData('testimonials'),
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => fetchModuleData('brands'),
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => fetchModuleData('services'),
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchModuleData('categories'),
  });
};
