"use client";

import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"
import { registerUser } from "../../utils/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "client" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(form);
      window.location.href = "/";
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4 mt-10">
      <h1 className="text-2xl font-bold mb-4">Cadastro</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input placeholder="Nome" id="nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>

        <div>

          <Label htmlFor="email">Email</Label>
          <Input placeholder="Email" id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>

        <div>

          <Label htmlFor="password">Senha</Label>
          <Input placeholder="Senha" id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="password">O que você é</Label>

          <Select
            value={form.role}
            onValueChange={(value) => setForm({ ...form, role: value })}
          >
            <SelectTrigger className="w-full border p-2 rounded cursor-pointer">
              <SelectValue placeholder="Selecione o tipo de usuário" />
            </SelectTrigger>
            <SelectContent className="cursor-pointer">
              <SelectItem value="client" className="cursor-pointer">Cliente</SelectItem>
              <SelectItem value="vendor" className="cursor-pointer">Vendedor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="cursor-pointer" disabled={loading}>{loading ? "Cadastrando..." : "Cadastrar"}</Button>
      </form>
    </div>
  );
}
