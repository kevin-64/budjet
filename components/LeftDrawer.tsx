import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";
import { DRAWER_WIDTH } from "../config/constants";
import { Link, useHistory } from "react-router-dom";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import { ListItemIcon } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: theme.mixins.toolbar,
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
    },
    backArrow: {
      color: "#ffffff",
    },
    drawerPaper: {
      width: DRAWER_WIDTH,
      backgroundColor: "#1c95c9",
    },
    listItem: {
      color: "#ffffff",
    },
  })
);

export default function LeftDrawer(props: any) {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Drawer
      className={classes.drawer}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
      anchor="left"
    >
      <div className={classes.toolbar} />
      <List>
        <ListItem
          onClick={() => history.goBack()}
          className={classes.listItem}
          button
        >
          <ListItemIcon>
            <ArrowBackIcon className={classes.backArrow} />
          </ListItemIcon>
        </ListItem>
        <ListItem />
        {[
          "Dashboard",
          "Budget",
          "Cash flow",
          "Reconciliation",
          "Deadlines",
          "Expenses",
          "Accounts",
          "Export",
        ].map((text, index) => (
          <ListItem
            to={`/${
              text !== "Dashboard" ? text.replace(" ", "").toLowerCase() : ""
            }`}
            component={Link}
            className={classes.listItem}
            button
            key={text}
          >
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
