export const socials = {
  youtube: '',
  linkedin: '',
  tiktok: '',
  instagram: '',
} as const;

export type SocialPlatform = keyof typeof socials;
