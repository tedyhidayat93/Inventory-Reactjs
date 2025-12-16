import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from "@/lib/axios"
import { AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await axiosInstance.post(`/auth/login`, credentials);
      return data.data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      console.log('token:', localStorage.getItem('token'));
      queryClient.setQueryData(['user'], data.user);
    },
  });

  // Register mutation
  const registerMutation = useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: async (userData) => {
      const { data } = await axiosInstance.post(`/auth/register`, userData);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token from localStorage:', token);
        
        if (!token) {
          console.log('No token found in localStorage');
          return null;
        }

        console.log('Making request to:', `/auth/me`);
        
        const response = await axiosInstance.get(`/auth/me`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true // If your API uses cookies
        });
        
        console.log('Auth response:', response);
        return response.data;
      } catch (error) {
        if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
          const axiosError = error as AxiosError;
          console.error('Auth error details:', {
            status: axiosError.response?.status,
            statusText: axiosError.response?.statusText,
            data: axiosError.response?.data,
            headers: axiosError.response?.headers,
          });
        } else {
          console.error('Unexpected error:', error);
        }
        // Clear invalid token
        localStorage.removeItem('token');
        return null;
      }
    },
    enabled: !!localStorage.getItem('token'),
    retry: 1, // Only retry once on failure
  });

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['user'], null);
  };

  return {
    user,
    isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
};