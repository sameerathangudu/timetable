var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

//database Initialization
TasksMongoDB = function(host, port) {
  this.db= new Db('node-tasks', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};

//retrieving tasks collection
TasksMongoDB.prototype.getCollection= function(callback) {
  
    this.db.collection("tasks", function(error, tasks){
             callback(null, tasks);
    });
};


//retrieving rows from sorted collection by dueDate
TasksMongoDB.prototype.findAll = function(callback) {
    this.getCollection(function(error, collection) {
     
      if( error ) callback(error)
      else {
        
        collection.find({}, { 'sort':[['dueDate',1]]}).toArray(function(error, results) {
          if( error ) callback(error)
          else {
		
            var tasks = [];
            var completed = [];
            for( var i =0;i< results.length;i++ ) {
                if (results[i].isDone == "false") {
                    tasks.push(results[i]);
                } else {
                    completed.push(results[i]);
                }
            }
            callback(null, tasks, completed)
          }
        });
      }
    });
};

//marking a task as Done
TasksMongoDB.prototype.setTaskDone = function(id, callback) {
    this.getCollection(function(error, collection) {
      if( error ) callback(error)
      else {
        
        collection.update({_id: collection.db.bson_serializer.ObjectID.createFromHexString(id)}, {$set: {isDone: "true"}} , function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

//saving a new task to database
TasksMongoDB.prototype.save = function(tasks, callback) {
    this.getCollection(function(error, collection) {
      if( error ) callback(error)
      else {
        if( typeof(tasks.length)=="undefined")
          tasks = [tasks];

        for( var i =0;i< tasks.length;i++ ) {
          task = tasks[i];
        }

        collection.insert(tasks, function() {
          callback(null, tasks);
        });
      }
    });
};

exports.TasksMongoDB = TasksMongoDB;
