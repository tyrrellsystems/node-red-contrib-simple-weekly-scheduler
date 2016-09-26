# node-red-contrib-simple-weekly-scheduler

A collection of nodes to do basic scheduling.

## Simple Scheduler
A node to schedule a weeks worth of events. Multiple events can
be scheduled Sun-Sat at a courseness of 15mins (e.g. and event can 
start at 10:00, 10:15, 10:30 or 11:00 and is a multiple of 15min 
in duration)

Events are scheduled by dragging out periods of time on a calendar
style interface

The node will emit messages at the start and end of each event with
a configurable payload for both messages.

## Simple Schedule Filter

This node filters messages based on timeslots over a week. It works 
in the same way as the Simple Schduler node but output on the first
output if message arrives inside a marked zone and out the second
output if it is outside.