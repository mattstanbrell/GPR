import { AllFormsButton, AdminButton, ActionLogsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const AdminButtons = () => {
  return (
    <ButtonsContainer>
      <AdminButton />
      <ActionLogsButton />
      <AllFormsButton />
    </ButtonsContainer>
  )
}

export default AdminButtons