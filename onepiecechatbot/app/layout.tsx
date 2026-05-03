import "./global.css"

export const metdata = {
  title: "OnePieceCHATBOT",
  description: "The place to go for all your One piece questions!"
}


const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

export default RootLayout