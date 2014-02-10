#!/usr/local/bin/node

var cluster = require("cluster"),
var numCPUs = require("os").cpus().length;

var worker = function (cb) {


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