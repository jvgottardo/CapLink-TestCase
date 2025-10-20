"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteUser, reactiveUser, getCurrentUser } from "../utils/auth"; // adicionar função activateUser
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AccountStatusButtonProps {
  refreshProducts: () => void;
}

export default function AccountStatusButton({ refreshProducts }: AccountStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(true); // conta ativa por padrão

  // Busca o status da conta ao carregar
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser(token)
        .then((user) => {
          setIsActive(user.active); // user.active deve vir do backend
        })
        .catch((err) => console.error("Erro ao buscar status do usuário:", err));
    }
  }, []);

  const handleAction = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Usuário não autenticado");
      setLoading(false);
      return;
    }

    try {
      if (isActive) {
        // Desativar conta
        await deleteUser(token);
        toast.success("Conta desativada com sucesso!");
        setIsActive(false);
      } else {
        // Ativar conta
        await reactiveUser(token);
        toast.success("Conta ativada com sucesso!");
        setIsActive(true);
      }
      setOpen(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erro ao alterar status da conta");
    } finally {
      setLoading(false);
      refreshProducts();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="cursor-pointer hover:shadow hover:transition-all"
        >
          {isActive ? "Desativar Conta" : "Ativar Conta"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isActive ? "Desativar Conta" : "Ativar Conta"}</DialogTitle>
          <DialogDescription>
            {isActive
              ? "Tem certeza que deseja desativar sua conta? Você poderá reativar depois com login."
              : "Deseja ativar sua conta novamente?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
            Cancelar
          </Button>
          <Button onClick={handleAction} disabled={loading} className="cursor-pointer">
            {loading ? "Processando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
