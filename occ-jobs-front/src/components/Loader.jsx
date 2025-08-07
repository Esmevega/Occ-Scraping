function Loader() {
  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-blue-600 text-lg font-medium">Buscando empleos...</p>
    </div>
  );
}

export default Loader;
