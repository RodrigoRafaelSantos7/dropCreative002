export const indexPath = () => "/";

// Auth
export const signInPath = () => "/auth/sign-in";
export const signUpPath = () => "/auth/sign-up";

// Protected
export const dashboardPath = () => "/dashboard";

export const userDashboardPath = (profileName: string) =>
  `/dashboard/${profileName}`;

export const billingPath = (profileName: string) => `/billing/${profileName}`;
