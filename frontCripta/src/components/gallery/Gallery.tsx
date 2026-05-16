import { useEffect, useState } from "react"
import "./Gallery.scss"
import { useWebTexts } from "../../hooks/useWebTexts"

export const Gallery = () => {
  const text = useWebTexts("nav")

  useEffect(() => {
  }, [])

return (
    <>
    <main className="gallery-app">
      <h1>Hola mundo</h1>
    </main>
    </>
  );
}