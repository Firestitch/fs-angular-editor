$.Redactor.prototype.autocomplete = function()
{
    var autocomplete = null;
    var self = null;

    return {

        remove: function() {
            if(autocomplete) {
                autocomplete.container.remove();
                autocomplete = null;
                this.$editor.focus();
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

                var el = angular.element(this.opts.autocomplete.insert(selected.data('data')))[0];
                if(el) {
                	this.selection.restore();
	                this.autocomplete.insertTextAtCursor(el);
	            }

	            this.caret.after(el);
	            this.selection.get().extentNode.nodeValue = '\u00A0' + this.selection.get().extentNode.nodeValue;
	            this.autocomplete.remove();
            }
        },

		setCaret: function(target, isStart) {
			var range = document.createRange();
			var sel = window.getSelection();
			if (isStart){
				var newText = document.createTextNode('');
				target.appendChild(newText);
				range.setStart(target.childNodes[0], 0);
			} else {
				range.selectNodeContents(target);
			}

			range.collapse(isStart);
			sel.removeAllRanges();
			sel.addRange(range);

			$(target).focus();
			$(target).select();
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

            this.opts.autocomplete.data({ keyword: value })
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
                                .data('data',item)
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
        },

		insertTextAtCursor: function(node) {
		    var sel, range, html;
		    if (window.getSelection) {
		        sel = window.getSelection();
		        if (sel.getRangeAt && sel.rangeCount) {
		            range = sel.getRangeAt(0);
		            range.deleteContents();
		            range.insertNode(node);
		        }
		    }
		},

        init: function() {

            self = this.autocomplete;

            var options = this.opts.autocomplete;

            this.$editor.on('keydown.redactor-plugin-autocomplete', $.proxy(function(e) {

                var current = this.selection.current();

                if(current) {

					var range = this.selection.range(this.selection.get());


                    if(e.keyCode==32 && e.ctrlKey) { //space

                        var sel = this.selection.get();
                        sel.baseNode.nextSibling.nodeValue = sel.baseNode.nextSibling.nodeValue.replace(/^\s/,'');
                        this.selection.save();

                        var input = angular.element('<input/>')
                        				.attr('placeholder','Commands: user, task, spec, page')
                                        .on('blur',function(e) {
                                            setTimeout(function() {
                                                if(!self.preventBlur) {
                                                    self.remove();
                                                }
                                            },200);
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


                                                if(e.keyCode==13 || e.keyCode==9) { //enter, tab
                                                    this.autocomplete.itemSelect();
                                                    e.preventDefault();

                                                } else {
                                                    this.autocomplete.inputSearch(value);
                                                    this.autocomplete.inputWidth(String.fromCharCode(e.keyCode));
                                                }


                                            }
                                            e.stopPropagation();
                                        },this));

                        var autoWidth = angular.element('<span>').addClass('autocomplete-width');
                        var results = angular.element('<span class="results"></span>');
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

                        this.autocomplete.insertTextAtCursor(container[0]);
                        input[0].focus();
                       	this.autocomplete.inputSearch('');

                        autocomplete = {    container: container,
                                            results: results,
                                            input: input,
                                            autoWidth: autoWidth };
                    }
                }

            },this));
        }
    };
};



