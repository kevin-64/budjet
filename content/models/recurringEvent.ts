import { Category } from "./category";
import { Periodicity } from "./periodicity";

export interface RecurringEvent {
  id: number;
  periodicity: Periodicity;
  description: string;
  amount: number;
  category: Category;
  automatic: boolean;
}
