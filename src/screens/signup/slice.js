import { createSlice } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { apiSlice } from "src/apiSlice";
import { db } from "src/utils/firestore-provider";

const initialState = {
  userInfo: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state["userInfo"] = action?.payload;
    },
    resetUser: (state, action) => {
      state = initialState;
    },
  },
});

export const signUpApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      async queryFn(args) {
        try {
          const auth = getAuth();
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            args?.email,
            args?.password
          );
          await addDoc(collection(db, "users"), {name: args?.name, userId: userCredential?.user?.uid});
          return { data: userCredential?.user };
        } catch (error) {
          const errorCode = error?.code;
          const errorMessage = error?.message;
          return { error: { code: errorCode, message: errorMessage } };
        }
      },
    }),
    loginUser: builder.mutation({
      async queryFn(args) {
        try {
          const auth = getAuth();
          const userCredential = await signInWithEmailAndPassword(
            auth,
            args?.email,
            args?.password
          );
          return { data: userCredential?.user };
        } catch (error) {
          const errorCode = error?.code;
          const errorMessage = error?.message;
          return { error: { code: errorCode, message: errorMessage } };
        }
      },
    }),
  }),
});

export const { useCreateUserMutation, useLoginUserMutation } = signUpApi;
export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
