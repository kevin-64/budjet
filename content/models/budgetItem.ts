import { Category } from './category'

export interface BudgetItem {
  description: string
  amount: number
  category: Category
  exact: boolean
}
