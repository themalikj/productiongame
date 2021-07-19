//TODO
/*
/*
- TIMER (should begin as soon as game is no longer available)
    * send an email when the game starts
    * store timer in firebase
      - get current time and then calculate how long is left

- Timer
- buttons

*/



/**
 * initializes firebase connection for reading/writing
 */

function initializeFirebase() {

  var config = {
    apiKey: "AIzaSyDb7ZNWKxVN9_xoHy9hypNXiCsLkr01VIg",
    authDomain: "capstone-bcb8f.firebaseapp.com",
    databaseURL: "https://capstone-bcb8f.firebaseio.com",
    projectId: "capstone-bcb8f",
    storageBucket: "capstone-bcb8f.appspot.com",
    messagingSenderId: "475562776551"
  };
  firebase.initializeApp(config);
}

/**
 * gets the current User's username based on email and stores it into
 * sessionStorage
 */
function getUsername() {
  var ref = firebase.database().ref();
  var user = firebase.auth().currentUser.email;
  var userRef = ref.child("Users");
  userRef.orderByChild('Email').equalTo(user).on("value", function(snapshot) {
    snapshot.forEach(function(data) {
      sessionStorage.setItem('Username', data.key);
    });
  });
}
/*
 * makes picture array for current, past, and standby games
 */
function makePictureArray() {
  var pictures = ['../img/filmcamera.jpg', '../img/filmprojector.jpeg', '../img/filmreel.jpg'];
  var index = Math.floor(Math.random() * pictures.length);
  return pictures[index];
}

/**
 * Retrieves all available games along with descriptions about the game then
 * displays them to the page
 */
function getGames() {

  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location = '../Login/login.html'; //If User is not logged in, redirect to login page
    }
  });
  var ref = firebase.database().ref();
  var gameRef = ref.child("Games");
  var pace = '';
  let output = '';
  var userArray = [];

  gameRef.orderByChild('available').equalTo(true).once("value").then(function(snapshot) {

    snapshot.forEach(function(data) {
      pace = data.child('Pace').val() == 0 ? 'Blitz' : 'Real Time';
      userArray = [];
      // get the players that have not been selected yet
      if (data.child('Budgetary').val().username == false) {
        userArray.push('Budgetary');
      }
      if (data.child('Creative').val().username == false) {
        userArray.push('Creative');
      }
      if (data.child('SetOperatives').val().username == false) {
        userArray.push('Set Operative');
      }

      var users = userArray.toString();
      output += `
          <div class="card mb-4" style="background:black">
            <div class="card-body">
              <h2 class="card-title">${data.child('Title').val()}</h2>
              <p class="card-text">Number of Rounds: ${data.child('Rounds').val()}<br>
                                    Duration: ${data.child('Duration').val()} weeks<br>
                                    Pace: ${pace}<br>
                                    Roles Needed: ${users}<br>
                                    </p>
              <button type="button" class="btn btn-lg btn-block btn-outline-primary" onclick="setGameKey('${data.key}')">Join Game</button>
            </div>
            <div class="card-footer text-muted">
              Posted on ${data.child('datePosted').val()} by
              <a href="#">${data.child('Creator').val()}</a>
            </div>
          </div>`;
    });
    $('#Games').html(output);
  });
}

/**
 * gets the unique ID of the game and stores it into localStorage
 * @param gameKey unique value of the game
 */
function setGameKey(gameKey) {
  localStorage.setItem('gameKey', gameKey);
  window.location = "../Join/join.html";
}
/**
 * displays the players of the selected game then provides a dropdown list of
 * available roles the user can take
 */
