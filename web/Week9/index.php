<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <form method="GET">
        <input type="text" name="Input1">
        <br>
        <input type="text" name="Input2">
        <br>
        <input type="submit"> 
    </form>
</body>
</html>

<?php
    echo "First Input is ".$_GET["Input1"];
    echo "<br>Second input is".$_GET["Input2"];
?>
