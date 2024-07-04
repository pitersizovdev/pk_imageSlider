import React from "react";
import "./App.css";
import { ImageSlider } from "./components/ImageSlider/ImageSlider";

const images = [
  "https://via.placeholder.com/600x400/FF0000/FFFFFF?text=Slide+1",
  "https://via.placeholder.com/600x400/00FF00/FFFFFF?text=Slide+2",
  "https://via.placeholder.com/600x400/0000FF/FFFFFF?text=Slide+3",
];

const App: React.FC = () => (
  <div className="app">
    <h1>Image Slider</h1>
    <ImageSlider
      autoplay={0} //ms
      dots={true} //true | false
      arrows={true} //true | false
    >
      {images.map((src, index) => (
        <img key={index} src={src} alt={`Slide ${index}`} />
      ))}
    </ImageSlider>
  </div>
);

export default App;
