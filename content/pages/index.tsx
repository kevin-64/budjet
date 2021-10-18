import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import Export from "./export";
import Dashboard from "./dashboard";

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/export" render={(props) => <Export />} />
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </HashRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
