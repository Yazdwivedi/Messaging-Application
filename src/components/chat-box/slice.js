import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  collection,
  addDoc,
  query,
  where,
  or,
  onSnapshot,
  orderBy,
  and,
  getDocs,
} from "firebase/firestore";
import { db } from "../../utils/firestore-provider";
import { apiSlice } from "src/apiSlice";
const messageRef = collection(db, "messages");

export const firebaseApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchMessages: builder.query({
      async queryFn(args) {
        const { userId, selectedContactId } = args;
        let msgList = [];
        try {
          const res = await new Promise(async (resolve, reject) => {
            try {
              const q = query(
                messageRef,
                or(
                  and(
                    where("senderId", "==", userId),
                    where("receiverId", "==", selectedContactId)
                  ),
                  and(
                    where("senderId", "==", selectedContactId),
                    where("receiverId", "==", userId)
                  )
                ),
                orderBy("timestamp")
              );
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => {
                const msgObj = doc.data();
                const msgType =
                  msgObj?.senderId === selectedContactId ? "received" : "send";
                msgList.push({
                  message: msgObj?.message,
                  timestamp: msgObj?.timestamp,
                  msgType,
                  status: "success",
                });
              });
              resolve(msgList);
            } catch (error) {
              reject(error);
            }
          });
          return { data: res };
        } catch (error) {
          return { error };
        }
      },
      async onCacheEntryAdded(
        args,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        let unsubscribe = () => {};
        try {
          await cacheDataLoaded;
          const { userId, selectedContactId } = args;
          const q = query(
            messageRef,
            or(
              and(
                where("senderId", "==", userId),
                where("receiverId", "==", selectedContactId)
              ),
              and(
                where("senderId", "==", selectedContactId),
                where("receiverId", "==", userId)
              )
            ),
            orderBy("timestamp")
          );
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            let msgList = [];
            querySnapshot.forEach((doc) => {
              const msgObj = doc.data();
              const msgType =
                msgObj?.senderId === selectedContactId ? "received" : "send";
              msgList.push({
                msgId: msgObj?.msgId,
                message: msgObj?.message,
                timestamp: msgObj?.timestamp,
                msgType,
                status: "success",
              });
            });
            updateCachedData((draft) => {
              return msgList;
            });
          });
        } catch (error) {}
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),
    sendMessage: builder.mutation({
      async queryFn(args) {
        //FOR TESTING PURPOSE
        // return await new Promise((res, rej)=>{
        //   setTimeout(async()=>{
        //     if(args?.message==="error"){
        //         return rej({error: "luls"})
        //     }
        //     try {
        //       const docRef = await addDoc(collection(db, "messages"), args);
        //       return { data: docRef.id };
        //     } catch (error) {
        //       return {error}
        //     }
        //   },5000);
        // })
        try {
          const docRef = await addDoc(collection(db, "messages"), args);
          return { data: docRef.id };
        } catch (error) {
          return {error}
        }
      },
    }),
  }),
});

export const {useSendMessageMutation} = firebaseApis;

