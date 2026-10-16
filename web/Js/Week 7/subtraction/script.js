

function Sub(){
    let a = parseInt(document.getElementById("num1").value);
    let b = parseInt(document.getElementById("num2").value);

    let result =a-b;

    document.getElementById("output").innerHTML=
    `${a} - ${b} = ${result}`;
}