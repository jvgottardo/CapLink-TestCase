"use client";

import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { loginUser } from "../../utils/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(form);
      console.log(res)
      if (res.error) {
        setError(res.error);
        return;
      }

      window.location.href = "/";

    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Credenciais inválidas");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Ocorreu um erro ao tentar logar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4 mt-10">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input placeholder="Email" id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

        </div>
        <div>
          <Label htmlFor="password" className="mb-1">Senha</Label>
          <Input placeholder="Senha" id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <Button type="submit" className="cursor-pointer" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
      </form>

      <div>
        <p className="mt-4">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-blue-500 underline">
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
