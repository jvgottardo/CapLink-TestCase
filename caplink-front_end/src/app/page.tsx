"use client";

import { useState, useEffect } from "react";
import { getProducts } from "../utils/api";
import ProductCard from "../components/ProductCard";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10; // produtos por página

  // Função para buscar produtos
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({
        search,
        category: category === "all" ? "" : category,
        minPrice: minPrice ? Number(minPrice) : 0,
        maxPrice: maxPrice ? Number(maxPrice) : 999999,
        page,
        limit,
      });

      console.log()

      if (res.products) {
        setProducts(res.products);
        setTotalPages(res.totalPages);
      } else {
        setProducts([]);
        // alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao buscar os produtos. Tente novamente mais tarde.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Pega todas as categorias únicas
  const getCategories = async () => {
    const res = await getProducts({ limit: 1000 });
    const categories = res.products
      .map((p: any) => p.category)
      .filter((c: string | null) => c)
      .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i);
    return categories;
  };

  // Inicializa categorias
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // Busca produtos ao carregar e ao trocar página
  useEffect(() => {
    fetchProducts();
  }, [page]);

  // Filtrar produtos: reseta para página 1
  const handleFilter = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Produtos</h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-2 mb-4 items-end">
        <Input
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select onValueChange={(val) => setCategory(val)} value={category}>
          <SelectTrigger className="w-48 cursor-pointer">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="cursor-pointer">
            <SelectItem value="all" className="cursor-pointer">Todas</SelectItem>
            {categories.map((cat) => (
              <SelectItem className="cursor-pointer" key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Preço mínimo"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Preço máximo"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <Button onClick={handleFilter} className="cursor-pointer">Filtrar</Button>
      </div>

      {/* Grid de produtos */}
      {loading ? (
        <p>Carregando...</p>
      ) : products.length === 0 ? (
        <p>Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>
      )}

      {/* Paginação */}
      <div className="flex justify-center mt-6 gap-2">
        <Button
          disabled={page <= 1 || loading}
          onClick={() => setPage((prev) => prev - 1)}
          className="cursor-pointer"
        >
          Anterior
        </Button>
        <span className="flex items-center px-2">
          Página {page} de {totalPages}
        </span>
        <Button
          disabled={page >= totalPages || loading}
          onClick={() => setPage((prev) => prev + 1)}
          className="cursor-pointer"
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
