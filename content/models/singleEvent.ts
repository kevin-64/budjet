import { Category } from "./category";

export interface SingleEvent {
  id: number;
  date: Date;
  description: string;
  amount: number;
  category: Category;
}
