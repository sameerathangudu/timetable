var express = require('express');
var TasksMongoDB = require('./tasksMongoDB').TasksMongoDB;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.set('view options', {
    layout: false
});

var tasksMongoDB = new TasksMongoDB('localhost', 27017);

// Routes

//start route
app.get('/', function(req, res){

    tasksMongoDB.findAll( function(error, pendingTasks, completedTasks){

        res.render('index.ejs', { locals: {
            title: 'Timetable',
            tasks: pendingTasks,
            completed: completedTasks
            }
        });
    })
});

//route for add tasks to database
app.post('/addTask', function(req, res){
    if (req.param('title') != "") {
        tasksMongoDB.save({
            taskName: req.param('taskName'),
            dueDate: req.param('dueDate'),
            isDone: "false",
        }, function( error, docs) {
            res.redirect('/')
        });
    } else {
        res.redirect('/');
    }
});

//setting the task as done in database
app.post('/updateTask', function(req, res){
 
    tasksMongoDB.setTaskDone(req.param('id'), function(error, docs) {
        res.redirect('/');
    });
    //res.redirect('/');
});

//listen on port
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
