import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({ onPromptClick }: { onPromptClick: (text: string) => void }) => {
  const prompts = [
    "Who is Monkey D. Luffy?",
    "What is the Gomu Gomu no Mi devil fruit?",
    "What happened in the Egghead Arc?",
    "What is the Void Century?",
  ]

  return (
    <div className="prompt-suggestion-row">
        {prompts.map((prompt, index) => 
            <PromptSuggestionButton 
              key={`suggestion-${index}`}
              text={prompt}
              onClick={() => onPromptClick(prompt)}
              />)}
    </div>
  )
}

export default PromptSuggestionsRow