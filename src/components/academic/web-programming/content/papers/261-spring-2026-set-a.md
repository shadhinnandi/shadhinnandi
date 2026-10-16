# Spring 2026 Set A (261)

**Exam:** Final Exam, Spring 2026 (Set A)
**Course:** CSE 4165 / CSE 465: Web Programming
**Total marks:** 30
**Time:** 2 hours

## 1 [10]
**Topics:** 04, 05, 07, 09

### Question
Develop a JavaScript application where users can track their weekly study hours by subject and get feedback.

At first, create two input fields: **Subject Name** and **Study Hours**, an **"Add Study"** button, and a label area to display total study hours, average study hours, subjects studied, and feedback. The user will enter the subject name and the number of hours studied in each session. When the button is clicked, the application will do the following:

- a. Set a weekly study goal of **20 hours**.
- b. Add the entered study hours to a running total.
- c. Store each entered subject name.
- d. Count how many study sessions the user has entered.
- e. Calculate the average study hour so far: **Average = Total Study Hours / Number of Sessions**
- f. Display:
  - total study hours
  - average study hours
  - subjects studied in all sessions
  - feedback message
- g. Display feedback based on total study hours:
  - 0–5 → "Start studying regularly!"
  - 6–12 → "Good progress!"
  - 13–19 → "Almost ready!"
  - 20+ → "Weekly goal reached!"
- h. If the user enters more than 7 study sessions without reaching 20 hours, display **"Increase your study time!"**

| Sample Input | Sample Output |
|---|---|
| English-2, English-3, Bangla-4, Physics-5 | Total: 14 hours, Average: 3.5 hours, Subjects: [English, English, Bangla, Physics], Almost ready! |
| Math-5, Physics-6, Chemistry-7, English-3 | Total: 21 hours, Average: 5.25 hours, Subjects: [Math, Physics, Chemistry, English], Weekly goal reached! |
| 8 sessions, total 15 hours | Total: 15 hours, Average: 1.875 hours, Increase your study time! |

### Solution
**Map each requirement to code:**

| Requirement | Code |
|---|---|
| a. goal of 20 | `const GOAL = 20;` |
| b. running total | global `total`, `total += hours` |
| c. store subjects | global array, `subjects.push(subject)` |
| d. count sessions | global `sessions`, `sessions++` |
| e. average | `total / sessions` (after `sessions++`) |
| f. display | one `innerHTML` with all four parts |
| g. feedback | `if / else if` from the top: `>= 20`, `> 12`, `> 5`, else |
| h. warning | checked last: `sessions > 7 && total < GOAL` |

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Study Tracker</title>
</head>
<body>
    <h2>Weekly Study Tracker</h2>

    <label>Subject Name:</label>
    <input type="text" id="subject"><br><br>

    <label>Study Hours:</label>
    <input type="number" id="hours" min="0" step="any"><br><br>

    <button onclick="addStudy()">Add Study</button>
    <br><br>
    <label id="report"></label>

    <script src="script.js"></script>
</body>
</html>
```

**script.js**

```javascript
const GOAL = 20;      // a. weekly goal
let total = 0;        // b. running total
let subjects = [];    // c. subject names
let sessions = 0;     // d. number of sessions