function getGameInfo() {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      window.location = '../Login/login.html'; //If User is not logged in, redirect to login page
    }
  });

  var database = firebase.database();
  var ref = database.ref();
  var gameKey = localStorage.getItem('gameKey');
  var gameRef = ref.child("Games/" + gameKey);
  var role = document.getElementById("role");

  let output = '';

  gameRef.on("value", function(snapshot) {
    //check for budgetary player
    if (snapshot.val().Budgetary.username !== false) {
      //call hide function for the drop down
      for (var i = 0; i < role.length; i++) {
        if (role[i].value == 1) {
          role.remove(i);
        }
      }
      //add the username to the output
      output += `<h2>Budgetary: ${snapshot.val().Budgetary.username}</h2>`;
    }
    //check for creative player
    if (snapshot.val().Creative.username !== false) {

      //call hide function for the dropdown
      for (var i = 0; i < role.length; i++) {
        if (role[i].value == 2) {
          role.remove(i);
        }
      }

      //add the username to the output
      output += `<h2>Creative: ${snapshot.val().Creative.username}</h2>`;
    }
    //check for Set Op
    if (snapshot.val().SetOperatives.username !== false) {
      for (var i = 0; i < role.length; i++) {
        if (role[i].value == 0) {
          role.remove(i);
        }
      }
      //add username to the output
      output += `<h2>Set Operative: ${snapshot.val().SetOperatives.username}</h2>`;

    }

    $('#players').html(output);
  });

}

/**
 * checks an individual game to see if the user is currently in it
 * @param gameKey uniqueID of the game
 * @param username the username of the currently logged in player
 */
function setRoleInGame(gameKey, username) {
  var database = firebase.database();
  var ref = database.ref();
  var gameRef = ref.child("Games/" + gameKey);
  var role = '';

  gameRef.on("value", function(snapshot) {
    if (username === snapshot.val().Budgetary.username) {
      role = "Budgetary";
    } else if (username === snapshot.val().Creative.username) {
      role = "Creative";
    } else if (username === snapshot.val().SetOperatives.username) {
      role = "SetOperatives";
    } else if (username === snapshot.val().Creator) {

      role = "Creator";
    } else {
      role = '';
    }
    sessionStorage.setItem('role', role);
  });

}

/**
 * Gets what role the user chose & their username then opens the database
 *  so that the user can be added to the game
 *  @param option the role that the user wants to be in the game
 */
function getRole(option) {

  //figure out which role user chose
  var role = '';

  switch (option) {
    case '0':
      role = 'SetOperatives';
      break;
    case '1':
      role = 'Budgetary';
      break;
    case '2':
      role = 'Creative';
      break;

  }
  getUsername();
  var ref = firebase.database().ref();
  var gameKey = localStorage.getItem('gameKey');

  var gameRef = ref.child("Games/" + gameKey);

  var player = sessionStorage.getItem('Username');

  //check if user is in the game already
  setRoleInGame(gameKey, player);

  //using setTimeout to give enough time for querying
  setTimeout(addUser, 100, gameKey, gameRef, player, role);
}

/**
 * checks if the user is already in the game, if not adds user to the game
 * @param gameRef path to the Game table in the database
 * @param player username of current user
 * @param role - what role the user picked
 */
function addUser(gameKey, gameRef, player, role) {
  //get what current role the user is in
  currentRole = sessionStorage.getItem('role');
  var rolePath = firebase.database().ref().child("Games/" + gameKey + "/" + role);

  if (currentRole !== '') {
    alert("You are already operating as a " + currentRole + " for this game. Please go back and choose another game.");
    window.location = "../Available/available.html";
  } else {
    rolePath.update({
      username: player,
    });
    //check to see whether the game is full or not, if so, update database and start timer
    gameRef.once("value").then(function(snapshot) {
      if (snapshot.val().Budgetary.username !== false && snapshot.val().Creative.username !== false && snapshot.val().SetOperatives.username !== false) {

        var pace = snapshot.val().Pace;
        var endTime = setEndTime(pace);

        // //game is full
        gameRef.update({
          "available": false,
          "roundEndTime": endTime
        });

        var endTimeSecs = endTime.getTime();

        var dataToPass = {
          "fileName": "nick.txt",
          "endTime": endTimeSecs,
          "Pace": pace,
          "gameID": "ABC123"
        };

        $.post("../js/responder.php", dataToPass, function(data) {


        });


      }
    });

alertAndChange();

  }

}
/* sets alert for when someone joins a game
 *
 */
function alertAndChange() {
  alert("You have joined the game!");
  window.location = "../Available/available.html";
}
/**
 * Sets the end time for the game
 *@param pace - the pace at which the game will be played
 */
function setEndTime(pace) {
  var date = new Date();

  if (pace == 0) {
    return new Date(date.getTime() + (2 * 1000 * 60));
  } else if (pace == 1) {
    return new Date(date.getTime() + (12 * 1000 * 60 * 60));
  }
}

/**
 * allows the username to be set before getting games
 */
