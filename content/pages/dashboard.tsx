import { Typography } from '@material-ui/core'
import React from 'react'
import LeftDrawer from '../../components/LeftDrawer'
import RootContainer from '../../components/RootContainer'
import MainContainer from '../../components/MainContainer'

const DashboardContent = () => (
  <>
    <Typography>BudJet dashboard</Typography>
    <br />
    <br />
  </>
)

export default function Dashboard() {
  return (
    <RootContainer
      title="Dashboard"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<DashboardContent />} />
        </>
      }
    />
  )
}
