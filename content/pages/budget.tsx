import {
  Button,
  Checkbox,
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from '@material-ui/core'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import LeftDrawer from '../../components/LeftDrawer'
import MainContainer from '../../components/MainContainer'
import RootContainer from '../../components/RootContainer'
import { calculateBalance, getApprovedBudget, getBudgetItems } from '../lib/budgeting'
import { db } from '../lib/dbaccess'
import '../lib/utils'
import { Account } from '../models/account'
import { Budget } from '../models/budget'
import { BudgetItem } from '../models/budgetItem'
import { Category } from '../models/category'
import { Period } from '../models/periodicity'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    adjustmentText: {
      width: 100,
    },
    select: {
      minWidth: 250,
      marginRight: '20px',
    },
    descriptionCell: {
      fontWeight: 'bold',
    },
    positiveAmountCell: {
      textAlign: 'right',
      color: '#2aad5a',
    },
    negativeAmountCell: {
      textAlign: 'right',
      color: '#ff0000',
    },
    totalDescCell: {
      fontWeight: 'bold',
    },
    totalAmountCell: {
      textAlign: 'right',
      fontWeight: 'bold',
    },
    add: {
      backgroundColor: '#c9501c',
      color: '#ffffff',
      marginTop: 10,
    },
    table: {
      borderSpacing: '30px',
      fontSize: '16pt',
    },
    approvalButton: {
      backgroundColor: '#c9501c',
      color: '#ffffff',
      padding: 10,
      margin: 10,
      minWidth: 100,
    },
  })
)

const BudgetContent = () => {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [include, setInclude] = useState<boolean[]>([])
  const [balance, setBalance] = useState(0)
  const [period, setPeriod] = useState(Period.fortnight)
  const [adjustment, setAdjustment] = useState(0)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [approvedBudget, setApprovedBudget] = useState<Budget | null>(null)

  const [refresh, setRefresh] = useState(false)

  const classes = useStyles()

  //initial loading of accounts, performed only once
  useEffect(() => {
    db.accounts
      .find({})
      .sort({ name: 1 })
      .exec((err: Error | null, docs: any[]) => {
        if (!err && docs.length) {
          setAccounts(docs)
          setSelectedAccountId(docs[0]._id)
        }
      })
  }, [])

  //DB loading of items, repeated only on refresh or when the period or account change
  useEffect(() => {
    async function effect(selectedAccount: string) {
      const budget = (await getApprovedBudget(selectedAccount)) as Budget
      if (budget) {
        //a budget already exists: show its items
        setBudgetItems(budget.items)
        setInclude(budget.items.map(item => true))
        setApprovedBudget(budget)
      } else {
        //no approved budget: show all expenses for the chosen account
        let items = await getBudgetItems(period, selectedAccount)

        //incomes should appear before expenses; estimated should go after exact; everything else is sorted alphabetically
        items = items.sort((left, right) => {
          if (left.category !== right.category) {
            if (left.category === 'income') return -1
            if (right.category === 'income') return 1
          }

          if (!left.exact && right.exact) return 1
          if (!right.exact && left.exact) return -1
          return left.description.localeCompare(right.description)
        })
        setBudgetItems(items)
        setInclude(items.map(item => true))
        setApprovedBudget(null)
      }
    }

    if (accounts.length) {
      //this forces to wait for accounts to be loaded
      effect(selectedAccountId)
      setRefresh(false)
    }
  }, [refresh, selectedAccountId])

  //balance re-calculation, repeated whenever the inclusion of items changes or when the adjustment is edited
  useEffect(() => {
    setBalance(calculateBalance(budgetItems.filter((item, index) => include[index])))
  }, [budgetItems, include])

  const onPeriodChange = (event: ChangeEvent<any>) => {
    setPeriod(event.target.value)
    setRefresh(true)
  }

  const onAccountChange = (event: ChangeEvent<any>) => {
    setSelectedAccountId(event.target.value)
    setRefresh(true)
  }

  const onIncludeChange = useCallback(
    (event: ChangeEvent<any>, index: number) => {
      const newInclude = [...include]
      newInclude[index] = event.target.checked
      setInclude(newInclude)
    },
    [include]
  )

  const onAdjustmentChange = useCallback(
    (event: ChangeEvent<any>) => {
      setAdjustment(event.target.value)
      const newItems = [...budgetItems]
      newItems[newItems.length - 1].amount = Number(event.target.value)
      setBudgetItems(newItems)
    },
    [budgetItems]
  )

  const onToggleApproval = useCallback(() => {
    if (approvedBudget) {
      //approved -> remove approval
      db.budgets.remove({ account: selectedAccountId }, (err: Error | null, amount: number) =>
        setRefresh(true)
      )
    } else {
      //not yet approved -> approve
      db.budgets.insert(
        {
          account: selectedAccountId,
          items: budgetItems.filter((item, index) => include[index]),
        },
        (err: Error | null, doc: any) => setRefresh(true)
      )
    }
  }, [approvedBudget, selectedAccountId, budgetItems, include])

  return (
    <>
      <div></div>
      <div>
        <FormControl variant="filled">
          <InputLabel htmlFor="account">Account</InputLabel>
          <Select
            id="account"
            className={classes.select}
            value={selectedAccountId}
            onChange={onAccountChange}
          >
            {accounts.map(account => (
              <MenuItem value={(account as any)._id}>{account.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="filled">
          <InputLabel htmlFor="period">Period</InputLabel>
          <Select id="period" className={classes.select} value={period} onChange={onPeriodChange}>
            {Object.keys(Period).map(period => (
              <MenuItem value={period}>{period}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={onToggleApproval} className={classes.approvalButton}>
          {approvedBudget ? 'Remove approval' : 'Approve'}
        </Button>
      </div>
      <hr />
      <table className={classes.table}>
        <tbody>
          {budgetItems.map((item, index) => (
            <tr>
              <td>
                <Checkbox
                  id="automatic"
                  checked={include[index] || false}
                  onChange={event => onIncludeChange(event, index)}
                  disabled={!!approvedBudget}
                />
              </td>
              <td className={classes.descriptionCell}>
                {item.description}
                {item.exact ? '' : ' (est.)'}:
              </td>
              {item.description === 'Forecast adjustment' && !approvedBudget ? (
                <td className={classes.positiveAmountCell}>
                  <TextField
                    id="adjustment"
                    className={classes.adjustmentText}
                    inputProps={{ style: { textAlign: 'right', fontSize: '16pt' } }} //does not work in the class
                    type="number"
                    value={adjustment}
                    onChange={onAdjustmentChange}
                    variant="filled"
                    label=""
                  />
                </td>
              ) : (
                <>
                  <td
                    className={
                      item.category === Category.income
                        ? classes.positiveAmountCell
                        : classes.negativeAmountCell
                    }
                  >
                    ${item.amount.toCurrencyString()}
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td colSpan={3}>
              <hr />
            </td>
          </tr>
          <tr>
            <td></td>
            <td className={classes.totalDescCell}>Period balance:</td>
            <td className={classes.totalAmountCell}>${balance.toCurrencyString()}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default function Budget(props: any) {
  return (
    <RootContainer
      title="Budget"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<BudgetContent />} />
        </>
      }
    />
  )
}
