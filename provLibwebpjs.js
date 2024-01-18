const fs = require('fs');
const sharp = require('sharp');
const sizeOf = require('image-size');
const jpegAutorotate = require('jpeg-autorotate');
const tinify = require('tinify');
tinify.key = 'wVRCqfxcrNLqjjPw1QkgrhC7cF5TvmFx';

//Отсюда берем картинки
const inputDirectory = 'images';
const outputDirectory = 'putImage';

const operationKeys = {
      compress: "compress",
      convertJpgToWebp: "convert"
};

const getFiles = (dir, files_) => { // Функция для получения списка файлов из папки
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

/**
 * Метод возвращает имя файла (без формата)
 * @param url - Ссылка в формате строки
 * @return name - Имя файла (без формата)
**/
const getName = (url) => url.split(/\/+/).reverse()[0];

const createDirectory = (directoryPath) => {
      if (!fs.existsSync(directoryPath)) {
            try {
                  fs.mkdirSync(directoryPath, { recursive: true });
                  console.log(`Папка создана по пути: ${directoryPath}`);
            } catch (error) {
                  console.error(`Ошибка при создании папки: ${error}`);
            }
      }
};

const convertToWebP = async (inputPath, outputPath) => {
      return sharp(inputPath)
            .toFormat('webp', { quality: 50 })
            .toFile(outputPath)
            .then(() => {
                  console.log(`Изображение ${inputPath} успешно преобразовано и сохранено в ${outputPath}`);
            })
            .catch((error) => {
                  console.error(`Ошибка при преобразовании изображения ${inputPath}: ${error}`);
                  throw error;
            });
};

const analyzeMetadata = (filePath) => {
      try {
            const dimensions = sizeOf(filePath);
            console.log(`Изображение: ${filePath}`);
            console.log(`Размеры: ${dimensions.width} x ${dimensions.height}`);
            console.log(`Метаданные:`, dimensions.orientation || 'Отсутствуют');
            console.log('---');
      } catch (error) {
            console.error(`Ошибка при анализе метаданных изображения ${filePath}: ${error}`);
      }
};

const removeMetadata = async (inputPath, outputPath) => {
      try {
            await jpegAutorotate.rotate(inputPath, { quality: 100 }, { path: outputPath });
            console.log(`Метаданные изображения ${inputPath} успешно удалены и сохранены в ${outputPath}`);
      } catch (error) {
            console.error(`Ошибка при удалении метаданных изображения ${inputPath}: ${error}`);
      }
};

const processImages = async (files, operationKey) => {
      files.forEach(async (file) => {
            let outputPath = file.replace(`${inputDirectory}`, `${outputDirectory}`);
            if (operationKey === operationKeys.convertJpgToWebp) outputPath = outputPath.replace(".jpg", ".webp");

            const directoryPath = outputPath.replace(`/${getName(outputPath)}`, '');
            createDirectory(directoryPath);

            if (operationKey === operationKeys.compress) {
                  tinify.fromFile(file).toFile(outputPath, (err) => {
                        if (err) throw err;
                        console.log('Image compressed successfully.');
                  });
            } else if (operationKey === operationKeys.convertJpgToWebp) {
                  // Конвертируйте изображение в формат webp
                  try {
                        await convertToWebP(file, outputPath);
                  } catch (error) {
                        console.log("Обработка ошибок, если конвертация не удалась");
                  }
            }
      });
};

let files = getFiles(inputDirectory);
processImages(files, operationKeys.compress);
