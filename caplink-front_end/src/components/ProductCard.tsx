"use client";

import { useRouter } from "next/navigation";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  brand?: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${product.product_id}`);
  }

  return (
    <div
      className="border p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer"
      onClick={handleClick}
    >
      <img
        src={product.image_url && product.image_url.trim() !== "" ? product.image_url : "/placeholder.jpg"}
        alt={product.name}
        className="w-full h-48 object-cover mb-2"
      />
      <h2 className="font-bold text-lg">{product.name}</h2>
      <p className="text-gray-700">{product.brand}</p>
      <p className="text-gray-700">{product.description}</p>
      <p className="text-gray-700">{product.category}</p>
      <p className="text-green-600 font-bold">R${product.price}</p>
    </div>
  );
}
