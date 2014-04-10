'use strict';

angular.module('frmsApp')
	.directive('redactor', function($timeout) {
		var marked = window.marked;
		var $ = window.$;
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function postLink(scope, element, attrs, ngModel) {
				if (!ngModel) {
					return;
				}
				var rem = new reMarked();

				var $red = $(element);
				var red = null;

				var redactorSync = false; //if redactor is in the process of syncing

				/*
					When the model changes, we need to update redactor with the new info
				*/
				scope.$watch(attrs.ngModel, function() {
					//dont update redactor if the model change was triggered by redactor syncing
					if (!ngModel.$viewValue || redactorSync) {
						return;
					}
					var html = marked(ngModel.$viewValue);
					var clean = red.cleanStripTags(html);

					red.$editor.html(clean);
					red.sync();
				});

				/*
					When redactor's content updates, we have to change the model
				*/
				function syncModel() {
					//if the change was caused by us syncing to redactor, we dont need to trigger another sync
					if (scope.$$phase) {
						return;
					}
					redactorSync = true;
					scope.$apply(function() {
						var markdown = rem.render(red.get());
						ngModel.$setViewValue(markdown);
					});
					redactorSync = false;
				}

				//setup the plugin for editing the raw markdown
				if (typeof window.RedactorPlugins === 'undefined') {
					window.RedactorPlugins = {};
				}

				window.RedactorPlugins.markdownView = {
					init: function() {
						//add the button
						this.buttonAddFirst('markdown', 'Markdown', this.showMarkdownView);
						this.buttonAwesome('markdown', 'fa-code');
						//and the textarea
						this.getBox().append('<textarea class="mdview_editor" style="display: none;"></textarea>');
					},
					showMarkdownView: function() {
						var $mdEditor = this.$box.find('.mdview_editor');
						var $wysiwyg = this.$box.find('.redactor_editor');

						//if its currently visible, we should update the data back to redactor
						//(which will then sync back to the model)
						if ($mdEditor.is(':visible')) {
							var html = marked($mdEditor.val());
							var clean = this.cleanStripTags(html);

							this.$editor.html(clean);
							this.sync();

							//hide the editor and reset toolbar
							$mdEditor.hide();
							$wysiwyg.show();
							this.$toolbar.find('.re-icon:not(.re-markdown)').removeClass('redactor_button_disabled');
							this.buttonInactive('markdown');
							return;
						}

						//show the editor and disable toolbar
						$wysiwyg.hide();
						this.$toolbar.find('.re-icon:not(.re-markdown)').addClass('redactor_button_disabled');
						this.buttonActive('markdown');
						$mdEditor.val(rem.render(this.get())).height($wysiwyg.height()).show();
					}
				};

				/*
					Redactor starts inserting divs instead of p tags if the editor doesnt start
					by having a paragraph.  Don't ask me why.
				*/
				if (!ngModel.$viewValue && !element.val()) {
					element.val('<p></p>');
				}

				//init redactor
				$red.redactor({
					changeCallback: syncModel,
					plugins: ['markdownView'],
					buttons: ['bold', 'italic', 'deleted', '|',
						'unorderedlist', 'orderedlist',
						'image', 'video', 'table', 'link', '|',
						'horizontalrule'
					]
				});

				//cache the redactor instance
				red = $red.data('redactor');
			}
		};
	});