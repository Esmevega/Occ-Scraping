import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, "empleos.json");
};

export const exportToCSV = (data) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, "empleos.csv");
};

export const exportToXLSX = (data) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Empleos");
  XLSX.writeFile(workbook, "empleos.xlsx");
};

export const exportToPDF = (data) => {
  const doc = new jsPDF();
  const tableData = data.map((job) => [
    job.puesto,
    job.empresa,
    job.salario,
    job.ubicacion,
  ]);

  autoTable(doc, {
    head: [["Puesto", "Empresa", "Salario", "Ubicación"]],
    body: tableData,
  });

  doc.save("empleos.pdf");
};

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
