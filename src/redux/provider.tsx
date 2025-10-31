"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type RootState } from "./store";

type ReduxProviderProps = {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
};

const ReduxProvider = ({ children, preloadedState }: ReduxProviderProps) => {
  const storeRef = useRef<ReturnType<typeof makeStore> | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore(preloadedState);
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
};

export default ReduxProvider;
