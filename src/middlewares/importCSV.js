import multer from "multer";
import path from "path";

const storageCSV = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/csv/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname)); // ex: 1729009999-123456.csv
  },
});

const csvFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".csv" && file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Apenas arquivos CSV são permitidos."), false);
  }
};

export const uploadCSV = multer({ storage: storageCSV, fileFilter: csvFileFilter });
