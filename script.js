
var MainTable = React.createClass({

	// define arrays to store three kind of tasks
	componentWillMount: function() {
		this.todoAll = [];
		this.inprogressAll =[];
		this.doneAll = [];
	},

	getInitialState: function() {
		return {kanbanBoard: 0};
	},
	// handle properties referred from child (TodoForm)
	handleTaskSubmit: function(task) {
		this.todoAll.push(task);
		this.setState({kanbanBoard: this.state.kanbanBoard + 1});
	},
	// remove task from parent column (dragged column)
	refreshColumn: function(parentColumn, taskid) {
		for (var i = 0; i < parentColumn.length; i++) {
			if(parentColumn[i].taskid == taskid) {
				return parentColumn.splice(i, 1);
				break;
			}
		};
	},
	// handle tasks moving between columns 
	handleTaskMove: function(task, targetColumn, parentColumn) {
		// chack in what column drop have to be done and refresh parent column
		if(targetColumn === "inprogress") {
			this.inprogressAll.push(task);
			if(parentColumn === "todo")
				this.refreshColumn(this.todoAll, task.taskid);
			else if(parentColumn === "done")
				this.refreshColumn(this.doneAll, task.taskid);
			// task was dropped in the same column
			else
				this.refreshColumn(this.inprogressAll, task.taskid);

		} else if(targetColumn === "done") {
			this.doneAll.push(task);
			if(parentColumn === "todo")
				this.refreshColumn(this.todoAll, task.taskid);
			else if(parentColumn === "inprogress")
				this.refreshColumn(this.inprogressAll, task.taskid);
			else
				this.refreshColumn(this.doneAll, task.taskid);

		} else {
			this.todoAll.push(task);
			if(parentColumn === "inprogress")
				this.refreshColumn(this.inprogressAll, task.taskid);
			else if(parentColumn === "done")
				this.refreshColumn(this.doneAll, task.taskid);
			else 
				this.refreshColumn(this.todoAll, task.taskid);
		}
		this.setState({kanbanBoard: this.state.kanbanBoard + 1});
	},

	render: function() {
		return (
			React.createElement("div", {className: "MainTable"},
				React.createElement(TaskTable, {allTask: this.todoAll, allDone: this.doneAll, allInprogress: this.inprogressAll, handleTaskMove: this.handleTaskMove}),
				React.createElement(TodoForm, {onTaskSubmit: this.handleTaskSubmit})
			)
		);
	}
});

// Table component
// here is building of each columns
var TaskTable = React.createClass({

	getInitialState: function() {
		return {todoTotal: 0};
	},

	allowDrop: function(event) {
		event.preventDefault();
	},

	drop: function(event) {
		event.preventDefault();
		// fetch data of moved task
		var taskId = event.dataTransfer.getData("text/id");
		var dataClass = event.dataTransfer.getData("text/class");
		var dataName = event.dataTransfer.getData("text/name");
		var movedTask = {taskname: dataName, taskprior: dataClass, taskid: taskId};
		// fetch class of parent and target column 
		var targetColumn = event.target.className;
		var parentColumn = event.dataTransfer.getData("text/column");
		// invoke handleTaskMove function from MainTable component
		this.props.handleTaskMove(movedTask, targetColumn, parentColumn);
	},

	render: function() {
		// bild tasks arrays
		if(this.props.allTask != ''){ 
			var tasksTodo = this.props.allTask.map(function(item){
				return (
					React.createElement(Todoitem, {name: item.taskname, prior: item.taskprior, id: item.taskid, column: "todo", key: item.taskid})
					)	
				});
		}else{
			var tasksTodo = "Todo tasks";
		};

		if(this.props.allInprogress != ''){
			var tasksInprogress = this.props.allInprogress.map(function(item){
				return (
					React.createElement(Todoitem, {name: item.taskname, prior: item.taskprior, id: item.taskid, column: "inprogress", key: item.taskid})
				)
			});
		}else{
			var tasksInprogress = "In progress tasks";
		};

		if(this.props.allDone != ''){
			var tasksDone = this.props.allDone.map(function(item){
				return (
					React.createElement(Todoitem, {name: item.taskname, prior: item.taskprior, id: item.taskid, column: "done", key: item.taskid})
				)
			});
		}else{
			var tasksDone = "Done tasks";
		};

		return (
			React.createElement("table", {className: "taskTable"},
				React.createElement("tr"),
				React.createElement("th", null, "To Do"),
				React.createElement("th", null, "In progress"),
				React.createElement("th", null, "Done"),
				React.createElement("tr"),
				React.createElement("td", {className: "todo", onDrop: this.drop, onDragOver: this.allowDrop}, tasksTodo),
				React.createElement("td", {className: "inprogress", onDrop: this.drop, onDragOver: this.allowDrop}, tasksInprogress),
				React.createElement("td", {className: "done", onDrop: this.drop, onDragOver: this.allowDrop}, tasksDone))
		)
	}
});

// Task item component
var Todoitem = React.createClass({
	getInitialState: function(){
		return {item: this.props.prior};
	},

	dragStart: function(event) {
		// Set data of moving task
		event.dataTransfer.setData("text/class", event.target.className);
		event.dataTransfer.setData("text/name", this.props.name);
		event.dataTransfer.setData("text/id", event.target.id);
		event.dataTransfer.setData("text/column", this.props.column);

	},

	render: function() {
		return React.createElement("div", {className: this.state.item, id: this.props.id, draggable: true, onDragStart: this.dragStart}, this.props.name, 
				React.createElement("p", null, this.props.prior));
	}
});

// Form component
var TodoForm = React.createClass({
	// handling of form submiting
	handleSubmit: function(event){
		event.preventDefault(); //If this method is called, the default action of the event will not be triggered.
		// store values from form fields
		var taskname = this.refs.taskname.getDOMNode().value.trim();
		var taskprior = this.refs.taskprior.getDOMNode().value.trim().toLowerCase();
		// fetch current time and use it as task unique ID
		var taskid = new Date();
		if(!taskname || !taskprior)
			return;
		var priorities = ["low","middle","hot"];
		for (var i = 0; i < priorities.length; i++) {
			if(taskprior === priorities[i])
				break
			else if (i == 2)
				return
				
		};
		//refer props to parent
		this.props.onTaskSubmit({taskname: taskname, taskprior: taskprior, taskid: taskid});
		// clear fields
		this.refs.taskname.getDOMNode().value = '';
		this.refs.taskprior.getDOMNode().value = '';
	},

	render: function() {
		return (
			React.createElement("form", {className: "todoForm", onSubmit: this.handleSubmit},
				React.createElement("div",{className: "formHeaderName"},
				React.createElement("h4",null, "Task name:"),
				React.createElement("input", {className: "inputTaskName", type: "text", placeholder: "What you need to do ?", ref: "taskname"})),
				React.createElement("div",{className: "formHeaderPrior"},
				React.createElement("h4",null, "Task priority (low, middle, hot):"),
				React.createElement("input", {className: "inputTaskPrior", type: "text", placeholder: "Task priority", ref: "taskprior"}),
				React.createElement("input", {className: "submitButton", type: "submit", value: "Add"})))
		)
	}
});

React.render(React.createElement(MainTable), document.getElementById('content'));