export enum Period {
  day = 'day',
  week = 'week',
  fortnight = 'fortnight',
  month = 'month',
}

export const daysPerPeriod = {
  day: 1,
  week: 7,
  fortnight: 14,
  month: 30,
}

export interface Periodicity {
  period: Period
  start: Date
  end?: Date
}
