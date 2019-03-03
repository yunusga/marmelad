function getSVGIconHTML(name, tag, attrs) {

    if (typeof name === 'undefined') {
        console.error('name is required');
        return false;
    }

    if (typeof tag === 'undefined') {
        tag = 'div';
    }

    var classes = 'svg-icon svg-icon--<%= name %>';

    var iconHTML = [
        '<<%= tag %> <%= classes %>>',
            '<svg class="svg-icon__link">',
                '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#<%= name %>"></use>',
            '</svg>',
        '</<%= tag %>>'
    ]
    .join('')
    .replace(/<%= classes %>/g, 'class="' + classes + '"')
    .replace(/<%= tag %>/g, tag)
    .replace(/<%= name %>/g, name);

    return iconHTML;
}