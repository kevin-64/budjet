import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";
import Export from "./export";
import Dashboard from "./dashboard";
import EditAccount from "./edit-accounts";
import Accounts from "./accounts";
import RecurringEvents from "./recurring-events";
import EditRecurringEvent from "./edit-recurring-event";

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
        <Route
          path="/edit-recurring-event"
          render={(props) => <EditRecurringEvent {...props} />}
        />
        <Route
          path="/recurring-events"
          render={(props) => <RecurringEvents {...props} />}
        />
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </HashRouter>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
