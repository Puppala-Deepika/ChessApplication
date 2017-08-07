var app = angular.module("userDetailApp", ["firebase","hSweetAlert"]);				// firebase is the real time database module used
												// hSweetAlert is customized alert module

app.controller("userCtrl",  function($scope,$window,sweet,$firebaseArray ,$firebaseObject) {	
    // controller for login page , signup , reset password.
    
    var ref = new Firebase("https://chess-kumuda.firebaseio.com/");				// constructs new firebase reference from full url
    var userRef = ref.child("users");								// https://chess-kumuda.firebaseio.com/users
    var usernameCheckQuery;							
    var usernameCheckArray;
    var userDetailArray ; 
    var obj;
    
    $scope.emailSigntext = "";								       //scope variables act as link from html to angular
    $scope.usernameSigntext = "";
    $scope.passwordSigntext = "";
    $scope.confirmPasswordSigntext = "";
    $scope.username = "";
    $scope.email = "";
   
    
    $scope.loginEmailtext = "";
    $scope.loginPasswordtext = "";
    $scope.loginEmail = "";
    
    $scope.resetEmailtext = "";
    $scope.resetEmail = "";
             
    /* On clicking login button on login.html  , this function is called with email and password as params.
       if a valid email and password are passed then user enters showfriends.html page.
       Whether the email and password are valid are not , it is checked using this function.
    */
    $scope.login = function(loginEmail,loginPassword) {									
        var entered = 0;
        if(loginEmail === undefined || loginEmail.length === 0) {				// If user does not enter the email id
            entered = 1;
            $scope.loginEmailtext = "enter the email address";
            $scope.loginEmail = "";
        }else if(loginEmail.indexOf("@")  === -1 || loginEmail.indexOf(".")  === -1){		// incorrect email format
            entered = 1;      
            $scope.loginEmailtext = "invalid email";
            $scope.loginEmail = "";
        }
        if(loginPassword === undefined || loginPassword.length === 0) {				// if user does not enter password
            entered = 1; 
            $scope.loginPasswordtext = "enter the password";   
            $scope.loginPassword = "";
        }
        if(entered === 0) {									
        // if user enters everything then check if they are valid email and password pair from database.
            	
            	//Authenticates a Firebase client using email / password credentials
                ref.authWithPassword({					
                    email    : $scope.loginEmail,
                    password : $scope.loginPassword
                }, function(error, authData) {							// callback
                    if (error) {   
                    console.log("Login Failed!", error);
                    $scope.$apply(function () {					
                    	// if an error occurs then it will make rpt changes to html
                        if(error.message.indexOf("password") > -1) {				// if password is not matched			
                            $scope.loginPasswordtext = error.message;
                            $scope.loginPassword = "";
                            $scope.loginEmailtext = "";
                        }
                        else {
                            $scope.loginEmailtext = error.message;   				// if error is related to email
                            $scope.loginEmail = "";                        
                            $scope.loginPasswordtext = "";
                            $scope.loginPassword = "";
                        }
                    });
                        
                } else {									// if entered credentials are correct
                    
                    var user;
                    var userObj ; 
                    var query = userRef.orderByChild("uid").equalTo(authData.uid);
                    userObj = $firebaseArray(query);
                    
                  
                    userObj.$loaded().then(function(messages) {
                        
                        
                        
                        userObj[0].status = "online";						// set the user to be online.
                        localStorage.setItem('userDetail',JSON.stringify(userObj[0]));
                        user = JSON.parse(localStorage.getItem('userDetail'));
                        userObj.$save(userObj[0]);
                        
                        $window.location.href = 'showFriends.html';				// move to showFriends.html page
                       
                    });
                    
                    
                    console.log("Authenticated successfully with payload:",authData);
                    
                }
                });
           
        }
    }
    
    /* On clicking reset password button on reset_password.html  , this function is called with email  as params.
       and an mail is sent to this email address to reset the password.
    */
    $scope.resetPassword = function(resetEmail) {					
        var entered = 0;
        if(resetEmail === undefined || resetEmail.length === 0) {				// if user donot enter email
            entered = 1;  
            $scope.resetEmailtext = "enter the email address";
            $scope.resetEmail = "";
            
        }else if(resetEmail.indexOf("@") === -1 || resetEmail.indexOf(".") === -1){		// email format is incorrect
            entered = 1;      
            $scope.resetEmailtext = "invalid email";
            $scope.resetEmail = "";
        }
        if(entered === 0) {
            ref.resetPassword({									// checks if this email is already present
                email : $scope.resetEmail
            }, function(error) {								// callback
            if (error === null) {								// if there no error then mail is sent
            
                var text = "is sent to "+resetEmail;
                sweet.show({
                    title: "Reset password email",
                    text: text,
                    type: 'success',
                    showConfirmButton: true
                });
                console.log("Password reset email sent successfully");
            } else {										// if the user with this email is not present
                
                console.log("Error sending password reset email:", error);
                $scope.$apply(function () {
                    $scope.resetEmailtext = error.message;
                    $scope.resetEmail = "";
                });
            }
            });
        }
    }
    
    $scope.setresetEmailtext = function() {
        $scope.resetEmailtext = "";
    }
    
    $scope.setloginEmailtext = function(loginEmail) {
        $scope.loginEmailtext = "";
    }
    
    $scope.setloginPasswordtext = function(loginPassword) {
        $scope.loginPasswordtext = "";   
    }
    
    
    
    
    $scope.setemailSigntext = function(email) {
        $scope.emailSigntext = "";   
    }
    
    $scope.setusernameSigntext = function(username) {						// displays error if length of username < 4
        if( username.length < 4 ) {
            $scope.usernameSigntext = "username lenght should be atleat 4"; 
        }else {
            $scope.usernameSigntext = "";
        }
    }
    
    $scope.setpasswordSigntext = function(password , confirmPassword) {				// displays error if length of password < 7
        if(password.length < 7) {
            $scope.passwordSigntext = "password lenght should be atleast 7";
        }
        else {
            $scope.passwordSigntext = "";
        }
        if(password != confirmPassword)  {		// displays error if confirm password does not match entered password
            $scope.confirmPasswordSigntext = "did not match with password ";   			
        }
        else{
            $scope.confirmPasswordSigntext = "";
        }
    }
    
    $scope.setconfirmPasswordSigntext = function(password , confirmPassword) {
        if(password != confirmPassword)  {		// displays error if confirm password does not match entered password
            $scope.confirmPasswordSigntext = "did not match with password ";   
        }
        else{
            $scope.confirmPasswordSigntext = "";
        }
    }
    
    // On clicking Sign up button on register.html  , this function is called.
      
    $scope.register = function(email ,username, password , confirmPassword) { // this function is similar to $scope.login
        var entered = 0;
        if(email === undefined || email.length === 0) {
            entered = 1;
            $scope.emailSigntext = "did not enter the email address";   
            $scope.email = "";
        }else if(email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            entered = 1;
            $scope.emailSigntext = "invalid email address";   
            $scope.email = "";
        }
        if(username === undefined || username.length === 0) {
            entered = 1;
            $scope.username = "";
            $scope.usernameSigntext = "did not enter the username";   
        }
        else if(username.length < 4) {
            entered = 1;
            $scope.username = "";
            $scope.usernameSigntext = "username lenght should be atleat 4";  
        }
        if(password === undefined || password.length === 0) {
            entered = 1;
            $scope.password = "";
            $scope.passwordSigntext = "did not enter the password";
            $scope.confirmPassword = "";
        }
        if(confirmPassword === undefined || confirmPassword.length === 0) {
            entered = 1;
            $scope.confirmPassword = "";
            $scope.confirmPasswordSigntext = "did not enter the confirm password";
        }
        if(entered === 0) {
            if(password.length < 7) {
                $scope.passwordSigntext = "password lenght should be atleast 7";
                $scope.password = "";
                $scope.confirmPassword = "";
                
            }
            else if(password != confirmPassword)  {
                $scope.confirmPasswordSigntext = "did not match with password ";   
                $scope.confirmPassword = ""; 
            }
            else {							
            // checks if already a user is present with this username
            // We need not check for email id because firebase by default checks it in create function.
                usernameCheckQuery = userRef.orderByChild("username").equalTo($scope.username);	
                usernameCheckArray = $firebaseArray(usernameCheckQuery);		// loads the data of user with 
                
                usernameCheckArray.$loaded().then(function(messages) {
                    console.log("usernameCheckArray : ",usernameCheckArray);
                    if(usernameCheckArray.length != 0) {		//User with this username is already present
                        
                            $scope.username = "";
                            $scope.usernameSigntext = "User with this username is already present"; 
                        
                    }
                    else {   						// create a user with this information
                            ref.createUser({
                            email : $scope.email,
                            password : $scope.password
                    }, function(error, userData) {
                            if(error) {
                                
                                console.log(error.message);
                                $scope.$apply(function () {
                                    $scope.emailSigntext = error.message;   
                                    $scope.email = "";
                                });
                            } else { // store in local storage of browser so that this info  can be retrieved in other html pages of this website.
                                var push_uid = userData.uid;
                                obj = {
                                        "uid"       :  push_uid  ,
                                        "email"     :  $scope.email,
                                        "username"  :  $scope.username,
                                        "status"    :  "online" 
                 
                                };
                                userDetailArray  = $firebaseArray(userRef);
                                userDetailArray.$add(obj);
                        
                                localStorage.setItem('userDetail',JSON.stringify(obj));
                                console.log(JSON.parse(localStorage.getItem('userDetail')));  
                        
                                $window.location.href = 'showFriends.html';
                
                            }
                    	});
              
                    }
                       
            	});
                
            }
            
        }
        
    }
    
   
});


