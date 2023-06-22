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

const fetchContactsForEachUser = async (querySnapshot) => {
  let contactList = [];
  const promises = [];
  let allContactsObj = {};
  querySnapshot &&
    querySnapshot.forEach(async (doc) => {
      allContactsObj = doc.data();
      allContactsObj?.contacts &&
        allContactsObj?.contacts.forEach(async (contact) => {
          if (contact?.id) {
            const contactQuery = query(
              usersRef,
              where("userId", "==", contact?.id || "")
            );
            const promise = getDocs(contactQuery).then(
              (contactQuerySnapshot) => {
                contactQuerySnapshot &&
                  contactQuerySnapshot.forEach((user) => {
                    const contactObj = user.data();
                    contactList = [...contactList, contactObj];
                  });
              }
            );
            promises.push(promise);
          }
        });
    });
  await Promise.all(Array.from(promises));
  return {contactList, username: allContactsObj?.name};
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    fetchContacts: builder.query({
      async queryFn(args) {
        const { userId } = args;
        const q = query(usersRef, where("userId", "==", userId || ""));
        try{
          const querySnapshot = await getDocs(q);
          const results = await fetchContactsForEachUser(querySnapshot);
          return { data: {contactList: results?.contactList, username: results?.username} };
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
          unsubscribe = onSnapshot(q, async(querySnapshot) => {
            const results = await fetchContactsForEachUser(querySnapshot);
            updateCachedData((draft) => {
              return {contactList: results?.contactList, username: results?.username};
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
