const fs = require('fs');

function inlineSvgSprite() {
  const opts = this.ctx.app.settings.iconizer;

  if (opts.mode === 'inline') {
    const pathIcons = `${opts.dest}/sprite.icons.svg`;
    const pathColores = `${opts.dest}/sprite.colored.svg`;
    const hasIcons = fs.existsSync(pathIcons);
    const hasColored = fs.existsSync(pathColores);

    if (!hasIcons && !hasColored) {
      return '';
    }

    const spriteIcons = hasIcons ? fs.readFileSync(pathIcons).toString() : '';
    const spriteColored = hasColored ? fs.readFileSync(pathColores).toString() : '';

    return `${spriteIcons + spriteColored}\n`;
  }

  return '';
}

module.exports = inlineSvgSprite;