function addStudy() {
    let subject = document.getElementById("subject").value.trim();
    let hours = parseFloat(document.getElementById("hours").value);

    if (subject === "" || isNaN(hours) || hours < 0) {
        document.getElementById("report").innerHTML = "Please enter a subject and the hours studied.";
        return;
    }

    total += hours;              // b
    subjects.push(subject);      // c
    sessions++;                  // d

    let average = total / sessions;                   // e
    average = Math.round(average * 1000) / 1000;      // at most 3 decimals: 3.5, 5.25, 1.875

    // g. feedback
    let feedback;
    if (total >= GOAL) {
        feedback = "Weekly goal reached!";
    } else if (total > 12) {
        feedback = "Almost ready!";
    } else if (total > 5) {
        feedback = "Good progress!";
    } else {
        feedback = "Start studying regularly!";
    }

    // h. more than 7 sessions without reaching the goal
    if (sessions > 7 && total < GOAL) {
        feedback = "Increase your study time!";
    }

    // f. display
    document.getElementById("report").innerHTML =
        `Total: ${total} hours, Average: ${average} hours, ` +
        `Subjects: [${subjects.join(", ")}], ${feedback}`;

    document.getElementById("subject").value = "";
    document.getElementById("hours").value = "";
}
```

**Results** (each sample starts from a fresh page):

| Sessions | Shown |
|---|---|
| English 2, English 3, Bangla 4, Physics 5 | Total: 14 hours, Average: 3.5 hours, Subjects: [English, English, Bangla, Physics], Almost ready! |
| Math 5, Physics 6, Chemistry 7, English 3 | Total: 21 hours, Average: 5.25 hours, Subjects: [Math, Physics, Chemistry, English], Weekly goal reached! |
| 8 sessions: 2, 2, 2, 2, 2, 2, 2, 1 | Total: 15 hours, Average: 1.875 hours, Subjects: [...8 subjects], Increase your study time! |
| 4 sessions of 5 | Total: 20 hours, Average: 5 hours, ..., Weekly goal reached! |

**Pitfalls this answer avoids:**

- `total > 20` for "20+" misses exactly 20 hours; use `>= 20`.
- Ranges written as `>= 0 && <= 5`, `>= 6 && <= 12` leave gaps for decimals such as 5.5 or 12.5, which then get no message. Checking from the top (`>= 20`, `> 12`, `> 5`) gives every total a message.
- The running total, the array and the counter must be declared outside the function, or they reset on every click.

## 2 [10]
**Topics:** 11, 13

### Question
Write a PHP program for a student academic tracking system. The program should take three inputs from the user via an HTML form:

- **credits earned per course**
- **number of courses completed**
- **target graduation credits**.

First, calculate the **total credits earned** by multiplying the credits per course by the number of courses completed. Classify the academic progress using the following conditions:

- **Excellent:** total credits 120 or more
- **Good:** total credits 90 or more but less than 120
- **Average:** total credits 60 or more but less than 90
- **Poor:** total credits less than 60

The program should then compare the total credits earned with the target graduation credits. Finally, display the total credits, the progress category, the target value, and clearly state whether the progress is **above**, **below**, or **exactly at** the target, along with the difference.

Sample:

| Credits/Course | Courses Completed | Target | Total Credits | Progress | Result |
|---|---|---|---|---|---|
| 4 | 30 | 120 | 120 | Excellent | Target met exactly (0 difference) |
| 3 | 35 | 100 | 105 | Good | Above target by 5 |
| 3 | 25 | 90 | 75 | Average | Below target by 15 |
| 4 | 10 | 60 | 40 | Poor | Below target by 20 |

### Solution
Same structure as Fall 2025 Question 2: multiply, classify from the top, compare with the target.

**index.php**

```php
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Academic Tracker</title>
    <style>
        table { border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #999; padding: 6px 12px; }
    </style>
</head>
<body>
    <h2>Student Academic Tracker</h2>
    <form method="POST" action="">
        <label>Credits earned per course:</label>
        <input type="number" name="credits" min="0" required><br><br>
        <label>Number of courses completed:</label>
        <input type="number" name="courses" min="0" required><br><br>
        <label>Target graduation credits:</label>
        <input type="number" name="target" min="0" required><br><br>
        <input type="submit" name="calculate" value="Calculate">
    </form>

    <?php
    if (isset($_POST["calculate"])) {
        $credits = (int) $_POST["credits"];
        $courses = (int) $_POST["courses"];
        $target = (int) $_POST["target"];

        if ($credits < 0 || $courses < 0 || $target < 0) {
            echo "<p>Values cannot be negative.</p>";
        } else {
            $total = $credits * $courses;

            if ($total >= 120) {
                $progress = "Excellent";
            } elseif ($total >= 90) {
                $progress = "Good";
            } elseif ($total >= 60) {
                $progress = "Average";
            } else {
                $progress = "Poor";
            }

            $difference = $total - $target;
            if ($difference > 0) {
                $result = "Above target by $difference";
            } elseif ($difference < 0) {
                $result = "Below target by " . abs($difference);
            } else {
                $result = "Target met exactly (0 difference)";
            }

            echo "<table>";
            echo "<tr><th>Total Credits</th><th>Progress</th><th>Target</th><th>Result</th></tr>";
            echo "<tr><td>$total</td><td>$progress</td><td>$target</td><td>$result</td></tr>";
            echo "</table>";
        }
    }
    ?>
</body>
</html>
```

**Output:**

| Input | Total Credits | Progress | Target | Result |
|---|---|---|---|---|
| 4, 30, 120 | 120 | Excellent | 120 | Target met exactly (0 difference) |
| 3, 35, 100 | 105 | Good | 100 | Above target by 5 |
| 3, 25, 90 | 75 | Average | 90 | Below target by 15 |
| 4, 10, 60 | 40 | Poor | 60 | Below target by 20 |

## 3 [10]
**Topics:** 14, 15, 16, 17, 19

### Question
Create a database named tourism and a table named tourist_spot with the following structure and values:

| SpotID | SpotName | Region | Category | Rating | EntryFee | VisitorsPerYear |
|---|---|---|---|---|---|---|
| 1 | Cox's Bazar Beach | CTG | Beach | 4.9 | 0 | 150000 |
| 2 | Sundarbans Forest | KHL | Nature | 4.3 | 150 | 80000 |
| 3 | Ratargul Forest | SYL | Nature | 4.8 | 100 | 60000 |
| 4 | Kuakata Beach | PTU | Beach | 4.5 | 0 | 90000 |
| 5 | Shat Gambuj Mosque | BGH | Heritage | 4.7 | 30 | 70000 |
| 6 | Paharpur | NWG | Heritage | 4.1 | 30 | 40000 |

Now, do the following **(write full PHP–MySQL code):**

1. Display the SpotName, Region and Rating of all spots whose rating is above 4.5 or whose SpotName contains the word 'Beach'. Sort the result by Rating in descending order.
2. Update: for all spots whose rating is between 4.0 and 4.5 (inclusive) and whose EntryFee is greater than 0, increase the Rating by 0.2 and raise the EntryFee by 10%.
3. For each category, show the category name, the number of spots in it, the average rating, and the total visitors per year but only include categories whose average rating is above 4.4. Sort the result by average rating in descending order.
4. For each region, show the region name and its total estimated yearly revenue, calculated as the sum of (EntryFee × VisitorsPerYear) over its spots. Display only those regions whose total estimated revenue exceeds 1,000,000, ordered from highest to lowest.

### Solution
**tourism.sql**

```sql
CREATE DATABASE IF NOT EXISTS tourism;
USE tourism;

CREATE TABLE tourist_spot (
    SpotID INT PRIMARY KEY,
    SpotName VARCHAR(100),
    Region VARCHAR(10),
    Category VARCHAR(50),
    Rating DECIMAL(3,1),
    EntryFee DECIMAL(8,2),
    VisitorsPerYear INT
);

INSERT INTO tourist_spot (SpotID, SpotName, Region, Category, Rating, EntryFee, VisitorsPerYear) VALUES
(1, 'Cox''s Bazar Beach',  'CTG', 'Beach',    4.9, 0,   150000),
(2, 'Sundarbans Forest',   'KHL', 'Nature',   4.3, 150,  80000),
(3, 'Ratargul Forest',     'SYL', 'Nature',   4.8, 100,  60000),
(4, 'Kuakata Beach',       'PTU', 'Beach',    4.5, 0,    90000),
(5, 'Shat Gambuj Mosque',  'BGH', 'Heritage', 4.7, 30,   70000),
(6, 'Paharpur',            'NWG', 'Heritage', 4.1, 30,   40000);
```

Two details:

- **`'Cox''s Bazar Beach'`**: the apostrophe inside the text is doubled, otherwise it ends the string.
- **`DECIMAL(3,1)` for Rating**: exact decimals. With `FLOAT`, 4.3 is stored as about 4.30000019, so `BETWEEN 4.0 AND 4.5` and "average above 4.4" can give surprising results.

#### The SQL for each task

```sql
-- 1) rating above 4.5 OR name contains "Beach", best first
SELECT SpotName, Region, Rating
FROM tourist_spot
WHERE Rating > 4.5 OR SpotName LIKE '%Beach%'
ORDER BY Rating DESC;

