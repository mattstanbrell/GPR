import { AllFormsButton, AdminButton, ActionLogsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const AdminButtons = async () => {
  return (
    <ButtonsContainer>
      <AdminButton />
      <ActionLogsButton />
      <AllFormsButton />
    </ButtonsContainer>
  )
}

export default AdminButtons