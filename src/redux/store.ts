import {
  combineReducers,
  configureStore,
  type Middleware,
  type ReducersMapObject,
} from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { env } from "@/lib/env";
import { apis } from "./api";
import { slices } from "./slices";

const rootReducer = combineReducers({
  ...slices,
  ...apis.reduce((acc, api) => {
    acc[api.reducerPath] = api.reducer;
    return acc;
  }, {} as ReducersMapObject),
});

type RootState = ReturnType<typeof rootReducer>;
type MakeStoreProps = Partial<RootState>;

function makeStore(preloadedState?: MakeStoreProps) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        ...apis.map((api) => api.middleware as Middleware)
      ),
    preloadedState,
    devTools: env.NODE_ENV !== "production",
  });
}

const store = makeStore();
type AppStore = ReturnType<typeof makeStore>;
type AppDispatch = AppStore["dispatch"];

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
const useAppDispatch = () => useDispatch<AppDispatch>();

export {
  store,
  makeStore,
  type RootState,
  type AppStore,
  type AppDispatch,
  useAppSelector,
  useAppDispatch,
};
