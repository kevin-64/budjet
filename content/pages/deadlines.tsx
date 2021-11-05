import { Button, Checkbox, createStyles, Link, makeStyles, Theme } from '@material-ui/core'
import { DataGrid, GridCellParams, GridColDef } from '@material-ui/data-grid'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import LeftDrawer from '../../components/LeftDrawer'
import MainContainer from '../../components/MainContainer'
import RootContainer from '../../components/RootContainer'
import { db } from '../lib/dbaccess'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    mediumText: {
      minWidth: 400,
      marginRight: 20,
    },
    tableContainer: {
      height: 1400,
      width: '100%',
    },
    add: {
      backgroundColor: '#c9501c',
      color: '#ffffff',
      marginTop: 10,
    },
  })
)

const DeadlinesContent = () => {
  const [deadlines, setDeadlines] = useState<any[]>([])

  const [refresh, setRefresh] = useState(false)

  const classes = useStyles()

  useEffect(() => {
    db.deadlines
      .find({ paid: false })
      .sort({ date: 1 })
      .exec((err: Error | null, docs: any[]) => {
        setDeadlines(
          docs.map(d => {
            return {
              ...d,
              id: d._id,
            }
          })
        )
      })
    setRefresh(false)
  }, [refresh])

  const onCheckPaid = (id: string, event: any) => {
    db.deadlines.update(
      { _id: id },
      { $set: { paid: true } },
      {},
      (err: Error | null, numUpd: number, ups: boolean) => setRefresh(true)
    )
  }

  const columns: GridColDef[] = [
    { field: 'description', headerName: 'Description', width: 600 },
    { field: 'amount', headerName: 'Amount', width: 200 },
    {
      field: 'date',
      headerName: 'Date',
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>
          <div>{moment.utc(params.row.date).format('MM/DD/yyyy')}</div>
        </>
      ),
    },
    {
      field: '-event-',
      headerName: ' ',
      renderCell: (params: GridCellParams) => {
        return (
          <Button href={`/#/edit-recurring-event?id=${params.row.eventId}`} component={Link}>
            Go to event
          </Button>
        )
      },
    },
    {
      field: '-isPaid-',
      headerName: 'Paid',
      width: 200,
      renderCell: (params: GridCellParams) => {
        return <Checkbox onChange={event => onCheckPaid(params.row.id, event)} />
      },
    },
  ]

  return (
    <>
      <div className={classes.tableContainer}>
        <DataGrid rows={deadlines} columns={columns} pageSize={20} rowsPerPageOptions={[20]} />
      </div>
    </>
  )
}

export default function Deadlines(props: any) {
  return (
    <RootContainer
      title="Deadlines"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<DeadlinesContent />} />
        </>
      }
    />
  )
}
