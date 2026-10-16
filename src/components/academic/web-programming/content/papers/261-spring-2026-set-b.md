# Spring 2026 Set B (261)

**Exam:** Final Exam, Spring 2026 (Set B)
**Course:** CSE 4165 / CSE 465: Web Programming
**Total marks:** 30
**Time:** 2 hours

## 1 [10]
**Topics:** 04, 05, 06, 07, 09

### Question
Create a JavaScript program where a user enters a patient's vitals and your code shows a live health report. Strategies are as follows:

**Index.html:**
Create two text fields (input type text) to take the user's **Heart Rate (bpm)** and **Oxygen Saturation / SpO2 (%)**, and a **"Save Reading"** button. Below the button there is a label field to show the report and feedback.

**Script.js:**

1. Take the user's Heart Rate and SpO2 from the input fields in the HTML file.
2. Keep track of every reading entered so far (for example, in arrays).
3. Inside a function:
   - a) Calculate and display the Average Heart Rate (of all readings entered so far, including the current one).
   - b) Calculate and display the Average Oxygen Saturation (of all readings so far, including the current one).
   - c) Calculate and display the **Risk Score** from the current reading using the formula: **RiskScore = (100 − SpO2) × 2 + |HeartRate − 80| × 0.5** (|HeartRate − 80| is the absolute / positive difference, e.g. |78 − 80| = 2.)
   - d) Display the **feedback** in the label area: "SAFE" if the Risk Score is 10 or less, "WARNING" if it is greater than 10 and 20 or less, and "DANGER" if it is greater than 20.

**Sample Input / Output**

| Heart Rate, SpO2 (entered in order) | Report | Feedback |
|---|---|---|
| 80, 97 | Average Heart Rate: 80<br>Average Oxygen Saturation: 97<br>Risk Score: 6.0 | **SAFE** |
| 78, 95 | Average Heart Rate: 79<br>Average Oxygen Saturation: 96<br>Risk Score: 11 | **WARNING** |
| 130, 80 | Average Heart Rate: 96<br>Average Oxygen Saturation: 90.67<br>Risk Score: 65 | **DANGER** |

### Solution
**Working for the samples** (the readings are cumulative):

| After reading | Heart rates | Average HR | SpO2 values | Average SpO2 | Risk (current reading) | Feedback |
|---|---|---|---|---|---|---|
| 80, 97 | 80 | 80 | 97 | 97 | (100 − 97) × 2 + 0 × 0.5 = **6** | SAFE |
| 78, 95 | 80, 78 | 79 | 97, 95 | 96 | 5 × 2 + 2 × 0.5 = **11** | WARNING |
| 130, 80 | 80, 78, 130 | 96 | 97, 95, 80 | 90.67 | 20 × 2 + 50 × 0.5 = **65** | DANGER |

The averages use **all** readings so far; the risk score uses only the **current** reading. `Math.abs()` gives |HeartRate − 80|.

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Patient Vitals</title>
</head>
<body>
    <h2>Patient Vitals Monitor</h2>

    <label>Heart Rate (bpm):</label>
    <input type="text" id="heartRate"><br><br>

    <label>Oxygen Saturation / SpO2 (%):</label>
    <input type="text" id="spo2"><br><br>

    <button onclick="saveReading()">Save Reading</button>
    <br><br>
    <label id="report"></label>

    <script src="script.js"></script>
</body>
</html>
```

**script.js**

```javascript
let heartRates = [];   // every heart rate entered so far
let spo2Values = [];   // every SpO2 entered so far

function average(values) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum / values.length;
}

