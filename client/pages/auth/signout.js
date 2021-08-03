import Router from "next/router";
import React, { useEffect } from "react";
import useRequest from "../../hooks/useRequest";
function signout() {
  const { doRequest, errors } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
    onSuccess: () => {
      return Router.push("/");
    },
  });

  useEffect(() => {
    doRequest();
  }, []);

  return <div>signing out...</div>;
}

export default signout;
