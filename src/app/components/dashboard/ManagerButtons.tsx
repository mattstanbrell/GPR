import { AllFormsButton, FormBoardButton, AdminButton, ThreadsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const ManagerButtons = () => {
  return (
    <ButtonsContainer>
      <AdminButton />
      <FormBoardButton />
      <AllFormsButton />
      <ThreadsButton />
    </ButtonsContainer>
  )
}

export default ManagerButtons