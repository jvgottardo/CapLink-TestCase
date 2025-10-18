"use client";

import { useState } from "react";
import { addToCart, toggleFavorite } from "../utils/api";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

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
    vendor?: User; // opcional: se você já retorna o vendedor junto do produto
  };
  user: User;
}


export default function ProductDetails({ product, user }: ProductDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Adiciona ao carrinho
  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product.product_id);
      toast.success("Produto adicionado ao carrinho!");
    } catch (error) {
      toast.error("Erro ao adicionar ao carrinho.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Favoritar ou desfavoritar
  const handleToggleFavorite = async () => {
    try {
      const res = await toggleFavorite(product.product_id);
      setIsFavorite(res.isFavorite);
      toast.success(
        res.isFavorite
          ? "Adicionado aos favoritos!"
          : "Removido dos favoritos!"
      );
    } catch {
      toast.error("Erro ao atualizar favorito.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
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
