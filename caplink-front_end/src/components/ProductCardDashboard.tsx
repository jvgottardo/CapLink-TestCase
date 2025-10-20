"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { activateProduct, deactivateProduct, editProduct, deleteProduct } from "../utils/api"; // função da API que você precisa criar
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface Product {
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  category?: string;
  brand?: string;
  active?: boolean;
  quantity?: number;
}

interface ProductCardProps {
  product: Product;
  refreshProducts: () => void;
}

export default function ProductCardDashboard({ product, refreshProducts }: ProductCardProps) {
  const router = useRouter();
  const [form, setForm] = useState({ ...product });
  const [isActive, setIsActive] = useState(product.active);
  const [loading, setLoading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(product.image_url || null);
  const [open, setOpen] = useState(false);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(product.image_url || null);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);

    try {
      if (isActive) {
        // chama a rota de desativar
        await deactivateProduct(product.product_id)
        setIsActive(false);
        toast.success("Produto desativado com sucesso!");
      } else {
        // chama a rota de ativar
        await activateProduct(product.product_id)
        setIsActive(true);
        toast.success("Produto ativado com sucesso!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao alterar status do produto");
    } finally {
      setLoading(false);
    }
  };


  const handleEditProduct = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description || "");
      formData.append("price", String(form.price));
      if (form.brand) formData.append("brand", form.brand);
      if (form.category) formData.append("category", form.category);

      if (file) {
        formData.append("image", file);
      }

      await editProduct(formData, product.product_id);

      toast.success("Produto atualizado com sucesso!");
      refreshProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar produto");
    } finally {
      if (file && preview) {
        URL.revokeObjectURL(preview);
      }
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await deleteProduct(product.product_id);
      toast.success("Produto deletado com sucesso!");
      refreshProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar produto");
    } finally {
      setLoadingDelete(false);

    }
  };
  return (
    <div
      className="border p-4 rounded-lg shadow hover:shadow-lg transition cursor-pointer relative"
    >
      <Badge
        className="absolute right-6 top-6"
      >
        {product.quantity}
      </Badge>

      <img
        src={product.image_url && product.image_url.trim() !== "" ? product.image_url : "/placeholder.jpg"}
        alt={product.name}
        className="w-full h-48 object-cover mb-2"
      />
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg">{product.name}</h2>
        <Badge
          className={isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}
        >
          {isActive ? "Ativo" : "Desativado"}
        </Badge>
      </div>

      <p className="text-gray-700">{product.brand}</p>
      <p className="text-gray-700">{product.description}</p>
      <p className="text-gray-700">{product.category}</p>
      <p className="text-green-600 font-bold">R${product.price}</p>

      {/* modal edicao */}
      <Dialog open={open} onOpenChange={(state) => {
        setOpen(state);
        if (!state) {
          setForm({ ...product });
          setFile(null);
          if (preview && preview !== product.image_url) URL.revokeObjectURL(preview);
          setPreview(product.image_url || null);
        }
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-full cursor-pointer">Editar Produto</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <div>

              <Label htmlFor="name" className="mb-1"> Nome</Label>
              <Input
                type="text"
                placeholder="Nome"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-1"> Descrição</Label>
              <Input
                type="text"
                id="description"
                placeholder="Descrição"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border p-2 rounded"
              />
            </div>

            <div>

              <Label htmlFor="price" className="mb-1"> Preço</Label>
              <Input
                type="number"
                id="price"
                placeholder="Preço"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
                className="border p-2 rounded"
              />
            </div>
            <div>

              <Label htmlFor="brand" className="mb-1"> Marca</Label>
              <Input
                type="text"
                id="brand"
                placeholder="Marca"
                value={form.brand || ""}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
            <div>

              <Label htmlFor="category" className="mb-1"> Categoria</Label>
              <Input
                type="text"
                id="category"
                placeholder="Categoria"
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border p-2 rounded"
              />
            </div>
            <div>

              <Label htmlFor="quantity" className="mb-1"> Quantidade</Label>
              <Input
                type="number"
                id="quantity"
                placeholder="Quantidade"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="border p-2 rounded"
              />
            </div>
            <div>

              <Label className="flex flex-col cursor-pointer">
                <div className="text-sm font-medium ">Imagem (substitui a atual)</div>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
                {preview && (
                  <img src={preview} alt="preview" className="w-40 h-40 object-cover mt-2 rounded" />
                )}
              </Label>
            </div>

            <Button className="cursor-pointer" onClick={handleEditProduct} disabled={loading}>
              {loading ? "Atualizando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button
        variant={isActive ? "default" : "default"}
        size="sm"
        className="mt-2 w-full cursor-pointer bg-amber-500"
        onClick={handleToggleStatus}
        disabled={loading}
      >
        {loading ? "Alterando..." : isActive ? "Desativar" : "Ativar"}
      </Button>

      <Button
        variant={"destructive"}
        size="sm"
        className="mt-2 w-full cursor-pointer"
        onClick={handleDelete}
        disabled={loadingDelete}
      >
        {loadingDelete ? "Deletando..." : "Excluir"}
      </Button>
    </div>
  );
}
