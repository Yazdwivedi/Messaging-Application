import ContactReducer from "./components/contact-list/slice";
import UserReducer from "./screens/signup/slice";
import { apiSlice } from "./apiSlice";

const { configureStore } = require("@reduxjs/toolkit");

export const store = configureStore({
  reducer: {
    contacts: ContactReducer,
    user: UserReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat([
      apiSlice.middleware,
    ]),
});
