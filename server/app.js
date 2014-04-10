'use strict';

var path = require('path');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var mongoose = require('mongoose');

var modelDirectory = '/server/app/models/';
var moduleDirectory = '/server/app/modules/';

var modules = [];
var models = [];

//resolve the path to the module directory
var modulePath = path.resolve(path.normalize(process.cwd() + moduleDirectory));
var modelPath = path.resolve(path.normalize(process.cwd() + modelDirectory));

/*
	Synchronously figure out the modules to load.
	Done once at bootstrap.

	POTENTIAL BOTTLENECK
*/
function compileModules(path, toPush) {
	var files = fs.readdirSync(path);
	files.forEach(function(file) {
		if (file.indexOf('.js') !== -1) {
			//if it is a .js file, it is a module to load
			toPush.push({
				path: path + '/' + file,
				name: file.replace('.js', '').replace(file[0], file[0].toUpperCase())
			});
		} else {
			//otherwise we recurse
			compileModules(modulePath + '/' + file, toPush);
		}
	});
}
compileModules(modulePath, modules);

//after we know all the modules, add them to the exports so the user can access them
modules.forEach(function forEach(part) {
	var module = part.name;
	exports[module] = require(part.path)[module];
});

//compile the models
compileModules(modelPath, models);
exports.models = {};
models.forEach(function forEach(part) {
	var model = part.name;
	exports.models[model] = require(part.path)[model];
});


/*
	exposes: createServer

	Emits:
		database:connected - mongo connection has been established
			@arg mongoose - mongoose instance
		models:loaded - all models have been loaded
		modules:loaded - all modules have been loaded
		modules:loaded - server has been created
*/
exports.createServer = function(options) {
	var server = {
		modules: {},
		models: {},
		options: options,
		events: new EventEmitter()
	};

	if (options.db) {
		mongoose.connect(options.db);
		server.events.emit('database:connected', mongoose);
	}

	//require each module in ./app/ and create new instance of each, passing opts
	models.forEach(function generate(part) {
		var k = part.name;
		var model = k.toLowerCase();
		server.models[model] = new exports.models[k](server.options, mongoose);
	});

	server.events.emit('models:loaded');

	//require each module in ./app/ and create new instance of each, passing opts
	modules.forEach(function generate(part) {
		var k = part.name;
		var module = k.toLowerCase();
		// store for user access via serverInstance.modules
		server.modules[module] = new exports[k](server.options, server.events, server.models);
	});

	server.events.emit('modules:loaded');

	return server;
};