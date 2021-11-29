import {
  Button,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Theme,
} from '@material-ui/core'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog'
import LeftDrawer from '../../components/LeftDrawer'
import MainContainer from '../../components/MainContainer'
import RootContainer from '../../components/RootContainer'
import { calculateDeadlines } from '../lib/budgeting'
import { db } from '../lib/dbaccess'
import { Account } from '../models/account'
import { Category } from '../models/category'
import { Period } from '../models/periodicity'
const moment = require('moment')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mediumText: {
      minWidth: 250,
    },
    select: {
      minWidth: 250,
    },
    cancel: {
      backgroundColor: '#ffffff',
      color: '#c9501c',
      padding: 10,
      margin: 10,
    },
    submit: {
      backgroundColor: '#c9501c',
      color: '#ffffff',
      padding: 10,
      margin: 10,
      minWidth: 100,
    },
    delete: {
      backgroundColor: '#3f51b5',
      color: '#ffffff',
      marginLeft: 100,
      padding: 10,
      minWidth: 100,
    },
  })
)

const EditContent = ({ id }: { id: string }) => {
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState('')
  const [startDate, setStartDate] = useState(moment.utc().format('yyyy-MM-DD'))
  const [endDate, setEndDate] = useState(moment.utc().add(1, 'years').format('yyyy-MM-DD'))
  const [amount, setAmount] = useState<number>(0)
  const [category, setCategory] = useState('')
  const [automatic, setAutomatic] = useState(false)
  const [accountId, setAccountId] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])

  const [showDialog, setShowDialog] = useState(false)
  const [found, setFound] = useState(true)

  const [descriptionError, setDescriptionError] = useState(true)
  const [amountError, setAmountError] = useState(true)
  const [periodError, setPeriodError] = useState(true)
  const [startDateError, setStartDateError] = useState(false)
  const [accountError, setAccountError] = useState(true)

  const history = useHistory()
  const classes = useStyles()

  //initial loading of accounts, performed only once
  useEffect(() => {
    db.accounts
      .find({})
      .sort({ name: 1 })
      .exec((err: Error | null, docs: any[]) => {
        if (!err && docs.length) {
          setAccounts(docs)
        }
      })
  }, [])

  useEffect(() => {
    if (id) {
      db.recurringEvents.findOne({ _id: id }, (err: Error | null, doc: any) => {
        console.log(doc)

        if (!doc) setFound(false)
        else {
          setFound(true)

          setDescription(doc.description)
          setPeriod(doc.periodicity.period)
          setStartDate(moment.utc(doc.periodicity.start).format('yyyy-MM-DD'))
          setEndDate(moment.utc(doc.periodicity.end).format('yyyy-MM-DD'))
          setAmount(doc.amount)
          setCategory(doc.category)
          setAutomatic(doc.automatic)
          setAccountId(doc.accountId)

          setDescriptionError(false)
          setAmountError(false)
          setStartDateError(false)
          setPeriodError(false)
          setAccountError(false)
        }
      })
    }
  }, [id])

  const onSubmit = useCallback(() => {
    if (!id) {
      db.recurringEvents.insert(
        {
          description,
          amount,
          category,
          periodicity: {
            period,
            start: new Date(startDate),
            end: endDate && new Date(endDate),
          },
          accountId,
          automatic,
        },
        (err: Error | null, doc: any) => {
          if (!automatic) {
            //automatic events do not need deadlines to remember them
            const deadlines = calculateDeadlines(doc, doc._id)
            if (deadlines.length) {
              db.deadlines.insert(deadlines, (err: Error | null, docs: any[]) =>
                history.push('/recurring-events')
              )
            } else {
              history.push('/recurring-events')
            }
          } else {
            history.push('/recurring-events')
          }
        }
      )
    } else {
      const updateObj: any = {
        description,
        amount,
        category,
        periodicity: {
          period,
          start: new Date(startDate),
          end: new Date(endDate),
        },
        accountId,
        automatic,
      }
      console.log(updateObj)
      db.recurringEvents.update(
        { _id: id },
        updateObj,
        {},
        (err: Error | null, numUpd: number, ups: boolean) => {
          const today = moment().startOf('day').toDate()
          db.deadlines.remove(
            { eventId: id, date: { $gte: today } },
            { multi: true },
            (err: Error | null, amount: number) => {
              if (!updateObj.automatic) {
                let deadlines = calculateDeadlines(updateObj, id)
                if (deadlines.length) {
                  deadlines = deadlines.filter(d => d.date >= today)
                  db.deadlines.insert(deadlines, (err: Error | null, docs: any[]) =>
                    history.push('/recurring-events')
                  )
                } else {
                  history.push('/recurring-events')
                }
              } else {
                history.push('/recurring-events')
              }
            }
          )
        }
      )
    }
  }, [id, description, amount, category, period, startDate, endDate, automatic, accountId])

  const validateDesc = (description: string) => {
    return !(description === null || description === undefined || description.length === 0)
  }

  const validateAmount = (amount: number) => {
    return !!amount
  }

  const validateStartDate = (date: string) => {
    return !(date === null || date === undefined) && new Date(date)
  }

  const showDeleteConfirm = useCallback(() => setShowDialog(true), [])

  const onDelete = useCallback(() => {
    if (id) {
      db.recurringEvents.remove({ _id: id }, (err: Error | null, amount: number) => {
        db.deadlines.remove(
          { eventId: id },
          { multi: true },
          (err: Error | null, amount: number) => {
            history.push('/recurring-events')
          }
        )
      })
    }
  }, [id])

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    switch (event.target.id) {
      case 'description':
        if (!validateDesc(event.target.value)) {
          setDescriptionError(true)
        } else {
          setDescriptionError(false)
        }
        setDescription(event.target.value)
        break
      case 'amount':
        if (!validateAmount(Number(event.target.value))) {
          setAmountError(true)
        } else {
          setAmountError(false)
        }
        setAmount(Number(event.target.value))
        break
      case 'startDate':
        if (!validateStartDate(event.target.value)) {
          setStartDateError(true)
        } else {
          setStartDateError(false)
        }
        setStartDate(event.target.value)
        break
      case 'endDate':
        setEndDate(event.target.value)
        break
    }
  }

  const onCategoryChange = (event: ChangeEvent<any>) => {
    setCategory(event.target.value)
  }

  const onPeriodChange = (event: ChangeEvent<any>) => {
    if (event.target.value) setPeriodError(false)
    else setPeriodError(true)

    setPeriod(event.target.value)
  }

  const onAutomaticChange = (event: ChangeEvent<any>) => {
    setAutomatic(event.target.checked)
  }

  const onAccountChange = (event: ChangeEvent<any>) => {
    if (event.target.value) setAccountError(false)
    else setAccountError(true)

    setAccountId(event.target.value)
  }

  return (
    <>
      {found ? (
        <>
          <TextField
            id="description"
            className={classes.mediumText}
            value={description}
            onChange={onChange}
            error={descriptionError}
            helperText={descriptionError && 'Description is required'}
            variant="filled"
            label="Description"
          />
          <br />
          <br />
          <TextField
            id="amount"
            className={classes.mediumText}
            type="number"
            value={amount}
            onChange={onChange}
            error={amountError}
            helperText={amountError && 'A nonzero amount is required.'}
            variant="filled"
            label="Amount"
          />
          <br />
          <br />
          <FormControl variant="filled">
            <InputLabel htmlFor="category">Category</InputLabel>
            <Select
              id="category"
              className={classes.select}
              value={category}
              onChange={onCategoryChange}
            >
              {Object.keys(Category)
                .sort((cat1, cat2) => {
                  if (cat1 < cat2) {
                    return -1
                  }
                  if (cat1 > cat2) {
                    return 1
                  }

                  return 0
                })
                .map(cat => (
                  <MenuItem value={cat}>{cat}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <FormControl variant="filled">
            <InputLabel htmlFor="period">Repeats every</InputLabel>
            <Select
              id="period"
              className={classes.select}
              value={period}
              onChange={onPeriodChange}
              error={periodError}
            >
              {Object.keys(Period).map(period => (
                <MenuItem value={period}>{period}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <FormControl variant="filled">
            <InputLabel htmlFor="account">Account</InputLabel>
            <Select
              id="account"
              className={classes.select}
              value={accountId}
              onChange={onAccountChange}
              error={accountError}
            >
              {accounts.map(account => (
                <MenuItem value={(account as any)._id}>{account.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />
          <br />
          <TextField
            id="startDate"
            className={classes.mediumText}
            type="date"
            value={startDate}
            onChange={onChange}
            error={startDateError}
            helperText={startDateError && 'Start date is required'}
            variant="filled"
            label="Start Date"
            disabled={!!id}
          />
          <br />
          <br />
          <TextField
            id="endDate"
            className={classes.mediumText}
            type="date"
            value={endDate}
            onChange={onChange}
            variant="filled"
            label="End Date"
          />
          <br />
          <br />
          <FormControlLabel
            control={<Checkbox id="automatic" checked={automatic} onChange={onAutomaticChange} />}
            label="Automatic"
          />
          <br />
          <br />
          <Button to="/recurring-events" className={classes.cancel} component={Link}>
            Back to event list
          </Button>
          <Button
            onClick={onSubmit}
            className={classes.submit}
            disabled={
              descriptionError || amountError || startDateError || periodError || accountError
            }
          >
            {id ? 'Save' : 'Add'}
          </Button>
          {id && (
            <>
              <Button onClick={showDeleteConfirm} className={classes.delete}>
                Delete
              </Button>
              <ConfirmDialog
                open={showDialog}
                setOpen={setShowDialog}
                setConfirm={onDelete}
                prompt="this event"
              />
            </>
          )}
        </>
      ) : (
        <h3>Event id not found - it may have been deleted.</h3>
      )}
    </>
  )
}

export default function EditRecurringEvent(props: any) {
  const id =
    props.location &&
    props.location.search &&
    props.location.search.includes('?id=') &&
    props.location.search.replace('?id=', '')
  return (
    <RootContainer
      title={id ? 'Edit recurring event' : 'Add recurring event'}
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<EditContent id={id} />} />
        </>
      }
    />
  )
}
