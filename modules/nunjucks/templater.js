const path = require('path');
const fs = require('fs-extra');
const Nunjucks = require('nunjucks');

class Templater {
  constructor() {
    this.store = {};
    this.env = null;
    this.templatePaths = null;
    this.templaterLoader = null;
    this.Nunjucks = Nunjucks;
  }

  init(settings, store) {
    const templatePaths = settings.paths._blocks;

    this.templatePaths = fs.readdirSync(templatePaths).map((blockPath) => path.join(templatePaths, blockPath));

    this.templaterLoader = new this.Nunjucks.FileSystemLoader(this.templatePaths, {
      watch: true,
      noCache: false,
    });

    this.env = new this.Nunjucks.Environment(this.templaterLoader, { autoescape: false });

    this.env.addFilter('translit', require('./filters/translit'));
    // this.env.addFilter('limitto', require('./filters/limitto'));
    this.env.addFilter('bodyClass', require('./filters/bodyclass'));

    this.env.addGlobal('_icon', settings.iconizer.icon);
    this.env.addGlobal('_fns', settings._fns);
    this.env.addGlobal('inlineSvgSprite', require('./globals/inlineSvgSprite'));

    const Incw = require('./globals/incw');

    this.env.addExtension('incw', new Incw(this.env, store, settings));
  }
}

module.exports = Templater;
