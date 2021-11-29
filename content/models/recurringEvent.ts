import { Category } from './category'
import { Periodicity } from './periodicity'

export interface RecurringEvent {
  periodicity: Periodicity
  description: string
  amount: number
  category: Category
  automatic: boolean
  accountId: string
}