function saveReading() {
    // 1. Read the inputs
    let heartRate = parseFloat(document.getElementById("heartRate").value);
    let spo2 = parseFloat(document.getElementById("spo2").value);

    if (isNaN(heartRate) || isNaN(spo2) || heartRate <= 0 || spo2 < 0 || spo2 > 100) {
        document.getElementById("report").innerHTML =
            "Enter a positive heart rate and an SpO2 between 0 and 100.";
        return;
    }

    // 2. Keep every reading
    heartRates.push(heartRate);
    spo2Values.push(spo2);

    // 3a, 3b. Averages of all readings (at most 2 decimals)
    let avgHeartRate = Number(average(heartRates).toFixed(2));
    let avgSpo2 = Number(average(spo2Values).toFixed(2));

    // 3c. Risk score of the current reading
    let risk = (100 - spo2) * 2 + Math.abs(heartRate - 80) * 0.5;

    // 3d. Feedback
    let feedback;
    if (risk <= 10) {
        feedback = "SAFE";
    } else if (risk <= 20) {
        feedback = "WARNING";
    } else {
        feedback = "DANGER";
    }

    document.getElementById("report").innerHTML =
        "Average Heart Rate: " + avgHeartRate + "<br>" +
        "Average Oxygen Saturation: " + avgSpo2 + "<br>" +
        "Risk Score: " + risk.toFixed(1) + "<br>" +
        "<b>" + feedback + "</b>";

    document.getElementById("heartRate").value = "";
    document.getElementById("spo2").value = "";
}
```

**Results:**

| Reading | Shown |
|---|---|
| 80, 97 | Average Heart Rate: 80, Average Oxygen Saturation: 97, Risk Score: 6.0, **SAFE** |
| 78, 95 | Average Heart Rate: 79, Average Oxygen Saturation: 96, Risk Score: 11.0, **WARNING** |
| 130, 80 | Average Heart Rate: 96, Average Oxygen Saturation: 90.67, Risk Score: 65.0, **DANGER** |

The sample prints the risk as "6.0" in the first row but "11" and "65" in the others. The program always shows one decimal (`toFixed(1)`); the values are the same. Exactly 10 is SAFE and exactly 20 is WARNING ("10 or less", "20 or less").

## 2 [10]
**Topics:** 11, 13

### Question
The UIU Mars Rover Team is preparing for a rover field-test mission and needs to calculate how many battery modules must be carried for the rover. Write a PHP program that takes three inputs from an HTML form: the **mission distance in meters**, the **energy consumption per meter**, and the **capacity of one battery module**.

The program should first calculate the **total energy required** by multiplying the mission distance with the energy consumption per meter. Since the team cannot carry partial battery modules, the program must calculate the minimum number of **complete battery modules** needed. Then, calculate the **unused energy capacity** after the required number of battery modules is carried.

Classify the battery usage efficiency using the following conditions:

- **Efficient:** unused energy is less than or equal to 10% of total carried energy
- **Acceptable:** unused energy is more than 10% but less than or equal to 25% of total carried energy
- **Wasteful:** unused energy is more than 25% of total carried energy

Finally, display the **total energy required**, **number of battery modules needed**, **unused energy capacity**, and the **battery usage status**.

| Mission Distance | Energy per Meter | Battery Capacity | Total Energy Required | Battery Modules | Unused Energy | Status |
|---|---|---|---|---|---|---|
| 1200 | 8 | 5000 | 9600 | 2 | 400 | Efficient |
| 1500 | 9 | 4000 | 13500 | 4 | 2500 | Acceptable |
| 1000 | 6 | 5000 | 6000 | 2 | 4000 | Wasteful |

(Sample Input taken using HTML form; Sample Output printed using PHP code.)

### Solution
**Formulas:**

- Total energy = distance × energy per meter
- Modules = **ceil**(total energy ÷ capacity)
- Carried energy = modules × capacity
- Unused = carried − total energy
- Unused % = unused ÷ carried × 100 → ≤ 10 Efficient, ≤ 25 Acceptable, otherwise Wasteful

| Sample | Total energy | Modules | Carried | Unused | Unused % | Status |
|---|---|---|---|---|---|---|
| 1200, 8, 5000 | 9600 | 2 | 10000 | 400 | 4% | Efficient |
| 1500, 9, 4000 | 13500 | 4 | 16000 | 2500 | 15.6% | Acceptable |
| 1000, 6, 5000 | 6000 | 2 | 10000 | 4000 | 40% | Wasteful |

The percentage is of the **carried** energy (modules × capacity), not of the required energy.

**index.php**

```php
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Mars Rover Battery Planner</title>
    <style>
        table { border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #999; padding: 6px 12px; }
    </style>
</head>
<body>
    <h2>UIU Mars Rover: Battery Planner</h2>
    <form method="POST" action="">
        <label>Mission Distance (m):</label>
        <input type="number" name="distance" min="1" step="any" required><br><br>
        <label>Energy per Meter:</label>
        <input type="number" name="energy" min="0.01" step="any" required><br><br>
        <label>Battery Capacity:</label>
        <input type="number" name="capacity" min="1" step="any" required><br><br>
        <input type="submit" name="calculate" value="Calculate">
    </form>

    <?php
    if (isset($_POST["calculate"])) {
        $distance = (float) $_POST["distance"];
        $energyPerMeter = (float) $_POST["energy"];
        $capacity = (float) $_POST["capacity"];

        if ($distance <= 0 || $energyPerMeter <= 0 || $capacity <= 0) {
            echo "<p>All values must be positive.</p>";
        } else {
            $totalEnergy = $distance * $energyPerMeter;
            $modules = (int) ceil($totalEnergy / $capacity);
            $carried = $modules * $capacity;
            $unused = $carried - $totalEnergy;
            $unusedPercent = $unused / $carried * 100;

            if ($unusedPercent <= 10) {
                $status = "Efficient";
            } elseif ($unusedPercent <= 25) {
                $status = "Acceptable";
            } else {
                $status = "Wasteful";
            }

            echo "<table>";
            echo "<tr><th>Total Energy Required</th><th>Battery Modules</th><th>Unused Energy</th><th>Status</th></tr>";
            echo "<tr><td>$totalEnergy</td><td>$modules</td><td>$unused</td><td>$status</td></tr>";
            echo "</table>";
            echo "<p>Unused energy is " . round($unusedPercent, 2) . "% of the $carried units carried.</p>";
        }
    }
    ?>
</body>
</html>
```

**Output:**

| Input | Total Energy Required | Battery Modules | Unused Energy | Status |
|---|---|---|---|---|
| 1200, 8, 5000 | 9600 | 2 | 400 | Efficient |
| 1500, 9, 4000 | 13500 | 4 | 2500 | Acceptable |
| 1000, 6, 5000 | 6000 | 2 | 4000 | Wasteful |

## 3 [10]
**Topics:** 14, 15, 16, 17, 19

### Question
Create a database named 'uiu_bookshop' and a table named 'book_info' with the following structure and values:

| BookID | BookTitle | Author | Category | Price | Stock |
|---|---|---|---|---|---|
| 1 | Web Basics | John Smith | Programming | 450 | 10 |
| 2 | Database Guide | Alice Roy | Programming | 550 | 8 |
| 3 | English Grammar | Mary Khan | Language | 300 | 15 |
| 4 | Business Math | David Lee | Business | 400 | 12 |
| 5 | Python Mastery | Sara Ahmed | Programming | 600 | 5 |
| 6 | French Made Easy | Paul Costa | Language | 350 | 7 |

Now, do the following **(write full PHP–MySQL code):**

1. Display all books from the Programming category, sorted by Price in descending order.
2. Display the BookTitle, Author, and Price of all books where the Price is greater than 400 BDT and the Category is 'Programming'.
3. Display the number of books available in each Category.
4. Display the total net worth of the entire bookshop. (Hint: To find the total net worth of the entire bookshop, multiply the Price and Stock of each book, then add all the values together.)
5. Apply a 10% price reduction to all books in the 'Language' category, then display the BookTitle and updated Price of those books.

### Solution
**uiu_bookshop.sql**

```sql
CREATE DATABASE IF NOT EXISTS uiu_bookshop;
USE uiu_bookshop;

CREATE TABLE book_info (
    BookID INT PRIMARY KEY,
    BookTitle VARCHAR(100),
    Author VARCHAR(100),
    Category VARCHAR(50),
    Price DECIMAL(8,2),
    Stock INT
);

INSERT INTO book_info (BookID, BookTitle, Author, Category, Price, Stock) VALUES
(1, 'Web Basics',       'John Smith', 'Programming', 450, 10),
(2, 'Database Guide',   'Alice Roy',  'Programming', 550, 8),
(3, 'English Grammar',  'Mary Khan',  'Language',    300, 15),
(4, 'Business Math',    'David Lee',  'Business',    400, 12),
(5, 'Python Mastery',   'Sara Ahmed', 'Programming', 600, 5),
(6, 'French Made Easy', 'Paul Costa', 'Language',    350, 7);
```

#### The SQL for each task

```sql
-- 1) Programming books, most expensive first
SELECT * FROM book_info WHERE Category = 'Programming' ORDER BY Price DESC;

