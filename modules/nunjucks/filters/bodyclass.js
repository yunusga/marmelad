function bodyClass(layout, additionalClasses = '', prefix = 'has-', postfix = '') {
  const classes = [];

  if (additionalClasses.length > 1) {
    classes.push(additionalClasses);
  }

  Object.keys(layout).forEach((key) => {
  	if (layout[key]) {
	    classes.push(`${prefix}${key}${postfix}`);
  	}
  });

  return classes.join(' ');
}

module.exports = bodyClass;
