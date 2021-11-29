import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route, Switch } from 'react-router-dom'
import Accounts from './accounts'
import Budget from './budget'
import Dashboard from './dashboard'
import Deadlines from './deadlines'
import EditAccount from './edit-account'
import EditExpense from './edit-expense'
import EditRecurringEvent from './edit-recurring-event'
import Expenses from './expenses'
import Export from './export'
import RecurringEvents from './recurring-events'

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route path="/export" render={props => <Export />} />
        <Route path="/accounts" render={props => <Accounts {...props} />} />
        <Route path="/edit-account" render={props => <EditAccount {...props} />} />
        <Route path="/recurring-events" render={props => <RecurringEvents {...props} />} />
        <Route path="/edit-recurring-event" render={props => <EditRecurringEvent {...props} />} />
        <Route path="/expenses" render={props => <Expenses {...props} />} />
        <Route path="/edit-expense" render={props => <EditExpense {...props} />} />
        <Route path="/deadlines" render={props => <Deadlines {...props} />} />
        <Route path="/budget" render={props => <Budget {...props} />} />
        <Route path="/">
          <Dashboard />
        </Route>
      </Switch>
    </HashRouter>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
