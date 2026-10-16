<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Pizza Calculator.</h1>
    <form method="POST">
        <input type="number" name="students" placeholder="Number of Students">
        <br><br>
        <input type="number" name="slicesStudents" placeholder="Slices Per Students">
        <br><br>
        <input type="number" name="slicesPizza" placeholder="Slices Per Pizza">
        <br><br>
        <input type="submit">
    </form>
</body>
</html>

<?php
    if(isset($_POST["students"])){
    $students= (int)$_POST["students"];
    $slicesStudent= (int)$_POST["slicesStudents"];
    $slicesPizza= (int)$_POST["slicesPizza"];

    $sliceNeeded= $students * $slicesStudent;

    $totalPizza= ceil($sliceNeeded/$slicesPizza);
    $leftover= $totalPizza*$slicesPizza - $sliceNeeded;

    $wasted= (1050/$slicesPizza) * $leftover;

    echo "Total Pizzas: $totalPizza<br>";
    echo "Leftover Slices: $leftover<br>";
    echo "Wasted Money(BDT): $wasted";
    }

?>

