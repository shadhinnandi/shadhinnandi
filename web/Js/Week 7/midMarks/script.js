
function cal(){
    let ct1 = parseInt(document.getElementById("ct1").value);
    let ct2 = parseInt(document.getElementById("ct2").value);
    let ct3 = parseInt(document.getElementById("ct3").value);

    let mid = parseInt(document.getElementById("mid").value);
    let final = parseInt(document.getElementById("final").value);

    let bestTwo = ct1 + ct2 + ct3 - Math.min(ct1, ct2, ct3);

    let total = bestTwo+mid+final;

    document.getElementById("bestTwo").innerHTML=
        `Best two CT = ${bestTwo}`;

    document.getElementById("midMarks").innerHTML=
        `Mid marks = ${mid}`;

    document.getElementById("finalMarks").innerHTML=
        `Final marks = ${final}`;
    
    document.getElementById("total").innerHTML=
        `Total marks = ${total}`;

    if(total < 54){
        document.getElementById("status").innerHTML=
            `Status = Failed!`;
    }
    else{
        document.getElementById("status").innerHTML=
            `Status = Passed!`
    }
}