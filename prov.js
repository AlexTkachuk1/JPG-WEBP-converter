const fs = require('fs');
const sharp = require('sharp');
const webp = require('webp-converter');
const tinify = require('tinify');
tinify.key = 'wVRCqfxcrNLqjjPw1QkgrhC7cF5TvmFx';

const libraryKeys = {
      sharp: "sharp",
      webp: "webp"
};

const INPUT_DIRECTORY = 'INPUT_DIRECTORY';
const OUTPUT_DIRECTORY = 'OUTPUT_DIRECTORY';
const CURRENT_CONVERTER_LIB = libraryKeys.webp;
// Потеря разрешения изображения при конвертации, 100 не теряет, 50 теряет половину.
const CURRENT_QUOLITY = 50;

let remainingKeyUsageCount = 0

const tinifyKeys = [
      'wVRCqfxcrNLqjjPw1QkgrhC7cF5TvmFx',
      'N32vjFyTWDDX3YgC2Hjm588MZ0r4zrTJ',
      'fKxFVZPsXYv53ZJgt2KhtJh14GG4ln1k',
      'qGBMVYzQ1X1zX8kTKhBLMRW0MKBTsd0r',
      'wp5g10sqwq6TChpbFNPmTGVRZsV3xl8f',
      'XkZPPdznmP5BcSF2T4G2jKyNGJ8wxtMS',
];

const operationKeys = {
      compress: "compress",
      convertJpgToWebp: "convert"
};

const getFiles = (dir, files_) => {
      files_ = files_ || [];
      let files = fs.readdirSync(dir);
      for (let i in files) {
            let name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                  getFiles(name, files_);
            } else {
                  files_.push(name);
            }
      }
      return files_;
};

const getName = (url) => url.split(/\/+/).reverse()[0];

const getExtension = (name) => name.split('.').reverse()[0];

const createDirectory = (directoryPath) => {
      if (!fs.existsSync(directoryPath)) {
            try {
                  fs.mkdirSync(directoryPath, { recursive: true });
            } catch (err) {
                  console.error(`Ошибка при создании папки: ${err}`);
                  throw err;
            }
      }
};

const convertToWebP = async (inputPath, outputPath) => {
      if (CURRENT_CONVERTER_LIB === libraryKeys.sharp) {
            return sharp(inputPath)
                  .toFormat('webp', { quality: CURRENT_QUOLITY })
                  .toFile(outputPath)
                  .catch((err) => {
                        console.log(`Ошибка при преобразовании изображения ${inputPath}: ${error}`);
                        throw err;
                  });
      } else {
            webp.cwebp(inputPath, outputPath, `-q ${CURRENT_QUOLITY}`);
      }
};

const keyValidation = async (index = 0) => {
      return new Promise((resolve, reject) => {
            tinify.key = tinifyKeys[index];

            tinify.validate(function (err) {
                  if (err) {
                        reject(new TinyPngValidateError());
                        return;
                  }

                  const compressionsThisMonth = 500 - tinify.compressionCount;
                  resolve(compressionsThisMonth);
            });
      })
            .then((compressionsThisMonth) => {
                  if (index + 1 < tinifyKeys.length) {
                        if (compressionsThisMonth <= 0) return keyValidation(index + 1);
                        else {
                              remainingKeyUsageCount = compressionsThisMonth;
                              return;
                        };
                  }
            });
};

const processImages = async (files, operationKey) => {
      files.forEach(async (file) => {
            let outputPath = file.replace(`${INPUT_DIRECTORY}`, `${OUTPUT_DIRECTORY}`);
            const fileName = getName(file);
            const directoryPath = outputPath.replace(`/${fileName}`, '');

            if (operationKey === operationKeys.convertJpgToWebp) outputPath = outputPath.replace(/.jpg|.png/, ".webp");

            createDirectory(directoryPath);

            const fileExtention = getExtension(fileName);
            if (fileExtention !== "webp"
                  && fileExtention !== "jpg"
                  && fileExtention !== "png") {
                  fs.copyFile(file, outputPath, (err) => {
                        if (err) {
                              console.log("Произошла ошибка копирования файла");
                              throw err;
                        }
                  });
            } else {
                  if (operationKey === operationKeys.compress) {
                        if (remainingKeyUsageCount == 0) keyValidation().then(() => {
                              tinify.fromFile(file).toFile(outputPath, (err) => {
                                    if (err) {
                                          console.log('Image compressed successfully.');
                                          throw err;
                                    }
                              });
                        });
                        else {
                              --remainingKeyUsageCount;
                              new Promise((resolve, reject) => {
                                    tinify.fromFile(file).toFile(outputPath, (err) => {
                                          if (err) {
                                                reject('Что-то пошло не так');
                                                return;
                                          }
                                          console.log('Image compressed successfully.');
                                          resolve('Image compressed successfully.');
                                    });
                              })
                        }
                  } else if (operationKey === operationKeys.convertJpgToWebp) {
                        try {
                              await convertToWebP(file, outputPath);
                        } catch (err) {
                              if (err) {
                                    console.log("Конвертация в WEBP не удалась");
                                    throw err;
                              }
                        }
                  }
            }
      });
};

let files = getFiles(INPUT_DIRECTORY);
processImages(files, operationKeys.convertJpgToWebp);