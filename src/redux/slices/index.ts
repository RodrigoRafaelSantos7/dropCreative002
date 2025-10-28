import type { Reducer } from "@reduxjs/toolkit";
import profileReducer from "./profile";

type Slices = Record<string, Reducer>;

const slices: Slices = {
  profile: profileReducer,
};

export { slices };
