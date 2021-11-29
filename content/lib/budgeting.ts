import moment from 'moment'
import { BudgetItem } from '../models/budgetItem'
import { Category } from '../models/category'
import { Deadline } from '../models/deadline'
import { daysPerPeriod, Period } from '../models/periodicity'
import { RecurringEvent } from '../models/recurringEvent'
import { db } from './dbaccess'

function findRecurringEvents(param: any, order?: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!order) {
      db.recurringEvents.find(param, (err: Error | null, docs: any[]) => {
        if (err) return reject(err)
        resolve(docs)
      })
    } else {
      db.recurringEvents
        .find(param)
        .sort(order)
        .exec((err: Error | null, docs: any[]) => {
          if (err) return reject(err)
          resolve(docs)
        })
    }
  })
}

function findExpenses(param: any, order?: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!order) {
      db.singleEvents.find(param, (err: Error | null, docs: any[]) => {
        if (err) return reject(err)
        resolve(docs)
      })
    } else {
      db.singleEvents
        .find(param)
        .sort(order)
        .exec((err: Error | null, docs: any[]) => {
          if (err) return reject(err)
          resolve(docs)
        })
    }
  })
}

function findBudget(param: any): Promise<any> {
  return new Promise((resolve, reject) => {
    db.budgets
      .find(param)
      .limit(1)
      .exec((err: Error | null, docs: any[]) => {
        if (err) return reject(err)
        resolve(docs[0])
      })
  })
}

function findAccounts(param: any): Promise<any> {
  return new Promise((resolve, reject) => {
    db.accounts.find(param, (err: Error | null, docs: any[]) => {
      if (err) return reject(err)
      resolve(docs)
    })
  })
}

function proRate(amount: number, originalPeriod: Period, newPeriod: Period) {
  if (originalPeriod === newPeriod) return amount //avoids approximation errors
  return (amount / daysPerPeriod[originalPeriod]) * daysPerPeriod[newPeriod]
}

export function calculateDeadlines(event: RecurringEvent, id: string): Deadline[] {
  const deadlines: Deadline[] = []

  let period: [number, 'days' | 'months']
  switch (event.periodicity.period) {
    case Period.day:
      period = [1, 'days']
      break
    case Period.week:
      period = [7, 'days']
      break
    case Period.fortnight:
      period = [14, 'days']
      break
    case Period.month:
      period = [1, 'months']
      break
  }

  let date = event.periodicity.start
  let end
  if (event.periodicity.end && event.periodicity.end < moment().endOf('year').toDate())
    end = event.periodicity.end
  else end = moment().endOf('year').toDate()

  while (date <= end) {
    deadlines.push({
      description: event.description,
      eventId: id,
      amount: event.amount,
      date,
      paid: false,
    })
    date = moment(date).add(period[0], period[1]).toDate()
  }

  return deadlines
}

export async function getBudgetItems(
  proratePeriod: Period,
  accountId: string
): Promise<BudgetItem[]> {
  const items: BudgetItem[] = []

  const today = moment().startOf('day').toDate()
  const oneMonthAgo = moment().subtract(1, 'months').toDate()

  //recurring events are added to the budget prorated for the correct period
  let recurringEvents = await findRecurringEvents({
    accountId,
  })

  //for some reason the $and filter does not work so we do it manually
  recurringEvents = recurringEvents.filter(event => {
    return new Date(event.periodicity.end) >= today
  })

  recurringEvents = recurringEvents.map(event => {
    return {
      ...event,
      amount: proRate(event.amount, event.periodicity.period, proratePeriod),
      periodicity: undefined,
      automatic: undefined,
      exact: true,
    }
  })

  items.push(...recurringEvents)

  //expenses are estimated based on the sum of expenses over the last month, prorated for the correct period
  let lastMonthExpenses = await findExpenses({
    accountId,
  })

  lastMonthExpenses = lastMonthExpenses.filter(expense => {
    const dt = new Date(expense.date)
    return dt <= today && dt >= oneMonthAgo
  })

  items.push({
    description: 'Expenses',
    amount: proRate(
      lastMonthExpenses.reduce((total: number, expense: any) => (total += expense.amount), 0),
      Period.month,
      proratePeriod
    ),
    category: Category.misc,
    exact: false,
  })

  items.push({
    description: 'Forecast adjustment',
    amount: 0, //the user will determine it
    category: Category.misc,
    exact: false,
  })

  return items
}

export function calculateBalance(items: BudgetItem[]) {
  let balance = 0

  items.forEach(item => {
    if (item.category === Category.income) balance += item.amount
    else balance -= item.amount
  })

  return balance
}

export async function getApprovedBudget(accountId: string) {
  return await findBudget({ account: accountId })
}

async function getAccountById(accountId: string) {
  const accounts = await findAccounts({ _id: accountId })
  return accounts[0]
}

export async function getRecurringEvents(filter?: any) {
  const recEvents = await findRecurringEvents(filter || {}, { 'periodicity.start': 1 })
  return Promise.all(
    recEvents.map(async event => {
      const account = await getAccountById(event.accountId)
      return {
        ...event,
        accountObj: account,
        account: account.name,
        id: event._id,
      }
    })
  )
}

export async function getExpenses(filter?: any) {
  const expenses = await findExpenses(filter || {}, { date: 1 })
  return Promise.all(
    expenses.map(async expense => {
      const account = await getAccountById(expense.accountId)
      return {
        ...expense,
        accountObj: account,
        account: account.name,
        id: expense._id,
      }
    })
  )
}
