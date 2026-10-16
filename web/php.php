<?php
// CSE 4165 Final Exam | Summer 2025 (252) | Q3
// PHP & MySQL (mysqli procedural): Sundarban Sales Operations
// (Run CSE4165_all_databases.sql first to set up the database)

$conn = mysqli_connect("localhost", "root", "", "sundarban");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Sundarban Sales Operations</title>
    <style>
        body { font-family: Arial; padding: 25px; }
        h3 { color: #4a90e2; margin-top: 25px; }
        table { border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #333; padding: 8px 14px; text-align: center; }
        th { background: #f0f0f0; }
        .ok { color: green; }
        .top { color: green; font-weight: bold; }
        .reg { color: gray; }
    </style>
</head>
<body>

<?php
// ---------- Task 1 ----------
// Total revenue per category
echo "<h3>1) Total revenue per category</h3>";

$sql = "SELECT CategoryName, SUM(Revenue) AS total_rev
        FROM sales_data
        GROUP BY CategoryName";

$result = mysqli_query($conn, $sql);

echo "<table>";
echo "<tr><th>Category</th><th>Total Revenue</th></tr>";
while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>
            <td>{$row['CategoryName']}</td>
            <td>" . number_format($row['total_rev']) . "</td>
          </tr>";
}
echo "</table>";


// ---------- Task 2 ----------
// Revenue < 40000  ->  CategoryName = 'Low Performing'
mysqli_query($conn, "UPDATE sales_data
                     SET CategoryName = 'Low Performing'
                     WHERE Revenue < 40000");

echo "<h3>2) Low-performing products marked</h3>";
echo "<p class='ok'>Products with Revenue &lt; 40,000 BDT moved to category 'Low Performing'.</p>";


// ---------- Task 3 ----------
// Revenue > 70000  ->  add 10% bonus revenue
mysqli_query($conn, "UPDATE sales_data
                     SET Revenue = Revenue * 1.10
                     WHERE Revenue > 70000");

echo "<h3>3) Bonus revenue applied</h3>";
echo "<p class='ok'>+10% bonus revenue added to products generating &gt; 70,000 BDT.</p>";


// ---------- Task 4 ----------
// For each product: show name, category, and "Top Seller" or "Regular Seller"
// "Top Seller" = revenue is ABOVE the average revenue of its OWN category
//
// We use a correlated subquery: for each row, calculate the avg revenue
// of all products in the same category as that row.
echo "<h3>4) Product seller status</h3>";

$sql = "SELECT s.ProductName,
               s.CategoryName,
               s.Revenue,
               CASE
                   WHEN s.Revenue > (
                       SELECT AVG(Revenue)
                       FROM sales_data
                       WHERE CategoryName = s.CategoryName
                   )
                   THEN 'Top Seller'
                   ELSE 'Regular Seller'
               END AS Status
        FROM sales_data s
        ORDER BY s.CategoryName, s.Revenue DESC";

$result = mysqli_query($conn, $sql);

echo "<table>";
echo "<tr>
        <th>Product</th>
        <th>Category</th>
        <th>Revenue</th>
        <th>Status</th>
      </tr>";

while ($row = mysqli_fetch_assoc($result)) {
    $cls = ($row['Status'] === 'Top Seller') ? 'top' : 'reg';
    echo "<tr>
            <td>{$row['ProductName']}</td>
            <td>{$row['CategoryName']}</td>
            <td>" . number_format($row['Revenue']) . "</td>
            <td class='$cls'>{$row['Status']}</td>
          </tr>";
}
echo "</table>";

mysqli_close($conn);
?>

</body>
</html>