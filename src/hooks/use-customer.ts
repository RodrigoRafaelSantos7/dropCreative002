import { useCustomer as useAutumnCustomer } from "autumn-js/react";

const useCustomer = () => {
  const { customer, track, check, checkout } = useAutumnCustomer();

  return { customer, track, check, checkout };
};

export { useCustomer };
