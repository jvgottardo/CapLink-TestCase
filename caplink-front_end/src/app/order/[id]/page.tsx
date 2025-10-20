"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "../../../utils/api";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";

interface OrderItem {
  order_items_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image_url: string;
  brand?: string;
}

interface OrderDetail {
  order_id: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderById(Number(id));
        console.log(res)
        setOrder(res.order);
      } catch (error: any) {
        if (error?.response?.data?.error === "Token inválido ou expirado") {
          toast.error("Sessão expirada. Faça login novamente.");
          router.push("/login");
        } else {
          toast.error("Erro ao carregar detalhes do pedido.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center text-muted-foreground">
        Pedido não encontrado.
      </div>
    );
  }

  const totalItens = order.items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Botão de voltar */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <h1 className="text-3xl font-bold mb-6">
        Detalhes do Pedido #{order.order_id}
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações do Pedido</span>
            <Badge className="bg-green-100 text-green-800">Concluído</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Realizado em:{" "}
            {(order.created_at)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Quantidade de itens: {totalItens}
          </p>
          <p className="text-base font-semibold mt-3">
            Total: R$ {Number(order.total)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.order_items_id}
              className="flex items-center justify-between border-b pb-3 last:border-none"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image_url || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-16 h-16 rounded-md object-cover border"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.brand}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quantidade: {item.quantity}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  R$ {Number(item.price)}
                </p>
                <p className="text-sm font-semibold">
                  Subtotal: R$ {(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
