module.exports = function(RED) {
	"use strict";
	var path= require('path');

	var timePlanner = function(n) {
		RED.nodes.createNode(this,n);
		this.events = JSON.parse(n.events);
		this.topic = n.topic;
		var node = this;

		function checkTime(){
			var now = new Date();
			var day = now.getDay();
			var hour = now.getHours();
			var mins = now.getMinutes()
			for (var i=0; i< node.events.length; i++) {
				var evtStart = new Date();
				evtStart.setTime(Date.parse(node.events[i].start));
				var evtEnd =  new Date();
				evtEnd.setTime(Date.parse(node.events[i].end));
				// console.log("Now: ", now);
				// console.log("Start: ",evtStart);
				// console.log("End: ",evtEnd);

				if (evtStart.getDay() === day) { //same day of week
					if (hour === evtStart.getHours() && mins === evtStart.getMinutes()) {
						console.log("start");
						var msg = {
							topic: node.topic,
							event: node.events[i],
							payload: "start"
						};
						node.send(msg);
					}
					if (hour === evtEnd.getHours() && mins === evtEnd.getMinutes()) {
						console.log("end");
						var msg = {
							topic: node.topic,
							event: node.events[i],
							payload: "end"
						};
						node.send(msg);
					}
				}
			}
		}

		node.interval = setInterval(checkTime,60000); //once a min
		checkTime();

		node.on('close', function(){
			clearInterval(node.interval);
		});

	};
	RED.nodes.registerType("time-planner",timePlanner);

	RED.httpAdmin.get('/time-planner/js/*', function(req,res){
		// var filename = path.join(__dirname , 'static', req.params[0]);
		// res.sendfile(filename);
		var options = {
			root: __dirname + '/static/',
			dotfiles: 'deny'
		};
 		res.sendFile(req.params[0], options);
	});
}