"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "../../../utils/api";
import ProductDetails from "../../../components/ProductDetail";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getProductById(Number(id))
        .then((data) => {
          setUser(data.product.users)
          setProduct(data.product);
        })
        .catch((err) => {
          console.error("Erro ao buscar produto:", err);
        })
        .finally(() => {
          setLoading(false);
        });

    }
  }, [id]);

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

  if (!product) return <p className="p-8 text-center">Produto não encontrado</p>;

  return <ProductDetails product={product} user={user} />;
}
