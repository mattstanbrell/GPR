'use client'

import { useContext } from "react";
import { NewFormButton, FormBoardButton, AllFormsButton, ThreadsButton } from "./Buttons"
import ButtonsContainer from "./ButtonsContainer"
import { AppContext } from "@/app/layout";

const SocialWorkerButtons = () => {
  const { currentUser } = useContext(AppContext);
  
  return (
    <ButtonsContainer>
      {(currentUser &&
        currentUser.teamID) ? <NewFormButton/> : null}
      <FormBoardButton/>
      <AllFormsButton/>
      <ThreadsButton/>
    </ButtonsContainer>
  )
}

export default SocialWorkerButtons