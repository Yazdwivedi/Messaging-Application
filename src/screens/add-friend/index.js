// @ts-nocheck
import "./style.css";
import { useState } from "react";
import {
  useSendRequestMutation,
  useFetchRequestsQuery,
  useUpdateRequestMutation,
} from "./slice";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { useFetchContactsQuery } from "src/apiSlice";

const AddFriend = () => {
  const userId = useSelector((state) => state?.user?.userInfo?.uid);
  const userContacts = useFetchContactsQuery({ userId }) || [];
  const [friendId, setFriendId] = useState("");
  const [sendReqErr, setSendReqErr] = useState("No such user found");

  const [sendNewRequest, { isError: addRequestError }] =
    useSendRequestMutation();

  const [updateRequest, { isError: updateRequestError }] =
    useUpdateRequestMutation();

  const {
    data: requests,
    isFetching,
    isError,
  } = useFetchRequestsQuery({ userId }, { skip: !userId });

  const sendRequest = () => {
    sendNewRequest({ requestId: uuidv4(), userId, friendId, userContacts })
      .unwrap()
      .catch((err) => setSendReqErr(err));
  };

  const updateUserRequest = (requestId, type, userReqId) => {
    updateRequest({ requestId, userId, userReqId, type })
      .unwrap()
      .catch((err) => setSendReqErr(err));
  };

  return (
    <>
      <input value={friendId} onChange={(e) => setFriendId(e?.target?.value)} />
      <button onClick={sendRequest}>Submit</button>
      {addRequestError && <p>{sendReqErr}</p>}
      {isError && <p>Error fetching requests</p>}
      <h3>Requests Sent</h3>
      {requests?.sent.map((req) => {
        return (
          <div key={req.requestId}>
            <p>{req.name}</p>
          </div>
        );
      })}
      <h3>Requests Received</h3>
      {requests?.received.map((req) => {
        return (
          <div key={req?.requestId} className="received-container">
            <p>{req.name}</p>
            <button
              onClick={() =>
                updateUserRequest(req?.requestId, "accept", req?.userId)
              }
            >
              Accept
            </button>
            <button
              onClick={() =>
                updateUserRequest(req?.requestId, "reject", req?.userId)
              }
            >
              Reject
            </button>
          </div>
        );
      })}
      {updateRequestError && <p>Unable to add or reject requests</p>}
    </>
  );
};

export default AddFriend;
