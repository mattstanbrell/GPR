import { AllFormsButton, FormBoardButton, AdminButton, UpdatesButton, ThreadsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const ManagerButtons = () => {
  return (
    <ButtonsContainer>
      <AdminButton />
      <FormBoardButton />
      <UpdatesButton />
      <AllFormsButton />
      <ThreadsButton />
    </ButtonsContainer>
  )
}

export default ManagerButtons