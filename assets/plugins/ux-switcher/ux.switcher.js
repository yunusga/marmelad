;(function($) {

    var pluginName = 'uxSwitcher';

    $.uxSwitcher = function(element, options) {

        var defaults = {
                classes : {
                opened : 'is-opened',
                closed : 'is-closed',
                popups : null
            },
            onOpened : function() {},
            onClosed : function() {}
        };

        var plugin = this;

        plugin.settings = {}

        var $element = $(element);

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);
            plugin.bindEvents();
        };

        plugin.bindEvents = function() {

            $element.on('click' + '.' + pluginName, function(event) {

                event.preventDefault();
                event.stopPropagation();

                if ($element.hasClass(plugin.settings.classes.opened)) {
                    plugin.close(this);
                } else {
                    plugin.open(this);
                }
            });

            $(document).on('click' + '.' + pluginName, plugin.close);

            $(document).on('keydown' + '.' + pluginName, function(event) {
                if (event.keyCode == 27) {
                    plugin.close();
                }
            });
        };

        plugin.unBindEvents = function() {
            $element.off('.' + pluginName);
            $(document).off('.' + pluginName);
        };

        plugin.open = function(element) {
            $element
                .removeClass(plugin.settings.classes.closed)
                .addClass(plugin.settings.classes.opened);

            plugin.settings.onOpened.call(element);
        };

        plugin.close = function(element) {

            $element
                .addClass(plugin.settings.classes.closed)
                .removeClass(plugin.settings.classes.opened);

            plugin.settings.onClosed.call(element);
        };

        plugin.destroy = function() {
            plugin.unBindEvents();
            //$element.removeData(pluginName);
        }

        plugin.init();

    }

     // add the plugin to the jQuery.fn object
     $.fn.uxSwitcher = function(options) {

        return this.each(function() {

            if (undefined == $(this).data(pluginName)) {
                var plugin = new $.uxSwitcher(this, options);
                $(this).data(pluginName, plugin);
           }

        });

    }

})(jQuery);
