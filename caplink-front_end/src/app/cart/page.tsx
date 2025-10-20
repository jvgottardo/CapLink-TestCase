"use client";

import { useEffect, useState } from "react";
import { getItemsInCart, removeFromCart } from "../../utils/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  cart_item_id: number;
  product: {
    product_id: number;
    name: string;
    price: string; // veio como string da API
    image_url?: string | null;
  };
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await getItemsInCart();
      setCartItems(res.cart.items || []);
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
      toast.error("Erro ao carregar carrinho");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (product_id: number) => {
    try {
      await removeFromCart(product_id);
      setCartItems((prev) => prev.filter((item) => item.product.product_id !== product_id));
      window.location.reload();
      toast.success("Produto removido do carrinho!");
    } catch (err) {
      console.error("Erro ao remover produto:", err);
      toast.error("Erro ao remover produto do carrinho");
    }
  };


  const totalPrice = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.product.price) * item.quantity,
    0
  );

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4 animate-pulse border p-4 rounded">
            <div className="w-24 h-24 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/4 bg-gray-200 rounded" />
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (

    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-10 flex flex-col gap-4 md:col-span-2 ">
        <Button
          onClick={() => { window.location.href = "/"; }}
          variant="outline"
          className="flex items-center gap-2 w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </div>
      <h1 className="text-2xl font-bold mb-6">Meu Carrinho</h1>

      {cartItems.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cart_item_id}
              className="flex items-center justify-between border p-4 rounded hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.product.image_url || "/placeholder.jpg"}
                  alt={item.product.name}
                  className="w-24 h-24 object-contain rounded"
                />
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-gray-500">
                    {item.quantity} x R$ {parseFloat(item.product.price).toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  R$ {(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </p>
                <Button
                  onClick={() => handleRemoveItem(item.product.product_id)}
                  variant="outline"
                  className="p-2 hover:bg-red-600 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Resumo do pedido */}
          <div className="mt-6 flex justify-end items-center gap-4">
            <p className="text-xl font-semibold">Total: R$ {totalPrice.toFixed(2)}</p>
            <Button onClick={() => router.push("/checkout")} className="bg-green-600 hover:bg-green-700 cursor-pointer">Finalizar Compra</Button>
          </div>
        </div>
      )}
    </div>
  );
}
