import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
        content: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
            padding: theme.spacing(3),
        }
    }))

export default function MainContainer({content}: {content: JSX.Element}) {
    const classes = useStyles();

    return (
        <main className={classes.content} >
            <div className={classes.toolbar} />
            {content}
        </main>
    )
}