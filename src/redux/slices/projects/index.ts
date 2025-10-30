import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ProjectSummary = {
  _id: string;
  name: string;
  projectNumber: number;
  thumbnail?: string;
  lastModified: number;
  createdAt: number;
  isPublic?: boolean;
};

type ProjectsState = {
  projects: ProjectSummary[];
  total: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  // Track Creation State
  isCreating: boolean;
  createError: string | null;
};

const initialState: ProjectsState = {
  projects: [],
  total: 0,
  isLoading: false,
  error: null,
  lastFetched: null,
  isCreating: false,
  createError: null,
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (
      state,
      action: PayloadAction<{ projects: ProjectSummary[]; total: number }>
    ) => {
      state.isLoading = false;
      state.projects = action.payload.projects;
      state.total = action.payload.total;
      state.error = null;
      state.lastFetched = Date.now();
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    //Create Project Actions
    createProjectStart: (state) => {
      state.isCreating = true;
      state.createError = null;
    },
    createProjectSuccess: (state) => {
      state.isCreating = false;
      state.createError = null;
    },
    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.isCreating = false;
      state.createError = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectSummary>) => {
      state.projects.unshift(action.payload);
      state.total += 1;
    },
    updateProject: (state, action: PayloadAction<ProjectSummary>) => {
      const index = state.projects.findIndex(
        (project) => project._id === action.payload._id
      );
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload };
      }
    },
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(
        (project) => project._id !== action.payload
      );
      state.total = Math.max(0, state.total - 1);
    },
    clearProjects: (state) => {
      state.projects = [];
      state.total = 0;
      state.lastFetched = null;
      state.error = null;
      state.createError = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
    },
  },
});

export const {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  addProject,
  updateProject,
  removeProject,
  clearProjects,
  clearErrors,
} = projectsSlice.actions;

export default projectsSlice.reducer;
