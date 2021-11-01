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
    datePicker: {
      minWidth: 180,
      marginLeft: 20,
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
    archive: {
      backgroundColor: "#3f51b5",
      color: "#ffffff",
      marginTop: 10,
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

const RecurringEventsContent = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [descFilter, setDescFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [idToDelete, setIdToDelete] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const history = useHistory();
  const classes = useStyles();

  useEffect(() => {
    if (!descFilter && !categoryFilter) {
      db.recurringEvents
        .find({})
        .sort({ "periodicity.startDate": 1 })
        .exec((err: Error | null, docs: any[]) => {
          setEvents(
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
      db.recurringEvents
        .find(filter)
        .sort({ "periodicity.startDate": 1 })
        .exec((err: Error | null, docs: any[]) => {
          if (docs)
            setEvents(
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
      db.recurringEvents.remove(
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
      field: "period",
      headerName: "Frequency",
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>
          <div>{(params.row.periodicity as any)!.period}</div>
        </>
      ),
    },
    {
      field: "since",
      headerName: "Since",
      width: 200,
      renderCell: (params: GridCellParams) => (
        <>
          <div>
            {moment((params.row.periodicity as any)!.startDate).format("MM/DD")}
          </div>
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
          rows={events}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          onRowDoubleClick={(row) =>
            history.push(`edit-recurring-event?id=${row.id}`)
          }
        />
      </div>
      <Button
        href="#/edit-recurring-event"
        className={classes.add}
        component={Link}
      >
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

export default function RecurringEvents(props: any) {
  return (
    <RootContainer
      title="Recurring events list"
      content={
        <>
          <LeftDrawer />
          <MainContainer content={<RecurringEventsContent />} />
        </>
      }
    />
  );
}
