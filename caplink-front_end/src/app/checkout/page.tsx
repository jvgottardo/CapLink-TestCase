"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getItemsInCart, createOrder } from "../../utils/api";
import { useRouter } from "next/navigation";

interface CartItem {
  cart_item_id: number;
  product_id: number;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getItemsInCart();
        console.log(res);
        setCartItems(res.cart.items || []);
      } catch (err: any) {
        console.error(err);

        if (err.response?.data?.error === "Token inválido ou expirado") {
          toast.error("Você precisa fazer login para finalizar a compra.");
        }
        toast.error("Erro ao carregar carrinho");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const total = cartItems.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      await createOrder();
      toast.success("Sua compra foi concluída com sucesso 🎉");
      router.push("/orders");
    } catch (err) {
      console.error(err);

      toast.error("Não foi possível finalizar a compra");
    } finally {
      setProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando carrinho...</p>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-2">Carrinho vazio 🛒</h2>
        <p className="text-gray-500">Adicione produtos para continuar.</p>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4 bg-gray-50 rounded-lg mt-10 shadow">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="rounded-lg bg-white shadow-md">
        {cartItems.map((item) => (
          <Card key={item.cart_item_id} className="bg-white border-none shadow-none rounded-none mx-2">
            <CardContent className="flex items-center gap-2 px-4 py-2">
              <img
                src={item.product.image_url || "/placeholder.jpg"}
                alt={item.product.name}
                className="w-20 h-20 rounded object-cover"
              />
              <div className="flex-1">
                <h2 className="font-semibold">{item.product.name}</h2>
                <p className="text-sm text-gray-500">
                  Quantidade: {item.quantity}
                </p>
              </div>
              <p className="font-bold">
                R$ {(Number(item.product.price) * item.quantity)}
              </p>
            </CardContent>
            <hr />
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <h1 className="text-xl font-bold mb-6">Total</h1>
        <CardContent className="flex justify-between items-center">
          <span className="text-lg font-semibold">
            R$ {total.toFixed(2)}
          </span>
          <Button
            className="ml-auto cursor-pointer bg-green-600 hover:bg-green-700"
            disabled={processing}
            onClick={handleCheckout}
          >
            {processing ? "Processando..." : "Finalizar Compra"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
