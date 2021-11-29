import { Button, createStyles, makeStyles, Theme, Toolbar } from '@material-ui/core'
import React, { ChangeEvent, useRef } from 'react'
import LeftDrawer from '../../components/LeftDrawer'
import MainContainer from '../../components/MainContainer'
import RootContainer from '../../components/RootContainer'
import { getDbContentForExport, importDbContent } from '../lib/dbaccess'
import downloadJSON from '../lib/download'
const moment = require('moment')

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      minHeight: 0,
      paddingLeft: 0,
    },
    export: {
      backgroundColor: '#c9501c',
      color: '#ffffff',
    },
    import: {
      backgroundColor: '#3f51b5',
      color: '#ffffff',
      marginLeft: 10,
    },
  })
)

const ExportContent = () => {
  const classes = useStyles()

  const fileRef = useRef<HTMLInputElement>(null)

  const exportDb = () => {
    getDbContentForExport().then(res => {
      downloadJSON(document, res, `dbExport-${moment().format('YYYY-MM-DD-hh-mm-ss')}.json`)
    })
  }

  const importDb = (content: string) => {
    importDbContent(content)
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = e => importDb(reader.result as string)
      reader.readAsText(file)
    }
  }

  return (
    <>
      <Toolbar className={classes.toolbar}>
        <Button onClick={exportDb} className={classes.export}>
          Export database
        </Button>
        <Button onClick={() => fileRef.current?.click()} className={classes.import}>
          Import database
        </Button>
        <input
          ref={fileRef}
          style={{ display: 'none' }}
          type="file"
          name="file"
          accept="*.json"
          multiple={false}
          onChange={onFileChange}
        />
      </Toolbar>
      <hr />
    </>
  )
}

export default function Export(props: any) {
  return (
    <RootContainer
      title="Import/export"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<ExportContent />} />
        </>
      }
    />
  )
}
