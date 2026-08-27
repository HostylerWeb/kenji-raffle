"use client";

import type { ElementType, ReactNode } from "react";
import type { SiteCopyKey } from "@kenji-raffle/shared/site-copy-defaults";
import { useSiteCopyEditor } from "./SiteCopyEditorProvider";
import { SiteCopyInlineField } from "./SiteCopyInlineField";

type SiteCopySlotProps = {
  copyKey: SiteCopyKey;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function SiteCopySlot({
  copyKey,
  as: Tag = "span",
  className,
  children,
}: SiteCopySlotProps) {
  const editor = useSiteCopyEditor();

  if (!editor?.active) {
    return <Tag className={className}>{children}</Tag>;
  }

  const text = editor.getText(copyKey);

  return (
    <SiteCopyInlineField
      copyKey={copyKey}
      as={Tag}
      className={className}
      displayText={text}
    />
  );
}
