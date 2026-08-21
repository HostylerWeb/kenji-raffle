"use client";

import { useParams } from "next/navigation";
import { RaffleEditor } from "@/components/admin/RaffleEditor";

export default function EditRafflePage() {
  const params = useParams();
  return <RaffleEditor raffleId={String(params.id)} />;
}
