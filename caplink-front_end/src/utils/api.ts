'use client';
import axios from 'axios';
import { getToken } from './auth';

interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  active?: boolean;
  page?: number;
  limit?: number;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // coloque a URL do Railway
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `${token}`;
  return config;
});

// Função para pegar todos os produtos
export const getProducts = async (params: GetProductsParams = {}) => {
  try {
    const res = await api.get('/api/product/getProducts', {
      params: {
        search: params.search || '',
        category: params.category || '',
        minPrice: params.minPrice || 0,
        maxPrice: params.maxPrice || 999999,
        active: params.active ?? true,
        page: params.page || 1,
        limit: params.limit || 10,
      },
    });
    console.log('Produtos buscados com sucesso:', res.data);
    return res.data;
  } catch (err: any) {
     console.error('Erro ao buscar produtos:', err.message);

    // Retorna objeto amigável em vez de lançar
    return {
      success: false,
      data: [],
      message: 'Não foi possível carregar os produtos. Tente novamente mais tarde.',
    };
  }
};

export const getItemsInCart = async () => {
  const res = await api.get("api/cart/getCart");
  console.log("Itens no carrinho:", res.data);
  return res.data;
}

export const getProductById = async (product_id: number) => {
  const res = await api.get(`api/product/getProductById/${product_id}`);
  return res.data;
};

export const addToCart = async (product_id: number, quantity: number ) => {
  const res = await api.post("api/cart/addProductCart", { product_id, quantity });
  return res.data;
};

export const toggleFavorite = async (product_id: number) => {
  const res =  await api.post("api/favorite/addFavorite", { product_id });
  return res.data;
};

export const getFavorites = async () => {
  const res = await api.get("api/favorite/getFavorites");
  return res.data;
};

export const removeFavorite = async (favoriteId: number) => {
  console.log("Removendo favorito com ID:", favoriteId);
  const res = await api.delete("api/favorite/removeFavorite", {
    data: { favoriteId },
  });
  return res.data;
};
