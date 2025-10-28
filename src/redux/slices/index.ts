import type { Reducer } from "@reduxjs/toolkit";
import profile from "./profile";
import projects from "./projects";
import shapes from "./shapes";
import viewport from "./viewport";

type Slices = Record<string, Reducer>;

const slices: Slices = {
  profile,
  projects,
  shapes,
  viewport,
};

export { slices };
