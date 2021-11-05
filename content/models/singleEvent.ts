import { Category } from "./category";

export interface SingleEvent {
  date: Date;
  description: string;
  amount: number;
  category: Category;
}
