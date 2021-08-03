import React from "react";

function OrdersIndex({ orders }) {
  return (
    <ul>
      {orders.map((o) => (
        <li key={o.id}>
          {o.ticket.title}-{o.status}
        </li>
      ))}
    </ul>
  );
}

OrdersIndex.getInitialProps = async (context, client) => {
  const { data } = await client.get("/api/orders");

  return { orders: data };
};

export default OrdersIndex;