function getUserThenDisplay() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      getUsername();
      setTimeout(getCurrentGames, 1000);
      setTimeout(getStandbyGames, 1000);
      setTimeout(getPastGames, 1000);
    }
  });

}

/**
 *   gets all the games the user is in that have not been completed
 *   and displays them to the homepage
 */
function getCurrentGames() {



  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var username = sessionStorage.getItem('Username');
      var output = '';
      var database = firebase.database();
      var ref = database.ref();
      var gameRef = ref.child("Games");

      gameRef.once("value").then(function(snapshot) {
        snapshot.forEach(function(data) {
          var budget = data.child('Budgetary').val().username;
          var creative = data.child('Creative').val().username;
          var setOps = data.child('SetOperatives').val().username;
          var title = data.child('Title').val();

          if (budget === username || creative === username || setOps === username) {

            if (data.child('available').val() == false && data.child('completed').val() == false) {
              var picture = makePictureArray();
              output += `<div class=" mb-4 box-shadow" style=margin:35px;>
                  <div class="card-body" style="background:black;">
                  <img src="${picture}" width="200">
                    <p style="height:20px;"></p>
                    <button type="button" class="btn btn-lg btn-block btn-outline-primary" onclick="gameSelected('${data.key}','${username}')">${title}</button>
                  </div>
                </div>`;
            }

          }
        });
        $('#currentGames').html(output);
      });




    } else {
      window.location = '../Login/login.html';
    }
  });
}

/**
 * gets all the games the user is currently in that do not have enough players
 * and displays them to the homepage
 */
function getStandbyGames() {
  //get current user email
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.

      var database = firebase.database();
      var ref = database.ref();

      var username = sessionStorage.getItem('Username');


      var output = '';
      //get the games
      var gameRef = ref.child("Games");
      //output variable
      gameRef.once("value").then(function(snapshot) {
        snapshot.forEach(function(data) {
          var budget = data.child('Budgetary').val().username;
          var creative = data.child('Creative').val().username;
          var setOps = data.child('SetOperatives').val().username;
          var title = data.child('Title').val();
          if (budget === username || creative === username || setOps === username) {

            if (data.child('available').val() == true && data.child('completed').val() == false) {
              var picture = makePictureArray();
              output += `<div class=" mb-4 box-shadow" style=margin:35px;>
                  <div class="card-body" style="background:black;">
                    <img src="${picture}" width="200">
                    <p style="height:20px;"></p>
                    <button type="button" onclick="morePlayersAlert()" class="btn btn-lg btn-block btn-outline-primary"">${title}</button>
                  </div>
                </div>`;
            }
          }
        });
        $('#standbyGames').html(output);
      });
    } else {
      // No user is signed in.
    }
  });

}
/**
 * displays an alert when the user trys to click on a standby game
 */
function morePlayersAlert() {
  alert("This game needs more players before it can be played");
}

/**
 * gets all the games the user was involved in that were complete and displays
 * them to the homepage
 */
function getPastGames() {
  //get current user email
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.

      var database = firebase.database();
      var ref = database.ref();

      var username = sessionStorage.getItem('Username');
      var output = '';
      //get the games
      var gameRef = ref.child("Games");
      //output variable
      gameRef.once("value").then(function(snapshot) {
        snapshot.forEach(function(data) {

          var budget = data.child('Budgetary').val().username;
          var creative = data.child('Creative').val().username;
          var setOps = data.child('SetOperatives').val().username;
          var title = data.child('Title').val();


          if (budget === username || creative === username || setOps === username) {
            if (data.child('available').val() == false && data.child('completed').val() == true) {
              var picture = makePictureArray();
              output += `<div class=" mb-4 box-shadow" style=margin:35px;>
                  <div class="card-body" style="background:black;">
                    <img src="${picture}" width="200">
                    <p style="height:20px;"></p>
                    <button type="button" id="past" class="btn btn-lg btn-block btn-outline-primary" onclick="pastGames('${data.key}','${username}')"">${title}</button>
                  </div>
                </div>`;
            }
          }
        });
        $('#pastGames').html(output);
      });

    } else {
      // No user is signed in.
    }
  });
}
/*
 * A function that displays past game stats
 */
function pastGames(gameKey, username) {

  var gameRef = firebase.database().ref("/Games/" + gameKey);
  var output = '';
  gameRef.on("value", function(snapshot) {

  });
}
/**
 * gets all the games the user created and displays them to the homepage
 */
