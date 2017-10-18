$.Redactor.prototype.autocomplete = function()
{
    var self = null;

    return {

        remove: function() {
            self.container.remove();
            this.$editor.focus();
            this.code.sync();
        },

        inputWidth: function(char) {
            var val = self.input.val().concat(char).replace(/[\s]/,'');

            var span = self.autoWidth.text(val);

            self.input.css('width',span[0].offsetWidth + 15);
        },

        itemSelect: function() {

            var selected = angular.element(self.results[0].querySelector('.result.selected'));

            if(selected.length) {

            	var data = selected.data('data').data;
                var el = angular.element(this.opts.autocomplete.insert(data))[0];
                if(el) {
                	this.selection.restore();
	                self.insertTextAtCursor(el);
	            }

	            this.caret.after(el);
	            this.selection.get().extentNode.nodeValue = '\u00A0' + this.selection.get().extentNode.nodeValue;
	            self.remove();
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
            self.results.empty();
        },

        itemSetSelected: function(item) {
            angular.element(self.results[0].querySelector('.result.selected')).removeClass('selected');

            if(item) {
                angular.element(item).addClass('selected');
            }
        },

        inputSearch: function(value) {

            this.opts.autocomplete.data(value)
            .then($.proxy(function(items) {
                self.resultClear();

                if(!items.length) {
                    self.results.append(angular.element('<div>')
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

					self.results.append(div);
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

		debounce: function(func, wait, immediate) {
			var timeout;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		},
        init: function() {
        	self = this.autocomplete;

        	var options = this.opts.autocomplete || {};

        	if(options.button) {
	        	options.button.name = options.button.name || 'autocomplete-open'
	        	var button = this.button.add(options.button.name,options.button.tooltip);

	        	if(options.button.icon) {
	        		this.button.setIcon(button, '<md-icon class="material-icons">' + options.button.icon + '</md-icon>');
	        	}

	            this.button.addCallback(button,function() {
	            	setTimeout(function() {
	            		self.open();
	            	});
	            });
	        }

            this.$editor.on('keyup.redactor-plugin-autocomplete', $.proxy(function(e) {

                var current = this.selection.current();
                if(current) {
                    if(e.keyCode==32 && e.ctrlKey) { //space + Ctrl
                    	e.preventDefault();
                    	this.autocomplete.open();
                    }
                }

            },this));
        },

        open: function() {

			var sel = this.selection.get();
			this.selection.save();

			var keydownDebounce = self.debounce(function(e,value) {
				self.inputSearch(value);
			    self.inputWidth(String.fromCharCode(e.keyCode));
			},300);

			var input = angular.element('<input/>')
			.attr('placeholder',this.opts.autocomplete.placeholder)
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
            .on('keydown',function(e) {

            	var immediate = e.keyCode==8 || e.keyCode==38 || e.keyCode==40;

		        self.preventBlur = false;

		        var value = self.input.val();

		        if(e.keyCode==8) //backspace
		            value = value.slice(0,-1);
		        else
		        	value += e.key;

		        if(e.keyCode==38 || e.keyCode==40) { //up,down

		            var selected = angular.element(self.results[0].querySelector('.result.selected'));

		            if(selected.length) {

		                if(e.keyCode==38) {
		                    if(selected[0].previousSibling) {
		                        self.itemSetSelected(selected[0].previousSibling);
		                    }
		                } else if(e.keyCode==40) {
		                    if(selected[0].nextSibling) {
		                        self.itemSetSelected(selected[0].nextSibling);
		                    }
		                }
		            }

		            e.preventDefault();

		        } else if((!self.input.val().length && e.keyCode==8) || e.keyCode==27) { //backspace, escape
		            self.remove();
		            e.preventDefault();

		        } else {

		            if(e.keyCode==13 || e.keyCode==9) { //enter, tab
		                self.itemSelect();
		                e.preventDefault();

		            } else {
		            	keydownDebounce(e,value);
		            }

		        }
		        e.stopPropagation();
            });

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

			self.insertTextAtCursor(container[0]);
			self.container = container;
			self.results = results;
			self.autoWidth = autoWidth;
			self.input = input;

			input[0].focus();
			self.inputSearch('');
        }
    };
};



