"use client";

import { useEffect, useState } from "react";
import { getOrders } from "../../utils/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  order_id: string;
  total: number;
  created_at: string;
}

interface PaginatedResponse {
  orders: Order[];
  totalPages: number;
  currentPage: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const limit = 5;

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Você precisa estar logado para ver seus pedidos.");
        return;
      }

      const res: PaginatedResponse = await getOrders(page, limit);
      setOrders(res.orders || []);
      setTotalPages(res.totalPages || 1);
    } catch (error: any) {
      if (error?.response?.data?.error === "Token inválido ou expirado") {
        toast.error("Sessão expirada. Faça login novamente.");
      } else {
        toast.error("Erro ao buscar pedidos.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleViewDetails = (order_id: string) => {
    router.push(`/order/${order_id}`);
  };
  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Button>

      <h1 className="text-3xl font-bold mb-6">Meus Pedidos</h1>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-center">
          Você ainda não possui pedidos.
        </p>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {orders.map((order) => (
              <Card key={order.id} className="shadow-sm">
                <CardHeader className="flex justify-between items-center flex-row">
                  <CardTitle className="text-lg font-semibold">
                    Pedido #{order.order_id}
                  </CardTitle>
                  <Badge className="bg-green-100 text-green-800">
                    Concluído
                  </Badge>
                </CardHeader>

                <CardContent className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Realizado em:{" "}
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-base font-medium mt-1">
                      Total: R$ {Number(order.total).toFixed(2)}
                    </p>
                  </div>
                  <Button onClick={() => handleViewDetails(order.order_id)} className="cursor-pointer" variant="outline" size="sm">
                    Ver detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* PAGINAÇÃO */}
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={page === 1 || loading}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={page === totalPages || loading}

            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