function getCreatedGames() {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      var username = sessionStorage.getItem('Username');
      var output = '';

      var database = firebase.database();
      var ref = database.ref();
      var gameRef = ref.child("Games");

      gameRef.once("value").then(function(snapshot) {
        snapshot.forEach(function(data) {

          var creator = data.child('Creator').val();
          var title = data.child('Title').val();
          if (creator === username) {
            var picture = makePictureArray();
            output += `<div class=" mb-4 box-shadow" style=margin:35px;>
                  <div class="card-body" style="background:black;">
                    <img src="${picture}" width="200">
                    <p style="height:20px;"></p>
                    <button type="button" class="btn btn-lg btn-block btn-outline-primary">${title}</button>
                  </div>
                </div>`;

          }
        });
        $('#madeGames').html(output);
      });
    } else {
      // No user is signed in.
    }
  });
}

/**
 * stores all of the values from the gdCreate form into localStorage so
 * they can be referenced later
 * @param form the gdCreate.html form
 */
function saveCreateForm(form) {
  var title = form.title.value;
  var rounds = form.rounds.value;
  var weeks = form.weeks.value;
  localStorage.setItem('Rounds', rounds);
  localStorage.setItem('Duration', weeks);
  localStorage.setItem('Title', title);
  window.location = "Duration.html";
}

/**
 * returns a random number used to index the event data
 * @param numEvents the number of events for a single player
 */
function getRandomIndex(numEvents) {
  var min = 1;
  return Math.floor(Math.random() * (numEvents - min) + min);
}

/**
 *   creates an associative array for an event
 * @param player the player type
 * @param id the uniqueID of the event
 * @return a hashmap of an event
 */
function makeEventHashMap(player, id) {
  var event = {
    player: player,
    id: id,
    asked: false,
    answered: false
  };
  return event;
}

/**
 * generates random events and then stores them into localStorage
 * @param pace pace at which the game is too be played (blitz or real time)
 */
function getEvents(pace) {
  //figure out how many rounds there are
  var rounds = localStorage.getItem('Rounds');
  var weeks = localStorage.getItem('Duration');
  var numEvents = rounds * weeks;
  //set pace
  //0 means Blitz
  //1 means real time
  var pace = localStorage.setItem("Pace", pace);

  var setOperativeIndexArray = [];
  var creativeIndexArray = [];
  var budgetaryIndexArray = [];
  //number of maximum events for each player
  var setOperativeNumberOfEvents = 9;
  var creativeNumberOfEvents = 8;
  var budgetaryNumberOfEvents = 8;
  //array to hold Events
  var eventsJSON = [];
  //run a loop to get a random event for each player in each round
  for (var i = 0; i < numEvents; i++) {

    var setOperativeRanIndex = getRandomIndex(setOperativeNumberOfEvents);

    while (setOperativeIndexArray.includes(setOperativeRanIndex) == true) {

      setOperativeRanIndex = getRandomIndex(setOperativeNumberOfEvents);
    }
    setOperativeIndexArray.push(setOperativeRanIndex);

    var event = makeEventHashMap("SetOperatives", setOperativeRanIndex);
    eventsJSON.push(event);

    var creativeRanIndex = getRandomIndex(creativeNumberOfEvents);

    while (creativeIndexArray.includes(creativeRanIndex) == true) {
      creativeRanIndex = getRandomIndex(creativeNumberOfEvents);
    }
    creativeIndexArray.push(creativeRanIndex);

    event = makeEventHashMap("Creative", creativeRanIndex)
    eventsJSON.push(event);

    var budgetaryRanIndex = getRandomIndex(budgetaryNumberOfEvents);

    //   // check to see if that has been indexed already
    while (budgetaryIndexArray.includes(budgetaryRanIndex) == true) {
      //     // if so get a new index
      budgetaryRanIndex = getRandomIndex(budgetaryNumberOfEvents);
    }
    // store the random index into the indexArray
    budgetaryIndexArray.push(budgetaryRanIndex);

    event = makeEventHashMap("Budgetary", budgetaryRanIndex);
    eventsJSON.push(event);
  }

  localStorage.setItem("Events", JSON.stringify(eventsJSON))
  createGame();
}

