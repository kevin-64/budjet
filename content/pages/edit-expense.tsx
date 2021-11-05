import {
  Button,
  createStyles,
  FormControl,
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
import { db } from '../lib/dbaccess'
import { Category } from '../models/category'
const moment = require('moment')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    largeText: {
      minWidth: 800,
    },
    smallText: {
      maxWidth: 100,
    },
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
  const [date, setDate] = useState(moment().format('yyyy-MM-DD'))
  const [amount, setAmount] = useState<number>(0)
  const [category, setCategory] = useState('')

  const [showDialog, setShowDialog] = useState(false)
  const [found, setFound] = useState(true)

  const [descriptionError, setDescriptionError] = useState(true)
  const [amountError, setAmountError] = useState(true)
  const [dateError, setDateError] = useState(false)

  const history = useHistory()
  const classes = useStyles()

  useEffect(() => {
    if (id) {
      db.singleEvents.findOne({ _id: id }, (err: Error | null, doc: any) => {
        console.log(doc)

        if (!doc) setFound(false)
        else {
          setFound(true)

          setDescription(doc.description)
          setDate(moment.utc(doc.date).format('yyyy-MM-DD'))
          setAmount(doc.amount)
          setCategory(doc.category)

          setDescriptionError(false)
          setAmountError(false)
          setDateError(false)
        }
      })
    }
  }, [id])

  const onSubmit = useCallback(() => {
    if (!id) {
      db.singleEvents.insert(
        {
          description,
          amount,
          category,
          date,
        },
        (err: Error | null, doc: any) => history.push('/expenses')
      )
    } else {
      const updateObj: any = {
        description,
        amount,
        category,
        date,
      }
      console.log(updateObj)
      db.singleEvents.update(
        { _id: id },
        updateObj,
        {},
        (err: Error | null, numUpd: number, ups: boolean) => history.push('/expenses')
      )
    }
  }, [id, description, amount, category, date])

  const validateDesc = (description: string) => {
    return !(description === null || description === undefined || description.length === 0)
  }

  const validateAmount = (amount: number) => {
    return !!amount
  }

  const validateDate = (date: string) => {
    return !(date === null || date === undefined) && new Date(date)
  }

  const showDeleteConfirm = useCallback(() => setShowDialog(true), [])

  const onDelete = useCallback(() => {
    if (id) {
      db.singleEvents.remove({ _id: id }, (err: Error | null, amount: number) =>
        history.push('/expenses')
      )
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
      case 'date':
        if (!validateDate(event.target.value)) {
          setDateError(true)
        } else {
          setDateError(false)
        }
        setDate(event.target.value)
        break
    }
  }

  const onCategoryChange = (event: ChangeEvent<any>) => {
    setCategory(event.target.value)
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
          <TextField
            id="date"
            className={classes.mediumText}
            type="date"
            value={date}
            onChange={onChange}
            error={dateError}
            helperText={dateError && 'Date is required'}
            variant="filled"
            label="Date"
          />
          <br />
          <br />
          <Button to="/expenses" className={classes.cancel} component={Link}>
            Back to expense list
          </Button>
          <Button
            onClick={onSubmit}
            className={classes.submit}
            disabled={descriptionError || amountError || dateError}
          >
            {id ? 'Save' : 'Add'}
          </Button>
          {id && (
            <>
              <Button onClick={showDeleteConfirm} className={classes.delete}>
                Delete
              </Button>
              <ConfirmDialog open={showDialog} setOpen={setShowDialog} setConfirm={onDelete} />
            </>
          )}
        </>
      ) : (
        <h3>Event id not found - it may have been deleted.</h3>
      )}
    </>
  )
}

export default function EditExpense(props: any) {
  const id =
    props.location &&
    props.location.search &&
    props.location.search.includes('?id=') &&
    props.location.search.replace('?id=', '')
  return (
    <RootContainer
      title={id ? 'Edit expense' : 'Add expense'}
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<EditContent id={id} />} />
        </>
      }
    />
  )
}
