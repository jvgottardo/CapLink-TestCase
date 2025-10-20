"use client";

import { useEffect, useState } from "react";
import { addToCart, toggleFavorite, removeFavorite, getFavorites } from "../utils/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";


interface User {
  name: string;
  user_id: number;
  email: string;
}

interface ProductDetailsProps {
  product: {
    product_id: number;
    name: string;
    brand?: string;
    description?: string;
    price: number;
    image_url?: string;
    quantity?: number
    vendor?: User; // opcional: se você já retorna o vendedor junto do produto
    active?: boolean
  };
  user: User;
}


export default function ProductDetails({ product, user }: ProductDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // Adiciona ao carrinho
  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product.product_id, quantity);
      window.location.href = "/cart";
      toast.success("Produto adicionado ao carrinho!");
    } catch (error: any) {
      if (error.response?.data?.error === "Token inválido ou expirado") {
        toast.error("Você precisa fazer login para adicionar ao carrinho.");
      }
      toast.error("Erro ao adicionar ao carrinho.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Favoritar ou desfavoritar
  const handleToggleFavorite = async () => {
    try {
      if (isFavorite && favoriteId) {
        // Se já for favorito, remove usando favoriteId
        await removeFavorite(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        toast.info("Produto removido dos favoritos!");
      } else {
        // Caso não seja favorito, adiciona
        const res = await toggleFavorite(product.product_id);
        setIsFavorite(true);
        // Verifica se o produto já está nos favoritos retornados
        const favItem = res.favorites?.find(
          (fav: any) =>
            fav.product_id === product.product_id ||
            fav.products?.product_id === product.product_id
        );
        if (favItem) {
          setIsFavorite(true);
          setFavoriteId(favItem.favorite_id);
          toast.success("Produto adicionado aos favoritos!");
        }
      }
    } catch (err: any) {
      if (err.response?.data?.error === "Token inválido ou expirado") {
        toast.error("Você precisa fazer login para adicionar ao favoritos.");
      }
      console.error("Erro ao atualizar favorito:", err);
      toast.error("Erro ao atualizar favorito.");
    }
  };

  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        const res = await getFavorites();
        const favItem = res.favorites?.find(
          (fav: any) =>
            fav.product_id === product.product_id ||
            fav.products?.product_id === product.product_id
        );
        if (favItem) {
          setIsFavorite(true);
          setFavoriteId(favItem.favorite_id);
        }
      } catch (err: any) {
        console.error("Erro ao buscar favoritos:", err);
      } finally {
        setLoading(false);
      }
    };
    checkIfFavorite();
  }, [product.product_id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Skeleton da imagem */}
        <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg" />
        {/* Skeleton do conteúdo */}
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded" />
          <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded" />
          <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">

      {/* botao de boltar  */}
      <div className="px-8 flex flex-col gap-4 md:col-span-2 ">
        <Button
          onClick={() => router.push('/')}
          variant="outline"
          className="flex items-center gap-2 w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-md overflow-hidden md:grid md:grid-cols-2">

        {/* Imagem */}
        <div className="flex justify-center items-center bg-gray-100 p-8">
          <img
            src={product.image_url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full max-w-md h-auto object-contain rounded-lg"
          />
        </div>

        {/* Informações */}
        <div className="flex flex-col justify-between p-8">
          <div className="space-y-4">
            <Label className="text-sm text-gray-500 uppercase tracking-wide">
              Detalhes do Produto
            </Label>

            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {product.brand && (
              <p className="text-sm text-gray-500">Marca: {product.brand}</p>
            )}

            <p className="text-4xl font-semibold text-green-600">
              R$ {Number(product.price).toFixed(2)}
            </p>

            {product.description && (
              <p className="text-gray-700 leading-relaxed border-t pt-4">
                {product.description}
              </p>
            )}

            {/* Seleção de quantidade */}
            {product.quantity && (
              <div className="mt-4">
                <Label className="text-sm text-gray-500">Quantidade</Label>
                <input
                  type="number"
                  min={1}
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border rounded px-3 py-1 w-24 mt-1"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Disponível em estoque: {product.quantity}
                </p>
              </div>
            )}

            {/* Info do vendedor */}
            <div className="border rounded-lg p-4 bg-gray-50 mt-4">
              <p className="text-sm text-gray-500">Vendido por</p>
              <p className="text-lg font-semibold text-gray-800">
                {user?.name || "Vendedor não informado"}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            {product.active ? (
              <>
                <Button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex items-center cursor-pointer justify-center gap-2 w-full md:w-auto bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addingToCart ? "Adicionando..." : "Adicionar ao carrinho"}
                </Button>

                <Button
                  onClick={handleToggleFavorite}
                  variant={isFavorite ? "default" : "outline"}
                  className={`flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer ${isFavorite
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "border-red-500 text-red-500"
                    }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isFavorite ? "fill-current text-white" : "text-red-500"
                      }`}
                  />
                  {isFavorite ? "Favoritado" : "Favoritar"}
                </Button>
              </>
            ) : (
              <div className="w-full text-center border border-red-500 text-red-600 font-semibold py-3 rounded-lg bg-red-50">
                Produto desativado no momento
              </div>
            )}
          </div>


          {/* Garantia / info adicional */}
          <div className="mt-8 border-t pt-6 text-sm text-gray-500">
            <p>✔ Garantia de 30 dias direto com o vendedor</p>
            <p>🚚 Frete grátis para pedidos acima de R$ 200</p>
            <p>💳 Parcele em até 12x sem juros</p>
          </div>
        </div>
      </div>
    </div>
  );
}
