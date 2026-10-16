let totalHours=0.0;
let attempts=0;
let subjects=[];

function study()
{
    let name= document.getElementById("name").value;
    let hour= parseFloat(document.getElementById("hour").value);

    totalHours=totalHours+hour;
    attempts=attempts+1;
    let average=totalHours/attempts;

    subjects.push(name);
    document.getElementById("totalHours").innerHTML
    =`Total Hours: ${totalHours}`;

    document.getElementById("averageHours").innerHTML
    =`Average Hours: ${average}`;

    document.getElementById("subjects").innerHTML
    =`Subjects: [${subjects.join(", ")}]`;

    if(totalHours<=5)
    {
        document.getElementById("feedback").innerHTML
        =`Start studying regularly!`;
    }
    else if(totalHours>5 && totalHours<=12)
    {
        document.getElementById("feedback").innerHTML
        =`Good Progress!`;
    }

    else if(totalHours>12 && totalHours<20)
    {
        document.getElementById("feedback").innerHTML
        =`Almost ready!`;
    }
    else{
        document.getElementById("feedback").innerHTML
        =`Weekly Goal Reached!`;
    }

    if(attempts>7 && totalHours<20)
    {
        document.getElementById("feedback").innerHTML
        =`Increase your study time!`;
    }
    
    document.getElementById("name").value="";
    document.getElementById("hour").value="";


}