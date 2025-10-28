"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type RootState } from "./store";

type ReduxProviderProps = {
  children: React.ReactNode;
  preloadedState?: Partial<RootState>;
};

const ReduxProvider = ({ children, preloadedState }: ReduxProviderProps) => {
  const storeRed = useRef(makeStore(preloadedState));
  return <Provider store={storeRed.current}>{children}</Provider>;
};

export default ReduxProvider;
