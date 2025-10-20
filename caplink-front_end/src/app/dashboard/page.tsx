"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeactivateAccountButton from "@/src/components/DeactivateAccountButton";
import { toast } from "sonner";
import { getProductsByUser, addProduct, dashboard } from "../../utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ProductCardDashboard from "@/src/components/ProductCardDashboard";
import Image from "next/image";
import UploadCSVButton from "@/src/components/UploadCSVButton";
import { editProfile, getCurrentUser } from "../../utils/auth";
import ProductFilters from "@/src/components/ProductFilters";

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

interface BestProduct {
  name: string;
  price: string;
  totalSold: number;
}

interface VendorDashboardData {
  totalSold: number;
  totalRevenue: number;
  productCount: number;
  bestProduct: BestProduct;
  activeProductCount: number;
  inactiveProductCount: number;
}

export default function VendorDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [data, setData] = useState<VendorDashboardData>();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser(token)
        .then((user) => setCurrentUser(user))
        .catch((err) => console.error("Erro ao buscar dados do usuário:", err));
    }
  }, []);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    quantity: "",
    category: "",
    image: null as File | null,
  });

  const fetchProducts = async (filters: Record<string, any> = {}) => {
    setLoading(true);
    try {
      const res = await getProductsByUser(page, 12, filters); // passa filtros
      setProducts(res.products);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar produtos do vendedor");
    } finally {
      setLoading(false);
    }
  };


  const fetchDataDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboard();
      setData(res);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar dados do vendedor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(filters);
    fetchDataDashboard();
  }, [filters, page]);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setForm({ ...form, image: file });

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };


  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }



    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    if (form.brand) formData.append("brand", form.brand);
    if (form.quantity) formData.append("quantity", form.quantity);
    if (form.category) formData.append("category", form.category);
    if (form.image) formData.append("image", form.image);

    try {
      await addProduct(formData);
      toast.success("Produto adicionado com sucesso!");
      setForm({
        name: "",
        description: "",
        price: "",
        brand: "",
        quantity: "",
        category: "",
        image: null,
      });
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar produto");
    }
  };

  const refreshProducts = async () => {
    fetchProducts();
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token')
    try {
      await editProfile(profileForm, token);
      toast.success("Perfil atualizado com sucesso!");
      setProfileModalOpen(false);
      getCurrentUser(token); // Atualiza os dados do dashboard
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar perfil");
    }
  };


  useEffect(() => {
    if (!modalOpen) {
      // Resetar formulário e preview sempre que o modal fechar
      setForm({
        name: "",
        description: "",
        price: "",
        brand: "",
        quantity: "",
        category: "",
        image: null,
      });
      setImagePreview(null);
    }
    if (!modalOpen && imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  }, [modalOpen]);

  // Dentro do seu VendorDashboard

  useEffect(() => {
    if (profileModalOpen) {
      const token = localStorage.getItem("token");
      if (token) {
        getCurrentUser(token)
          .then((user) => {
            setProfileForm({
              name: user.name || "",
              email: user.email || "",
              password: "", // não preenche a senha por segurança
            });
          })
          .catch((err) => console.error("Erro ao buscar dados do usuário:", err));
      }
    }
  }, [profileModalOpen]);


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard do {currentUser?.name || "Vendedor"} { }</h1>
      <div className="w-full flex justify-between">

        <DeactivateAccountButton refreshProducts={refreshProducts} />
        {/* Botão Editar Perfil */}
        <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="cursor-pointer">Editar Perfil</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Perfil</DialogTitle>
            </DialogHeader>
            <form
              className="flex flex-col gap-2"
              onSubmit={handleUpdateProfile}
            >
              <div>
                <Label htmlFor="profileName" className="mb-1">Nome</Label>
                <Input
                  id="profileName"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="profileEmail" className="mb-1">Email</Label>
                <Input
                  id="profileEmail"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="profilePassword" className="mb-1">Senha</Label>
                <Input
                  id="profilePassword"
                  type="password"
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, password: e.target.value })
                  }
                  placeholder="Digite para alterar a senha"
                />
              </div>

              <Button type="submit" className="mt-4 cursor-pointer">
                Salvar Alterações
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-5">
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-2xl hover:transition ">
            <h2 className="text-sm font-medium text-gray-500">Total Vendido</h2>
            <span className="text-2xl font-bold">{data.totalSold}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-2xl hover:transition">
            <h2 className="text-sm font-medium text-gray-500">Receita Total</h2>
            <span className="text-2xl font-bold">R$ {data.totalRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-2xl hover:transition">
            <h2 className="text-sm font-medium text-gray-500">Produtos Cadastrados</h2>
            <span className="text-2xl font-bold">{data.productCount}</span>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-2xl hover:transition">
            <h2 className="text-sm font-medium text-gray-500">Produto Mais Vendido</h2>
            <span className="text-lg font-semibold">{data.bestProduct?.name || "-"}</span>
            <span className="text-sm text-gray-600">
              {data.bestProduct ? `${data.bestProduct.totalSold} vendidos` : ""}
            </span>
            <span className="text-sm text-gray-600">
              {data.bestProduct ? `R$ ${parseFloat(data.bestProduct.price).toFixed(2)}` : ""}
            </span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-2xl hover:transition ">
            <h2 className="text-sm font-medium text-gray-500">Total Produtos Ativados</h2>
            <span className="text-2xl font-bold">{data.activeProductCount}</span>
          </div>

          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center hover:shadow-2xl hover:transition ">
            <h2 className="text-sm font-medium text-gray-500">Total Produtos Desativados</h2>
            <span className="text-2xl font-bold">{data.inactiveProductCount}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <span className="font-bold">Seus produtos</span>

        {/* Botão do modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">Adicionar Produto</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Produto</DialogTitle>
            </DialogHeader>
            <UploadCSVButton refreshProducts={refreshProducts} />

            <form className="flex flex-col gap-2" onSubmit={handleAddProduct}>
              <div>
                <Label htmlFor="name" className="mb-1">Nome</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description" className="mb-1">Descrição</Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price" className="mb-1">Preço</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand" className="mb-1">Marca</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="quantity" className="mb-1">Quantidade</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category" className="mb-1">Categoria</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image" className="mb-1">Imagem</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {/* ✅ Preview da imagem */}
                {imagePreview && (
                  <div className="mt-3 flex justify-center">
                    <Image
                      src={imagePreview}
                      alt="Pré-visualização"
                      width={200}
                      height={200}
                      className="rounded-md object-cover shadow-md"
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="mt-4 cursor-pointer">
                Adicionar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ProductFilters onFilter={(newFilters) => setFilters(newFilters)} />

      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCardDashboard key={product.product_id} product={product} refreshProducts={refreshProducts} />
          ))}
        </div>
      )}

      <div className="flex justify-center mt-6 gap-2">
        <Button className="cursor-pointer" disabled={page <= 1 || loading} onClick={() => setPage((prev) => prev - 1)}>Anterior</Button>
        <span className="flex items-center px-2">Página {page} de {totalPages}</span>
        <Button className="cursor-pointer" disabled={page >= totalPages || loading} onClick={() => setPage((prev) => prev + 1)}>Próxima</Button>
      </div>


    </div>
  );
}
