/*
	Base Module class

	Accepts options and adds a getter

	@method generateStaticDirectory
		@arg string relativeDirectory - path from app root (eg. '/public/frontend')

	@method log
		@arg msg - message to console.log (on local) or ignore (anywhere else)
*/
var path = require('path');

var Module = exports.Module = function(options) {
	this.options = options;

	//add a getter to the options
	if (typeof this.options.get !== 'function') {
		this.options.get = function(key,deep) {
			if (deep) { return this[key][deep]; }
			return this[key];
		};
	}
};

Module.prototype.generateStaticDirectory = function(relativeDirectory) {
	return path.resolve(path.normalize(process.cwd() + relativeDirectory));
};

Module.prototype.log = function(msg) {
	if (this.options.get('env') === 'local') {
		console.log(msg);
	}
};