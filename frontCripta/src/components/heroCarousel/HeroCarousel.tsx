import { useState, useEffect } from "react";
import slide1 from "../../assets/carousel/slide1.jpg";
import slide2 from "../../assets/carousel/slide2.jpg";
import slide3 from "../../assets/carousel/slide3.jpg";
import "./heroCarousel.scss";

const slides = [slide1, slide2, slide3];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="hero-carousel">
      <img src={slides[current]} alt={`Slide ${current + 1}`} />
      <button className="hero-carousel__arrow hero-carousel__arrow--prev" onClick={prev}>‹</button>
      <button className="hero-carousel__arrow hero-carousel__arrow--next" onClick={next}>›</button>
      <div className="hero-carousel__dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`hero-carousel__dot${i === current ? " hero-carousel__dot--active" : ""}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
};