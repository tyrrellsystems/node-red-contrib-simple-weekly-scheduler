module.exports = function(RED) {
	"use strict";
	var path= require('path');

	var timePlanner = function(n) {
		RED.nodes.createNode(this,n);
		this.events = JSON.parse(n.events);
		this.topic = n.topic;
		this.startPayload = n.startPayload;
		this.startPayloadType = n.startPayloadType;
		this.endPayload = n.endPayload;
		this.endPayloadType = n.endPayloadType;
		var node = this;

		function checkTime(){
			var now = new Date();
			var day = now.getUTCDay();
			var hour = now.getUTCHours();
			var mins = now.getUTCMinutes()
			for (var i=0; i< node.events.length; i++) {
				var evtStart = new Date();
				evtStart.setTime(Date.parse(node.events[i].start));
				var evtEnd =  new Date();
				evtEnd.setTime(Date.parse(node.events[i].end));
				// console.log("Now: ", now);
				// console.log("Start: ",evtStart);
				// console.log("End: ",evtEnd);

				if (evtStart.getUTCDay() === day) { //same day of week
					if (hour === evtStart.getUTCHours() && mins === evtStart.getUTCMinutes()) {
						console.log("start");
						var msg = {
							topic: node.topic,
							event: {
								start:evtStart.toTimeString()
								end: evtEnd.toTimeString()
							},
							payload: RED.util.evaluateNodeProperty(node.startPayload, node.startPayloadType, node,msg)
						};
						node.send(msg);
					}
					if (hour === evtEnd.getUTCHours() && mins === evtEnd.getUTCMinutes()) {
						console.log("end");
						var msg = {
							topic: node.topic,
							event: {
								start:evtStart.toTimeString()
								end: evtEnd.toTimeString()
							},
							payload: RED.util.evaluateNodeProperty(node.endPayload, node.endPayloadType, node,msg)
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