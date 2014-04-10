/*
	Depends on: Module

	Subscribes:
		modules:loaded - once modules are loaded, create the server

	Emits:
		server:configure - emitted when the app is ready to be configured by modules
			@arg app -- the express app instance
		server:routes - emitted when the app is ready to bind routes
			@arg app -- the express app instance
		server:genericRoutes - emitted when the app is ready to bind catch-all routes (eg. /*)
			@arg app - the express app instance
		server:ready - emitted when the server has been bound to the port
			#arg server -- the http server instance
*/
var http = require('http');
var express = require('express');
var util = require('util');

var Module = require('./module').Module;

var Server = exports.Server = function(options, events) {
	Module.call(this, options);
	//call parent constructor
	var self = this;

	var app = express();
	var httpServer = http.createServer(app);

	events.on('modules:loaded', function(){
		//tell the other modules to configure the express app
		events.emit('server:configure', app, httpServer);

		app.configure(function() {
			app.use(app.router);
		});

		//tell the modules other modules to bind their routes
		events.emit('server:routes', app);

		events.emit('server:genericRoutes', app);

		var serverOptions = self.options.get('server');
		//create server
		httpServer.listen(serverOptions.port, function() {
			self.log('Environment is ' + self.options.get('env') + ' - listening on port ' + serverOptions.port);
			events.emit('server:ready', httpServer);
		});
	});
};

util.inherits(Server, Module);