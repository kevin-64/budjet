import {
  Button,
  createStyles,
  Link,
  makeStyles,
  TextField,
  Theme,
  Toolbar,
} from '@material-ui/core'
import { DataGrid, GridColDef, GridCellParams } from '@material-ui/data-grid'
import moment from 'moment'
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import ConfirmDialog from '../../components/ConfirmDialog'
import LeftDrawer from '../../components/LeftDrawer'
import MainContainer from '../../components/MainContainer'
import RootContainer from '../../components/RootContainer'
import { db } from '../lib/dbaccess'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      minHeight: 0,
      paddingLeft: 0,
    },
    mediumText: {
      minWidth: 400,
    },
    clear: {
      backgroundColor: '#3f51b5',
      color: '#ffffff',
      marginLeft: 10,
    },
    tableContainer: {
      height: 450,
      width: '100%',
    },
    add: {
      backgroundColor: '#c9501c',
      color: '#ffffff',
      marginTop: 10,
    },
  })
)

const AccountsContent = () => {
  const [accounts, setAccounts] = useState<any[]>([])
  const [nameFilter, setNameFilter] = useState('')
  const [idToDelete, setIdToDelete] = useState('')

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [refresh, setRefresh] = useState(false)

  const history = useHistory()
  const classes = useStyles()

  useEffect(() => {
    if (!nameFilter) {
      db.accounts
        .find({})
        .sort({ creationDate: 1 })
        .exec((err: Error | null, docs: any[]) => {
          setAccounts(
            docs.map(d => {
              return {
                ...d,
                id: d._id,
                creationDate: moment.utc(d.creationDate).format('yyyy-MM-DD'),
              }
            })
          )
        })
    } else {
      const filter: any = { name: new RegExp(nameFilter, 'i') }

      console.log(filter)
      db.accounts
        .find(filter)
        .sort({ creationDate: 1 })
        .exec((err: Error | null, docs: any[]) => {
          if (docs)
            setAccounts(
              docs.map(d => {
                return {
                  ...d,
                  id: d._id,
                  creationDate: moment.utc(d.creationDate).format('yyyy-MM-DD'),
                }
              })
            )
        })
    }
    setRefresh(false)
  }, [nameFilter, refresh])

  const clearFilters = () => {
    setNameFilter('')
  }

  const onNameFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNameFilter(event.target.value)
  }

  const onDelete = useCallback(() => {
    if (idToDelete) {
      db.accounts.remove({ _id: idToDelete }, (err: Error | null, amount: number) =>
        setRefresh(true)
      )
      setShowDeleteDialog(false)
    }
  }, [idToDelete])

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 400 },
    {
      field: 'creationDate',
      headerName: 'Creation Date',
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>
          <div>{moment.utc(params.row.creationDate).format('MM/DD/yyyy')}</div>
        </>
      ),
    },
    {
      field: 'color',
      headerName: 'Color',
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>
          <div
            style={{
              backgroundColor: params.getValue(params.id, 'color') as string,
              width: 200,
              height: 20,
            }}
          ></div>
        </>
      ),
    },
    {
      field: '-delete-',
      headerName: ' ',
      renderCell: (params: GridCellParams) => {
        const onClick = () => {
          setIdToDelete(params.row.id as string)
          setShowDeleteDialog(true)
        }

        return (
          <Button style={{ color: '#3f51b5' }} onClick={onClick}>
            Delete
          </Button>
        )
      },
    },
  ]

  return (
    <>
      <Toolbar className={classes.toolbar}>
        <TextField
          id="name-filter"
          className={classes.mediumText}
          value={nameFilter}
          onChange={onNameFilterChange}
          size="small"
          label="Name"
        />
        <Button onClick={clearFilters} className={classes.clear}>
          Clear filters
        </Button>
      </Toolbar>
      <hr />
      <div className={classes.tableContainer}>
        <DataGrid
          rows={accounts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          onRowDoubleClick={row => history.push(`edit-account?id=${row.id}`)}
        />
      </div>
      <Button href="#/edit-account" className={classes.add} component={Link}>
        Add
      </Button>
      <ConfirmDialog
        prompt="this account"
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        setConfirm={onDelete}
      />
    </>
  )
}

export default function Accounts(props: any) {
  return (
    <RootContainer
      title="Account list"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<AccountsContent />} />
        </>
      }
    />
  )
}
