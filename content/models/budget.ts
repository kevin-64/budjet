import { BudgetItem } from './budgetItem'

export interface Budget {
  account: string
  items: BudgetItem[]
}
