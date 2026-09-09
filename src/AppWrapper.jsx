import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { MemoryRouter, useInRouterContext } from "react-router-dom";
import { store, persistor } from "./store/store.js";
import App from "./App.jsx";

const MaybeRouter = ({ children }) =>
  useInRouterContext() ? children : <MemoryRouter>{children}</MemoryRouter>;

MaybeRouter.propTypes = {
  children: PropTypes.node,
};

const AppWrapper = (props) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <MaybeRouter>
        <App {...props} />
      </MaybeRouter>
    </PersistGate>
  </Provider>
);

export default AppWrapper;
