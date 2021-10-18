export enum Period {
  day,
  week,
  fortnight,
  month,
}

export interface Periodicity {
  period: Period;
  start: Date;
  end: Date;
}
