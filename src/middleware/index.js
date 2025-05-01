// Middleware to run multer
export const runMulter = (req, res) => {
  return new Promise((resolve, reject) => {
    upload.single('pdfFile')(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Helper function for running middleware
export const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};