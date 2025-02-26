import { AllFormsButton, FormBoardButton, AdminButton, UpdatesButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const ManagerButtons = async () => {
  return (
    <ButtonsContainer>
      <AdminButton />
      <FormBoardButton />
      <UpdatesButton />
      <AllFormsButton />
    </ButtonsContainer>
  )
}

export default ManagerButtons