
//Calculates the new temperament score.
function calculateNew(valueOne, valueTwo, valueThree, current){
  return Number((valueOne + valueTwo + valueThree + current));
}

//function will update the temperament score
function insertNewTemperament(gameKey, role, newTemperament){
  var database = firebase.database();
  var ref = database.ref();
  var gameRef = ref.child("Games/" + gameKey + "/Events/" + role);
  gameRef.update({
    temperament: newTemperament
  });
}


//function will insert the consquences for an unanswered question and update the answered: value to true
function blankAnswerConsequence(gameKey, eventID){
  var consequences = [];
  //We've placed in order the choice array in the database to hold the consequences in this order: [SetOperatives, Creative, Budgetary]
  //The consequence for not answering a question is a -2 for the player who missed their question, and -1 to their teammates
  var consequencesSO = [-2, -1, -1];
  var consequencesC = [-1, -2, -1];
  var consequencesB = [-1, -1, -2];
  var playerType;
//get player type
  var consequenceRef = firebase.database().ref("Games/" + gameKey + "/Events/" + eventID);
  consequenceRef.once("value")
    .then(function(snapshot) {
      localStorage.setItem('playerType', snapshot.child("player").val());
    });

    playerType = localStorage.getItem('playerType');
  //figure out which role type missed the event and assign the relevent consequence
  if (playerType === "SetOperatives") {
    consequences = consequencesSO.slice(0, consequencesSO.length);
  } else if (playerType === "Creative") {
    consequences = consequencesC.slice(0, consequencesC.length);
  } else if (playerType === "Budgetary") {
    consequences = consequencesB.slice(0, consequencesB.length);
  }
  var database = firebase.database();
  var ref = database.ref();
  var gameRef = ref.child("Games/" + gameKey + "/Events/" + eventID);
  gameRef.update({
    answered: true,
    choice: consequences
  });

}
/* Function orchestrates the gathering of values to update a player's role's temperament.
*/
/* Parameters: gameKey is the current game that is calling the calculation.
Return Value: None
Description: Takes in information to connect to the database and calculate the new temperament score for the players.
/*include change "answered" to "true" after you check if its true or false. Important for Function of event generation
NEED TODO: put a plyer on strike if their temperament falls below -10
      strike penalty: same consequence to teammates as missing an event
      connect the temperament score to the html/css - done
functions I need to call at the very end of updateTemperament:
block of code to start database timer
startTimer(gameKey);
getAllEvents(); (needs to be the very last thing)
*/
/*
*/
function updateTemperament(gameKey, pace){
//get current event values
var eventSetOps;
var eventCreative;
var eventBudgetary;

var eventRef = firebase.database().ref("Games/" + gameKey);
eventRef.on("value", function(snapshot) {
    localStorage.setItem('eventSetOps', snapshot.child("SetOperatives/currentEvent").val());
    localStorage.setItem('eventCreative', snapshot.child("Creative/currentEvent").val());
    localStorage.setItem('eventBudgetary', snapshot.child("Budgetary/currentEvent").val());
  });

eventSetOps = localStorage.getItem('eventSetOps');
eventCreative = localStorage.getItem('eventCreative');
eventBudgetary = localStorage.getItem('eventBudgetary');
  // find out if the events have been answered. If they havent, apply penalty. blankAnswerConsequence will also update the 'answered' value to 'true'
  var eventRef4 = firebase.database().ref("Games/" + gameKey + "/Events/" + eventSetOps);
  eventRef4.once("value")
    .then(function(snapshot) {
      if (snapshot.child('answered').val() == false){
        blankAnswerConsequence(gameKey, eventSetOps);
      }
    });

  var eventRef5 = firebase.database().ref("Games/" + gameKey + "/Events/" + eventCreative);
    eventRef5.once("value")
      .then(function(snapshot) {
        if (snapshot.child('answered').val() == false){
          blankAnswerConsequence(gameKey, eventCreative);
        }
      });

  var eventRef6 = firebase.database().ref("Games/" + gameKey + "/Events/" + eventBudgetary);
    eventRef6.once("value")
      .then(function(snapshot) {
        if (snapshot.child('answered').val() == false){
          blankAnswerConsequence(gameKey, eventBudgetary);
        }
      });

//retrieve the consequence values and sort them for role types. Array value order is [SetOps, Creative, Budgetary]
/*
var event1array = [];
var event2array = [];
var event3array = []; */

var event1array;
var event2array;
var event3array;

/*
//get the choice arrays
 var ref = firebase.database().ref();
var sortingRefSO = ref.child("Games/" + gameKey + "/Events/" + eventSetOps + "/choice");
//console.log(eventSetOps);
 sortingRefSO.once("value")
    .then(function(snapshot) {
    sessionStorage.setItem('event1array', JSON.stringify(snapshot.val()));
  });

  var sortingRefB = ref.child("Games/" + gameKey + "/Events/" + eventBudgetary + "/choice");
   sortingRefB.once("value")
     .then(function(snapshot) {
      sessionStorage.setItem('event2array', JSON.stringify(snapshot.val()));
    });

    var sortingRefC = ref.child("Games/" + gameKey + "/Events/" + eventCreative + "/choice");
     sortingRefC.once("value")
       .then(function(snapshot) {
        sessionStorage.setItem('event3array', JSON.stringify(snapshot.val()));
      });
  setTimeout(restOfIt(), 3000, gameKey, pace); //make the function wait to give the database time
}

function restOfIt(gameKey, pace){
var event1array = [];
var event2array = [];
var event3array = [];

event1array = sessionStorage.getItem('event1array'); //string
event2array = sessionStorage.getItem('event2array'); //string
event3array = sessionStorage.getItem('event3array'); //string
*/

var consequencesSO = [-2, -1, -1];
var consequencesC = [-1, -2, -1];
var consequencesB = [-1, -1, -2];
  var eventarray1 = [1, .5, .5];
  var eventarray2 = [.5, 1, .5];
  var eventarray3 = [.5, .5, 1];
/*
  eventarray1 = JSON.parse(event1array); //turn string into array
  eventarray2 = JSON.parse(event2array); //turn string into array
  eventarray3 = JSON.parse(event3array); //turn string into array
  eventarray1 = event1array.slice(0, event1array.length);
  eventarray2 = event2array.slice(0, event2array.length);
  eventarray3 = event3array.slice(0, event3array.length);
*/


  //divy out the values from the arrays and assign them to respective variables for calculation
  var setOps1 = eventarray1[0];
  var setOps2 = eventarray2[0];
  var setOps3 = eventarray3[0];
  var creative1 = eventarray1[1];
  var creative2 = eventarray2[1];
  var creative3 = eventarray3[1];
  var budgetary1 = eventarray1[2];
  var budgetary2 = eventarray2[2];
  var budgetary3 = eventarray3[2];

  //grab the current temperament for each role
  var currentBudgetary;
  var currentCreative;
  var currentSetOps;

  var currentRef = firebase.database().ref("Games/" + gameKey);
  currentRef.once("value")
    .then(function(snapshot) {
     localStorage.setItem('currentBudgetary', snapshot.child("Budgetary/temperment").val());
     localStorage.setItem('currentCreative', snapshot.child("Creative/temperment").val());
     localStorage.setItem('currentSetOps', snapshot.child("SetOperatives/temperment").val());
    });

    currentBudgetary = localStorage.getItem('currentBudgetary');
    currentCreative = localStorage.getItem('currentCreative');
    currentSetOps = localStorage.getItem('currentSetOps');



//calculate the new scores
var newSetOpsTemperament = calculateNew(setOps1, setOps2, setOps3, currentSetOps);
var newCreativeTemperament = calculateNew(creative1, creative2, creative3, currentCreative);
var newBudgetaryTemperament = calculateNew(budgetary1, budgetary2, budgetary3, currentBudgetary);

//update the temperaments with new scores
insertNewTemperament(gameKey, "SetOperatives", newSetOpsTemperament);
insertNewTemperament(gameKey, "Creative", newCreativeTemperament);
insertNewTemperament(gameKey, "Budgetary", newBudgetaryTemperament);

var endTime = setEndTime(pace);

currentRef.update({
    "roundEndTime": endTime
});

startTimer(gameKey);

}
