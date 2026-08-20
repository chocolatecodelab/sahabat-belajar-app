"use client";

import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  confirmMessage?: string;
}

export default function DeleteButton({
  confirmMessage = "Apakah Anda yakin ingin menghapus data ini?",
}: DeleteButtonProps) {
  return (
    <button
      type="submit"
      className="p-2 rounded-lg transition-colors hover:bg-red-50"
      style={{ color: "var(--color-error)" }}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      title="Hapus"
    >
      <Trash2 size={16} />
    </button>
  );
}
