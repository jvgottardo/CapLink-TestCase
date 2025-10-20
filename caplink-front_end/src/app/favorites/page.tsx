"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getFavorites, removeFavorite } from "../../utils/api";
import { toast } from "sonner";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;


  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const res = await getFavorites(page, limit);
        setFavorites(res.favorites);
        setTotalPages(res.totalPages);
      } catch (err: any) {
        console.error(err);
        toast.error("Você precisa fazer login para ver seus favoritos.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [page]);

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      setDeletingId(favoriteId);
      await removeFavorite(favoriteId);
      setFavorites((prev) =>
        prev.filter((fav) => fav.favorite_id !== favoriteId)
      );
      toast.success("O item foi removido da sua lista com sucesso.");
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Não foi possível remover o item.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando favoritos...</p>
      </div>
    );

  if (favorites.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <h2 className="text-xl font-semibold mb-2">Nenhum favorito ainda 💔</h2>
        <p className="text-gray-500">Adicione produtos aos seus favoritos!</p>
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Meus Favoritos ❤️</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favorites.map((fav) => (
          <Card key={fav.favorite_id} className="shadow-md w-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <img
                src={fav.products.image_url || "/placeholder.jpg"}
                alt={fav.products.name}
                className="w-full h-60 object-cover rounded-md mb-3"
              />
              <h2 className="text-lg font-semibold">{fav.products.name}</h2>
              <p className="text-sm text-gray-500 line-clamp-2">
                {fav.products.description} -      {fav.products.brand}
              </p>
              <p className="mt-2 text-green-600 font-bold">R$ {fav.products.price}</p>
            </CardContent>

            <CardFooter className="flex justify-end ">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    disabled={deletingId === fav.favorite_id}
                  >
                    {deletingId === fav.favorite_id
                      ? "Removendo..."
                      : "Remover"}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Remover este produto dos favoritos?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={() => handleRemoveFavorite(fav.favorite_id)}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Paginação simples */}
      <div className="flex justify-center mt-6 gap-3">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Anterior
        </Button>
        <span className="text-sm text-gray-600 mt-2">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}

