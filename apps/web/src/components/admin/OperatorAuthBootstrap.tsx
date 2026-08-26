"use client";

import { useEffect } from "react";
import { bootstrapOperatorAuthSession } from "@/lib/api";

export function OperatorAuthBootstrap() {
  useEffect(() => {
    bootstrapOperatorAuthSession();
  }, []);
  return null;
}