-- 2) rating 4.0 to 4.5 and paid entry -> rating +0.2, fee +10%
UPDATE tourist_spot
SET Rating = Rating + 0.2, EntryFee = EntryFee * 1.10
WHERE Rating BETWEEN 4.0 AND 4.5 AND EntryFee > 0;

-- 3) per category, only average rating above 4.4
SELECT Category, COUNT(*) AS Spots, ROUND(AVG(Rating), 2) AS AvgRating,
       SUM(VisitorsPerYear) AS TotalVisitors
FROM tourist_spot
GROUP BY Category
HAVING AVG(Rating) > 4.4
ORDER BY AvgRating DESC;

-- 4) per region revenue above 1,000,000
SELECT Region, SUM(EntryFee * VisitorsPerYear) AS EstimatedRevenue
FROM tourist_spot
GROUP BY Region
HAVING EstimatedRevenue > 1000000
ORDER BY EstimatedRevenue DESC;
```

#### The PHP page (full code)

**index.php**

```php
<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conn = new mysqli("localhost", "root", "", "tourism");
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

$message = "";

if (($_POST["task"] ?? "") === "2") {
    $ratingStep = 0.2;
    $feeRate = 1.10;
    $low = 4.0;
    $high = 4.5;
    $minFee = 0;
    $stmt = $conn->prepare(
        "UPDATE tourist_spot
         SET Rating = Rating + ?, EntryFee = EntryFee * ?
         WHERE Rating BETWEEN ? AND ? AND EntryFee > ?"
    );
    $stmt->bind_param("ddddd", $ratingStep, $feeRate, $low, $high, $minFee);
    $stmt->execute();
    $message = "Task 2: " . $stmt->affected_rows . " spot(s) updated.";
}

