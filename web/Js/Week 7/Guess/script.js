let secretNumber=Math.ceil((Math.random()*4500)+500);
let attempt=0;

console.log("Secret Value "+secretNumber);
function guess()
{
    let guess=parseInt(document.getElementById("input").value);

    attempt=attempt+1;

    let feedback=document.getElementById("feedback");

    if(guess==secretNumber)
    {
        feedback.innerHTML=
        `Correct!`;

        document.getElementById("input").disabled=true;
        document.getElementById("btn").disabled=true;
    }
    else if(guess<secretNumber)
    {
        feedback.innerHTML=
        `Too Low!`;
    }

    else{
        feedback.innerHTML=
        `Too High!`;
    }

    if(attempt==5)
    {
        feedback.innerHTML=
        `Too many attempts!`;

        document.getElementById("input").disabled=true;
        document.getElementById("btn").disabled=true;
    }
}