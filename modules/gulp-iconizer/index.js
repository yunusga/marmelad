/*
 * gulp-iconizer
 * Licensed under the MIT license.
 */
const fs = require('fs');
const through = require('through2');
const PluginError = require('plugin-error');
const chalk = require('chalk');

function buildParamsFromString(string) {
  let match;
  let attr;
  let value;
  const params = {};
  const attrsRegexp = /(\S+)=["']?((?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gi;

  while (match = attrsRegexp.exec(string)) {
    attr = match[1];
    value = match[2].replace(/'|"/, '');
    params[attr] = value;
  }

  return params;
}

function replaceIconTags(src, opts) {
  let match;
  let tag;
  let params;
  let name;
  let html = src.toString();
  let iconRegexp = /<icon\s+([-=\w\d\c{}'"\s]+)\s*\/?>|<\/icon>/gi;

  while (match = iconRegexp.exec(html)) {
    [tag] = match;
    params = buildParamsFromString(match[1]);
    name = params.name;

    delete params.name;

    Object.assign(params, opts);

    if (typeof name !== 'undefined') {
      console.log(chalk`\n{bgRed  DEPRECATED } иконка: {yellow ${name}}`);
      console.log(chalk`Тег {yellow <icon name="" ...>} помечен как устаревший и будет удалён в версии marmelad 6+`);
      console.log('Обновлённое применение: https://github.com/solversgroup/marmelad#iconizer\n');


    }

    html = html.replace(tag, opts.icon(name, params));
  }

  return html;
}

function iconizeHtml(src, opts) {
  let html = src.toString();

  if (opts.mode === 'inline') {
    const pathIcons = `${opts.dest}/sprite.icons.svg`;
    const pathColores = `${opts.dest}/sprite.colored.svg`;
    const hasIcons = fs.existsSync(pathIcons);
    const hasColored = fs.existsSync(pathColores);

    if (!hasIcons && !hasColored) {
      return html;
    }

    const spriteIcons = hasIcons ? fs.readFileSync(pathIcons).toString() : '';
    const spriteColored = hasColored ? fs.readFileSync(pathColores).toString() : '';

    html = html.replace(/<body.*?>/, match => `${match}\n\n    ${spriteIcons + spriteColored}\n`);
  }

  return replaceIconTags(html, opts);
}

module.exports = function (opts) {

  return through.obj(function(file, enc, cb) {

    if (file.isNull()) {
      cb(null, file);
    }

    let html = iconizeHtml(file.contents, opts);

    if (file.isBuffer()) {
      file.contents = Buffer.from(html);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-iconizer', 'Streaming not supported'));
      return cb();
    }

    this.push(file);

    cb(null, file);
  });
};
