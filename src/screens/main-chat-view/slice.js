import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../utils/firestore-provider";
import { apiSlice } from "src/apiSlice";
import { getAuth, signOut } from "firebase/auth";
const usersRef = collection(db, "users");

export const contactApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    logoutUser: builder.mutation({
      async queryFn(args) {
        try {
          const auth = getAuth();
          const userCredential = await signOut(auth);
          return { data: true};
        } catch (error) {
          const errorCode = error?.code;
          const errorMessage = error?.message;
          return { error: { code: errorCode, message: errorMessage } };
        }
      },
    }),
  }),
});

export const { useLogoutUserMutation } = contactApis;
