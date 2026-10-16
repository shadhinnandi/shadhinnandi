total
function marks(){
    let c1= parseInt(document.getElementById("ct1").value);
    let c2= parseInt(document.getElementById("ct2").value);
    let c3= parseInt(document.getElementById("ct3").value);
    let mid= parseInt(document.getElementById("mid").value);
    let final= parseInt(document.getElementById("final").value);

    let bestTwo;

    if(c1 > c2 && c1 > c3){
        if(c2>c3){
            bestTwo=c1+c2;
            document.getElementById("bestTwo").innerHTML=
                `Best two CTs: ${c1+c2}`
        }
        else{
            bestTwo=c1+c3;
             document.getElementById("bestTwo").innerHTML=
                `Best two CTs: ${c1+c3}`           
        }
    }

    else if(c2 > c1 && c2 > c3){
        if(c1>c3){
            bestTwo=c1+c2;
            document.getElementById("bestTwo").innerHTML=
                `Best two CTs: ${c2+c1}`
        }
        else{
            bestTwo=c2+c3;
             document.getElementById("bestTwo").innerHTML=
                `Best two CTs: ${c2+c3}`           
        }       
    }
    else{
        if(c1>c2){
            bestTwo=c3+c1;
            document.getElementById("bestTwo").innerHTML=
                `Best two CTs: ${c3+c1}`
        }
        else{
            bestTwo=c3+c2;
             document.getElementById("bestTwo").innerHTML=
                `Best two CTs: ${c3+c2}`           
        }         
    }

    let total = bestTwo+mid+final;

    document.getElementById("total").innerHTML=
        `Total marks: ${total}`

    if(total < 54){
        document.getElementById("status").innerHTML=
            `Status: Failed`       
    }
    else{
        document.getElementById("status").innerHTML=
            `<strong>Status: Passed</strong>`         
    }
}