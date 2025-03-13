import { NewFormButton, FormBoardButton, AllFormsButton, UpdatesButton, ThreadsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"

const SocialWorkerButtons = () => {
  return (
    <ButtonsContainer>
      <NewFormButton/>
      <FormBoardButton/>
      <AllFormsButton/>
      <UpdatesButton/>
      <ThreadsButton/>
    </ButtonsContainer>
  )
}

export default SocialWorkerButtons