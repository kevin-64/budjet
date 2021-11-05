export enum Period {
  day = 'day',
  week = 'week',
  fortnight = 'fortnight',
  month = 'month',
}

export interface Periodicity {
  period: Period
  start: Date
  end?: Date
}
