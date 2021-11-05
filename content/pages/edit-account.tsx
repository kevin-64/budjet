import { Button, createStyles, makeStyles, TextField, Theme } from '@material-ui/core'
import { ColorPicker } from 'material-ui-color'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog'
import LeftDrawer from '../../components/LeftDrawer'
import MainContainer from '../../components/MainContainer'
import RootContainer from '../../components/RootContainer'
import { db } from '../lib/dbaccess'
const moment = require('moment')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mediumText: {
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
  const [name, setName] = useState('')
  const [color, setColor] = useState<any>('#000000')

  const [showDialog, setShowDialog] = useState(false)
  const [found, setFound] = useState(true)

  const [nameError, setNameError] = useState(true)
  const history = useHistory()
  const classes = useStyles()

  useEffect(() => {
    if (id) {
      db.accounts.findOne({ _id: id }, (err: Error | null, doc: any) => {
        console.log(doc)

        if (!doc) setFound(false)
        else {
          setFound(true)

          setName(doc.name)
          setColor(doc.color)
          setNameError(false)
        }
      })
    }
  }, [id])

  const onSubmit = useCallback(() => {
    if (!id) {
      db.accounts.insert(
        {
          name,
          color: `#${color.hex}` || '#000000',
          creationDate: moment.utc().format('MM/DD/YYYY'),
        },
        (err: Error | null, doc: any) => history.push('/accounts')
      )
    } else {
      const updateObj: any = {
        name,
        color: `#${color.hex}` || '#000000',
      }
      db.accounts.update(
        { _id: id },
        updateObj,
        {},
        (err: Error | null, numUpd: number, ups: boolean) => history.push('/accounts')
      )
    }
  }, [id, name, color])

  const validateName = (name: string) => {
    return !(name === null || name === undefined || name.length === 0)
  }

  const showDeleteConfirm = useCallback(() => setShowDialog(true), [])

  const onDelete = useCallback(() => {
    if (id) {
      db.accounts.remove({ _id: id }, (err: Error | null, amount: number) =>
        history.push('/accounts')
      )
    }
  }, [id])

  const onColorChange = (newColor: any) => {
    setColor(newColor)
  }

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    switch (event.target.id) {
      case 'name':
        if (!validateName(event.target.value)) {
          setNameError(true)
        } else {
          setNameError(false)
        }
        setName(event.target.value)
        break
    }
  }

  return (
    <>
      {found ? (
        <>
          <TextField
            id="name"
            className={classes.mediumText}
            value={name}
            onChange={onChange}
            error={nameError}
            helperText={nameError && 'Account name is required'}
            variant="filled"
            label="Name"
          />
          <br />
          <br />
          <ColorPicker
            value={color}
            defaultValue="#000000"
            onChange={(color: any) => onColorChange(color)}
          />
          <br />
          <br />
          <Button to="/accounts" className={classes.cancel} component={Link}>
            Back to account list
          </Button>
          <Button onClick={onSubmit} className={classes.submit} disabled={nameError}>
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
        <h3>Account id not found - it may have been deleted.</h3>
      )}
    </>
  )
}

export default function EditAccount(props: any) {
  const id =
    props.location &&
    props.location.search &&
    props.location.search.includes('?id=') &&
    props.location.search.replace('?id=', '')
  return (
    <RootContainer
      title={id ? 'Edit account info' : 'Add account'}
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<EditContent id={id} />} />
        </>
      }
    />
  )
}
