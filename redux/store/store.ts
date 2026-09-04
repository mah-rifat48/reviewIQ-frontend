import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import { baseApiAi } from "../api/AI/baseApiAi";
import businessReducer from "../slices/businessSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [baseApiAi.reducerPath]: baseApiAi.reducer,
    business: businessReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, baseApiAi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
