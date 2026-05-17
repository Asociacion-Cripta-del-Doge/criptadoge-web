import { useEffect, useState } from "react"
import "./Gallery.scss"
import { useWebTexts } from "../../hooks/useWebTexts"

export const GalleryCard = ({ image, title }: { image: string; title: string }) => {
  const text = useWebTexts("nav")

  useEffect(() => {
  }, [])

  return (
    <>
        <div className="gallery-image">
            <h1>{title}</h1>
            <img src={image} alt={title} className="gallery-card-image" />
        </div>
    </>
  );
}