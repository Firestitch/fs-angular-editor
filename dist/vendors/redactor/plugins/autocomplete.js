$.Redactor.prototype.autocomplete = function()
{
    var autocomplete = null;
    var self = null;
    var type = null;

    return {

        remove: function() {
            if(autocomplete) {
                autocomplete.container.remove();
                autocomplete = null;
                this.$editor.focus();
                type = null;
                this.code.sync();
            }
        },

        inputWidth: function(char) {
            var val = autocomplete.input.val().concat(char).replace(/[\s]/,'');

            var span = autocomplete.autoWidth.text(val);

            autocomplete.input.css('width',span[0].offsetWidth + 15);
        },

        itemSelect: function() {

            var selected = angular.element(autocomplete.results[0].querySelector('.result.selected'));

            if(selected.length) {

                if(type) {

                    var el = this.opts.autocomplete.insert(type, selected.data('data'));
                    var text = document.createTextNode('\u00A0');

                    if(autocomplete.split.nextSibling) {
                    	autocomplete.current.parentElement.insertBefore(el[0],autocomplete.split);
                    	autocomplete.current.parentElement.insertBefore(text,autocomplete.split);
                   	} else {
                    	autocomplete.current.append(el[0]);
                    	autocomplete.current.append(text);
                    }

                    this.autocomplete.remove();
                } else {
                    type = selected.data('type');
                    this.autocomplete.inputSearch('');
                }
            }
        },

        resultClear: function() {
            autocomplete.results.empty();
        },

        itemSetSelected: function(item) {
            angular.element(autocomplete.results[0].querySelector('.result.selected')).removeClass('selected');

            if(item) {
                angular.element(item).addClass('selected');
            }
        },

        inputSearch: function(value) {

            if(type) {

                this.opts.autocomplete.data({ type: type, keyword: value })
                .then($.proxy(function(items) {
                    this.autocomplete.resultClear();

                    if(!items.length) {
                        autocomplete.results.append(angular.element('<div>')
                                                        .addClass('result')
                                                        .append('No Results'));
                    }

                    angular.forEach(items,$.proxy(function(item,index) {

                        var selected = index===0 ? 'selected' : '';
                        var div = angular.element('<div>')
                                    .addClass('result ' + selected)
                                    .attr('layout','row')
                                    .data('data',item.data)
                                    .append(item.template)
                                    .on('click',function(e) {
                                        self.itemSelect();
                                        e.preventDefault();
                                        e.stopPropagation();
                                    })
                                    .on('mouseenter',function(e) {
                                        self.itemSetSelected(angular.element(this));
                                    });

						autocomplete.results.append(div);
                    },this));

                },this));

            } else {

                this.autocomplete.resultClear();

                angular.forEach(this.opts.autocomplete.types,function(type,index) {
                    autocomplete.results.append(angular.element('<div>')
                                                        .addClass('result' + (index ? '' : ' selected'))
                                                        .data('type',type.value)
                                                        .append(type.name)
                                                        .on('click',function(e) {
                                                            self.itemSelect();
                                                            self.preventBlur = true;
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        })
                                                        .on('mouseover',function(e) {
                                                            var el = angular.element(this);
                                                            angular.forEach(el.parent().children(),function(item) {
                                                                angular.element(item).removeClass('selected');
                                                            });
                                                            el.addClass('selected');
                                                        }));

                });
            }

        },

        init: function() {

            self = this.autocomplete;

            var options = this.opts.autocomplete;

            this.$editor.on('keydown.redactor-plugin-autocomplete', $.proxy(function(e) {

                var editor = this;
                var selection = this.selection;
                var current = this.selection.current();

                if(current) {
/*
	               	if(current.nodeName!='#text') {
    	            	current = current.lastChild;
	                }*/

                    if(e.keyCode==32 && e.ctrlKey) { //space

                        e.stopPropagation();
                        e.preventDefault();

                        var input = angular.element('<input/>')
                                        .on('blur',function(e) {
                                            setTimeout(function() {
                                                if(!self.preventBlur) {
                                                    self.remove();
                                                }
                                            },100);
                                        })
                                        .on('keyup',$.proxy(function(e) {
                                            e.stopPropagation();
                                        },this))
                                        .on('keydown',$.proxy(function(e) {
                                            self.preventBlur = false;
                                            var value = autocomplete.input.val();

                                            if(e.keyCode==8)
                                                value = value.slice(0,-1)
                                            else
                                                value += e.key;

                                            if(e.keyCode==38 || e.keyCode==40) { //up,down

                                                var selected = angular.element(autocomplete.results[0].querySelector('.result.selected'));

                                                if(selected.length) {

                                                    if(e.keyCode==38) {
                                                        if(selected[0].previousSibling) {
                                                            this.autocomplete.itemSetSelected(selected[0].previousSibling);
                                                        }
                                                    } else if(e.keyCode==40) {
                                                        if(selected[0].nextSibling) {
                                                            this.autocomplete.itemSetSelected(selected[0].nextSibling);
                                                        }
                                                    }
                                                }

                                                e.preventDefault();

                                            } else if((!input.val().length && e.keyCode==8) || e.keyCode==27) { //backspace, escape
                                                this.autocomplete.remove();
                                                e.preventDefault();

                                            } else {

                                                if(type) {

                                                    if(e.keyCode==13 || e.keyCode==9) { //enter, tab
                                                        this.autocomplete.itemSelect();
                                                        e.preventDefault();

                                                    } else {
                                                        this.autocomplete.inputSearch(value);
                                                        this.autocomplete.inputWidth(String.fromCharCode(e.keyCode));
                                                    }

                                                } else {

                                                    angular.forEach(autocomplete.results.find('div'),$.proxy(function(item) {
                                                        item = angular.element(item);
                                                        if(item.data('type').indexOf(e.key)===0) {
                                                            this.autocomplete.itemSetSelected(item);
                                                        }
                                                    },this));

                                                    e.preventDefault();
                                                    this.autocomplete.itemSelect();
                                                }
                                            }
                                            e.stopPropagation();
                                        },this));

                        var autoWidth = angular.element('<span>').addClass('autocomplete-width');
                        var results = angular.element('<span class="results md-whiteframe-z2"></span>');
                        var elw = angular.element('<div>')
                                        .addClass('editor-autocomplete-wrap')
                                        .append('<span class="bumper"></span>')
                                        .append(angular.element('<span class="input"></span>')
                                                    .append(input))
                                        .append(results)
                                        .append(autoWidth);

                        var container = angular.element('<div>')
                                                    .addClass('editor-autocomplete')
                                                    .append(elw);

                        var split = current.splitText ? current.splitText(0) : current;

                        autocomplete = {    current: current,
                                            container: container,
                                            results: results,
                                            split: split,
                                            input: input,
                                            autoWidth: autoWidth };

                       	if(split.nodeValue) {
                       		split.nodeValue = split.nodeValue.replace(/\s$/,'');
                       	}

                        setTimeout($.proxy(function() {
                            if(split.nextSibling) {
                            	current.parentElement.insertBefore(container[0],split.nextSibling);
                            } else {
                            	current.appendChild(container[0]);
                            }

                            input[0].focus();

                            this.autocomplete.inputSearch('');
                        },this),100);
                    }
                }


            },this));
        }
    };
};



