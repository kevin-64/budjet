import moment from 'moment'
import { Deadline } from '../models/deadline'
import { Period } from '../models/periodicity'
import { RecurringEvent } from '../models/recurringEvent'

export function getDeadlines(event: RecurringEvent, id: string): Deadline[] {
  const deadlines: Deadline[] = []

  let period: [number, 'days' | 'months']
  switch (event.periodicity.period) {
    case Period.day:
      period = [1, 'days']
      break
    case Period.week:
      period = [7, 'days']
      break
    case Period.fortnight:
      period = [14, 'days']
      break
    case Period.month:
      period = [1, 'months']
      break
  }

  let date = event.periodicity.start
  let end
  if (event.periodicity.end && event.periodicity.end < moment().endOf('year').toDate())
    end = event.periodicity.end
  else end = moment().endOf('year').toDate()

  while (date <= end) {
    deadlines.push({
      description: event.description,
      eventId: id,
      amount: event.amount,
      date,
      paid: false,
    })
    date = moment(date).add(period[0], period[1]).toDate()
  }

  return deadlines
}
