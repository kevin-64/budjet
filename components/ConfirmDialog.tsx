import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import React from "react";

export default function ConfirmDialog({
  open,
  setOpen,
  setConfirm,
  prompt = "this account",
}: {
  open: boolean;
  setOpen: (o: boolean) => void;
  setConfirm: () => void;
  prompt?: string;
}) {
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="alert-dialog-title">{"Confirm deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to delete {prompt}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={setConfirm} color="primary">
            Yes
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
