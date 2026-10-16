function voteCandidate(candidate){

let answer = confirm(

"Are you sure you want to vote for " + candidate + " ?"

);

if(answer){

alert(

"You have successfully voted for " + candidate

);

// Later we'll save this to the database

window.location.href = "dashboard.html";

}

}