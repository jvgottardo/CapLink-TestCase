"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductFilters({ onFilter }: { onFilter: (filters: any) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState(""); // ativo / desativado / todos

  const handleApplyFilters = () => {
    onFilter({
      search: search || undefined,
      category: category || undefined,
      brand: brand || undefined,
      active:
        status === "ativo" ? true : status === "desativado" ? false : undefined,
    });
  };

  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      <div>
        <Label className="mb-1">Buscar</Label>
        <Input
          placeholder="Nome, marca ou descrição"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1">Categoria</Label>
        <Input
          placeholder="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1">Marca</Label>
        <Input
          placeholder="Marca"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
      </div>

      <div>
        <Label className="mb-1">Status</Label>
        <Select value={status} onValueChange={(val) => setStatus(val)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="desativado">Desativado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Button className="cursor-pointer" onClick={handleApplyFilters}>Filtrar</Button>
      </div>
    </div>
  );
}