-- 2) Programming books above 400
SELECT BookTitle, Author, Price FROM book_info WHERE Price > 400 AND Category = 'Programming';

-- 3) books per category: number of titles and copies in stock
SELECT Category, COUNT(*) AS Titles, SUM(Stock) AS CopiesInStock
FROM book_info
GROUP BY Category;

-- 4) net worth = sum of price x stock
SELECT SUM(Price * Stock) AS NetWorth FROM book_info;

-- 5) 10% off Language books, then show them
UPDATE book_info SET Price = Price * 0.90 WHERE Category = 'Language';
SELECT BookTitle, Price FROM book_info WHERE Category = 'Language';
```

**Task 3 wording:** "number of books available" can mean the number of **titles** (`COUNT(*)`) or the number of **copies in stock** (`SUM(Stock)`). The query shows both; say which one you mean in the exam.

#### The PHP page (full code)

The category name goes into the queries through prepared statements. Task 5's price change runs only when its button is pressed (POST).

**index.php**

```php
<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn = new mysqli("localhost", "root", "", "uiu_bookshop");
$conn->set_charset("utf8mb4");

// Prints any SELECT result as an HTML table
function showTable($result) {
    if ($result->num_rows === 0) {
        echo "<p>No rows found.</p>";
        return;
    }
    echo "<table><tr>";
    foreach ($result->fetch_fields() as $field) {
        echo "<th>" . htmlspecialchars($field->name) . "</th>";
    }
    echo "</tr>";
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>" . htmlspecialchars((string) $value) . "</td>";
        }
        echo "</tr>";
    }
    echo "</table>";
}

