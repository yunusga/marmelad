const fs = require('fs');
const path = require('path');
const camelCase = require('camelcase');

class Database {
  constructor() {
    this._store = {};
  }

  getStore() {
    return this._store;
  }

  /**
   * Установка ключа/значения для хранилища
   *
   * @param {string} name имя/ключ для установки значения
   * @param {any} data значение для ключа
   */
  set(name, data) {
    this._store[camelCase(name)] = data;
  }

  /**
   * Создание хранилища на базе переданного массива путей до файлов данных блоков
   *
   * @param {Array} blocks массив путей до json-файлов с данными блоков
   */
  create(blocks) {
    blocks.forEach((block) => {
      this.read(block);
    });
  }

  /**
   * Чтение файла данных блока и помещение их в хранилище
   *
   * @param {string} blockPath путь до json-файла данных блока
   */
  read(blockPath) {
    const name = path.basename(blockPath, '.json');
    let data = null;

    try {
      data = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
      this.set(name, data);
    } catch (error) {
      if (typeof this.onError === 'function') {
        this.onError.call(this, blockPath, error);
      }
    }
  }

  /**
   * Обновление данных блока в хранилище
   *
   * @param {string} block путь до json-файла данных блока
   */
  update(block) {
    this.read(block);
  }

  combine(data, key = false) {
    if (key) {
      if (this._store[key]) {
        Object.assign(this._store[key], data);
      } else {
        this.set(key, data);
      }
    } else {
      Object.assign(this._store, data);
    }
  }

  /**
   * Очистка данных после удаляения файла данных блока
   *
   * @param {string} block путь до json-файла данных блока
   */
  delete(block) {
    delete this._store[camelCase(path.basename(block, '.json'))];
  }
}

module.exports = Database;
