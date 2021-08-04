import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    //We're on the server!
    return axios.create({
      baseURL: "http://www.dzony12-tickets.website",
      headers: req.headers,
    });
  } else {
    //We must be on the browser!
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
