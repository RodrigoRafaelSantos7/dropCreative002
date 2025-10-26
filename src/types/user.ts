import { combinedSlug } from "@/lib/utils";

export type ConvexRawUser = {
  _id: string;
  _creationTime: number;
  name: string;
  email: string;
  image?: string;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
  displayUsername?: string;
  isAnonymous?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  twoFactorEnabled?: boolean;
  username?: string;
  userId?: string;
};

export type Profile = {
  id: string; // Normalized from _id
  createdAt: number; // Normalized from _creationTime
  email: string;
  emailVerified?: boolean;
  image?: string;
  name: string;
};

const SPLIT_NAME_REGEX = /[._-]/;

export const normalizeProfile = (raw: ConvexRawUser | null): Profile | null => {
  if (!raw) {
    return null;
  }

  const extractNameFromEmail = (email: string): string => {
    const username = email.split("@")[0];
    return username
      .split(SPLIT_NAME_REGEX)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  };

  const name = combinedSlug(raw.name) || extractNameFromEmail(raw.email);

  return {
    id: raw._id,
    createdAt: raw._creationTime,
    email: raw.email,
    emailVerified: raw.emailVerified,
    image: raw.image,
    name,
  };
};