// controller for game.html page.
app.controller("gameCtrl", function($scope, $firebaseArray,sweet,$timeout, $window, $firebaseObject) {
    
   
    var mainref = new Firebase("https://chess-kumuda.firebaseio.com/");
    var userRef = mainref.child("users");

    
    var user = JSON.parse(localStorage.getItem('userDetail'));
    
    var thisGame = JSON.parse(localStorage.getItem('gameObj')); 
    console.log("thisGame : ",thisGame);
    var gameid = thisGame.white;
    
    localStorage.setItem('gameid',thisGame.white);		// retrieve game id and senderid and request recirverid from local storage
    localStorage.setItem('senderid',thisGame.white);
    localStorage.setItem('recieverid',thisGame.black);
    
    if(thisGame.white === user.uid) {				// check if this user is white or black
              
        localStorage.setItem('opponentName',thisGame.blackName);      
        localStorage.setItem('opponentid',thisGame.black);
        
    }else {
        
        localStorage.setItem('opponentName',thisGame.whiteName);      
        localStorage.setItem('opponentid',thisGame.white);
        console.log("request id : ", localStorage.getItem('requestId'));
        mainref.child("requests").child(localStorage.getItem('requestId')).set(null);
    }
    
    $scope.profileName = localStorage.getItem('opponentName'); //set opponent name for display in game.html page
    console.log("opponentName : ",localStorage.getItem('opponentName'));
    console.log("gameid : ",localStorage.getItem('gameid'));
    console.log("opponentid : ",localStorage.getItem('opponentid'));
    
                                    
    
    var other,white , black , turn ,movesFrom,movesTo ;
    var correctGame = 0;
    var query1 = userRef.orderByChild("uid").equalTo(user.uid);
    var oppQuery = userRef.orderByChild("uid").equalTo(localStorage.getItem('opponentid'));
    var userObj;
    
    var friendsRef = mainref.child("friends");
    var pushedidRef = new Firebase("https://chess-kumuda.firebaseio.com/pushedid");
    
    var thisfriendsRef = friendsRef.child(user.uid);
    var thispushedidRef = pushedidRef.child(user.uid);
    var IamSender;
    var idObj;
    
     userObj = $firebaseArray(query1);
     userObj.$loaded().then(function(messages) {   // when a user is playing a game then his status is set is set to opponentid in users node.
                    console.log("entered",userObj[0]);
                    console.log(" userObj id  : ",userObj[0].$id);
                    userObj[0].status = localStorage.getItem('opponentid');
                    userObj.$save(userObj[0]);
                    console.log(userObj[0]);
                 
    });
    
    
    
    thispushedidRef.on("value", function(snapshot) {	// idObj has list of friends of this user.
        console.log(snapshot.val());
        idObj = snapshot.val();
    });
    
    
    setStatusInFriend = function() {			// set staus of this user in friends node as "gaming"
           var array1 = $firebaseArray(thisfriendsRef); // array1 has list of this users friends.
           var object = {
                            uid : user.uid,
                            username : user.username,
                            status : "gaming"
                     };
           array1.$loaded().then(function(messages) { 	
                var i;
                for(i = 0 ; i < array1.length ; i++)  {
                   
                    var element = array1[i];
                    console.log(element.username+" :  ",idObj[element.uid]); 
                    var elementRef = friendsRef.child(element.uid);	// now set the status of this user in node of its every friend as "gaming"
                    var thisRef = elementRef.child(idObj[element.uid]);
                    thisRef.set(object);
                    
                    
                }
           });
    }
    setStatusInFriend();
    
    
    $scope.onExit = function() {			// remove this game object on exit
      
     if(correctGame === 1) {
         var address = "https://chess-kumuda.firebaseio.com/games/" +gameid
         console.log("address ",address);
         var ref = new Firebase(address);
         ref.set(null);
     }
        
    };

   $window.onbeforeunload =  $scope.onExit;		// on refreshing or closing the tab the above function is called. 
    
    console.log("entered main part");
    
    var oppObj = $firebaseArray( oppQuery );		// oppQuery :- userRef.orderByChild("uid").equalTo(localStorage.getItem('opponentid'))
    var opponentId ;
    oppObj.$loaded().then(function(messages) {  	 
       console.log("opponent object  : ",oppObj[0]);
       opponentId =  oppObj[0].$id;
       console.log("opponentId at userRef : ",opponentId);
                
       var oppId = userRef.child(opponentId);		// loads the data of opponent of this user 
       oppId.on("value", function(snapshot) {
          if(snapshot.val().status != "gaming" &&  snapshot.val().status != "online" && snapshot.val().status != "offline") {
            
            if( user.uid   === localStorage.getItem('senderid')) {	// if this user is request sender then
                correctGame = 1;
                IamSender = "white";
                if(snapshot.val().status === user.uid) {		// if opponents status is user id of this user 
                    var gameid = user.uid;
                    var gameObj;
                    gameObj = {
                        "white": user.uid,
                        "black": localStorage.getItem('recieverid') ,
                        "whiteName" : user.username,
                        "blackName" : localStorage.getItem('opponentName'),
                        "movesFrom": 'A3' , 
                        "movesTo": 'A3',
                        "turn" : "white",
                        "winner" : ""
                    };                                                                                               
                    
                    // again set the games object at key value : senderid at games node     
                    var gamesRef = mainref.child("games").child(user.uid);   
                    gamesRef.set(gameObj);
                    
                    console.log("entered senderid");
                    var requestRef2 = mainref.child("requests");
                    var query3 = requestRef2.orderByChild("senderUid").equalTo(user.uid);
                    var reqsenderArray = $firebaseArray(query3);
                    var j;
                    reqsenderArray.$loaded().then(function(messages) { // clear all the requests sent by this user
                            console.log("entered senderid senderArray");
                            for(j = 0 ; j < reqsenderArray.length ; j++) {
                                reqsenderArray.$remove(reqsenderArray[j]);

                            }
                    });
        
                    var query2 = requestRef2.orderByChild("recieverUid").equalTo(user.uid);
                    var reqrecieverArray = $firebaseArray(query2);     // set the requests to this user as denied
                    reqrecieverArray.$loaded().then(function(messages) { 
                        console.log("entered senderid recieve array");    
                        var k;
                        for(k = 0 ; k < reqrecieverArray.length ; k++) {
                            reqrecieverArray[k].status = "denied";
                            reqrecieverArray.$save(reqrecieverArray[k]);
                        }
            
            
                    });
                    
                }else {	// opponents status is  set to another user id in users then this user is traced back to friends page
                    console.log("entered else of sender");
                      $window.location.href = 'showFriends.html';      
                }
                
            }
            else if( user.uid   === localStorage.getItem('recieverid') ) { // if this user is request reciever then
                IamSender = "black";
                if(snapshot.val().status === user.uid) {
                    correctGame = 1;
                    console.log("entered recieverid");
                    var requestRef = mainref.child("requests");
                    var query2 = requestRef.orderByChild("recieverUid").equalTo(user.uid);
                    var reqrecieverArray = $firebaseArray(query2);
                    reqrecieverArray.$loaded().then(function(messages) { // set the requests to this user as denied 
                        console.log("entered recieverid recieve array");    
                        var k;
                        for(k = 0 ; k < reqrecieverArray.length ; k++) {
                            reqrecieverArray[k].status = "denied";
                            reqrecieverArray.$save(reqrecieverArray[k]);
                        }
            
            
                    });
        
                    var query3 = requestRef.orderByChild("senderUid").equalTo(user.uid);
                    var reqsenderArray = $firebaseArray(query3);
                    var j;
                    reqsenderArray.$loaded().then(function(messages) {  // clear all the requests sent by this user
                        console.log("entered recieverid sender array");
                        for(j = 0 ; j < reqsenderArray.length ; j++) {
                            reqsenderArray.$remove(reqsenderArray[j]);

                        }
                    });
                    
                    
                }else {   // opponents status is  set to another user id in users then this user is traced back to friends page
                        console.log("entered else of reciever");
                             $window.location.href = 'showFriends.html';            
                }
                
            }
            
        }else if(snapshot.val().status === "online") {			// if the opponent's status is still online then game is cancelled
            sweet.show({
                title: 'Sorry',
                text: 'the request is cancelled',
                type: 'error',
                timer: 5000,
                showConfirmButton: false
            });
            $scope.QuitGame(); 
            
        }
    });
         
         
    });
    
    
    
    
    sweet.show({							// this is the alert that is shown as loading 
        title: 'Loading',
        text: 'game starts in 3sec',
        type: 'success',
        timer: 5000,
        showConfirmButton: false
    });
  
    if(gameid != 0) {							// actual code for moves in game is in this block
        var address = "https://chess-kumuda.firebaseio.com/games/" +gameid
        console.log("address ",address);
        var ref = new Firebase(address);
        var msgref = ref.child("chat");
        $scope.messages = [];
       

        var firstmove , secondmove;
        
        msgref.on("value", function(snapshot) {				// msgs related to this game in chat
            $scope.messages = $firebaseArray(msgref);
        });
        
        ref.on("value", function(snapshot) {				// on change in node of this game
           if(snapshot.val() != null) {
            white = snapshot.val().white;
            black = snapshot.val().black;
            turn  = snapshot.val().turn;
            
            
            var syncObject = $firebaseObject(ref);
            syncObject.$bindTo($scope, "widget");
            
            if(user.uid === white)					// know of this user is white or black
                $scope.whiteOrblack = "white";
            else    
                $scope.whiteOrblack = "black";

            if($scope.whiteOrblack === "white") {			// set the respective image in the chat box
                $scope.oppimgsrc = "blknight.png";
                $scope.oppname = snapshot.val().blackName;
            }
            else {
                $scope.oppimgsrc = "wknight.png";
                $scope.oppname = snapshot.val().whiteName;
            }
            
            if(snapshot.val() != null && snapshot.val().winner != "") {    // if the winner is  already set                       
              
                
                      
                if(snapshot.val() != null && snapshot.val().winner === "draw") {	// if it is a draw
                        //alert("Match is draw");   
                        sweet.show({
                            title: 'Match is draw',
                            text: '',
                            type: 'error',
                            timer: 5000,
                            showConfirmButton: false
                        });
                }else if(snapshot.val() != null) {					
                      //  alert(snapshot.val().winner+" has won the match");
                    if(IamSender === snapshot.val().winner) {				// if white is the winner
                        sweet.show({
                            title: snapshot.val().winner,
                            text: 'has won the match',
                            type: 'success',
                            timer: 5000,
                            showConfirmButton: false
                        });
                    }else {
                       
                        sweet.show({							// if black has won the game
                            title: snapshot.val().winner,
                            text: 'has won the match',
                            type: 'error',
                            timer: 5000,
                            showConfirmButton: false
                        });
                        
                        
                        
                    }
                }  
                ref.set(null);								// remove this game object
                
            }
            
            if(turn === "white")							// if this turn is black then next turn is white's
                other = "black";
            else
                other = "white";
           }else {									// if the present game object is removed
                
                 $timeout(callAtTimeout, 3000);
                    
                
           }
        }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        });
        
        callAtTimeout = function() {
            $window.location.href = 'showFriends.html';
        }
        
        $scope.winnerDeclared = function() {						
               ref.update({ winner : $scope.winner});
        }
        
        
        $scope.update = function(move,variable_1) 					// update the move in this game node
        {
        if( (user.uid === white && turn === "white") || (user.uid === black && turn === "black"))               
        {										// if it's users turn then update
                console.log("entered update"+move+"   "+variable_1);
           	if(variable_1 === '1') 
           	{
           	console.log("1");
           		firstmove = move;
           	}
           	else
           	{
           	console.log("2");
           		secondmove = move;
           		ref.update({ movesFrom: firstmove, movesTo: secondmove , turn: other });
           	}
                
            }
            else {									
                console.log("it is not your turn");
              
            }
        }
        
        $scope.winner = function() {							// this function is called when this user wins the game
            if($scope.whiteOrblack === "white") {
                ref.update({ winner : "white"});
            }
            else
                ref.update({ winner : "black"});
        }
        
        $scope.draw = function() {
            ref.update({ winner : "draw"});
        }
        
        $scope.pushmsg = function(msg) {						// push the msg to chat messages array
            var timer  =  new Date();
            var timehr = timer.getHours() + ":" + timer.getMinutes();
            var thisimg ;
            if($scope.whiteOrblack === "white") {
                $scope.oppimgsrc = "blknight.png";
                thisimg = "wknight.png";
            }
            else {
                $scope.oppimgsrc = "wknight.png";
                thisimg = "blknight.png";
            }


            
            var msgObj= {
                            
                            "string": msg,
                            "msgtime" : timehr,
                            "src" : thisimg,
                            "colour": $scope.whiteOrblack
                        };
            
            $scope.msgText ="";
            $scope.messages.$add(msgObj);


        }

        $scope.imglink = function(colour) {						// has source of this users image
            if(colour == "white" )
                return "wknight.png";
            else
                return "blknight.png";
        }

        $scope.QuitGame =  function() {
            
            ref.set(null);
            console.log("successfully logged out");
            
        }
        
        
      
        
        
        
    }
        
});