$programming = "Programming";
$language = "Language";
$minPrice = 400;
$message = "";

if (($_POST["task"] ?? "") === "5") {
    $discount = 0.90;
    $stmt = $conn->prepare("UPDATE book_info SET Price = Price * ? WHERE Category = ?");
    $stmt->bind_param("ds", $discount, $language);
    $stmt->execute();
    $message = "Task 5: 10% price reduction applied to " . $stmt->affected_rows . " Language book(s).";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>UIU Bookshop</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        table { border-collapse: collapse; margin-bottom: 25px; }
        th, td { border: 1px solid #999; padding: 6px 12px; }
        th { background: #eee; }
    </style>
</head>
<body>
    <h1>UIU Bookshop</h1>

    <h2>1) Programming books by price (highest first)</h2>
    <?php
    $stmt = $conn->prepare("SELECT * FROM book_info WHERE Category = ? ORDER BY Price DESC");
    $stmt->bind_param("s", $programming);
    $stmt->execute();
    showTable($stmt->get_result());
    ?>

    <h2>2) Programming books above 400 BDT</h2>
    <?php
    $stmt = $conn->prepare("SELECT BookTitle, Author, Price FROM book_info WHERE Price > ? AND Category = ?");
    $stmt->bind_param("ds", $minPrice, $programming);
    $stmt->execute();
    showTable($stmt->get_result());
    ?>

    <h2>3) Books in each category</h2>
    <?php
    showTable($conn->query(
        "SELECT Category, COUNT(*) AS Titles, SUM(Stock) AS CopiesInStock
         FROM book_info
         GROUP BY Category"
    ));
    ?>

    <h2>4) Total net worth</h2>
    <?php
    $row = $conn->query("SELECT SUM(Price * Stock) AS NetWorth FROM book_info")->fetch_assoc();
    echo "<p>Total net worth: " . number_format($row["NetWorth"], 2) . " BDT</p>";
    ?>

    <h2>5) Language books after a 10% price reduction</h2>
    <form method="POST" action="">
        <button type="submit" name="task" value="5">Apply 10% reduction (once)</button>
    </form>
    <p><?= htmlspecialchars($message) ?></p>
    <?php
    $stmt = $conn->prepare("SELECT BookTitle, Price FROM book_info WHERE Category = ?");
    $stmt->bind_param("s", $language);
    $stmt->execute();
    showTable($stmt->get_result());
    ?>
</body>
</html>
<?php
$conn->close();
```

#### Results (run against MariaDB 10.4)

**1)**

| BookID | BookTitle | Author | Category | Price | Stock |
|---|---|---|---|---|---|
| 5 | Python Mastery | Sara Ahmed | Programming | 600.00 | 5 |
| 2 | Database Guide | Alice Roy | Programming | 550.00 | 8 |
| 1 | Web Basics | John Smith | Programming | 450.00 | 10 |

**2)** All three Programming books cost more than 400: Web Basics (John Smith, 450.00), Database Guide (Alice Roy, 550.00), Python Mastery (Sara Ahmed, 600.00).

**3)**

| Category | Titles | CopiesInStock |
|---|---|---|
| Business | 1 | 12 |
| Language | 2 | 22 |
| Programming | 3 | 23 |

**4)** 4500 + 4400 + 4500 + 4800 + 3000 + 2450 = **23,650.00 BDT**.

**5)** English Grammar 300 → **270.00**, French Made Easy 350 → **315.00**. After the reduction the net worth becomes 22,955.00 BDT. Pressing the button again would reduce the prices again, so press it once.