// Values used by tasks 1, 3 and 4
$minRating = 4.5;
$word = "%Beach%";
$minAverage = 4.4;
$minRevenue = 1000000;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Tourist Spots</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 30px; }
        table { border-collapse: collapse; margin-bottom: 25px; }
        th, td { border: 1px solid #999; padding: 6px 12px; }
        th { background: #eee; }
    </style>
</head>
<body>
    <h1>Tourist Spots of Bangladesh</h1>

    <form method="POST" action="">
        <button type="submit" name="task" value="2">Run task 2 (once)</button>
    </form>
    <p><?= htmlspecialchars($message) ?></p>

    <h2>All spots</h2>
    <?php showTable($conn->query("SELECT * FROM tourist_spot ORDER BY SpotID")); ?>

    <h2>1) Rating above 4.5 or a beach</h2>
    <?php
    $stmt = $conn->prepare(
        "SELECT SpotName, Region, Rating
         FROM tourist_spot
         WHERE Rating > ? OR SpotName LIKE ?
         ORDER BY Rating DESC"
    );
    $stmt->bind_param("ds", $minRating, $word);
    $stmt->execute();
    showTable($stmt->get_result());
    ?>

    <h2>3) Categories with an average rating above 4.4</h2>
    <?php
    $stmt = $conn->prepare(
        "SELECT Category, COUNT(*) AS Spots, ROUND(AVG(Rating), 2) AS AvgRating,
                SUM(VisitorsPerYear) AS TotalVisitors
         FROM tourist_spot
         GROUP BY Category
         HAVING AVG(Rating) > ?
         ORDER BY AvgRating DESC"
    );
    $stmt->bind_param("d", $minAverage);
    $stmt->execute();
    showTable($stmt->get_result());
    ?>

    <h2>4) Regions earning more than 1,000,000 a year</h2>
    <?php
    $stmt = $conn->prepare(
        "SELECT Region, SUM(EntryFee * VisitorsPerYear) AS EstimatedRevenue
         FROM tourist_spot
         GROUP BY Region
         HAVING EstimatedRevenue > ?
         ORDER BY EstimatedRevenue DESC"
    );
    $stmt->bind_param("i", $minRevenue);
    $stmt->execute();
    showTable($stmt->get_result());
    ?>
</body>
</html>
<?php
$conn->close();
```

Each press of task 2 adds another 0.2 to ratings that are still between 4.0 and 4.5, so press it **once**.

#### Results (run against MariaDB 10.4)

**1)** (the same before and after task 2)

| SpotName | Region | Rating |
|---|---|---|
| Cox's Bazar Beach | CTG | 4.9 |
| Ratargul Forest | SYL | 4.8 |
| Shat Gambuj Mosque | BGH | 4.7 |
| Kuakata Beach | PTU | 4.5 |

Kuakata (4.5) is not above 4.5 but its name contains "Beach".

**2)** 2 rows: Sundarbans Forest 4.3 → **4.5**, fee 150 → **165.00**; Paharpur 4.1 → **4.3**, fee 30 → **33.00**. Kuakata Beach (4.5) is in the range but its fee is 0, so it is not changed.

**3) After task 2:**

| Category | Spots | AvgRating | TotalVisitors |
|---|---|---|---|
| Beach | 2 | 4.70 | 240000 |
| Nature | 2 | 4.65 | 140000 |
| Heritage | 2 | 4.50 | 110000 |

Before task 2, Heritage averages exactly 4.40, which is not *above* 4.4, so only Beach (4.70) and Nature (4.55) appear. Run the tasks in the order given.

**4) After task 2:**

| Region | EstimatedRevenue |
|---|---|
| KHL | 13200000.00 |
| SYL | 6000000.00 |
| BGH | 2100000.00 |
| NWG | 1320000.00 |

Before task 2 the same four regions appear with KHL 12,000,000 and NWG 1,200,000. CTG and PTU have no entry fee, so their revenue is 0.
