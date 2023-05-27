import {
  collection,
  addDoc,
  query,
  where,
  or,
  and,
  onSnapshot,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firestore-provider";
import { apiSlice } from "src/apiSlice";
const usersRef = collection(db, "users");
const requestsRef = collection(db, "requests");

export const contactApis = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchRequests: builder.query({
      async queryFn(args) {
        const { userId } = args;
        const q = query(
          requestsRef,
          or(where("senderId", "==", userId), where("receiverId", "==", userId))
        );
        const querySnapshot = await getDocs(q);
        let requestList = [];
        let receivedList = [];
        querySnapshot.forEach(async (doc) => {
          const requestObj = doc.data();
          let type = "sent";
          if (requestObj?.receiverId === userId) {
            type = "received";
          }

          let userQuery = query(
            usersRef,
            where("userId", "==", requestObj?.receiverId)
          );

          if (userId === requestObj?.receiverId) {
            userQuery = query(
              usersRef,
              where("userId", "==", requestObj?.senderId)
            );
          }
          const userQuerySnapshot = await getDocs(userQuery);
          userQuerySnapshot.forEach((user) => {
            const userObj = user.data();
            if (type === "received") {
              receivedList = [
                ...receivedList,
                { ...userObj, requestId: requestObj?.requestId },
              ];
            } else {
              requestList = [
                ...requestList,
                { ...userObj, requestId: requestObj?.requestId },
              ];
            }
          });
        });
        return { data: { sent: requestList, received: receivedList } };
      },
      async onCacheEntryAdded(
        args,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        let unsubscribe = () => {};
        try {
          await cacheDataLoaded;

          const { userId } = args;

          const q = query(
            requestsRef,
            or(
              where("senderId", "==", userId),
              where("receiverId", "==", userId)
            )
          );
          unsubscribe = onSnapshot(q, async (querySnapshot) => {
            let requestList = [];
            let receivedList = [];
            let emptyFlag = true;
            querySnapshot.forEach(async (doc) => {
              emptyFlag = false;
              const requestObj = doc.data();
              let type = "sent";
              if (requestObj?.receiverId === userId) {
                type = "received";
              }

              let userQuery = query(
                usersRef,
                where("userId", "==", requestObj?.receiverId)
              );

              if (userId === requestObj?.receiverId) {
                userQuery = query(
                  usersRef,
                  where("userId", "==", requestObj?.senderId)
                );
              }
              const userQuerySnapshot = await getDocs(userQuery);
              userQuerySnapshot.forEach((user) => {
                const userObj = user.data();
                if (type === "received") {
                  receivedList = [
                    ...receivedList,
                    { ...userObj, requestId: requestObj?.requestId },
                  ];
                } else {
                  requestList = [
                    ...requestList,
                    { ...userObj, requestId: requestObj?.requestId },
                  ];
                }
              });
              updateCachedData((draft) => {
                return { sent: requestList, received: receivedList };
              });
            });
            emptyFlag &&
              updateCachedData((draft) => {
                return { sent: [], received: [] };
              });
          });
        } catch (error) {}
        await cacheEntryRemoved;
        unsubscribe();
      },
    }),
    sendRequest: builder.mutation({
      async queryFn(args) {
        const { requestId, userId, friendId, userContacts } = args;
        let userList = [];
        try {
          if (userContacts?.data?.find((contact) => contact.id === friendId)) {
            throw "Already in friend list";
          }
          if (userId === friendId) {
            throw "Cannot send friend id to self";
          }
          await new Promise(async (resolve, reject) => {
            try {
              const q = query(
                requestsRef,
                or(
                  and(
                    where("senderId", "==", userId),
                    where("receiverId", "==", friendId)
                  ),
                  and(
                    where("senderId", "==", friendId),
                    where("receiverId", "==", userId)
                  )
                )
              );
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => {
                const userObj = doc.data();
                if (userObj) {
                  reject("Duplicate Request");
                }
              });
              resolve("No duplicate requests found");
            } catch (error) {
              reject(error);
            }
          });
          const userRes = await new Promise(async (resolve, reject) => {
            try {
              const q = query(usersRef, where("userId", "==", friendId));
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => {
                const userObj = doc.data();
                userList.push(userObj);
              });
              resolve(userList[0]);
            } catch (error) {
              reject(error);
            }
          });
          if (!userRes) {
            throw "No Such User Found";
          }
          const docRef = await addDoc(collection(db, "requests"), {
            requestId,
            senderId: userId,
            receiverId: friendId,
          });
          return { data: docRef };
        } catch (error) {
          return { error };
        }
      },
    }),
    updateRequest: builder.mutation({
      async queryFn(args) {
        const { userId, userReqId, type } = args;
        try {
          await new Promise(async (resolve, reject) => {
            try {
              const q = query(
                requestsRef,
                or(
                  and(
                    where("senderId", "==", userId || ""),
                    where("receiverId", "==", userReqId || "")
                  ),
                  and(
                    where("senderId", "==", userReqId || ""),
                    where("receiverId", "==", userId || "")
                  )
                )
              );

              const querySnapshot = await getDocs(q);
              querySnapshot.forEach(async (doc) => {
                const userObj = doc.data();
                await deleteDoc(doc.ref);
              });
              resolve({});
            } catch (error) {
              reject(error);
            }
          });
          if (type == "accept") {
            await new Promise(async (resolve, reject) => {
              try {
                const q1 = query(usersRef, where("userId", "==", userId));
                const q2 = query(usersRef, where("userId", "==", userReqId));

                const querySnapshot1 = await getDocs(q1);
                querySnapshot1.forEach(async (doc) => {
                  const userObj = doc.data();

                  const newContactObj = userObj?.contacts || [];
                  newContactObj.push({ id: userReqId });
                  await updateDoc(doc.ref, {
                    ...userObj,
                    contacts: newContactObj,
                  });
                });
                const querySnapshot2 = await getDocs(q2);
                querySnapshot2.forEach(async (doc) => {
                  const userObj = doc.data();

                  const newContactObj = userObj?.contacts || [];
                  newContactObj.push({ id: userId });
                  await updateDoc(doc.ref, {
                    ...userObj,
                    contacts: newContactObj,
                  });
                });
              } catch (error) {
                reject(error);
              }
            });
          }
          return { data: {} };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
});

export const {
  useFetchRequestsQuery,
  useSendRequestMutation,
  useUpdateRequestMutation,
} = contactApis;
