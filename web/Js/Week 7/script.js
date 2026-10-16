
// let name="Karim";
// alert(`His name is ${name}`);

// function func_name()
// {

// }

function add()
{
    let firstNumber= parseInt(document.getElementById("num1").value);
    let secondNumber= parseInt(document.getElementById("num2").value);

    // let a= firstNumber.value;
    // let b= secondNumber.value;

    //let numb1=parseInt(a);
    //let numb2=parseInt(b);

    document.getElementById("output").innerHTML=
    `<strong>${firstNumber} + ${secondNumber} = ${firstNumber+secondNumber} </strong>`;
}