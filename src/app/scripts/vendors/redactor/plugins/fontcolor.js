$.Redactor.prototype.fontcolor = function()
{
    return {

        langs: {
            en: {
                fontcolor: "Font Color",
                backcolor: "Back Color"
            }
        },

        init: function()
        {
            var colors = [
                'none', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
                '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
                '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5', '#ffe694',
                '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
                '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
                '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b',  '#974806', '#7f6000'
            ];

            var buttons = ['fontcolor','backcolor'];

            var self = this;
            angular.forEach(buttons,function(button) {

                var len = colors.length;
                var options = {};
                var name = button;
                for (var z = 0; z < len; z++)
                {
                    var color = colors[z];
                    options[color] = {  title: '<div style="background-color:' +  color + '"></div>',
                                        func: function(color) {

                                            this.block.removeAttr('style');
                                            if(color!='none') {
                                                if(name=='fontcolor') {
                                                    this.block.addAttr('style', 'color:' + color);
                                                } else {
                                                    this.block.addAttr('style', 'background-color:' + color);
                                                }
                                            }
                                        }};
                }

                var button = self.button.add(button, self.lang.get(button));
                var $dropdown = self.button.addDropdown(button,options);
            });
        }
    };
};

