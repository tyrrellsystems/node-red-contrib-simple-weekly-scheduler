/**
 * Copyright 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
	"use strict";
	var path = require('path');
	var req = require('request');

	var timePlanner = function(n) {
		RED.nodes.createNode(this,n);
		this.events = JSON.parse(n.events);
		this.central = n.central;
		this.topic = n.topic;
		this.startPayload = n.startPayload;
		this.startPayloadType = n.startPayloadType;
		this.endPayload = n.endPayload;
		this.endPayloadType = n.endPayloadType;
		var node = this;

		function checkCentral() {
			if (node.central) {
				req(node.central, function(err, respose, body){
					if (!err && response.statusCode == 200) {
						try{
							node.events = JSON.parse(body);
						} catch (error) {
							//problem with the events returned
							node.log(error);
						}
					} else {
						node.log(err, response.statusCode);
					}
				});
			}
		}

		function checkTime(){
			var now = new Date();
			var day = now.getUTCDay();
			var hour = now.getUTCHours();
			var mins = now.getUTCMinutes();
			for (var i=0; i< node.events.length; i++) {
				var evtStart = new Date();
				evtStart.setTime(Date.parse(node.events[i].start));
				var evtEnd =  new Date();
				evtEnd.setTime(Date.parse(node.events[i].end));
				// console.log("Now: ", now);
				// console.log("Now hour: ", hour);
				// console.log("Now mins: ", mins);
				// console.log("Start: ",evtStart);
				// console.log("Start hour: ",evtStart.getUTCHours());
				// console.log("Start mins: ",evtStart.getUTCMinutes());
				// console.log("End: ",evtEnd);

				if (evtStart.getUTCDay() === day) { //same day of week
					var msg = {
						topic: node.topic,
						event: {
							start:evtStart.toTimeString(),
							end: evtEnd.toTimeString()
						}
					};
					if (hour === evtStart.getUTCHours() && mins === evtStart.getUTCMinutes()) {
						console.log("start");
						msg.payload = RED.util.evaluateNodeProperty(node.startPayload, node.startPayloadType, node,msg);
						node.send(msg);
					}
					if (hour === evtEnd.getUTCHours() && mins === evtEnd.getUTCMinutes()) {
						console.log("end");
						msg.payload = RED.util.evaluateNodeProperty(node.endPayload, node.emdPayloadType, node,msg);
						node.send(msg);
					}
				}
			}
		}

		node.centralInterval = setInterval(checkCentral,600000); //once every 10mins

		node.interval = setInterval(checkTime,60000); //once a min
		checkTime();

		node.on('close', function(){
			clearInterval(node.centralInterval);
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
};