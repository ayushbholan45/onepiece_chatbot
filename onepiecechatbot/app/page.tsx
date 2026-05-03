"use client"
import Image from "next/image"
import onepieceLogo from "./assets/onepieceLogoo.png"
import { useChat } from "@ai-sdk/react"
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {

  const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat()
  const noMessages = !messages || messages.length === 0

  const handlePrompt = (promptText: string) => {
    append({
      role: "user",
      content: promptText,
    })
  }

  return (
    <main>
      <Image 
        src={onepieceLogo} 
        width={250} 
        alt="Onepiece LOGO" 
        onClick={() => window.location.reload()}
        style={{ cursor: "pointer" }}
      />
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p className="starter-text">
               Welcome to the Grand Line!
            
              Your ultimate <span style={{ color: "#FFD700" }}>One Piece</span> companion.
              Ask <span style={{ color: "#FFD700" }}>Poneglyph AI</span> anything.
              <br /><br />
              The One Piece is REAL.
            </p>
            <br />
            <PromptSuggestionsRow onPromptClick={handlePrompt}/>
          </>
        ) : (
          <>
            {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
            {isLoading && <LoadingBubble/>}
          </>
        )}
      </section>  
      <form onSubmit={handleSubmit}>
        <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something..."/>
        <input type="submit" />
      </form>
    </main>
  )
}

export default Home