<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        table, th, td, tr{
            border: 1px solid black;
        }
    </style>
</head>
<body>
    <h1>Item Calculator</h1>
    <form method="POST">
        <input type="number" name="items" placeholder="Number of Item Sold">
        <br><br>
        <input type="number" name="days" placeholder="Number of Days Sale Runs">
        <br><br>
        <input type="number" name="target" placeholder="Target Number of Items">
        <br><br>
        <input type="submit">
    </form>
</body>
</html>

<?php
    if(isset($_POST["items"]))
        {
            $items=(int)$_POST["items"];
            $days=(int)$_POST["days"];
            $target=(int)$_POST["target"];

            
            $total=$items*$days;
            echo "<table>";
            echo "<tr><th>Total Items</th><th>Performance</th><th>Result</th></tr>";
            echo "<tr><td>$total</td>";
            if($total>=500)
                {
                    echo "<td>Excellent</td>";
                }
            elseif($total>=300 && $total<500)
                {
                    echo "<td>Good</td>";
                }
            elseif($total>=150 && $total<300)
                {
                    echo "<td>Average</td>";
                }
            else{
                echo "<td>Poor</td>";
            }

            $differences=$total-$target;

            if($differences==0)
                {
                    echo "<td>Target met exactly (0)</td>";
                }
            elseif($differences<0)
                {
                    echo "<td>Below target by (".$differences*(-1).")</td>";
                }
            else{
                 echo "<td>Above target by (".$differences.")</td>";
            }
            echo "</tr></table>";

        }
?>