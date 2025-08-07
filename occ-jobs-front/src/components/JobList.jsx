function JobList({ jobs }) {
  if (!jobs || jobs.length === 0) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {jobs.map((job, idx) => (
    <div key={idx} className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-lg">
      <h5 className="text-xl font-semibold text-gray-800">{job.puesto}</h5>
      <h6 className="text-sm text-gray-500 mb-2">{job.empresa}</h6>
      
      <p><span className="font-semibold">Salario:</span> {job.salario}</p>
      <p><span className="font-semibold">Ubicación:</span> {job.ubicacion}</p>
      <p><span className="font-semibold">Categoría:</span> {job.categoria}</p>

      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-teal-700 hover:underline">Ver descripción</summary>
        <p className="mt-2 text-gray-700">{job.descripcion}</p>
      </details>
    </div>
  ))}
</div>

  );
}

export default JobList;