/**
 * pulls all of the data needed in order to store the created game into the
 * database
 */
function createGame() {
  var rounds = localStorage.getItem('Rounds');
  var duration = localStorage.getItem('Duration');
  var title = localStorage.getItem('Title');
  var preEvents = localStorage.getItem('Events');
  var events = JSON.parse(preEvents);
  var pace = localStorage.getItem('Pace');
  //get the date that this was created
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  var datePosted = month + '/' + day + '/' + year;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      getUsername();
      setTimeout(addGame, 100, rounds, duration, title, events, pace, datePosted);
    } else {
      console.log("not user");
    }
  });

}

/**
 * stores user generated game to the database
 * @param rounds # of rounds for the game
 * @param duration how long the game spans
 * @param title name of the game
 * @param events randomly generated events for the game
 * @param pace speed of the game
 * @param datePosted when the game was posted
 */
function addGame(rounds, duration, title, events, pace, datePosted) {

  var username = sessionStorage.getItem('Username');

  var database = firebase.database();
  var ref = database.ref();
  var role = makeRoleHashMap();

  var gameRef = ref.child("Games");
  var newGameRef = gameRef.push();

  newGameRef.set({
      Rounds: rounds,
      Pace: pace,
      Title: title,
      Duration: duration,
      Creator: username,
      Events: events,
      SetOperatives: role,
      Creative: role,
      Budgetary: role,
      available: true,
      completed: false,
      datePosted: datePosted

    }).then(function() {

      alert("Game Created!");
      window.location = "../Home/index.html";
    })
    .catch(function(error) {
      console.log('Synchronization failed');
    });

}

/**
 * creates an associative array for information contained for each game role
 * @return hash an associative array for the role description
 */
function makeRoleHashMap() {
  var roleInfo = {
    username: false,
    temperment: 0,
    currentEvent: false
  };
  return roleInfo;
}

/**
 * sets the role of the user in the game selected
 * @param gameKey Unique ID of the game selected
 * @param username Username of the logged in user
 */
function gameSelected(gameKey, username) {

  setRoleInGame(gameKey, username);
  sessionStorage.setItem('gameKey', gameKey);
  window.location = "../Game Play/question.html";

}

/**
 * called every set timeFrame in order to get all possible questions
 * that could be asked
 */
function getAllEvents() {
  var role = sessionStorage.getItem('role');
  var gameKey = sessionStorage.getItem('gameKey');
  var eventArray = [];
  var gameArray = [];

  var database = firebase.database();
  var ref = database.ref();
  var gameRef = ref.child("Games/" + gameKey);
  var eventsRef = ref.child("Games/" + gameKey + "/Events");
  var output = '';



  roleRef = ("Games/" + gameKey + "/" + role);

  gameRef.on("value", function(snapshot) {
    output = ` <h1>${snapshot.val().Title}</h1>
      <h2>${role}</h2>`;

    $('#title').html(output);
  });
  roundRef = firebase.database().ref().child("Games/" + gameKey + "/roundEndTime");
  roundRef.once("value").then(function(snapshot) {
    sessionStorage.setItem("EndTime", snapshot.val());
  });


  roleRef = firebase.database().ref().child("Games/" + gameKey + "/" + role);
  roleRef.on("value", function(snapshot) {
    sessionStorage.setItem('currentEvent', snapshot.val().currentEvent);
  });


    var currentEvent = sessionStorage.getItem('currentEvent');
  if (currentEvent !== 'false') {
    var currentEventToNum = Number(currentEvent);

    eventsRef.orderByChild('id').equalTo(currentEventToString).on("value", function(snapshot) {

      snapshot.forEach(function(data) {
        if (data.child('player').val() == role) {
          sessionStorage.setItem('answered', data.child('answered').val());
          c

        }

      });
    });
  }

setTimeout(getCurrentEvents, 2000, eventsRef, eventArray, gameArray, role, gameKey);
}
function getCurrentEvents(eventsRef, eventArray, gameArray, role, gameKey){

  var answered = sessionStorage.getItem('answered');

    var currentEvent = sessionStorage.getItem('currentEvent');
    var endTimeDate = sessionStorage.getItem("EndTime");
    var endTime = new Date(endTimeDate);
    var currentTime = new Date();


  if (currentTime.getTime() < endTime.getTime() && currentEvent != false && answered == 'true') {

    alert("You have already answered your question for this round");
    window.location = "../Home/index.html";
    startTimer(gameKey);



  } else {
        var availableEvents = [];
    eventsRef.orderByChild('player').equalTo(role).on("value", function(snapshot) {

      snapshot.forEach(function(data) {
        if (data.child('asked').val() == false || data.child('answered').val() == false) {

          eventArray.push(data.child('id').val());
          gameArray.push(data.key);
        }
      });
      if (eventArray.length !== 0) {
        var database = firebase.database();
        var ref = database.ref();
        var eventRef = ref.child("Games/" + gameKey + "/Events/" + gameArray[0]);

        eventRef.update({
          asked: true
        });
        //display question
        setTimeout(getQuestion, 10, eventArray[0], gameArray[0], role, gameKey);
      } else {
        alert("You have answered all of your questions for this game!");

        //mark game as complete
        eventsRef.on("value", function(snapshot) {

          snapshot.forEach(function(data) {

            if (data.child('asked').val() == false || data.child('answered').val() == false) {
              availableEvents.push(data.key);
            }
          });

          if (availableEvents.length == 0) {
            gameRef.update({
              completed: true
            });
          }

        });
      }

    });
  }

}

