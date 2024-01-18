const fs = require('fs');
const sharp = require('sharp');
const sizeOf = require('image-size');
const jpegAutorotate = require('jpeg-autorotate');

//Отсюда берем картинки
const inputDirectory = 'images';
const outputDirectory = 'putImage';

const getFiles = (dir, files_) => { // Функция для получения списка файлов из папки
      files_ = files_ || [];
      let files = fs.readdirSync(dir);
      for (let i in files) {
            // console.log("Привет");
            let name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                  getFiles(name, files_);
            } else {
                  files_.push(name);
            }
      }
      return files_;
};

let files = getFiles(inputDirectory);

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
            .toFormat('webp', { quality: 55 })
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

files.forEach(async (file, index) => {
      await removeMetadata(file, file);

      // Определите путь для сохранения webp-изображения
      const outputPath = file.replace(`${inputDirectory}`, `${outputDirectory}`).replace(".jpg", ".webp");
      const directoryPath = outputPath.replace(`/${getName(outputPath)}`, '');

      createDirectory(directoryPath);

      // Конвертируйте изображение в формат webp
      try {
            await convertToWebP(file, outputPath);
      } catch (error) {
            // Обработка ошибок, если конвертация не удалась
      }
});
