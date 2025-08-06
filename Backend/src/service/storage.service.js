const ImageKit = require("imagekit");
const { mongoose } = require("mongoose");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function uploadFile(file) {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: file.buffer,
        fileName: "hello-cohort", // or use `${new mongoose.Types.ObjectId()}.mp3`
        folder: "/Cohort",         // ✅ This will create/use 'Cohort' folder
      },
      (error, result) => {
        if (error) {
          console.error("ImageKit upload error:", error);
          reject(error);
        } else {
          console.log("ImageKit upload result:", result);
          resolve(result);
        }
      }
    );
  });
}

module.exports = uploadFile;
