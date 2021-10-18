import { AppBar, createStyles, CssBaseline, makeStyles, Theme, Toolbar, Typography } from "@material-ui/core"
import React from "react"
import { DRAWER_WIDTH } from "../config/constants"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        toolbar: theme.mixins.toolbar,
        root: {
            display: 'flex',
        },
        appBar: {
            width: `calc(100% - ${DRAWER_WIDTH}px)`,
            marginLeft: DRAWER_WIDTH,
        },
    })
)

export default function RootContainer({ title, content }: { title: string, content: JSX.Element }) {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Typography variant="h6" noWrap>
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            {content}
        </div>
    )
}