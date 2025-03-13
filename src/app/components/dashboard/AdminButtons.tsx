import { AllFormsButton, AdminButton, ActionLogsButton, ThreadsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const AdminButtons = () => {
  return (
    <ButtonsContainer>
      <AdminButton />
      <ActionLogsButton />
      <AllFormsButton />
      <ThreadsButton />
    </ButtonsContainer>
  )
}

export default AdminButtons