import "bootstrap/dist/css/bootstrap.css";
import buildClient from "../api/buildClient";
import Header from "../components/Header";

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const { ctx: context } = appContext;
  const client = buildClient(context);
  const { data } = await client.get("/api/users/currentuser");

  let pageProps;
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      context,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
