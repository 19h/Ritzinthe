#!/usr/local/bin/node

var cluster = require("cluster"),
var numCPUs = require("os").cpus().length;

var worker = function (cb) {
	var 
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
	var init = process.hrtime(), _repl = void 0;

	_drpl = function () {
		process.env["dev"] && (_repl=require("repl").start({
			prompt: "libLegify> ",
			input: process.stdin,
			output: process.stdout
		}));
	};

	exit = function () {
		process.exit();
	}

	console.log("Spawning..");
	worker(function () {
		console.log("\t[" + process.pid + "] Worker online. [" + _hr_mutate(init) + "]");

		_drpl ();
	});
}