"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFavorites, removeFavorite } from "../../utils/api";

interface FavoriteProduct {
  favorite_id: number;
  product_id: number;
  products: {
    product_id: number;
    name: string;
    price: number;
    image_url: string;
    brand: string;
    category: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8; // 🧠 quantos favoritos por página

  // 🔹 Buscar lista de favoritos com paginação
  const fetchFavorites = async (currentPage: number) => {
    try {
      setLoading(true);
      const data = await getFavorites(currentPage, limit);

      if (data?.error === "Token inválido ou expirado") {
        setErrorMessage("Você precisa fazer login para ver seus favoritos.");
        setFavorites([]);
        return;
      }

      setFavorites(data.favorites || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      setErrorMessage("Erro ao carregar seus favoritos.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Remover favorito
  const handleRemoveFavorite = async (favoriteId: number) => {
    if (!confirm("Deseja remover este item dos favoritos?")) return;

    try {
      setDeletingId(favoriteId);
      await removeFavorite(favoriteId);
      setFavorites((prev) =>
        prev.filter((fav) => fav.favorite_id !== favoriteId)
      );
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      alert("Erro ao remover favorito");
    } finally {
      setDeletingId(null);
    }
  };

  // 🔹 Trocar de página
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  useEffect(() => {
    fetchFavorites(page);
  }, [page]);

  // 🔹 Exibe mensagem se usuário não logado
  if (errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-xl font-semibold mb-2 text-red-500">⚠️ {errorMessage}</h2>
        <p className="text-gray-500">
          Faça login para acessar sua lista de desejos.
        </p>
      </div>
    );
  }

  // 🔹 Estado de carregamento
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mb-2" />
        <p>Carregando seus favoritos...</p>
      </div>
    );
  }

  // 🔹 Nenhum favorito
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-semibold mb-2">Nenhum favorito 💔</h2>
        <p className="text-gray-500">
          Adicione produtos à sua lista de desejos!
        </p>
      </div>
    );
  }

  // 🔹 Renderiza favoritos
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Meus Favoritos ❤️</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((fav) => (
          <Card
            key={fav.favorite_id}
            className="p-3 relative flex flex-col hover:shadow-md transition"
          >
            <div className="relative w-full h-48 mb-3">
              <Image
                src={fav.products.image_url || "/placeholder.jpg"}
                alt={fav.products.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold truncate">
                {fav.products.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {fav.products.brand} • {fav.products.category}
              </p>
              <p className="text-primary font-bold mt-1">
                R$ {fav.products.price}
              </p>
            </div>

            <Button
              onClick={() => handleRemoveFavorite(fav.favorite_id)}
              variant="destructive"
              disabled={deletingId === fav.favorite_id}
              className="mt-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {deletingId === fav.favorite_id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Removendo...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Remover
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {/* 🔹 Paginação */}
      <div className="flex justify-center items-center mt-8 gap-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </Button>

        <span className="text-gray-700">
          Página {page} de {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          className="flex items-center gap-2"
        >
          Próximo <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
