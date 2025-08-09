import { useState } from "react";
import axios from "axios";
import Loader from "./components/Loader";
import JobList from "./components/JobList";
import JobMap from "./components/JobMap";
import Acerca from "./components/acerca"
import Footer from "./components/footer";
import { Search } from "lucide-react";

import {
  exportToJSON,
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "./utils/exportUtils";

// Función para desplazar ligeramente coordenadas duplicadas
function aleatorizarCoordenadas(jobs) {
  const usadas = new Set();
  return jobs.map((job) => {
    if (!job.lat || !job.lng) return job;

    let lat = job.lat;
    let lng = job.lng;

    while (usadas.has(`${lat},${lng}`)) {
      const offset = Math.random() * 0.01 - 0.005; 
      lat = parseFloat((job.lat + offset).toFixed(6));
      lng = parseFloat((job.lng + offset).toFixed(6));
    }

    usadas.add(`${lat},${lng}`);

    return {
      ...job,
      lat,
      lng,
    };
  });
}

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("all");
  const [viewMode, setViewMode] = useState("lista");

  const buscarEmpleos = async () => {
    if (!searchTerm.trim()) return alert("Ingresa un término válido");

    setLoading(true);
    setJobs([]);
    setView("all");
    setViewMode("lista");
    

    try {
      const response = await axios.post("https://occ-scraping-production.up.railway.app/api/jobs", {
        searchTerm,
      });

      const { empleos } = response.data;

      // Aplanar coordenadas
      const empleosConCoords = empleos.map((job) => {
        const { lat, lng } = job.coordenadas || {};
        return {
          ...job,
          lat,
          lng,
        };
      });

      // Evitar solapamiento visual de pines
      const ajustados = aleatorizarCoordenadas(empleosConCoords);
      setJobs(ajustados);
    } catch (err) {
      console.error(err);
      alert("Error al buscar empleos");
    } finally {
      setLoading(false);
    }
  };

  const ordenar = () => {
    const lista = [...jobs];
    if (view === "asc") {
      return lista.sort((a, b) => a.salarioNumerico - b.salarioNumerico);
    }
    if (view === "desc") {
      return lista.sort((a, b) => b.salarioNumerico - a.salarioNumerico);
    }
    return lista;
  };

  const empleosOrdenados = ordenar();

  return (
    <div className="flex flex-col min-h-screen pt-5 bg-gradient-to-r from-blue-200 to-cyan-200 px-4">
      <div className="flex-1 pt-5 px-4"> 
        <div className="w-full max-w-5xl mx-auto">
          <h1 className="text-5xl bitcount-text text-center text-blue-800 mb-8">Buscador de Empleos</h1>
          {/* Búsqueda */}
          <div className="mx-auto max-w-3xl flex items-center bg-white rounded-full shadow-lg overflow-hidden border border-blue-800">
            <input
              type="text"
              className="flex-1 px-5 py-3 text-shadow-gray-950 placeholder-gray-400 focus:outline-none"
              placeholder="Ej: 'React', 'Cobol', 'Mantenimiento'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 transition-all duration-200" onClick={buscarEmpleos}>
                <Search className="w-5 h-5" />
                Buscar
            </button>
          </div>
          

          {loading && <Loader />}

          {!loading && jobs.length > 0 && (
            <>
            {/* Botones de orden y mapa */}
              <div className="mb-6 text-center pt-9">
                <div className="inline-flex flex-wrap gap-3 justify-center">
                {/* Botón: Todos */}
                  <button className={`px-5 py-2 rounded-xl font-semibold transition duration-300 border 
                    ${view === "all"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100"}`}
                    onClick={() => {
                      setView("all");
                      setViewMode("lista");
                      setShowAbout(false);

                    }}
                  >
                    Todos
                  </button>
                    
                  {/* Botón: Mayor salario */}
                  <button
                    className={`px-5 py-2 rounded-xl font-semibold transition duration-300 border 
                      ${view === "desc"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100"}`}
                    onClick={() => {
                      setView("desc");
                      setViewMode("lista");
                      setShowAbout(false);
                    }}
                  >
                    Mayor salario
                  </button>

                  {/* Botón: Menor salario */}
                  <button
                    className={`px-5 py-2 rounded-xl font-semibold transition duration-300 border 
                      ${view === "asc"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100"}`}
                    onClick={() => {
                      setView("asc");
                      setViewMode("lista"); 
                      setShowAbout(false);
                    }}
                  >
                    Menor salario
                  </button>

                  {/* Botón: Ver Mapa */}
                  <button
                    className={`px-5 py-2 rounded-xl font-semibold transition duration-300 border 
                      ${viewMode === "mapa"
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100"}`}
                    onClick={() => {setViewMode("mapa"); setShowAbout(false);}}
                  >
                    Ver Mapa
                  </button>

                  {/* Nuevo botón: Acerca de mí */}
                    <button
                      className={`px-5 py-2 rounded-xl font-semibold transition duration-300 border 
                        ${viewMode === "acerca"
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100"}`}
                      onClick={() => {
                        
                        setViewMode("acerca"); // para que no interfiera con el mapa
                      
                      }}
                    >
                      Acerca de mí
                    </button>

                </div>
              </div>

              {/* Submenú exportar */}
              {viewMode === "lista" && (
                <div className="text-center mb-6">
                <h6 className="text-lg font-semibold mb-4 text-gray-950">Exportar resultados:</h6>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    className="px-4 py-2 rounded-xl border border-teal-400 text-teal-700 bg-white hover:bg-teal-100 transition duration-300 font-medium"
                    onClick={() => exportToJSON(empleosOrdenados)}
                  >
                    JSON
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl border border-teal-400 text-teal-700 bg-white hover:bg-teal-100 transition duration-300 font-medium"
                    onClick={() => exportToCSV(empleosOrdenados)}
                  >
                    CSV
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl border border-teal-400 text-teal-700 bg-white hover:bg-teal-100 transition duration-300 font-medium"
                    onClick={() => exportToXLSX(empleosOrdenados)}
                  >
                    Excel
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl border border-teal-400 text-teal-700 bg-white hover:bg-teal-100 transition duration-300 font-medium"
                    onClick={() => exportToPDF(empleosOrdenados)}
                  >
                    PDF
                  </button>
                </div>
              </div>
              )}

              {/* Lista o mapa */}
              {viewMode === "lista" && <JobList jobs={empleosOrdenados} />}

              {viewMode === "mapa" && (
                <div className="mt-4">
                  <h4 className="text-center text-2xl font-semibold mb-3">Mapa de empleos</h4>
                  <JobMap jobs={empleosOrdenados} />
                </div>
              )}

              {viewMode === "acerca" && (
                <div className="mt-4">
                  <h4 className="text-center text-2xl font-semibold mb-3">Acerca de mi</h4>
                  <Acerca />
                </div>
              )}
            </>
          )}
        </div>
      </div>
       <Footer />
    </div>
  );
}

export default App;
