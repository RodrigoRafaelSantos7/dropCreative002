export const indexPath = () => "/";

// Auth
export const signInPath = () => "/auth/sign-in";
export const signUpPath = () => "/auth/sign-up";

// Protected
export const dashboardPath = (route?: string) => `/dashboard/${route}`;

export const canvasPath = (userSlug: string, projectSlug: string) =>
  `/dashboard/${userSlug}/canvas?project=${projectSlug}`;

export const styleGuidePath = (userSlug: string, projectSlug: string) =>
  `/dashboard/${userSlug}/style-guide?project=${projectSlug}`;

export const billingPath = (profileName: string) => `/billing/${profileName}`;
