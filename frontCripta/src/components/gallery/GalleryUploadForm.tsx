import { useEffect, useState } from "react"
import "./Gallery.scss"
import { useWebTexts } from "../../hooks/useWebTexts"
import { useAuth } from "../../context/AuthContext"

export const GalleryUploadForm = () => {
  const text = useWebTexts("nav")

  useEffect(() => {
  }, [])

  return (
    <>
        <div className="gallery-upload-form">
            <h2>Subir foto</h2>
            <form>
                <input type="text" placeholder="Título de la foto" />
                <textarea placeholder="Descripción de la foto"></textarea>
                <input type="file" accept="image/*" />
                <button type="submit" className="submit">Subir foto</button>
            </form>
        </div>
    </>
  );
}