#!/usr/local/bin/node

var cluster = require("cluster"),
var numCPUs = require("os").cpus().length;

var http = require("http");
var httpProxy = require("http-proxy");

var routes = {
	// Structure:
	// <VHOST>: <target>
	// Example: 
	// "sly.mn": "http://127.0.0.1:3128"
	"test.com": "http://127.0.0.1:1234",

	// This will apply to every vhost that
	// is different from the above ones:
	"default": "http://127.0.0.1:81"
};

var worker = function (cb) {
	// Initialize routes
		var routeCache = {};

		Object.keys(routes).forEach(function (v) {
			routeCache[v] = httpProxy.createProxyServer({
	                        target: routes[v]
	                });
		})

	// Create Router
		http.createServer(function (request, response) {
			if ( routes[request.host] )
				return routeCache[request.host].web(request, response);

			routeCache["default"].web(request, response);
		})

	// Notify cluster that this
	// instance is running
	cb();
}

if (cluster.isMaster) {
	_master();
	
	var init = process.hrtime();
	var child = cluster.fork();

	cluster.on("exit", function(worker, code, signal) {
		if ( worker.suicide ) return;

		var exitCode = worker.process.exitCode;
		console.log("\t[" + worker.process.pid + "] Worker died. (" + exitCode + ")");
		console.log("\tRespawning..");
		cluster.fork();
	});
} else {
	console.log("Spawning..");
	worker(function () {
		console.log("\t[" + process.pid + "] Worker online. [" + _hr_mutate(init) + "]");
	});
}