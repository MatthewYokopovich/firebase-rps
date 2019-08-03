var firebaseConfig = {
  apiKey: "AIzaSyDFoFJzUjr1pVRRGdpW6m2i_6WgZ3wmV3c",
  authDomain: "fir-rps-27235.firebaseapp.com",
  databaseURL: "https://fir-rps-27235.firebaseio.com",
  projectId: "fir-rps-27235",
  storageBucket: "",
  messagingSenderId: "401582342921",
  appId: "1:401582342921:web:57e349db9000daa7"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
var playerRef = database.ref("/Players");

var player = {
  ready: false,
  number: '0',
  wins: 0,
  losses: 0,
  turns: 0,
  choice: ''
};
var opponent = {
  ready: false,
  number: '0',
  wins: 0,
  losses: 0,
  turns: 0,
  choice: ''
};


//rps is the function with the actualy game logic inside of it that evaluates the choices of the players and updates info accordingly.
function rps(p1, p2){
  if(p1==='rock'){
    if(p2==='paper'){
      opponent.wins++;
      $("#results").text("Opponent wins!");
      player.losses++;
    }
    else if(p2==='scissors'){
      player.wins++;
      $("#results").text("You win!");
      opponent.losses++;
    }
    else{
      $("#results").text("It's a draw...");
    }
  }
  else if(p1==='paper'){
    if(p2==='rock'){
      player.wins++;
      $("#results").text("You win!");
      opponent.losses++;
    }
    else if(p2==='scissors'){
      opponent.wins++;
      $("#results").text("opponent wins!");
      player.losses++;
    }
    else{
      $("#results").text("It's a draw...");
    }
  }
  else if(p1==='scissors'){
    if(p2==='paper'){
      player.wins++;
      $("#results").text("You win!");
      opponent.losses++;
    }
    else if(p2==='rock'){
      opponent.wins++;
      $("#results").text("opponent wins!");
      player.losses++;
    }
    else{
      $("#results").text("It's a draw...");
    }
  }
  player.turns++;
  opponent.turns++;
  updateStats();
  player.ready = false;
  opponent.ready = false;
  playerRef.child(player.number).set(player);
  //at the end of the comparison, each player reupdates the database with the new info.
}

//updateStats exists to update info on wins, losses, and turns whenever a new round is over and when the page loads initially.
function updateStats(){
  if(player.number==='1'){
    $("#player-1-results").text("You have "+player.wins + " wins, "+ player.losses+" losses, and have played "+player.turns+ " times");
    $("#player-2-results").text("Your opponent has "+opponent.wins + " wins, "+ opponent.losses+" losses, and have played "+opponent.turns+ " times")
  }
  else if(player.number==='2'){
    $("#player-2-results").text("You have "+player.wins + " wins, "+ player.losses+" losses, and have played "+player.turns+ " times");
    $("#player-1-results").text("Your opponent has "+opponent.wins + " wins, "+ opponent.losses+" losses, and have played "+opponent.turns+ " times")
  }
}

//this function is just to have the player make a connection when they load and delete the connection when they leave.
connectedRef.on("value", function (snap) {
  // If they are connected..
  if (snap.val()) {
    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function (snapshot) {
  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#watchers").text(snapshot.numChildren()+" people on this page currently");
});

connectionsRef.once('value', function(snapshot){
  if (snapshot.numChildren() === 1) {//if you are the first person on the page, you become player 1
        player.number = '1';
        opponent.number = '2';
      } else if (snapshot.numChildren() === 2) {//if you are the second person on the page, you become player 2
        player.number = '2';
        opponent.number = '1';
      }
      else{//any people after player 2 are excluded.
        player.number = '-1';
        opponent.number = '-1';
      }
      if(player.number !== '-1'){//if the player is not excluded, put their 'player' object into the DB
        console.log(playerRef);
        playerRef.child(player.number).set(player);
      }
      if(player.number==='1'){//hides the buttons for the other player
        $("#player-2-space").hide();
      }
      else if(player.number==='2'){
        $("#player-1-space").hide();
      }
      else{//hids the buttons for both players if you are exluded.
        $("#player-2-space").hide();
        $("#player-1-space").hide();
      }
      //initial stat update on page load.
      updateStats();
      console.log("You are Player " + player.number);
      console.log("Your opponent is player " + opponent.number);
});

$(".btn").click(function(){//when any button is clicked...
  if(player.ready===false){//if the player has not already made a choice
    player.choice = $(this).text().trim();
    console.log(player.choice);
    player.ready = true;
    playerRef.child(player.number).set(player);
    if(!opponent.ready){//if the opponent has not chosen yet, put a message that alerts the user
      $("#results").text("You picked "+player.choice+".  Waiting for opponent...")
  }
  } 
})

playerRef.on('child_changed', (childSnapshot) => {//whenever a player updates the db...
    playerRef.on('value', function(snap){
        player.ready = snap.val()[player.number].ready;
        player.choice = snap.val()[player.number].choice;
        player.wins = snap.val()[player.number].wins;
        player.losses = snap.val()[player.number].losses;
        player.turns = snap.val()[player.number].turns;

        opponent.ready = snap.val()[opponent.number].ready;
        opponent.choice = snap.val()[opponent.number].choice;
        opponent.wins = snap.val()[opponent.number].wins;
        opponent.losses = snap.val()[opponent.number].losses;
        opponent.turns = snap.val()[opponent.number].turns;
    });
    if((player.ready)&&(opponent.ready)){
        rps(player.choice, opponent.choice);
    }
});
