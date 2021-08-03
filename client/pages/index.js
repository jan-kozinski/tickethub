import React from "react";
import Link from "next/link";

function LandingPage({ currentUser, tickets }) {
  const ticketList = tickets.map((t) => (
    <tr key={t.id}>
      <td>{t.title}</td>
      <td>{t.price.toFixed(2)} PLN</td>
      <td>
        <Link href="/tickets/[ticketId]" as={`/tickets/${t.id}`}>
          <a>View</a>
        </Link>
      </td>
    </tr>
  ));
  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
}

LandingPage.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};

export default LandingPage;
