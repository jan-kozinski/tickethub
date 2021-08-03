import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/useRequest";
import Router from "next/router";

function OrderShow({ order, currentUser }) {
  const [remainingTime, setRemainingTime] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findRemainingTime = () => {
      const expiresAt = new Date(order.expiresAt);
      const msLeft = expiresAt - Date.now();
      if (msLeft <= 0) setIsExpired(true);
      setRemainingTime(Math.round(msLeft / 1000));
    };
    findRemainingTime();
    const timer = setInterval(findRemainingTime, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return isExpired ? (
    <div>
      Order expired <br /> {errors}
    </div>
  ) : (
    <div>
      Remaining time for payment:
      <br />
      {remainingTime} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51JJxmKIqyYQ3GqNwYH4sP19qat1CeWZlmfZlVIrbeQPTrMSulFMmtYvr5iGHGUMlQ3eSy3um1tRaWDQuxr0QvsQy001CMba21n"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  );
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;

  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