// controller for showfriends.html page.
app.controller("showfriendCtrl", function($scope,$window,sweet, $firebaseArray, $firebaseObject) {
    var ref = new Firebase("https://chess-kumuda.firebaseio.com/");
    var userRef = ref.child("users");
    var friendsRef = ref.child("friends");
    var friendRequsetRef = ref.child("friendrequests");
    var notificationRef = ref.child("notifications");
    var pushedidRef = new Firebase("https://chess-kumuda.firebaseio.com/pushedid");
    var deniedReqNotifyRef = ref.child("deniedRequests");
    
    $scope.result = $firebaseArray(userRef);   
    var user = JSON.parse(localStorage.getItem('userDetail')); 
    $scope.profile = user.username;
    $scope.userInf = user;
    
    $scope.OldPasswordtext = "";					//these scope variables are for updating user info
    $scope.NewPasswordtext = "";
    $scope.ConfirmPasswordtext = "";
    $scope.NewEmailtext = "";
    $scope.OldEmailtext = "";
    $scope.Passwordtext = "";
    $scope.OldEmail = "";
    $scope.NewEmail = "";
    
    $scope.remark = "";
    $scope.remark2 = "";
    
    var thisfriendsRef = friendsRef.child(user.uid);
    var thisfriendsReqRef = friendRequsetRef.child(user.uid);
    var thisnotificationRef = notificationRef.child(user.uid);
    var thispushedidRef = pushedidRef.child(user.uid);
    var thisdeniedReqNotifyRef = deniedReqNotifyRef.child(user.uid);
    var query1 = userRef.orderByChild("uid").equalTo(user.uid);
    
    
    var requestRef = ref.child("requests");
    var acceptRef = ref.child("acceptedRequests");
    var gamesRef = ref.child("games");
    var requestArray;
    var responseArray;

    var length_of_array = 0;
    var length_of_responsearray = 0;
    

    localStorage.setItem('gameid',0);
    localStorage.setItem('senderid',0);
    localStorage.setItem('recieverid',0); 
    localStorage.setItem('opponentid',0);
    localStorage.setItem('gameObj',null); 
    localStorage.setItem('requestId',0);
    
    var gameObj = {};
    
    var query =  userRef.orderByChild("status").equalTo("online");
    var query2 = requestRef.orderByChild("recieverUid").equalTo(user.uid);
    var query3 = requestRef.orderByChild("senderUid").equalTo(user.uid);
    
    
    $scope.onExit = function() {				// this function is called when user leaves this page
        
                
              var array1 = $firebaseArray(thisfriendsRef);	// array of this use's friends
              var object = {
                            uid : user.uid,
                            username : user.username,
                            status : "offline"
                     };
              array1.$loaded().then(function(messages) {	// set this users status as offline in its friends nodes 
                var i;
                 
                    for(i = 0 ; i < array1.length ; i++)  {
                   
                        var element = array1[i];
                        console.log(element.username+" :  ",idObj[element.uid]); 
                        var elementRef = friendsRef.child(element.uid);
                        var thisRef = elementRef.child(idObj[element.uid]);
                        thisRef.set(object);
                    
                    }
                
             });   
                
                
           
    };

   $window.onbeforeunload =  $scope.onExit;			// this function is called when user leaves this page
    
    
    var gamesRef2 = ref.child("games").child(user.uid);  	// set all the games related to this user to null      
    gamesRef2.set(null);
    
    var userObj = $firebaseArray(query1);
    userObj.$loaded().then(function(messages) { 		// set the status of this user to online in users   
        
                    userObj[0].status = "online";
                    userObj.$save(userObj[0]);
    });
    
    var friendsArray;
    var friendsReqArray;
    var notifyArray;
    var query5,query6;
    var idObj;
    console.log("user : ",user);
    
    thispushedidRef.on("value", function(snapshot) {		// userid's of all friends of this user
        console.log(snapshot.val());
        idObj = snapshot.val();
    });
    
    
    thisfriendsRef.on("value", function(snapshot) {		// friendsOnline all online friends of this user
        $scope.friendsList = $firebaseArray(thisfriendsRef);
        var query7 = thisfriendsRef.orderByChild("status").equalTo("online");
        $scope.friendsOnline =  $firebaseArray(query7);
    });
    
    thisfriendsReqRef.on("value", function(snapshot) {		// presentRequests has friend requests of this user.
        $scope.presentRequests = $firebaseArray(thisfriendsReqRef.orderByChild("startedAt")); 
        /*$scope.presentRequests.$loaded().then(function(messages) {   
            $scope.reqCount = $scope.presentRequests.length;
        });*/
    });
    
    thisfriendsReqRef.orderByChild("seen").equalTo("false").on("value", function(snapshot) {	// notifications of this user
        $scope.reqarray = $firebaseArray(thisfriendsReqRef.orderByChild("seen").equalTo("false")); 
        $scope.reqarray.$loaded().then(function(messages) {   
            
            	$scope.reqCount = $scope.reqarray.length;
           
        });
    });
    
    thisnotificationRef.on("value", function(snapshot) {	// notifications of this user
        $scope.notifications = $firebaseArray(thisnotificationRef.orderByChild("startedAt")); 
       /* $scope.notifications.$loaded().then(function(messages) {   
           // $scope.notifyCount = $scope.notifications.length;
            console.log($scope.notifications);
        });*/
    });
    
    thisnotificationRef.orderByChild("seen").equalTo("false").on("value", function(snapshot) {	// notifications of this user
        $scope.arraynotify = $firebaseArray(thisnotificationRef.orderByChild("seen").equalTo("false")); 
        $scope.arraynotify.$loaded().then(function(messages) {   
            
            	$scope.notifyCount = $scope.arraynotify.length;
           	
        });
    });
    
    thisdeniedReqNotifyRef.on("value", function(snapshot) {	// all denied game requests
        $scope.denynotifications = $firebaseArray(thisdeniedReqNotifyRef.orderByChild("startedAt")); 
        /*$scope.denynotifications.$loaded().then(function(messages) {   
            $scope.deniedNotifyCount = $scope.denynotifications.length;
        });*/
    });
    
    thisdeniedReqNotifyRef.orderByChild("seen").equalTo("false").on("value", function(snapshot) {	// notifications of this user
        $scope.arraydenynotify = $firebaseArray(thisdeniedReqNotifyRef.orderByChild("seen").equalTo("false")); 
        $scope.arraydenynotify.$loaded().then(function(messages) {   
           
            	$scope.deniedNotifyCount = $scope.arraydenynotify.length;
           
        });
    });
    
    setStatusInFriend = function() {				// set this users status as online in its friends nodes
           var array1 = $firebaseArray(thisfriendsRef);
           var object = {
                            uid : user.uid,
                            username : user.username,
                            status : "online"
                     };
           array1.$loaded().then(function(messages) { 
                var i;
                for(i = 0 ; i < array1.length ; i++)  {
                   
                    var element = array1[i];
                    console.log(element.username+" :  ",idObj[element.uid]); 
                    var elementRef = friendsRef.child(element.uid);
                    var thisRef = elementRef.child(idObj[element.uid]);
                    thisRef.set(object);
                    
                    
                }
           });
    }
    setStatusInFriend();
    
    $scope.addFriend = function(friend) {		     // send friend request
    	
    	
	
        if(friend.uid != user.uid) {   
            var query7 = friendRequsetRef.child(friend.uid);
            query6 = query7.orderByChild("senderUid").equalTo(user.uid);
            friendsReqArray = $firebaseArray(query6);  
            
            friendsReqArray.$loaded().then(function(messages) {   
                console.log(friendsReqArray);
                if(friendsReqArray.length === 0) {
                    query5 = thisfriendsRef.orderByChild("uid").equalTo(friend.uid);
            
                    friendsArray = $firebaseArray(query5); // checks if reciever is already a friend of this user  
        
                    friendsArray.$loaded().then(function(messages) {   
             
                        if(friendsArray.length === 0)   {
                            var d = new Date();
			    var n = d.getTime();	
                            var obj = {
                                    senderName :   user.username,
                                    senderUid  :   user.uid,
                                    recieverName : friend.username,
                                    recieverUid :   friend.uid,
                                    startedAt: -n,
                                    seen: "false"
                        
                            };
                    
                            query6 = friendRequsetRef.child(friend.uid);
                            console.log(friend);
                            friendsReqArray = $firebaseArray(query6);  
                    
                    
                            friendsReqArray.$add(obj);	
                            // if reciever is already not a friend then send request to reciever by adding obj to reciever's friend request array
                            var msg = "friend request is sent to "+friend.username;
                            var d = new Date();
			    var n = d.getTime();
                            var  notifyObj = {
                                            text: msg ,
                                            seen: "false",
              			            color : "#FAFAFA",
              			            startedAt: -n
                                            };
                            $scope.notifications.$add(notifyObj);  //notify this user that request is sent  
                        }
                        else {
                            var msg = friend.username+" is already your friend";
                            var d = new Date();
	                    var n = d.getTime();
                            var  notifyObj = {
                                            text: msg ,
                                            seen : "false",
              			            color : "#FAFAFA",
              			            startedAt: -n
                                         };
                            $scope.notifications.$add(notifyObj);     
                        }
                    });
                }
                else {			// if reciever is already a friend of this user add notification
                    var msg = "friend request has been already sent to "+friend.username;
                    var d = new Date();
	            var n = d.getTime();
                            var  notifyObj = {
                                            text: msg ,
                                            seen: "false",
              			            color : "#FAFAFA",
              			            startedAt: -n
                                             };
                    $scope.notifications.$add(notifyObj);  
                }
            });
        }
        $scope.friendName = "";
    }
    
    
    $scope.AcceptedReq = function(request) {	// if reciever accepts  friend request
        
        $scope.presentRequests.$remove(request);	// on acepting remove this object from requests array of this user
        var query9 = userRef.orderByChild("uid").equalTo(request.senderUid);
        var friendObj = $firebaseArray(query9); 
        
        var query15 = thisfriendsRef.orderByChild("uid").equalTo(request.senderUid);
        var check = $firebaseArray(query15);
        check.$loaded().then(function(messages) { 
            if(check.length === 0) {
            friendObj.$loaded().then(function(messages) { 
           	// whenever a friend is added, add this user to sender node of users.
                check.$add(friendObj[0]).then(function(ref) { 
                var id = ref.key();
                
                console.log("added record with id " + id);
                // whenever a friend is added,add the key at which this user is added to friends node in users
                var idRef = new Firebase("https://chess-kumuda.firebaseio.com/pushedid");
                var idRef1 = idRef.child(request.senderUid);
                var idRef2 = idRef1.child(user.uid);
            
                idRef2.set(id);
                
                check.$indexFor(id); // returns location in the array
                });
        
            
            
            
            });
            }
        });    
        
        // Similary do this for reciver node of users
        var query10 = userRef.orderByChild("uid").equalTo(user.uid);
        var friendObj1 = $firebaseArray(query10); 
        
        var query7 = friendsRef.child(request.senderUid).orderByChild("uid").equalTo(user.uid);
        var friendsArray2 = $firebaseArray(query7);
        
        friendsArray2.$loaded().then(function(messages) { 
            if(friendsArray2.length === 0) {
            friendObj1.$loaded().then(function(messages) { 
            
            friendsArray2.$add(friendObj1[0]).then(function(ref) {
                var id = ref.key();
                
                console.log("added record with id " + id);
                
                var idRef = new Firebase("https://chess-kumuda.firebaseio.com/pushedid");
                var idRef1 = idRef.child(user.uid);
                var idRef2 = idRef1.child(request.senderUid);
            
                idRef2.set(id);
                
                friendsArray2.$indexFor(id); // returns location in the array
            });
            
            
            });
            }
        
    });
        
        var msg = "you and "+request.senderName + " are now friends";
        var d = new Date();
	var n = d.getTime();
                            var  notifyObj = {
                                            text: msg ,
                                            seen: "false",
              				    color : "#FAFAFA",
              			            startedAt: -n
                                             };
        $scope.notifications.$add(notifyObj);  // add notification
        
        var query8 = notificationRef.child(request.senderUid)
        notifyArray = $firebaseArray(query8); 
        msg = user.username + " accepted your friend request";
        var d = new Date();
	var n = d.getTime();
        notifyObj = {
                        text: msg,
                        seen : "false",
              		color : "#FAFAFA",
           		startedAt: -n
                    };
        notifyArray.$add(notifyObj);
            
    }
    
    $scope.RejectedReq = function(request) {	// if the friend request is rejected then notify the sender and remove the request
        $scope.presentRequests.$remove(request);
        
        var msg = "you rejected "+request.senderName;
        var d = new Date();
	var n = d.getTime();
                            var  notifyObj = {
                                            text: msg ,
                                            seen  : "false",
              				    color : "#FAFAFA",
              			            startedAt: -n
                                             };
        $scope.notifications.$add(notifyObj);  
        
        var query8 = notificationRef.child(request.senderUid)
        notifyArray = $firebaseArray(query8); 
        msg = user.username + " rejected your friend request";
        var d = new Date();
	var n = d.getTime();
        notifyObj = {
                        text: msg ,
                        seen : "false",
              		color : "#FAFAFA",
              		startedAt: -n
                    };
        notifyArray.$add(notifyObj);
    }
    
    $scope.removeNotify = function(thisNotification){
        $scope.notifications.$remove(thisNotification);  
    }
    
    $scope.removeDenyNotify = function(denynotification){
        $scope.denynotifications.$remove(denynotification);  
    }
    
    
    requestRef.on("value", function(snapshot) {	// if there is any change in game requests node
                
       requestArray = $firebaseArray(query2); 	// game requests sent by other users to this user            
       requestArray.$loaded().then(function(messages) {
                        var array4 = requestArray;
                        length_of_array = requestArray.length;
                        var obj,i,j;
                        for(i = 0 ; i < length_of_array ; i++ ) {
                                obj  = requestArray[i];
                            console.log("the i value outside : ",i);
                            if( obj.status === "sent") {
                                
                               
                            
                                
                            sweet.show({	// display the alert showing the sender of game request
                                title: 'Want to play',
                                text: 'with ' + obj.senderName,
                                imageUrl: 'http://icons.iconarchive.com/icons/osullivanluke/orb-os-x/512/Chess-icon.png',
                                showCancelButton: true,
                                confirmButtonColor: '#DD6B55',
                                confirmButtonText: 'Yes, play!',
                                closeOnConfirm: false,
                                closeOnCancel: true
                            }, function(isConfirm) {	// if you accept
                                if (isConfirm) {
                                   
                                    var acceptedReqObj = obj;
                                 
                                    
                                    obj.status = "accepted";	// set this request status as accepted
                                    requestArray.$save( obj );
                                    console.log("saved accepted");
                                    
                                    
                                    
                                   sweet.show({
                                                title: 'You Accepted',
                                                text: 'the request',
                                                type: 'success',
                                                timer: 2000,
                                                showConfirmButton: false
                                    });
                                    
                                    
                                        
                                    
                                         console.log("entered1"); 
                                        var gameid = obj.senderUid;
                                        gameObj[gameid] = {
                                            "white": obj.senderUid,
                                            "black": obj.recieverUid,
                                            "whiteName" : obj.senderName,
                                            "blackName" : obj.recieverName,
                                            "movesFrom": 'A3' , 
                                            "movesTo": 'A3',
                                            "turn" : "white",
                                            "winner" : "",
                                            "chat" : []
                                        };                                                                                               
                              var checkOpponent = $firebaseArray(userRef.orderByChild("uid").equalTo(acceptedReqObj.senderUid));
                                    
                                    
                                 checkOpponent.$loaded().then(function(messages) {	// check the status of sender before setting game
                                     console.log("checkOpponent : ",checkOpponent[0]);
                                    if(checkOpponent[0].status === "online") { 		// if the sender is online then online start game      
                                    var thisgamesRef = gamesRef.child(obj.senderUid);    
                                    thisgamesRef.on("value", function(snapshot) {
                                            if(snapshot.val() === null) {		// a game obj is set with key equal to sender id
                                                    gamesRef.set(gameObj); 		    
                                              }
                                            else {
                                                if(snapshot.val().black != user.uid)  { // if node is not null then sender is already playing 
                                                    
                                                sweet.show({
                                                    title: 'You Accepted Request',
                                                    text: 'but your friend is busy',
                                                    type: 'error',
                                                    timer: 1000,
                                                    showConfirmButton: false
                                                });
                                                }else {	// once the game obj is set by this user then user navigate to game.html
                             
                                                    
                                                    userObj = $firebaseArray(query1);
                                                    userObj.$loaded().then(function(messages) {   
        
                                                    userObj[0].status = "gaming";
                                                    userObj.$save(userObj[0]);
                                                        
                             			    localStorage.setItem('gameObj',JSON.stringify(snapshot.val()));
                            			    localStorage.setItem('requestId',obj.$id);
                                                    $window.location.href = 'game.html';
                                                    });
                                                    
                                                    
                                                }
                                            }
                                           
                                        });
                                    }else {  // if this node is not null then sender is already playing
                                        sweet.show({
                                                    title: 'You Accepted Request',
                                                    text: 'but your friend is busy',
                                                    type: 'error',
                                                    timer: 1000,
                                                    showConfirmButton: false
                                                });
                                    }
                                 });
                                    
                              
                                    
                                }else{	    // if you set the status of this request as denied
                                             
                                    console.log("desicion false");
                                    obj.status = "denied";
                                    requestArray.$save( obj );
                                   
                                    
                                }
                            });
                                
                            }
                                   
                        }
                       
        });
        
        var thisgamesRef = gamesRef.child(user.uid);
                                        
        thisgamesRef.on("value", function(snapshot) { // if the game obj is set then set this sender's status as gaming at users 
        if(snapshot.val() != null) {
                                            
            localStorage.setItem('gameObj',JSON.stringify(snapshot.val())); 
                                    
                                            
            sweet.show({
                title: 'Accepted Request by!',
                text: snapshot.val().blackName,
                type: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            userObj = $firebaseArray(query1);
            userObj.$loaded().then(function(messages) {   
        
                    userObj[0].status = "gaming";
                    userObj.$save(userObj[0]);
                                                
                    $window.location.href = 'game.html';
            });
                                        
            }
                                           
            });  
                                    
        
        
        responseArray = $firebaseArray(query3);   // response of sent game requests
        responseArray.$loaded().then(function(messages) { // if response array changes
                        var array4 = responseArray;
                        length_of_responsearray = responseArray.length;
                        var obj,i,j;
                        var text;
                        
                        for(i = 0 ; i < length_of_responsearray ; i++ ) {
                                obj =  responseArray[i];
                                text = 'by ' + obj.recieverName;
                                if( obj.status === "accepted") {
                       
                                }else if(obj.status === "denied") {	// if the sent request is denied then add notification
                                    
                                    responseArray.$remove(obj);
                                    
                                    var msg = obj.recieverName + " is busy , could not accept game request ";
                                    var d = new Date();
	                            var n = d.getTime();
                                    var  notifyObj = {
                                            text: msg,
                                            seen : "false",
              				    color : "#FAFAFA",
              			            startedAt: -n
                                            
                                             };
                                   
                                    $scope.denynotifications.$add(notifyObj);  
                                }
                        }
                       
        });
        
        
        
        
        
        
     });
    
    $scope.sendRequest = function(opponent) {		// send a game request by adding the request object to the request aray of reciever
         requestObj = {
            "senderUid"   :  user.uid,
            "senderName"  :  user.username,
            "recieverUid" :  opponent.uid,
            "recieverName":  opponent.username,
             "status"     :  "sent"
         };
        
        requestArray.$add(requestObj);
        //alert("your request is sent to "+opponent.username);
        var msg = "Game request is sent to "+opponent.username;
        var d = new Date();
	var n = d.getTime();
        var  notifyObj = {
              			text: msg ,
              			seen : "false",
              			color : "#FAFAFA",
              			startedAt: -n
                         };
        $scope.notifications.$add(notifyObj);  
        
    }
    
    $scope.clickedfrndReq = function() {		// on clicking dropdown of  friend requests
    	//alert("notifications is clicked");
    	var l = $scope.presentRequests.length;
    	var frndReqArray = $scope.presentRequests;
    	
    	for(var i = 0 ; i < l ; i++) {
    		//var notificationobject = notificationArray[i];
    		
    		if(frndReqArray[i].seen === "false") {
    			frndReqArray[i].seen = "old";
    			frndReqArray.$save(frndReqArray[i]);
    		}	
    	
    	}
    
    }
    
    $scope.clickednotifications = function() {	       // on clicking dropdown of  notifications
    	//alert("notifications is clicked");
    	var l = $scope.notifications.length;
    	var notificationArray = $scope.notifications;
    	
    	for(var i = 0 ; i < l ; i++) {
    		//var notificationobject = notificationArray[i];
    		
    		if(notificationArray[i].seen === "false") {
    			notificationArray[i].seen = "recent";
    			notificationArray.$save(notificationArray[i]);
    		}	
    		else if(notificationArray[i].seen === "recent")	{
    			notificationArray[i].seen = "old";
    			//notificationArray[i].color = "#FAFAFA";
    			notificationArray[i].color = "#D5DBDB";
    			notificationArray.$save(notificationArray[i]);
    		}	
    		
    	
    	}
    
    }
    
    $scope.clickeddenynotifications = function() {    // on clicking dropdown of denied requests notifications
    	//alert("notifications is clicked");
    	var l = $scope.denynotifications.length;
    	var denynotificationArray = $scope.denynotifications;
    	
    	for(var i = 0 ; i < l ; i++) {
    		//var notificationobject = notificationArray[i];
    		
    		if(denynotificationArray[i].seen === "false") {
    			denynotificationArray[i].seen = "recent";
    			denynotificationArray.$save(denynotificationArray[i]);
    		}	
    		else if(denynotificationArray[i].seen === "recent")	{
    			denynotificationArray[i].seen = "old";
    			//notificationArray[i].color = "#FAFAFA";
    			denynotificationArray[i].color = "#D5DBDB";
    			denynotificationArray.$save(denynotificationArray[i]);
    		}	
    		
    	
    	}
    
    }
    
    /************************************************
    
    THE FOLLOWING IS THE CODE FOR UPDATING OR RESETTING USER INFO
    
    *************************************************/
    
    $scope.setOldPasswordtext = function(OldPassword) {
        
        $scope.OldPasswordtext = "";
        $scope.remark = ""
    }
    
    $scope.setNewPasswordtext = function(NewPassword,ConfirmPassword) {
        console.log("entered setNewPasswordtext");
        console.log(NewPassword);
       if(NewPassword.length < 7) {  
            $scope.NewPasswordtext = "password lenght should be minimum 7"; 
        }else {
            $scope.NewPasswordtext = "";   
        }
        
        if(NewPassword != ConfirmPassword) {
            $scope.ConfirmPasswordtext = "did not match with New Password";
        }else {
             $scope.ConfirmPasswordtext = "";
        }
        $scope.remark = ""
    }
    
    $scope.setConfirmPasswordtext = function(ConfirmPassword) {
        console.log("entered setConfirmPasswordtext");
        if($scope.NewPassword != ConfirmPassword) {
            $scope.ConfirmPasswordtext = "did not match with New Password";
        }else {
             $scope.ConfirmPasswordtext = "";
        }
        $scope.remark = ""
    }
    
    $scope.setPasswordtext = function(Password) {
            console.log("entered setPasswordtext");
            $scope.Passwordtext = "";
            $scope.remark2 = "";
    }
    
    $scope.setOldEmailtext = function(OldEmail) {
            console.log("entered setOldEmailtext");
            $scope.OldEmailtext = "";
            $scope.remark2 = "";
    }
    
    $scope.setNewEmailtext = function(NewEmail) {
            console.log("entered setNewEmailtext");
            $scope.NewEmailtext = "";
            $scope.remark2 = "";
    }
    
    $scope.UpdateEmail = function(OldEmail,NewEmail,Password) {
        console.log(OldEmail);
        console.log(NewEmail);
        console.log(Password);
        var entered = 0;
        if(OldEmail === undefined || OldEmail.length === 0 ) {
                entered = 1;  
                $scope.OldEmail = "";
                $scope.OldEmailtext = "enter the Old Email Address";
                $scope.remark2 = "";
        }
        if(NewEmail === undefined || NewEmail.length === 0 ) {
                entered = 1;  
                $scope.NewEmail = "";
                $scope.NewEmailtext = "enter the New Email Address";
                $scope.remark2 = "";
        }
        if(Password === undefined || Password.length === 0) {
            entered = 1;  
            $scope.Password = "";
            $scope.Passwordtext = "enter the Password";
            $scope.remark2 = "";
        }
        if(entered === 0) {
            
            if(user.email != OldEmail) {
                 $scope.OldEmail = "";
                 $scope.OldEmailtext = "entered wrong email address";
            }
            else {
                
                
                ref.changeEmail({
                    oldEmail : user.email,
                    newEmail : NewEmail,
                    password : Password
                }, function(error) {
                if (error === null) {
                    
                    user.email = NewEmail;
                    userObj = $firebaseArray(query1);
                                     
                    userObj.$loaded().then(function(messages) {   
                
                        userObj[0].email = NewEmail;
                        userObj.$save(userObj[0]);
                        localStorage.setItem('userDetail',JSON.stringify(userObj[0]));
                    });
                    
                    $scope.$apply(function () {
                       $scope.NewEmail = "";
                       $scope.OldEmail = "";
                       $scope.Password = "";
                       $scope.OldEmailtext = "";
                       $scope.NewEmailtext = "";
                       $scope.Passwordtext = "";
                       $scope.remark2 = "email address is changed";
                    });
                    
                    console.log("Email changed successfully");
                } else {
                    console.log("Error changing email:", error);
                    
                    $scope.$apply(function () {
                        if(error.code === "INVALID_PASSWORD") {
                            $scope.Password = "";
                            $scope.Passwordtext = "entered wrong password";
                        }
                        else if(error.code === "EMAIL_TAKEN") {
                            $scope.NewEmail = "";
                            $scope.NewEmailtext = "another user is using that email id ";
                        }
                        else if(error.code === "INVALID_EMAIL"){
                            $scope.NewEmail = "";
                            $scope.NewEmailtext = "invalid email address";
                        }else {
                            $scope.NewEmail = "";
                            $scope.NewEmailtext = error.code;
                        }
                            
                       
                       $scope.remark2 = "";
                    });
                    
                    }
                });
                
            }
            
            
        }
        
    }
    
    $scope.UpdatePassword = function(newPassword ,ConfirmPassword ,OldPassword ) {
        console.log(newPassword);
        console.log(ConfirmPassword);
        console.log(OldPassword);
        var entered = 0;
        if(newPassword === undefined || newPassword.length === 0  ) {
                   entered = 1;
                   $scope.NewPasswordtext = "enter the new password";
                   $scope.NewPassword = "";
                   $scope.ConfirmPassword = ""; 
                   $scope.remark = ""
        }
        if(ConfirmPassword === undefined || ConfirmPassword.length === 0 ) {
                   entered = 1;
                   $scope.ConfirmPasswordtext = "enter the confirm password"; 
                   $scope.remark = ""
        }
        if(OldPassword === undefined ||  OldPassword.length === 0 ) {
                   entered = 1;
                   $scope.OldPasswordtext = "enter the old password";     
                   $scope.remark = ""
        }
        if(entered === 0) {
            if(newPassword.length < 7) {
                $scope.NewPasswordtext = "password lenght should be minimum 7";   
                $scope.ConfirmPasswordtext = "";
                $scope.OldPasswordtext = "";
            
                $scope.NewPassword = "";
                $scope.ConfirmPassword = "";
            }else if(newPassword != ConfirmPassword) {
                $scope.NewPasswordtext = "";   
                $scope.ConfirmPasswordtext = "did not match with New Password";
                $scope.OldPasswordtext = "";
            
                $scope.ConfirmPassword = "";
            
            }else {
                
            
                ref.changePassword({
                    email       : user.email,
                    oldPassword : OldPassword,
                    newPassword : newPassword
                }, function(error) {
                if (error === null) {
                
                
                    
                    $scope.$apply(function () {
                        $scope.NewPasswordtext = "";   
                        $scope.ConfirmPasswordtext = "";
                        $scope.OldPasswordtext = "";
                
                        $scope.OldPassword = "";
                        $scope.NewPassword = "";
                        $scope.ConfirmPassword = "";
                        $scope.remark = "password is  changed";
                    });
                    console.log("Password changed successfully");
                } else {
             
                    $scope.$apply(function () {
                        
                        $scope.NewPasswordtext = "";   
                        $scope.ConfirmPasswordtext = "";
                        $scope.OldPasswordtext = "The specified password is incorrect";
                
                        $scope.OldPassword = "";
                        $scope.remark = "";
                    });
                    console.log("$scope.remark:", "jkl,");
                    console.log("Error changing password:", error);
                }
                });
            
            }
        }
        
    }
    
    
    $scope.logOut =  function() {
        
        if(user != null) {
            
            user.status = "offline";
            userObj = $firebaseArray(query1);
                                     
            userObj.$loaded().then(function(messages) {   
                
                
                userObj[0].status = "offline";
                userObj.$save(userObj[0]);
                
                
              var array1 = $firebaseArray(thisfriendsRef);
              var object = {
                            uid : user.uid,
                            username : user.username,
                            status : "offline"
                     };
              array1.$loaded().then(function(messages) { 
                var i;
                if(array1.length === 0)  {
                    $window.location.href = 'login.html';
                }
                else {  
                    for(i = 0 ; i < array1.length ; i++)  {
                   
                        var element = array1[i];
                        console.log(element.username+" :  ",idObj[element.uid]); 
                        var elementRef = friendsRef.child(element.uid);
                        var thisRef = elementRef.child(idObj[element.uid]);
                        thisRef.set(object);
                    
                        if(i === (array1.length - 1)) {
                            $window.location.href = 'login.html';
                        }
                    }
                }
             });   
                
                
            });
                
            localStorage.removeItem('userDetail');
          
            
            console.log("successfully logged out");
        }else {
            console.log("already removed");   
        }
        
    }
    
    
});
