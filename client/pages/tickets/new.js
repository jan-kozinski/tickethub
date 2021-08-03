import { useState } from "react";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

function NewTicket() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/tickets",
    method: "post",
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push("/"),
  });

  const onBlur = () => {
    return Object.is(+price, NaN) ? null : setPrice((+price).toFixed(2));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    doRequest();
  };

  return (
    <div>
      <h2>Create a Ticket</h2>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn  btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default NewTicket;
