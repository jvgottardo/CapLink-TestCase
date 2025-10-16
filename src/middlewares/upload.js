import multer from "multer";
import path from "path";

// define onde salvar os arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/"); // pasta local
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname)); // ex: 1699999999-123456789.jpg
  }
});

// filtro opcional (aceitar apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Tipo de arquivo não suportado"), false);
};

export const upload = multer({ storage, fileFilter });
