"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { importProducts } from "../utils/api";

export default function UploadCSVButton({ refreshProducts }: { refreshProducts: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile && selectedFile.type !== "text/csv") {
      toast.error("Por favor, selecione um arquivo CSV válido");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Selecione um arquivo CSV primeiro");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await importProducts(formData)
      toast.success(`CSV enviado com sucesso!`);
      setFile(null);
      refreshProducts(); // atualiza a lista de produtos no dashboard
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="cursor-pointer"
      />
      <Button onClick={handleUpload} disabled={loading} className="cursor-pointer">
        {loading ? "Enviando..." : "Adicionar produtos via CSV"}
      </Button>
    </div>
  );
}
