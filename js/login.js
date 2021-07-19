
//TODO
/*
1)Make alerts look nicer
*/

//login existing users
function login(form){

//get elements
var email = form.email.value;
 var password = form.password.value;

//user will be logged in for the duration of the session
 firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
   .then(function() {

     return firebase.auth().signInWithEmailAndPassword(email, password);
   })
   .catch(function(error) {
        if(error.code == "auth/wrong-password"){
          alert("Username or password incorrect");
           window.location = "../Login/login.html";
        }
 });

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

    // User is signed in.
   window.location = "../Home/index.html";

  } else {
    // User is signed out.


  }
});
}



//register new users
function register(form){



  var database = firebase.database();
   var ref = database.ref();
   var userRef = ref.child("Users");



//get elements from form
const email = form.email.value;
const username = form.username.value;
const firstName = form.firstName.value;
const lastName = form.lastName.value;
const pass = form.password.value;
console.log(pass);
const confirmPass = form.confirmpassword.value;

//check if user exists already
userRef.child(username).once('value', function(snapshot) {
  if(snapshot.val() !== null){
    alert("User exists! Please pick a new username");
  }
//check passwords are the same
else if (pass.trim() !== confirmPass.trim()){

alert("Passwords do not match!");

} //check password length
else if(pass.length < 6){

alert("Password must be atleast 6 characters");

} //store user
else{
    firebase.auth().createUserWithEmailAndPassword(email, pass).catch(function(error) {

      var errorCode = error.code;

      if (errorCode === "auth/email-already-in-use"){
        alert("Please use another email");
      }
      else if(errorCode === "auth/invalid-email"){
        alert("Please enter a valid email");
    }


    });

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if(firebaseUser) {
        userRef.child(username).set({
          Email: email,
          FirstName: firstName,
          LastName: lastName
        });
          window.location = '../Login/login.html';
      }
  });
}
});





}
//sign users out
function signOut(){


  firebase.auth().signOut().then(function() {
    localStorage.clear();
    sessionStorage.clear();


    window.location = "../index.html";
  }, function(error) {
    console.error('Sign Out Error', error);
  });

}
