import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import Export from "./export";
import Dashboard from "./dashboard";
import EditAccount from "./edit-accounts";
import Accounts from "./accounts";

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/export" render={(props) => <Export />} />
        <Route path="/accounts" render={(props) => <Accounts {...props} />} />
        <Route
          path="/edit-accounts"
          render={(props) => <EditAccount {...props} />}
        />
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </HashRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
