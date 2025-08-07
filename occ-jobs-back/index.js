const express = require("express");
const cors = require("cors");
const scrapeJobs = require("./scrapping");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.post("/api/jobs", async (req, res) => {
  const { searchTerm, order } = req.body;

  if (!searchTerm) {
    return res.status(400).json({ error: "Falta el término de búsqueda." });
  }

  try {
    const jobs = await scrapeJobs(searchTerm);

    // Convertir salario a número
    const normalizeSalary = (salario) => {
      if (!salario) return 0;
      const cleaned = salario.replace(/[^0-9\-]/g, '');
      const nums = cleaned.split('-').map(n => parseInt(n));
      if (nums.length === 1) return nums[0] || 0;
      if (nums.length === 2) return Math.round((nums[0] + nums[1]) / 2);
      return 0;
    };

    jobs.forEach(job => {
      job.salarioNumerico = normalizeSalary(job.salario);
    });

    // Ordenar
    if (order === "asc") {
      jobs.sort((a, b) => a.salarioNumerico - b.salarioNumerico);
    } else if (order === "desc") {
      jobs.sort((a, b) => b.salarioNumerico - a.salarioNumerico);
    }

    const jobsWithCoords = jobs.filter(job => job.coordenadas !== null);
    const statistics = {
      total: jobs.length,
      conCoordenadas: jobsWithCoords.length,
      sinCoordenadas: jobs.length - jobsWithCoords.length,
      tasaExito: jobs.length > 0 ? ((jobsWithCoords.length / jobs.length) * 100).toFixed(1) : 0
    };

    res.json({
      empleos: jobs,
      estadisticas: statistics,
      fechaConsulta: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error ejecutando el scraper:", error.message);
    res.status(500).json({ error: "Error al buscar empleos" });
  }
});

app.post("/api/jobs/map", async (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm) {
    return res.status(400).json({ error: "Falta el término de búsqueda." });
  }

  try {
    const allJobs = await scrapeJobs(searchTerm);
    
    const jobsWithCoords = allJobs.filter(job => 
      job.coordenadas && 
      job.coordenadas.lat && 
      job.coordenadas.lng
    );

    const groupedJobs = {};
    
    jobsWithCoords.forEach(job => {
      const key = `${job.coordenadas.lat.toFixed(4)}_${job.coordenadas.lng.toFixed(4)}`;
      if (!groupedJobs[key]) {
        groupedJobs[key] = {
          coordenadas: job.coordenadas,
          ubicacion: job.ubicacion,
          empleos: []
        };
      }
      groupedJobs[key].empleos.push({
        puesto: job.puesto,
        empresa: job.empresa,
        salario: job.salario,
        categoria: job.categoria,
        descripcion: job.descripcion.substring(0, 200) + '...',
        fechaExtraccion: job.fechaExtraccion
      });
    });

    const mapData = Object.values(groupedJobs);

    res.json({
      puntos: mapData,
      estadisticas: {
        totalEmpleos: allJobs.length,
        empleosConCoordenadas: jobsWithCoords.length,
        puntosEnMapa: mapData.length,
        tasaExito: allJobs.length > 0 ? ((jobsWithCoords.length / allJobs.length) * 100).toFixed(1) : 0
      },
      fechaConsulta: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error ejecutando el scraper para mapa:", error.message);
    res.status(500).json({ error: "Error al buscar empleos para el mapa" });
  }
});

app.get("/api/stats", (req, res) => {
  res.json({
    servidor: "OCC Jobs Scraper API",
    version: "1.1.0",
    funcionalidades: [
      "Scraping de empleos",
      "Geocodificación de ubicaciones",
      "Ordenamiento por salario",
      "Datos optimizados para mapas"
    ],
    endpoints: {
      "/api/jobs": "POST - Obtener todos los empleos con coordenadas",
      "/api/jobs/map": "POST - Obtener empleos agrupados para mapa",
      "/api/stats": "GET - Información del servidor"
    }
  });
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
  console.log(`🗺️ Funcionalidad de mapas habilitada`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   POST /api/jobs - Empleos completos`);
  console.log(`   POST /api/jobs/map - Datos para mapa`);
  console.log(`   GET /api/stats - Estadísticas del servidor`);
});