import { useEffect, useState } from "react"
import "./Gallery.scss"
import { useWebTexts } from "../../hooks/useWebTexts"
import { useAuth } from "../../context/AuthContext"
import { getToken, uploadGalleryPhoto } from "../../services/galleryService"

const API_BASE = "http://localhost:8080/api"

export const GalleryUploadForm = () => {
  const text = useWebTexts("nav")
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
  }, [])

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: POST /api/membership/interest
    await new Promise((res) => setTimeout(res, 800));
    uploadGalleryPhoto(getToken()!, {
      title: title,
      description: description,
      file: file!,
    });
    setLoading(false);
  };

  return (
    <>
        <div className="gallery-upload-form">
            <h2>Subir foto</h2>
            <form>
                <input
                    type="text"
                    placeholder="Título de la foto"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Descripción de la foto"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <input
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <button
                    type="submit"
                    className="submit"
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    Subir foto
                </button>
            </form>
        </div>
    </>
  );
}