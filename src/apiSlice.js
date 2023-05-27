import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

import { db } from "./utils/firestore-provider";
const usersRef = collection(db, "users");

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    fetchContacts: builder.query({
      async queryFn(args) {
        const { userId } = args;
        const q = query(usersRef, where("userId", "==", userId || ""));
        let contactList = [];
        try{
          const querySnapshot = await getDocs(q);
          querySnapshot && querySnapshot.forEach((doc) => {
            const allContactsObj = doc.data();
            allContactsObj?.contacts && allContactsObj?.contacts.forEach(async (contact) => {
              if (contact?.id) {
                const contactQuery = query(
                  usersRef,
                  where("userId", "==", contact?.id || "")
                );
                const contactQuerySnapshot = await getDocs(contactQuery);
                contactQuerySnapshot && contactQuerySnapshot.forEach((user) => {
                  const contactObj = user.data();

                  contactList = [...contactList, contactObj];

                });
              }
            });

          });
          return { data: contactList };
        }
        catch(error){
          return {error}
        }
      },
      async onCacheEntryAdded(
        args,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        let unsubscribe = () => {};
        try {
          await cacheDataLoaded;
          const { userId } = args;
          const q = query(usersRef, where("userId", "==", userId || ""));
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            let contactList = [];
            querySnapshot && querySnapshot.forEach((doc) => {
              const allContactsObj = doc.data();
              allContactsObj?.contacts && allContactsObj?.contacts.forEach(async (contact) => {
                if (contact?.id) {
                  const contactQuery = query(
                    usersRef,
                    where("userId", "==", contact?.id || "")
                  );
                  const contactQuerySnapshot = await getDocs(contactQuery);
                  contactQuerySnapshot && contactQuerySnapshot.forEach((user) => {
                    const contactObj = user.data();
                    contactList = [...contactList, contactObj];
                  });
                }
                updateCachedData((draft) => {
                  return contactList;
                });
              });
            });
          });
        } catch (error) {}
        await cacheEntryRemoved;
        unsubscribe();
      }
    }),
  }),
});

export const { useFetchContactsQuery } = apiSlice;
