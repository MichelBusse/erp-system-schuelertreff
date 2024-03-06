type ConfirmationDialogData = {
  open: boolean
  setProps: React.Dispatch<React.SetStateAction<ConfirmationDialogData>>
  title: string
  text: string
  action: () => void
  actionText?: string
}

export default ConfirmationDialogData;