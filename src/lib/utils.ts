import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const combinedSlug = (name: string, maxLen = 80): string => {
  const base = name;
  if (!base) {
    return "untilted";
  }
  let slug = base
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
  if (!slug) {
    slug = "untilted";
  }
  if (slug.length > maxLen) {
    slug = slug.slice(0, maxLen);
  }
  return slug;
};
