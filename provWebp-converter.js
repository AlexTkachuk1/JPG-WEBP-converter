const fs = require('fs');
const webp = require('webp-converter');

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

files.forEach((file, index) => {
    // Определите путь для сохранения webp-изображения
    const outputPath = file.replace(`${inputDirectory}`, `${outputDirectory}`).replace(".jpg", ".webp");
    const directoryPath = outputPath.replace(`/${getName(outputPath)}`, '');

    createDirectory(directoryPath);

    // Конвертируйте изображение в формат webp
    webp.cwebp(file, outputPath, '-q 50');
});
