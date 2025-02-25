import { NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const SocialWorkerButtons = async () => {
  return (
    <ButtonsContainer>
      <NewFormButton/>
      <FormBoardButton/>
      <AllFormsButton/>
      <UpdatesButton/>
    </ButtonsContainer>
  )
}

export default SocialWorkerButtons