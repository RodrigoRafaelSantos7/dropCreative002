import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type AutoSaveProjectResponse = {
  success: boolean;
  message: string;
  eventId: string;
};

type AutoSaveProjectRequest = {
  projectId: string;
  userId: string;
  // TODO: Add project data
};

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/project" }),
  tagTypes: ["Project"],
  endpoints: (builder) => ({
    autoSaveProject: builder.mutation<
      AutoSaveProjectResponse,
      AutoSaveProjectRequest
    >({
      query: (data) => ({
        url: "",
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});