/**
 * @param eventArray array of all questions that have not been asked
 * displays the first question avaiable to be asked
 */
function getQuestion(eventID, gameID, role, gameKey) {

  var ref = firebase.database().ref();
  //get the first event
  var nextEvent = JSON.stringify(eventID);
  //get the ID of the choice
  var gameEventID = gameID;


  var nextEventRef = ref.child("Events/" + role + "/" + nextEvent);
  var roleRef = ref.child("Games/" + gameKey + "/" + role);



  var output = '';
  nextEventRef.on("value", function(snapshot) {
    output = `  <p class="description">${snapshot.val().Description}</p>
      <br>
                      <form class="form-row align-items-center">
                    <div id="choice">
                    <p><input type="radio" name="choice" value="1" checked> ${snapshot.val().Option1.choice}</p><br>
                    <p><input type="radio" name="choice" value="2"> ${snapshot.val().Option2.choice}</p><br>
                    <p><input type="radio" name="choice" value="3"> ${snapshot.val().Option3.choice}</p><br>
                    </div>
                    <div>
                    <input value="Submit" type="button" style="color:black;" class="btn btn-lg btn-primary" onclick="submitAnswer(choice.value,'${snapshot.val().Option1.consequences}','${snapshot.val().Option2.consequences}','${snapshot.val().Option3.consequences}','${gameKey}','${gameEventID}')">
                    </div>
                    </form>
            `;


    $("#question").html(output);
  });
var gameStore = Number(gameEventID);
  roleRef.update({
    currentEvent: gameStore
  });

  startTimer(gameKey);
}

/**
 * stores the user's answer into the database
 */
function submitAnswer(choice, consequences1, consequences2, consequences3, gameKey, eventID) {
  var consequences = [];
  //figure out which choice was picked
  if (choice == 1) {
    consequences = consequences1.slice(0, consequences1.length);

  } else if (choice == 2) {
    consequences = consequences2.slice(0, consequences2.length);
  } else if (choice == 3) {
    consequences = consequences3.slice(0, consequences3.length);
  }
  var database = firebase.database();
  var ref = database.ref();
  var gameRef = ref.child("Games/" + gameKey + "/Events/" + eventID);
  gameRef.update({
    answered: true,
    choice: consequences
  }).then(function() {
    window.location = "../Home/index.html";
  });
}

function startTimer(gameKey) {
  gameRef = firebase.database().ref().child("Games/" + gameKey + "/roundEndTime");

  gameRef.on("value", function(snapshot) {
    var date = new Date();
    var endDate = new Date(snapshot.val());
    var timer = new Timer();
    var timeLeft = (endDate.getTime() - date.getTime()) / 1000;

    timer.start({
      countdown: true,
      startValues: {
        seconds: timeLeft
      }
    });
    $('.values').html(timer.getTimeValues().toString());
    timer.addEventListener('secondsUpdated', function(e) {
      $('.values').html(timer.getTimeValues().toString());

    });
        timer.addEventListener('targetAchieved', function (e) {
          alert("END OF THE ROUND!");
        updateTemperament(gameKey);
    });

  });

}
