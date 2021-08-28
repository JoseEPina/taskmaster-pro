var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
   // create elements that make up a task item
   var taskLi = $("<li>").addClass("list-group-item");
   var taskSpan = $("<span>") //
      .addClass("badge badge-primary badge-pill") //
      .text(taskDate); //
   var taskP = $("<p>") //
      .addClass("m-1") //
      .text(taskText); //

   // Append <span> and <p> element to parent <li>
   taskLi.append(taskSpan, taskP);

   // Check due date
   auditTask(taskLi);

   // Append to <ul> list on the page
   $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
   tasks = JSON.parse(localStorage.getItem("tasks"));

   // if nothing in localStorage, create a new object to track all task status arrays
   if (!tasks) {
      tasks = {
         toDo: [],
         inProgress: [],
         inReview: [],
         done: [],
      };
   }

   // loop over object properties
   $.each(tasks, function (list, arr) {
      console.log(list, arr);
      // then loop over sub-array
      arr.forEach(function (task) {
         createTask(task.text, task.date, list);
      });
   });
};

var saveTasks = function () {
   localStorage.setItem("tasks", JSON.stringify(tasks));
};

// To check the time status of the Task
var auditTask = function (taskElement) {
   // Get date from taskElement
   var date = $(taskElement)
      .find("span") //
      .text() //
      .trim(); //

   // Convert to moment.js object at 05:00pm
   // This should print out an obj for the value of the date variable, but at 05:00pm of that date
   var time = moment(date, "L").set("hour", 17);

   // Remove any old classes from element
   $(taskElement).removeClass("list-group-item-warning list-group-item-danger");

   // Apply new class if task is near/over due date
   if (moment().isAfter(time)) {
      // Adds a red backgroung when Past Due
      $(taskElement).addClass("list-group-item-danger");
   } // wrapping with Math.abs ensures we get a + number and not a -
   else if (Math.abs(moment().diff(time, "days")) <= 2) {
      // Adds a yellow backgrounf when due date is near
      $(taskElement).addClass("list-group-item-warning");
   }
};

// Drag & Drop JQuery UI Feature
$(".card .list-group").sortable({
   connectWith: $(".card .list-group"),
   scroll: false,
   tolerance: "pointer",
   helper: "clone",
   activate: function (event) {
      // console.log("activate", this);
   },
   deactivate: function (event) {
      // console.log("deactivate", this);
   },
   over: function (event) {
      // console.log("over", event.target);
   },
   out: function (event) {
      // console.log("out", event.target);
   },
   update: function (event) {
      // New array to store the task data in
      var tempArr = [];

      // Loop over current set of children in sortable list
      $(this)
         .children()
         .each(function () {
            var text = $(this) //
               .find("p") //
               .text() //
               .trim(); //

            var date = $(this) //
               .find("span") //
               .text() //
               .trim(); //

            // Add task data to the temp array as an object
            tempArr.push({
               text: text, //
               date: date, //
            });
         });
      // Trim down list's ID to match object property
      var arrName = $(this) //
         .attr("id") //
         .replace("list-", ""); //
      // Update array on tasks object and save
      tasks[arrName] = tempArr;
      saveTasks();
   },
   stop: function (event) {
      $(this).removeClass("dropover"); // ?
   },
});

// Makes our #trash area enabled with droppable jQuery method
$("#trash").droppable({
   accept: ".card .list-group-item",
   tolerance: "touch",
   drop: function (event, ui) {
      // Remove object (dragged element) from DOM
      ui.draggable.remove();
      console.log("drop");
   },
   over: function (event, ui) {
      console.log("over");
   },
   out: function (event, ui) {
      console.log("out");
   },
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
   // clear values
   $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
   // highlight textarea
   $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
   // get form values
   var taskText = $("#modalTaskDescription").val();
   var taskDate = $("#modalDueDate").val();

   if (taskText && taskDate) {
      createTask(taskText, taskDate, "toDo");

      // Close modal
      $("#task-form-modal").modal("hide");

      // Save in tasks array
      tasks.toDo.push({
         text: taskText,
         date: taskDate,
      });

      saveTasks();
   }
});

// Task text was clicked
$(".list-group").on("click", "p", function () {
   // get the textarea's current value/text
   var text = $(this) //
      .text() //
      .trim(); //
   // Replace the <p> element with a new textarea
   var textInput = $("<textarea>") //
      .addClass("form-control") //
      .val(text); //

   $(this).replaceWith(textInput);

   // "Auto Focus" new element
   textInput.trigger("focus");
});

// Editable area was Un-clicked (or "un-focused", keyword "blur")
$(".list-group").on("blur", "textarea", function () {
   // Get the textarea's current value/text
   var text = $(this) //
      .val() //
      .trim(); //

   // Get the parent ul's ID attribute
   var status = $(this) //
      .closest(".list-group") //
      .attr("id") //
      .replace("list-", ""); //

   // Get the task's position in the list of other li elements
   var index = $(this) //
      .closest(".list-group-item") //
      .index(); //

   tasks[status][index].text = text;
   saveTasks();

   // Recreate the <p> element
   var taskP = $("<p>") //
      .addClass("m-1") //
      .text(text); //

   // Replace textarea with <p> element
   $(this).replaceWith(taskP);
});

// Due Date was clicked (with <span> element)
$(".list-group").on("click", "Span", function () {
   // Get current text from date
   var date = $(this) //
      .text() //
      .trim(); //

   // Create new input element
   var dateInput = $("<input>") //
      .attr("type", "text") //
      .addClass("form-control") //
      .val(date);

   // Swap out elements
   $(this).replaceWith(dateInput);

   // Enable jQuery ui datepicker with onClose ("blur") event
   dateInput.datepicker({
      // minDate: 1,
      onClose: function () {
         // When calendar is closed, force a "change" event on the 'dateInput'
         // This will leave the date "as is" from original picked date
         $(this).trigger("change");
      },
   });

   // Automatically focus on new element (the calendar)
   dateInput.trigger("focus");
});

// Value of Date was changed. So now, change format back to original display properties
$(".list-group").on("change", "input[type='text']", function () {
   // Get current text
   var date = $(this) //
      .val() //
      .trim(); //

   // Get the parent ul's ID attribute
   var status = $(this) //
      .closest(".list-group") //
      .attr("id") //
      .replace("list-", ""); //

   // Get the task's position in the list of other <li> elements
   var index = $(this) //
      .closest(".list-group-item") //
      .index(); //

   // Update task in array and re-save to localStorage
   tasks[status][index].date = date;
   saveTasks();

   // Recreate <span> element with bootstrap classes
   var taskSpan = $("<span>") //
      .addClass("badge badge-primary badge-pill") //
      .text(date); //

   // Replace input with <span> element
   $(this).replaceWith(taskSpan);

   // Pass task's <li> element into auditTask() to check due date
   auditTask($(taskSpan).closest(".list-group-item"));
});

// remove all tasks
$("#remove-tasks").on("click", function () {
   for (var key in tasks) {
      tasks[key].length = 0;
      $("#list-" + key).empty();
   }
   saveTasks();
});

// Adds jQuery datepicker method to the <input> element with an id
// This is for "Add Task" action
$("#modalDueDate").datepicker({
   // Prevents users from selecting  dates that have passed.
   // Value of 1 indicates the minimum date to be 1 day from the currentDate
   minDate: 1,
});

// load tasks for the first time
loadTasks();

