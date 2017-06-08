var url = 'https://pacific-meadow-64112.herokuapp.com/data-api/taoshima';

//initialize the table template
var tableTemplate = Handlebars.compile($('#tableTemplate').html());
var formTemplate = Handlebars.compile($('#formTemplate').html());

//holds all the data the user enters into the form
var sushiItems = [];

//read from the REST API at startup
/*the get will return all of the data in the database that we have put in so far. Does it return a table?*/
$(document).ready(function() {
  $.ajax(url, {
    method: 'GET',
    success: function(items) {
      var tbody = $('#sushi-body');
      //set the sushiItems array to what we just got from the server
      sushiItems = items;
      /*now take this data and enter into the template. You always have to have the var data = {} format where whatever is in the {} has to match the keywork you put in the template*/
      var data = {sushiItems};
      var html = tableTemplate(data);
      $('#bodyContent').html(html);
    }
  });
  //hide the submit and cancel buttons on the form
  $('#newItemButton').css('display', 'inline-block');
  $('#clearTable').css('display', 'inline-block');
  $('#submit').css('display', 'none');
  $('#cancel').css('display', 'none');
});

//function handlers
$('#newItemButton').on('click', handleNewItemButton);
$('#submit').on('click', addToArray);
$('#cancel').on('click', handleCancel);
$('#clearTable').on('click', clearTable);

//handler for the new item button
/*will hide the table and reveal the form*/
function handleNewItemButton() {
  //put data into the form template
  var html = formTemplate({formTitle: "Enter a new sushi entry!"})
  $('#bodyContent').html(html);
  //hide the new item and clear table button but reveal submit and clear
  $('#newItemButton').css('display', 'none');
  $('#clearTable').css('display', 'none');
  $('#submit').css('display', 'inline-block');
  $('#cancel').css('display', 'inline-block');
}

//add user input to the data array
function addToArray() {
  //gets the input for the sushi field
  var sushiVal = $('#sushiEntry').val();
  //gets the form input for the restaurant field
  var restVal = $('#restEntry').val();
  //error handling
  if (sushiVal == "" || restVal == "") {
    alert("Please enter a sushi name and restaurant!");
  } else {
    //adds what the user entered into the object array
    sushiItems.push({sushiType: sushiVal, restaurant: restVal});
    
    //put the table into the main page div by entering data into the table template
    var data = {sushiItems};
    var html = tableTemplate(data);
    $('#bodyContent').html(html);
    
    //hide the submit and cancel buttons for the form
    $('#newItemButton').css('display', 'inline-block');
    $('#clearTable').css('display', 'inline-block');
    $('#submit').css('display', 'none');
    $('#cancel').css('display', 'none');
   
    //save the data to localStorage in addition to having it in the local array
    localStorage["sushi-list"] = JSON.stringify(sushiItems);
    
    //also save the data to the REST API connected to a Mongo database that was created for this assignment
    /*unlike localstorage where we can store the entire data array and have it read back, with the REST API we will need to send just one objet at a time. Maybe there is a way to send the whole array but couldn't figure it out...*/
    $.ajax(url, {
      method: 'POST',
      data: {
        sushiType: sushiVal,
        restaurant: restVal
      },
      success: function() {
        console.log("data posted successfully");
      },
      error: function() {
        cosole.log("AJAX error. Data not posted");
      }
    });
  }
}

/*handle the cancel by simply revealing the table again*/
function handleCancel() {
  var data = {sushiItems};
  var html = tableTemplate(data);
  $('#bodyContent').html(html);
    
  //hide the submit and cancel buttons for the form
  $('#newItemButton').css('display', 'inline-block');
  $('#clearTable').css('display', 'inline-block');
  $('#submit').css('display', 'none');
  $('#cancel').css('display', 'none');
}

//function to clear the table
function clearTable() {
  localStorage.clear();
  //clear the database. First get the id of each item in the dataabase
  $.ajax(url, {
    method: 'GET',
    success: function(data) {
      data.forEach(function(items) {
        $.ajax(url + '/' + items._id, {
          method: 'DELETE',
          success: function() {
            console.log("database cleared");
          },
          error: function() {
            console.log("could not clear database");
          }
        });
      });
    }
  });
}