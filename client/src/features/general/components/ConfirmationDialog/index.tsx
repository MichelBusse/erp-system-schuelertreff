import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import ConfirmationDialogData from '../../../../core/types/ConfirmationDialogData'

const ConfirmationDialog: React.FC<{
  confirmationDialogData: ConfirmationDialogData
}> = ({ confirmationDialogData }) => (
  <Dialog
    open={confirmationDialogData.open}
    keepMounted
    aria-describedby="alert-dialog-slide-description"
    sx={{ zIndex: 2000 }}
  >
    <DialogTitle>{confirmationDialogData.title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-slide-description">
        {confirmationDialogData.text}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button
        onClick={() =>
          confirmationDialogData.setProps(confirmationDialogData)
        }
      >
        Abbrechen
      </Button>
      <Button
        onClick={() => {
          confirmationDialogData.action()
          confirmationDialogData.setProps(confirmationDialogData)
        }}
      >
        {confirmationDialogData.actionText ?? 'Bestätigen'}
      </Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmationDialog
