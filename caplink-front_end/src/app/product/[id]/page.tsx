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
      <div className="container mx-auto p-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    );
  }

  if (!product) return <p className="p-8 text-center">Produto não encontrado</p>;

  return <ProductDetails product={product} user={user} />;
}
