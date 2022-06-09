import multer from "multer";

export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
  if (["image/jpeg", "image/png"].includes(file.mimetype)) {
    return callback(null, true)
  } else {
    return callback(new Error("Unsupported file type"))
  }
}

export const FILE_UPLOAD_KEY = "file"
