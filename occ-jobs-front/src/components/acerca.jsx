// src/components/ProfileCard.jsx
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";
import imageEs from "../assets/Esm.jpeg";
import imageSer from "../assets/Serg.jpg";
const acerca = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-6">
       <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-800 to-blue-400 text-white rounded-2xl shadow-lg p-6 text-center">
      <h2 className="text-xl font-bold mb-4"> 🎓  Wendy Esmeralda Vega</h2>
      <img
        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white"
        src={imageEs}
        alt="Amber Jimenez"
        
      />
      <p className="text-sm mb-4 px-2">
        Desarrolladora Frontend y Backend | Tecnico en TIC, Ing. Desarrollo y Gestion de Software.
      </p>
      <p>
        Apasionada por el diseño web, el código limpio y el anime.
      </p> 
      <p>
        Amigable, proactiva y siempre lista para crear algo nuevo.
      </p>   
    
      <div className="text-sm mb-2">
        <strong>Email:</strong> 20191222@utsh.edu.mx
      </div>
      <div className="text-sm mb-4">
        <strong>Teléfono:</strong> 8110308686
      </div>
      <div className="flex justify-center gap-6 mb-4 text-xl">
        <a href="https://www.instagram.com/eme_hhd?utm_source=qr&igsh=eTJpZDVudDIzbGo2" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
        <a href="https://www.facebook.com/share/1CM4LWAdDe/" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
        <a href="#"><FaTwitter /></a>
        <a href="#"><FaLinkedinIn /></a>
        <a href="https://github.com/Esmevega" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
      </div>
    </div>
     <div className="max-w-sm mx-auto bg-gradient-to-b from-blue-800 to-blue-400 text-white rounded-2xl shadow-lg p-6 text-center">
      <h2 className="text-xl font-bold mb-4" >🎓 Sergio Monter</h2>
      <img
        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white"
        src={imageSer}
        alt="Amber Jimenez"
      />
      <p className="text-sm mb-4 px-2">
        Desarrollador Backend | Técnico en TIC, Ing. Desarrollo y Gestion de Software
      </p>
      <p className="text-sm mb-4 px-2">
        Apasionado por el backend, el código eficiente y el rap.
      </p>
      <p className="text-sm mb-4 px-2">
        Buena onda, creativo y con formación en desarrollo de software multiplataforma.
        
      </p>
      <div className="text-sm mb-2">
        <strong>Email:</strong> dazer.mc1397@gmail.com
      </div>
      <div className="text-sm mb-4">
        <strong>Teléfono:</strong> (+52) 1 771 113 3601
      </div>
      <div className="flex justify-center gap-6 mb-4 text-xl">
        <a href="https://www.instagram.com/dazermc1397/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
        <a href="https://www.facebook.com/share/1K4KkzxqTw/" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
        <a href="#"><FaTwitter /></a>
        <a href="https://www.linkedin.com/in/sergio-m-l-ab6614259/" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
        <a href="https://github.com/dazer-m-l" target="_blank" rel="noopener noreferrer"><FaGithub /></a>      
      </div>
    </div>
    </div>
  );
};

export default acerca;
