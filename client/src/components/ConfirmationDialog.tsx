import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

export type ConfirmationDialogProps = {
  open: boolean
  setProps: React.Dispatch<React.SetStateAction<ConfirmationDialogProps>>
  title: string
  text: string
  action: () => void
  actionText?: string
}

export const defaultConfirmationDialogProps: ConfirmationDialogProps = {
  open: false,
  setProps: () => {},
  title: '',
  text: '',
  action: () => {},
}

const ConfirmationDialog: React.FC<{
  confirmationDialogProps: ConfirmationDialogProps
}> = ({ confirmationDialogProps }) => (
  <Dialog
    open={confirmationDialogProps.open}
    keepMounted
    aria-describedby="alert-dialog-slide-description"
    sx={{ zIndex: 2000 }}
  >
    <DialogTitle>{confirmationDialogProps.title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-slide-description">
        {confirmationDialogProps.text}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() =>
          confirmationDialogProps.setProps(defaultConfirmationDialogProps)
        }
      >
        Abbrechen
      </Button>
      <Button
        onClick={() => {
          confirmationDialogProps.action()
          confirmationDialogProps.setProps(defaultConfirmationDialogProps)
        }}
      >
        {confirmationDialogProps.actionText ?? 'Bestätigen'}
      </Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmationDialog
