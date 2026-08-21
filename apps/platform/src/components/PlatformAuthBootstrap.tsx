"use client";

import { useEffect } from "react";
import { bootstrapAuthSession } from "../lib/api";

export function PlatformAuthBootstrap() {
  useEffect(() => {
    bootstrapAuthSession();
  }, []);
  return null;
}
