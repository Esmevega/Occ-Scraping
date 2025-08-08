import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import MarkerIcon from "leaflet/dist/images/marker-icon.png";
import MarkerShadow from "leaflet/dist/images/marker-shadow.png";
import MarkerIcon2x from "leaflet/dist/images/marker-icon-2x.png";

// Configuración para que los íconos se vean en producción (Vercel)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: MarkerIcon2x,
  iconUrl: MarkerIcon,
  shadowUrl: MarkerShadow,
});

function JobMap({ jobs }) {
  const jobsConUbicacion = jobs.filter((job) => job.lat && job.lng);

  const center = jobsConUbicacion.length
    ? [jobsConUbicacion[0].lat, jobsConUbicacion[0].lng]
    : [23.6345, -102.5528]; // México

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {jobsConUbicacion.map((job, idx) => (
          <Marker key={idx} position={[job.lat, job.lng]}>
            <Popup>
              <strong>{job.puesto}</strong><br />
              {job.empresa}<br />
              {job.ubicacion}<br />
              Salario: {job.salario || "No especificado"}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default JobMap;
