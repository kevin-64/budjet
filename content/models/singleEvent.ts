import { Category } from "./category";

export interface RecurringEvent {
  id: number;
  date: Date;
  description: string;
  amount: number;
  category: Category;
}
