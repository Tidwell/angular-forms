/*
	Depends on: Module, Server

	Subscribes:
		server:routes - adds angular routes to the server
*/
var util = require('util');
var path = require('path');
var fs = require('fs');
var express = require('express');

var Module = require('./core/module').Module;

var FrmsServer = exports.FrmsServer = function(options, events) {
	//call parent constructor
	Module.call(this, options);
	var self = this;

	var serverOptions = self.options.get('frmsServer');

	//generate the absolute path from the config
	serverOptions.staticPath = self.generateStaticDirectory(serverOptions.staticDirectory);

	//add the static frontend server
    events.on('server:configure', function(app){
        app.use(serverOptions.uriPath, express.static(serverOptions.staticPath));
    });
	
	//add the routes
	events.on('server:genericRoutes', function(app){
		var prefix = serverOptions.uriPath === '/' ? '' : serverOptions.uriPath;
		app.get(prefix + '/*', function(req,res) { //serve all /uriPath/* routes
			self.serve(req,res);
		});
	});
};

util.inherits(FrmsServer, Module);

/*
	Serves the angular app

	If its just the uriPath route, redirect to index

	If the file exists, serve it, otherwise serve the index.html
		DANGER -- assumes single-point of entry and no 404
*/
FrmsServer.prototype.serve = function(req,res) {
	var self = this;
	var serverOptions = this.options.get('frmsServer');

	//strip off the leading /uriPath portion of the url
	var path = req.path;

	//we have a real path - check if the file exists
	var file = serverOptions.staticPath + path;
	fs.exists(file, function(exists) {
		if (exists) {
			//serve it
			res.sendfile(path, {
				root: serverOptions.staticPath
			});
		} else {
			//otherwise serve the index
			res.sendfile('index.html', {
				root: serverOptions.staticPath
			});
		}
	});
};