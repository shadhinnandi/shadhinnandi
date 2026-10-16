let totalHours = 0;
let attempts = 0;
let subject = [];

function cal() {
    let name = document.getElementById("name").value;
    let hours = parseFloat(document.getElementById("hours").value);

    totalHours += hours;
    attempts++;
    let avarage = totalHours / attempts;

    subject.push(name);

    document.getElementById("TotalHours").innerHTML =
        `Total: ${totalHours} hours,`;

    document.getElementById("Average").innerHTML =
        `Average: ${avarage} hours,`;

    document.getElementById("Subjects").innerHTML =
        `Subjects: ${subject}`;

    if (totalHours >= 0 && totalHours <= 5) {
        document.getElementById("feedback").innerHTML =
            `Start studying regularly!`;
    }

    else if (totalHours >= 6 && totalHours <= 12) {
        document.getElementById("feedback").innerHTML =
            `Good progress!`;
    }

    else if (totalHours >= 13 && totalHours <= 19) {
        document.getElementById("feedback").innerHTML =
            `Almost ready!`;
    }

    else if (totalHours > 20) {
        document.getElementById("feedback").innerHTML =
            `Weekly goal reached!`;
    }

    if(attempts > 7 && totalHours < 20){
        document.getElementById("warning").innerHTML=
            `Increase your study time!`;
    }
}