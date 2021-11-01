import {
  Button,
  createStyles,
  FormControl,
  Link,
  makeStyles,
  TextField,
  Theme,
  Toolbar,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { DataGrid, GridColDef, GridCellParams } from "@material-ui/data-grid";
import moment from "moment";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import ConfirmDialog from "../../components/ConfirmDialog";
import LeftDrawer from "../../components/LeftDrawer";
import MainContainer from "../../components/MainContainer";
import RootContainer from "../../components/RootContainer";
import { db } from "../lib/dbaccess";
import { Category } from "../models/category";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      minHeight: 0,
      paddingLeft: 0,
    },
    mediumText: {
      minWidth: 400,
      marginRight: 20,
    },
    clear: {
      backgroundColor: "#3f51b5",
      color: "#ffffff",
      marginLeft: 10,
    },
    aroundSelect: {
      marginLeft: 10,
    },
    select: {
      minWidth: 250,
      marginLeft: 10,
    },
    tableContainer: {
      height: 450,
      width: "100%",
    },
    add: {
      backgroundColor: "#c9501c",
      color: "#ffffff",
      marginTop: 10,
    },
  })
);

const ExpensesContent = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [descFilter, setDescFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [idToDelete, setIdToDelete] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    if (!descFilter && !categoryFilter) {
      db.singleEvents
        .find({})
        .sort({ date: 1 })
        .exec((err: Error | null, docs: any[]) => {
          setExpenses(
            docs.map((d) => {
              return {
                ...d,
                id: d._id,
              };
            })
          );
        });
    } else {
      const filter: any = {};

      if (descFilter) filter.description = new RegExp(descFilter, "i");
      if (categoryFilter) filter.category = new RegExp(categoryFilter, "i");

      console.log(filter);
      db.singleEvents
        .find(filter)
        .sort({ date: 1 })
        .exec((err: Error | null, docs: any[]) => {
          if (docs)
            setExpenses(
              docs.map((d) => {
                return {
                  ...d,
                  id: d._id,
                };
              })
            );
        });
    }
    setRefresh(false);
  }, [descFilter, categoryFilter, refresh]);

  const clearFilters = () => {
    setDescFilter("");
    setCategoryFilter("");
  };

  const onDescFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDescFilter(event.target.value);
  };

  const onCategoryFilterChange = (event: ChangeEvent<any>) => {
    setCategoryFilter(event.target.value);
  };

  const onDelete = useCallback(() => {
    if (idToDelete) {
      db.singleEvents.remove(
        { _id: idToDelete },
        (err: Error | null, amount: number) => setRefresh(true)
      );
      setShowDeleteDialog(false);
    }
  }, [idToDelete]);

  const columns: GridColDef[] = [
    { field: "description", headerName: "Description", width: 600 },
    { field: "category", headerName: "Category", width: 400 },
    { field: "amount", headerName: "Amount", width: 200 },
    {
      field: "date",
      headerName: "Date",
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>
          <div>{moment(params.row.date).format("MM/DD/yyyy")}</div>
        </>
      ),
    },
    {
      field: "-delete-",
      headerName: " ",
      renderCell: (params: GridCellParams) => {
        const onClick = () => {
          setIdToDelete(params.row.id as string);
          setShowDeleteDialog(true);
        };

        return (
          <Button style={{ color: "#3f51b5" }} onClick={onClick}>
            Delete
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <Toolbar className={classes.toolbar}>
        <TextField
          id="desc-filter"
          className={classes.mediumText}
          value={descFilter}
          onChange={onDescFilterChange}
          size="small"
          label="Description"
        />
        <FormControl className={classes.aroundSelect}>
          <InputLabel className={classes.aroundSelect} htmlFor="categoryFilter">
            Category
          </InputLabel>
          <Select
            id="categoryFilter"
            className={classes.select}
            value={categoryFilter}
            onChange={onCategoryFilterChange}
          >
            <MenuItem aria-label="None" value="">
              (No filter)
            </MenuItem>
            {Object.keys(Category)
              .sort((cat1, cat2) => {
                if (cat1 < cat2) {
                  return -1;
                }
                if (cat1 > cat2) {
                  return 1;
                }

                return 0;
              })
              .map((cat) => (
                <MenuItem value={cat}>{cat}</MenuItem>
              ))}
          </Select>
        </FormControl>
        <Button onClick={clearFilters} className={classes.clear}>
          Clear filters
        </Button>
      </Toolbar>
      <hr />
      <div className={classes.tableContainer}>
        <DataGrid
          rows={expenses}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          onRowDoubleClick={(row) => history.push(`edit-expense?id=${row.id}`)}
        />
      </div>
      <Button href="#/edit-expense" className={classes.add} component={Link}>
        Add
      </Button>
      <ConfirmDialog
        prompt="this event"
        open={showDeleteDialog}
        setOpen={setShowDeleteDialog}
        setConfirm={onDelete}
      />
    </>
  );
};

export default function Expenses(props: any) {
  return (
    <RootContainer
      title="Expenses list"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<ExpensesContent />} />
        </>
      }
    />
  );
}
