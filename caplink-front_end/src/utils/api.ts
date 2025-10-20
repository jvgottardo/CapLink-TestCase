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
  vendorId?: number;
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // JWT expirou ou inválido
      localStorage.removeItem("token"); // limpa o token
      console.log("Sessão expirada, redirecionando para a página inicial");
      window.location.href = "/"; // redireciona para home
    }
    return Promise.reject(error);
  }
);


// products
export const addProduct = async (formData: FormData) => {
  const { data } = await api.post("api/product/addProduct", formData, {
    headers: { "Content-Type": "multipart/form-data" }, // mantém multipart
  });
  return data;
};

export const getProductById = async (product_id: number) => {
  const res = await api.get(`api/product/getProductById/${product_id}`,);
  return res.data;
};

export const editProduct = async (formData: FormData, product_id: number) => {
  const { data } = await api.put(`api/product/editProduct/${product_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  return data;
};

export const deleteProduct = async (product_id: number) => {
  const res = await api.delete("api/product/deleteProduct", {
    data: { product_id } 
  });
  return res.data;
};



export const deactivateProduct = async (product_id: number) => {
  const res =  await api.put("api/product/deactivateProduct", { product_id });
  return res.data;
};

export const activateProduct = async (product_id: number) => {
  const res =  await api.put("api/product/activateProduct", { product_id });
  return res.data;
};

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
        limit: params.limit || 12,
        vendorId: params.vendorId || undefined,
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

export const getProductsByUser = async (page:number, limit = 12) => {
  const res = await api.get(`api/product/getProductsByUser?page=${page}&limit=${limit}`);
  return res.data;
};

export const importProducts = async (formData: FormData) => {
  const res = await api.post(`api/product/importProducts`, formData, {
     headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

//vendor dashboard
export const dashboard = async () => {
  const res = await api.get(`api/dashboard/vendor`);
  return res.data;
};

//cart
export const getItemsInCart = async () => {
  const res = await api.get("api/cart/getCart");
  console.log("Itens no carrinho:", res.data);
  return res.data;
}

export const addToCart = async (product_id: number, quantity: number ) => {
  const res = await api.post("api/cart/addProductCart", { product_id, quantity });
  return res.data;
};

export const removeFromCart = async (product_id: number) => {
  const res = await api.delete("api/cart/removeProductCart", {
    data: { product_id } 
  });
  return res.data;
};


//favorites

export const toggleFavorite = async (product_id: number) => {
  const res =  await api.post("api/favorite/addFavorite", { product_id });
  return res.data;
};

export const getFavorites = async (page = 1, limit = 8) => {
  const res = await api.get(`api/favorite/getFavorites?page=${page}&limit=${limit}`);
  return res.data;
};


export const removeFavorite = async (favoriteId: number) => {
  const res = await api.delete("api/favorite/removeFavorite", {
    data: { favoriteId },
  });
  return res.data;
};

//checkout
export const createOrder = async () => {
  const res = await api.post("api/order/checkout");
  return res.data;
};

export const getOrders = async (page = 1, limit = 10) => {
  const res = await api.get(`api/order/getOrders?page=${page}&limit=${limit}`);
  return res.data;
}

export const getOrderById = async (order_id: number) => {
  const res = await api.get(`/api/order/getOrderDetails/${order_id}`);
  return res.data;
};

// utils/api.ts
export const getVendors = async () => {
  const res = await api.get("/api/auth/vendors");
  return res.data.vendors; 
};
