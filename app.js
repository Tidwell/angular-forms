'use strict';

var server = require('./server/app');

var env = require('./server/config/local');

var fs = require('fs');

//process cmd-line args for environment
var args = process.argv.splice(2);
args.forEach(function(arg) {
	var parts = arg.split('=');
	switch (parts[0]) {
		case '-e':
		case '-env':
			env = require('./server/config/' + parts[1]);
			break;
	}
});

//sync to read the modules from the filesystem
var s = server.createServer(env);

s.events.on('server:ready', function() {
	s.modules.server.log('Server is ready');
	s.modules.server.log(s);
});

if (env.env === 'prod') {
	process.on('uncaughtException', function(err) {
		fs.appendFile('error.log', err, function(err) {
			console.log('error writting error log ', err);
		});
	});
}