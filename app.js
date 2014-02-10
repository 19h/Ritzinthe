#!/usr/local/bin/node

var cluster = require("cluster"),
    numCPUs = require("os").cpus().length;

var  http = require("http"),
httpProxy = require("http-proxy");

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

var websocketRoutes = {
	"test.com": "ws://127.0.0.1:1234"
}

var worker = function (cb) {
	// Initialize routes
		var routeCache = {};
		var websocketRouteCache = {};

		Object.keys(routes).forEach(function (v) {
			routeCache[v] = httpProxy.createProxyServer({
	                        target: routes[v]
	                });
		})

		Object.keys(websocketRoutes).forEach(function (v) {
			websocketRouteCache[v] = httpProxy.createProxyServer({
	                        target: routes[v],
	                        ws: true
	                });
		})

	// Create Router
		var server = http.createServer(function (request, response) {
			if ( routes[request.host] )
				return routeCache[request.host].web(request, response);

			routeCache["default"].web(request, response);
		}).listen(80);

		server.on("upgrade", function (request, socket, head) {
			if ( websocketRoutes[request.host] )
				return websocketRouteCache[request.host].ws(req, socket, head);
		})
}

if ( cluster.isMaster ) {
	var init = Date.now();

	console.log("Spawning..");

	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on("online", function(worker) {
		console.log("\t[" + worker.process.pid + "] Worker online. [" + (Date.now() - init) + "]");
	});

	cluster.on("disconnect", function(worker) {
		console.log("\t[" + worker.process.pid + "] Worker disconnected.");
		console.log("\tRespawning..");
		cluster.fork();
	});

	cluster.on("exit", function(worker, code, signal) {
		var exitCode = worker.process.exitCode;
		console.log("\t[" + worker.process.pid + "] Worker died. (" + exitCode + ")");
		console.log("\tRespawning..");
		cluster.fork();
	});
} else {
	worker();
}