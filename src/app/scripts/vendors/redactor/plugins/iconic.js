
$.Redactor.prototype.iconic = function()
{
    return {
        init: function ()
        {
            var icons = {
                'format': '<md-icon class="material-icons">text_format</md-icon>',
                'italic': '<md-icon class="material-icons">format_italic</md-icon>',
                'lists': '<md-icon class="material-icons">list</md-icon>',
                'link': '<md-icon class="material-icons">link</md-icon>',
                'bold': '<md-icon class="material-icons">format_bold</md-icon>',
                'deleted': '<md-icon class="material-icons">strikethrough_s</md-icon>',
                'horizontalrule': '<md-icon class="material-icons">remove</md-icon>',
                'alignment': '<md-icon class="material-icons">format_align_center</md-icon>',
                'undo': '<md-icon class="material-icons">undo</md-icon>',
                'redo': '<md-icon class="material-icons">redo</md-icon>',
                'table': '<md-icon class="material-icons">border_all</md-icon>',
                'html': '<md-icon class="material-icons">code</md-icon>',
                'fontcolor': '<md-icon class="material-icons">format_color_text</md-icon>',
                'backcolor': '<md-icon class="material-icons">format_color_fill</md-icon>'
            };

            $.each(this.button.all(), $.proxy(function(i,s)
            {
                var key = $(s).attr('rel');

                if (typeof icons[key] !== 'undefined')
                {
                    var icon = icons[key];
                    var button = this.button.get(key);
                    this.button.setIcon(button, icon);
                }

            }, this));
        }
    };
};
