# Lab L3: Projects

In this lab you build five complete programs, each bigger than anything in the
chapters. A project is where the separate ideas of the course meet: classes,
encapsulation, collections, inheritance, interfaces, exceptions, files and generics all
work together in one program.

The projects get harder in order. Project 1 needs only classes and `ArrayList`
(Chapters 04 to 08). Project 5 uses interfaces, maps, exceptions and file I/O together.
After the five projects you will find twelve project ideas to build on your own.

## Planning an OOP Project

Beginners often open the editor and start typing `main`. That works for 30 lines. For
300 lines it ends in one giant method that nobody, including you, can change safely.
Plan first. The plan below takes about 20 minutes and saves hours.

```text
  1. Requirements      What must the program do? Write it as a list.
         |
         v
  2. Find classes      Nouns in the requirements -> candidate classes
         |
         v
  3. Responsibilities  What does each class KNOW (fields) and DO?
         |
         v
  4. Methods           Turn each "do" into a method with a clear name,
         |             parameters and return value
         v
  5. Build and test    One class at a time; run after every step
```

### Step 1: Write the Requirements

A requirement is one sentence that says what the program must do, not how. Keep each
one testable: you should be able to say "yes, it does that" or "no, it does not".

- Good: "A member may borrow at most 2 books at a time."
- Too vague: "The library should work well."

Also write down the rules and limits (maximum credits, fine per day, seat capacity),
because those rules become `if` statements and validations later.

### Step 2: Find the Classes

Read the requirements and underline the **nouns**. Each noun is a *candidate* class or
field. Then ask the question you have met since Chapter 04: **"Should this be a
class?"** A noun deserves its own class when it has several pieces of data that belong
together *and* behaviour (rules) of its own. A noun that is just one value (a name, a
price, a day number) is a field.

### Step 3: Give Each Class Responsibilities

For every class, write two short lists: what it **knows** (its fields) and what it
**does** (its methods). A good rule: the class that owns the data enforces the rules
about that data. If a book's available copies must never go below zero, the `Book`
class checks it, not `main`.

### Step 4: Design the Methods

Turn each "does" into a method signature. Decide what each method needs (parameters)
and what it gives back (return value, or an exception when something is wrong). Keep
input and output (`Scanner`, `System.out`) in one place, usually the class with `main`
or a small "console" class, so the other classes stay reusable.

### Step 5: Build and Test Incrementally

Do not write all classes and then compile for the first time. Instead:

1. Write the smallest class (for example `Book`) and test it from a tiny `main`.
2. Add the next class and test the two together.
3. Add one command at a time to the command loop and run it after each one.
4. Keep a text file of test commands and feed it to the program again after every
   change. This is how the sample runs below were produced.

### Worked Example: Finding the Classes for a Canteen

Here is a short requirements text for a campus canteen ordering program:

> The canteen has a **menu** of **items**. Each item has a **name**, a **price** in Tk
> and a **category** (snack, meal or drink). A **student** places an **order** with one
> or more **order lines**; each line is an item and a **quantity**. An order has a
> **total**, and a 5% **discount** applies when the total is 300 Tk or more. The
> **cashier** marks an order as **paid** or **cancelled**.

Now apply "Should this be a class?" to each noun:

| Noun | Decision | Why |
|---|---|---|
| item | class `MenuItem` | has name, price, category; validates price > 0 |
| menu | class `Menu` | holds many items; can find an item by name |
| order | class `Order` | has lines, a status; computes total and discount |
| order line | class `OrderLine` | pairs an item with a quantity; computes line total |
| name, price, quantity | fields | single values, no behaviour of their own |
| category | `enum Category` | a fixed set: SNACK, MEAL, DRINK |
| total, discount | methods of `Order` | calculated, not stored, so they are never out of date |
| paid / cancelled | `enum Status` field | a fixed set of states |
| student, cashier | not classes (yet) | the program never stores anything about them |

The last row matters. Not every noun becomes a class. "Student" and "cashier" are the
*users* of the program; if a later requirement says "show a student's order history",
then `Student` becomes a class.

```text
+-------------+ 1     * +-------------+ *     1 +-------------+
|   Order     |-------->|  OrderLine  |-------->|  MenuItem   |
| status      |         | quantity    |         | name, price |
| total()     |         | lineTotal() |         | category    |
| discount()  |         +-------------+         +-------------+
+-------------+                                        ^ *
                                                       |
                                                +-------------+
                                                |    Menu     |
                                                | find(name)  |
                                                +-------------+
```

### How the Projects in This Lab Work

Every project is a **command-driven console program**. It reads one command per line
from standard input, with no prompts, and stops cleanly when the input ends
(`hasNextLine()` returns `false`). Before handling a command it prints the command
after `> `, so the output reads like a log of the session.

You can type commands by hand (end the input with Ctrl+D on Linux/macOS or Ctrl+Z then
Enter on Windows), but it is easier to put them in a file and redirect it:

```text
javac StudentManagementSystem.java
java StudentManagementSystem < commands.txt
```

In a real project each public class lives in its own file; here we keep each program
in one file so you can compile it with one command. Only the class with `main` is
`public`. All money amounts, fines, rates and academic rules in these projects are
hypothetical and invented for practice.

## Project 1: Student Management System

A department office keeps a record of students and their course grades. You build a
program that adds, lists, searches, updates and deletes students, records letter
grades and calculates each student's GPA.

### Requirements

- Add a student with a numeric ID and a full name. IDs must be unique.
- Record a course result: course code, credits (1 to 4) and a letter grade. Recording
  the same course again replaces the old grade.
- Convert letters to grade points on a 4.00 scale and compute the credit-weighted GPA.
- List all students, search by part of a name (case-insensitive), show one student's
  full record, rename a student, delete a student.
- Show the student with the highest GPA.
- Reject unknown commands, unknown IDs and invalid grades with a clear message.

| Command | Meaning |
|---|---|
| `ADD <id> <name>` | add a student |
| `GRADE <id> <course> <credits> <letter>` | record or replace a result |
| `LIST` / `SEARCH <text>` | table of all / matching students |
| `SHOW <id>` | one student's results and GPA |
| `UPDATE <id> <new name>` / `DELETE <id>` | rename / remove |
| `TOP` | highest GPA |
| `QUIT` | stop (end of input also stops) |

### Class Design

```text
+--------------------------+
| StudentManagementSystem  |  main: reads lines until input ends
+------------+-------------+
             | passes each line to
             v
+--------------------------+       +--------------------+
| StudentApp               |------>| GradeScale         |
|  execute(line)           | uses  |  pointsFor(letter) |
+------------+-------------+       +--------------------+
             | has one
             v
+--------------------------+
| StudentManager           |
|  students: ArrayList     |
|  add, findById, delete   |
|  searchByName, top...    |
+------------+-------------+
             | has many
             v
+--------------------------+ 1   * +--------------------+
| Student                  |------>| CourseResult       |
|  id, name, results       |       |  courseCode        |
|  recordResult(), gpa()   |       |  credits, letter   |
+--------------------------+       |  gradePoint        |
                                   +--------------------+
```

### Concepts Used

- Chapter 04: Classes and Objects (several cooperating classes, `this`)
- Chapter 05: Encapsulation, Abstraction and Access Control (private fields, getters)
- Chapter 06: Constructors and Object Lifecycle
- Chapter 07: Static and Instance Members (the `GradeScale` utility class)
- Chapter 08: Arrays, Object References and Collections (`ArrayList<Student>`,
  searching with loops, returning copies of lists)
- Chapter 02: Conditional Statements and Loops (the arrow form of `switch`)

### The Program

The sample run adds three students, records grades (one invalid, one replaced), then
lists, searches, shows, renames and deletes. Each output line can be traced back to
the command printed above it.

<details>
<summary>Full code and sample run: StudentManagementSystem.java (about 340 lines)</summary>

```java
import java.util.ArrayList;
import java.util.Scanner;

/** One graded course on a student's record. */
class CourseResult {
    private final String courseCode;
    private final int credits;
    private final String letter;
    private final double gradePoint;

    CourseResult(String courseCode, int credits, String letter, double gradePoint) {
        this.courseCode = courseCode;
        this.credits = credits;
        this.letter = letter;
        this.gradePoint = gradePoint;
    }

    String getCourseCode() {
        return courseCode;
    }

    int getCredits() {
        return credits;
    }

    String getLetter() {
        return letter;
    }

    double getGradePoint() {
        return gradePoint;
    }
}

/** Converts letter grades to grade points (a hypothetical 4.00 scale). */
class GradeScale {
    private static final String[] LETTERS = {
        "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"
    };
    private static final double[] POINTS = {
        4.00, 3.67, 3.33, 3.00, 2.67, 2.33, 2.00, 1.67, 1.33, 1.00, 0.00
    };

    private GradeScale() {
    }

    /** Returns the grade point of a letter, or -1 if the letter is unknown. */
    static double pointsFor(String letter) {
        for (int i = 0; i < LETTERS.length; i++) {
            if (LETTERS[i].equals(letter)) {
                return POINTS[i];
            }
        }
        return -1;
    }
}

/** A student with an ID, a name and a list of course results. */
class Student {
    private final int id;
    private String name;
    private final ArrayList<CourseResult> results = new ArrayList<>();

    Student(int id, String name) {
        this.id = id;
        this.name = name;
    }

    int getId() {
        return id;
    }

    String getName() {
        return name;
    }

    void setName(String name) {
        this.name = name;
    }

    /** Adds a result. Returns false if it replaced an older result of that course. */
    boolean recordResult(CourseResult result) {
        for (int i = 0; i < results.size(); i++) {
            if (results.get(i).getCourseCode().equals(result.getCourseCode())) {
                results.set(i, result);
                return false;
            }
        }
        results.add(result);
        return true;
    }

    int totalCredits() {
        int total = 0;
        for (CourseResult r : results) {
            total += r.getCredits();
        }
        return total;
    }

    /** Credit-weighted average of the grade points; 0.00 when nothing is graded. */
    double gpa() {
        int credits = totalCredits();
        if (credits == 0) {
            return 0.0;
        }
        double weighted = 0;
        for (CourseResult r : results) {
            weighted += r.getCredits() * r.getGradePoint();
        }
        return weighted / credits;
    }

    ArrayList<CourseResult> getResults() {
        return new ArrayList<>(results);
    }

    String summaryLine() {
        return String.format("%-6d %-16s %3d  %.2f", id, name, totalCredits(), gpa());
    }
}

/** Keeps all students in an ArrayList and answers questions about them. */
class StudentManager {
    private final ArrayList<Student> students = new ArrayList<>();

    boolean add(Student student) {
        if (findById(student.getId()) != null) {
            return false;
        }
        students.add(student);
        return true;
    }

    Student findById(int id) {
        for (Student s : students) {
            if (s.getId() == id) {
                return s;
            }
        }
        return null;
    }

    ArrayList<Student> searchByName(String text) {
        ArrayList<Student> matches = new ArrayList<>();
        String key = text.toLowerCase();
        for (Student s : students) {
            if (s.getName().toLowerCase().contains(key)) {
                matches.add(s);
            }
        }
        return matches;
    }

    boolean delete(int id) {
        Student s = findById(id);
        if (s == null) {
            return false;
        }
        students.remove(s);
        return true;
    }

    ArrayList<Student> getAll() {
        return new ArrayList<>(students);
    }

    /** The student with the highest GPA among those with at least one result. */
    Student topStudent() {
        Student best = null;
        for (Student s : students) {
            if (s.totalCredits() > 0 && (best == null || s.gpa() > best.gpa())) {
                best = s;
            }
        }
        return best;
    }
}

/** Reads one command line at a time and talks to the StudentManager. */
class StudentApp {
    private final StudentManager manager = new StudentManager();

    /** Runs one command. Returns false when the user typed QUIT. */
    boolean execute(String line) {
        System.out.println("> " + line);
        String[] parts = line.split(" ", 2);
        String command = parts[0].toUpperCase();
        String rest = parts.length > 1 ? parts[1].trim() : "";
        switch (command) {
            case "ADD" -> add(rest);
            case "GRADE" -> grade(rest);
            case "LIST" -> printTable(manager.getAll());
            case "SEARCH" -> printTable(manager.searchByName(rest));
            case "SHOW" -> show(rest);
            case "UPDATE" -> update(rest);
            case "DELETE" -> delete(rest);
            case "TOP" -> top();
            case "QUIT" -> {
                return false;
            }
            default -> System.out.println("Unknown command: " + command);
        }
        return true;
    }

    private void add(String rest) {
        String[] parts = rest.split(" ", 2);
        if (parts.length < 2 || !isNumber(parts[0])) {
            System.out.println("Usage: ADD <id> <name>");
            return;
        }
        Student student = new Student(Integer.parseInt(parts[0]), parts[1].trim());
        if (manager.add(student)) {
            System.out.println("Added " + student.getId() + " " + student.getName());
        } else {
            System.out.println("ID " + parts[0] + " is already used");
        }
    }

    private void grade(String rest) {
        String[] parts = rest.split("\\s+");
        if (parts.length != 4 || !isNumber(parts[0]) || !isNumber(parts[2])) {
            System.out.println("Usage: GRADE <id> <course> <credits> <letter>");
            return;
        }
        Student student = manager.findById(Integer.parseInt(parts[0]));
        double points = GradeScale.pointsFor(parts[3]);
        int credits = Integer.parseInt(parts[2]);
        if (student == null) {
            System.out.println("No student with ID " + parts[0]);
        } else if (points < 0) {
            System.out.println("Unknown grade " + parts[3]);
        } else if (credits < 1 || credits > 4) {
            System.out.println("Credits must be 1 to 4");
        } else {
            CourseResult r = new CourseResult(parts[1], credits, parts[3], points);
            boolean isNew = student.recordResult(r);
            String verb = isNew ? "Recorded " : "Updated ";
            System.out.printf("%s%s %s for %s, GPA now %.2f%n",
                    verb, parts[1], parts[3], student.getName(), student.gpa());
        }
    }

    private void show(String rest) {
        Student s = findStudent(rest);
        if (s == null) {
            return;
        }
        System.out.println(s.getId() + " " + s.getName());
        for (CourseResult r : s.getResults()) {
            System.out.printf("  %-8s %d cr  %-2s  %.2f%n", r.getCourseCode(),
                    r.getCredits(), r.getLetter(), r.getGradePoint());
        }
        System.out.printf("  Credits: %d, GPA: %.2f%n", s.totalCredits(), s.gpa());
    }

    private void update(String rest) {
        String[] parts = rest.split(" ", 2);
        if (parts.length < 2) {
            System.out.println("Usage: UPDATE <id> <new name>");
            return;
        }
        Student s = findStudent(parts[0]);
        if (s != null) {
            String old = s.getName();
            s.setName(parts[1].trim());
            System.out.println("Renamed " + old + " to " + s.getName());
        }
    }

    private void delete(String rest) {
        Student s = findStudent(rest);
        if (s != null && manager.delete(s.getId())) {
            System.out.println("Deleted " + s.getId() + " " + s.getName());
        }
    }

    private void top() {
        Student best = manager.topStudent();
        if (best == null) {
            System.out.println("No graded students yet");
        } else {
            System.out.printf("Top: %s (GPA %.2f)%n", best.getName(), best.gpa());
        }
    }

    /** Looks up a student by an ID typed as text, printing a message if not found. */
    private Student findStudent(String idText) {
        if (!isNumber(idText)) {
            System.out.println("Not a valid ID: " + idText);
            return null;
        }
        Student s = manager.findById(Integer.parseInt(idText));
        if (s == null) {
            System.out.println("No student with ID " + idText);
        }
        return s;
    }

    private void printTable(ArrayList<Student> list) {
        if (list.isEmpty()) {
            System.out.println("No students found");
            return;
        }
        System.out.printf("%-6s %-16s %3s  %s%n", "ID", "Name", "Cr", "GPA");
        for (Student s : list) {
            System.out.println(s.summaryLine());
        }
        System.out.println(list.size() + " student(s)");
    }

    /** True if text is 1 to 9 digits, so Integer.parseInt cannot fail. */
    private static boolean isNumber(String text) {
        if (text.isEmpty() || text.length() > 9) {
            return false;
        }
        for (int i = 0; i < text.length(); i++) {
            if (!Character.isDigit(text.charAt(i))) {
                return false;
            }
        }
        return true;
    }
}

public class StudentManagementSystem {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        StudentApp app = new StudentApp();
        boolean running = true;
        while (running && in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (!line.isEmpty()) {
                running = app.execute(line);
            }
        }
        System.out.println("Goodbye.");
    }
}
```

**Input:**

```text
ADD 1001 Nusrat Jahan
ADD 1002 Tanvir Hasan
ADD 1003 Ayesha Rahman
ADD 1002 Fahim Ahmed
GRADE 1001 CSE1110 3 A
GRADE 1001 MAT1101 3 B+
GRADE 1002 CSE1110 3 A-
GRADE 1002 ENG1011 2 A
GRADE 1003 CSE1110 3 B
GRADE 1003 PHY1103 3 X
GRADE 1001 MAT1101 3 A-
LIST
SEARCH ra
SHOW 1001
UPDATE 1003 Ayesha Siddiqua
DELETE 1002
DELETE 1009
TOP
HELLO
LIST
```

**Output:**

```text
> ADD 1001 Nusrat Jahan
Added 1001 Nusrat Jahan
> ADD 1002 Tanvir Hasan
Added 1002 Tanvir Hasan
> ADD 1003 Ayesha Rahman
Added 1003 Ayesha Rahman
> ADD 1002 Fahim Ahmed
ID 1002 is already used
> GRADE 1001 CSE1110 3 A
Recorded CSE1110 A for Nusrat Jahan, GPA now 4.00
> GRADE 1001 MAT1101 3 B+
Recorded MAT1101 B+ for Nusrat Jahan, GPA now 3.67
> GRADE 1002 CSE1110 3 A-
Recorded CSE1110 A- for Tanvir Hasan, GPA now 3.67
> GRADE 1002 ENG1011 2 A
Recorded ENG1011 A for Tanvir Hasan, GPA now 3.80
> GRADE 1003 CSE1110 3 B
Recorded CSE1110 B for Ayesha Rahman, GPA now 3.00
> GRADE 1003 PHY1103 3 X
Unknown grade X
> GRADE 1001 MAT1101 3 A-
Updated MAT1101 A- for Nusrat Jahan, GPA now 3.83
> LIST
ID     Name              Cr  GPA
1001   Nusrat Jahan       6  3.83
1002   Tanvir Hasan       5  3.80
1003   Ayesha Rahman      3  3.00
3 student(s)
> SEARCH ra
ID     Name              Cr  GPA
1001   Nusrat Jahan       6  3.83
1003   Ayesha Rahman      3  3.00
2 student(s)
> SHOW 1001
1001 Nusrat Jahan
  CSE1110  3 cr  A   4.00
  MAT1101  3 cr  A-  3.67
  Credits: 6, GPA: 3.83
> UPDATE 1003 Ayesha Siddiqua
Renamed Ayesha Rahman to Ayesha Siddiqua
> DELETE 1002
Deleted 1002 Tanvir Hasan
> DELETE 1009
No student with ID 1009
> TOP
Top: Nusrat Jahan (GPA 3.83)
> HELLO
Unknown command: HELLO
> LIST
ID     Name              Cr  GPA
1001   Nusrat Jahan       6  3.83
1003   Ayesha Siddiqua    3  3.00
2 student(s)
Goodbye.
```

</details>

### How It Works

- **`CourseResult`** is a small immutable class: all fields are `private final` and
  there are no setters. A result never changes; a new grade for the same course is a
  new `CourseResult` that replaces the old one.
- **`GradeScale`** is a utility class (Chapter 07): a private constructor, two parallel
  `static final` arrays and one `static` method. `pointsFor` returns `-1` for an unknown
  letter, so the caller can reject it without an exception.
- **`Student`** owns its list of results and computes the GPA from them each time
  (`gpa()` divides the sum of `credits * gradePoint` by the total credits). Because the
  GPA is calculated, it can never be out of date. `recordResult` replaces a result with
  the same course code and returns `false` in that case, so the caller can say
  "Updated" instead of "Recorded". `getResults()` returns a *copy* of the list, so code
  outside cannot add results behind the student's back.
- **`StudentManager`** holds the `ArrayList<Student>`. Every search is a plain loop:
  `findById` returns the first match or `null`, `searchByName` collects all matches
  into a new list, and `topStudent` keeps the best student seen so far. It never
  prints anything; it only answers questions.
- **`StudentApp`** is the only class that prints. `execute` splits the line into the
  command word and the rest, then a `switch` sends it to one small method per command.
  `isNumber` checks that an ID is made of digits *before* `Integer.parseInt` is called,
  so a typo like `SHOW 10a1` gives a message instead of a crash.
- **`main`** only reads lines. `running && in.hasNextLine()` stops on `QUIT` *or* at
  the end of the input, whichever comes first.

### Extension Ideas

- Add `SORT gpa` and `SORT name` that print the table in that order (sort a copy of
  the list with a simple selection sort).
- Store the trimester with each result and compute a GPA per trimester and an overall
  CGPA.
- Print a warning when a student's GPA drops below 2.00 (academic probation).
- Show the class average and the number of students per grade letter for one course.

## Project 2: Library Management System

A small department library lends books to members. You build the program that keeps
the catalogue, issues and returns books, and charges fines for late returns. This
project is about **encapsulation**: every rule lives inside the class that owns the
data, and the outside world can only ask, never change fields directly.

### Requirements

- Add books with an ID, a number of copies (1 to 10), a title and an author.
- Add members with an ID and a name.
- Issue a book on a given day. Refuse when: the member or book does not exist, the day
  is earlier than the last recorded day, the member has an unpaid fine, the member
  already has 2 books, the member already has this title, or no copy is available.
- A loan is due 14 days after it is issued. Returning late costs 5 Tk per day, at most
  100 Tk per loan. Fines are added to the member's unpaid balance.
- Members can pay fines (partly or fully; paying more than owed takes only what is
  owed).
- Search books by a word in the title or author, list all books, show a member,
  and list overdue loans on a given day.

| Command | Meaning |
|---|---|
| `BOOK <id> <copies> <title> \| <author>` | add a book |
| `MEMBER <id> <name>` | add a member |
| `ISSUE <member> <book> <day>` / `RETURN <member> <book> <day>` | lend / take back |
| `PAY <member> <amount>` | pay a fine |
| `SEARCH <word>` / `BOOKS` | find / list books |
| `OVERDUE <day>` / `MEMBERINFO <member>` | reports |
| `QUIT` | stop |

Days are plain numbers (day 1, day 2, ...) so that the program never depends on the
real date, and every run gives the same output.

### Class Design

```text
+-------------------------+
| LibraryManagementSystem |  main: parses commands, prints results
+-----------+-------------+
            | calls
            v
+-------------------------+
| Library                 |  owns the three lists, enforces rules
|  books, members, loans  |  issue(), giveBack(), pay(), search()
|  today                  |  overdueOn(day)
+---+--------+--------+---+
    |        |        |
    v        v        v
+-------+ +--------+ +-----------------------+
| Book  | | Member | | Loan                  |
| copies| | loans  | |  book ---> Book       |
| lend  | | fine   | |  member -> Member     |
| return| | pay()  | |  dueDay, fineOn(day)  |
+-------+ +--------+ +-----------------------+
```

A `Loan` is the link between one `Member` and one `Book`. It holds *references* to the
real objects (not copies), so `loan.getBook()` is the same object that is in the
catalogue.

### Concepts Used

- Chapter 05: Encapsulation, Abstraction and Access Control (private state, methods
  that protect invariants, no setters where none are needed)
- Chapter 06: Constructors and Object Lifecycle (fields set once in constructors)
- Chapter 07: Static and Instance Members (`static final` rule constants)
- Chapter 08: Arrays, Object References and Collections (three `ArrayList`s, objects
  referring to other objects, identity comparison with `==`)
- Chapter 09: Inheritance (overriding `toString` with `@Override`)

### The Program

In the sample run Nusrat borrows two books and hits her loan limit, Rafi finds no copy
left, the overdue report shows fines growing, a late return creates a fine that blocks
the next loan until it is paid, and Rafi's very late return reaches the 100 Tk cap.
The last commands show that a day in the past is refused and that `QUIT` stops the
program even though more input follows.

<details>
<summary>Full code and sample run: LibraryManagementSystem.java (about 390 lines)</summary>

```java
import java.util.ArrayList;
import java.util.Scanner;

/** A title in the library catalogue, with a number of physical copies. */
class Book {
    private final String id;
    private final String title;
    private final String author;
    private final int totalCopies;
    private int availableCopies;

    Book(String id, String title, String author, int copies) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.totalCopies = copies;
        this.availableCopies = copies;
    }

    String getId() {
        return id;
    }

    String getTitle() {
        return title;
    }

    boolean isAvailable() {
        return availableCopies > 0;
    }

    /** Takes one copy off the shelf. */
    boolean lendCopy() {
        if (availableCopies == 0) {
            return false;
        }
        availableCopies--;
        return true;
    }

    /** Puts one copy back; never more copies than the library owns. */
    void receiveCopy() {
        if (availableCopies < totalCopies) {
            availableCopies++;
        }
    }

    boolean matches(String keyword) {
        String key = keyword.toLowerCase();
        return title.toLowerCase().contains(key) || author.toLowerCase().contains(key);
    }

    @Override
    public String toString() {
        return String.format("%-5s %-26s %-15s %d/%d", id, title, author,
                availableCopies, totalCopies);
    }
}

/** A library member. Borrowing is blocked by a full loan quota or an unpaid fine. */
class Member {
    static final int MAX_LOANS = 2;

    private final String id;
    private final String name;
    private int loanCount;
    private int unpaidFine;

    Member(String id, String name) {
        this.id = id;
        this.name = name;
    }

    String getId() {
        return id;
    }

    String getName() {
        return name;
    }

    int getLoanCount() {
        return loanCount;
    }

    int getUnpaidFine() {
        return unpaidFine;
    }

    /** Returns null if the member may borrow, otherwise the reason why not. */
    String borrowBlocker() {
        if (unpaidFine > 0) {
            return name + " has an unpaid fine of " + unpaidFine + " Tk";
        }
        if (loanCount >= MAX_LOANS) {
            return name + " already has " + MAX_LOANS + " books";
        }
        return null;
    }

    void loanStarted() {
        loanCount++;
    }

    void loanEnded(int fine) {
        loanCount--;
        unpaidFine += fine;
    }

    /** Pays up to the amount owed and returns how much was actually taken. */
    int pay(int amount) {
        int taken = Math.min(amount, unpaidFine);
        unpaidFine -= taken;
        return taken;
    }
}

/** One copy of a book lent to one member, with a due day. */
class Loan {
    static final int LOAN_DAYS = 14;
    static final int FINE_PER_DAY = 5;
    static final int MAX_FINE = 100;

    private final Book book;
    private final Member member;
    private final int dueDay;

    Loan(Book book, Member member, int issueDay) {
        this.book = book;
        this.member = member;
        this.dueDay = issueDay + LOAN_DAYS;
    }

    Book getBook() {
        return book;
    }

    Member getMember() {
        return member;
    }

    int getDueDay() {
        return dueDay;
    }

    int daysLate(int day) {
        return Math.max(0, day - dueDay);
    }

    /** 5 Tk per late day, capped at 100 Tk per loan (hypothetical rules). */
    int fineOn(int day) {
        return Math.min(MAX_FINE, daysLate(day) * FINE_PER_DAY);
    }
}

/** The library: it owns all lists and enforces every rule. */
class Library {
    private final ArrayList<Book> books = new ArrayList<>();
    private final ArrayList<Member> members = new ArrayList<>();
    private final ArrayList<Loan> loans = new ArrayList<>();
    private int today = 1;

    String addBook(String id, int copies, String title, String author) {
        if (findBook(id) != null) {
            return "Book ID " + id + " is already used";
        }
        if (copies < 1 || copies > 10) {
            return "Copies must be between 1 and 10";
        }
        if (title.isEmpty() || author.isEmpty()) {
            return "Title and author are required";
        }
        books.add(new Book(id, title, author, copies));
        return "Added book " + id + ": " + title;
    }

    String addMember(String id, String name) {
        if (findMember(id) != null) {
            return "Member ID " + id + " is already used";
        }
        members.add(new Member(id, name));
        return "Added member " + id + ": " + name;
    }

    String issue(String memberId, String bookId, int day) {
        Member member = findMember(memberId);
        Book book = findBook(bookId);
        if (member == null || book == null) {
            return "Unknown member or book";
        }
        if (day < today) {
            return "Day " + day + " is before today (day " + today + ")";
        }
        today = day;
        String blocker = member.borrowBlocker();
        if (blocker != null) {
            return "Refused: " + blocker;
        }
        if (findLoan(member, book) != null) {
            return "Refused: " + member.getName() + " already has " + book.getTitle();
        }
        if (!book.lendCopy()) {
            return "Refused: no copy of " + book.getTitle() + " is available";
        }
        Loan loan = new Loan(book, member, day);
        loans.add(loan);
        member.loanStarted();
        return book.getTitle() + " issued to " + member.getName()
                + ", due on day " + loan.getDueDay();
    }

    String giveBack(String memberId, String bookId, int day) {
        Member member = findMember(memberId);
        Book book = findBook(bookId);
        Loan loan = (member == null || book == null) ? null : findLoan(member, book);
        if (loan == null) {
            return "No such loan";
        }
        if (day < today) {
            return "Day " + day + " is before today (day " + today + ")";
        }
        today = day;
        int fine = loan.fineOn(day);
        loans.remove(loan);
        book.receiveCopy();
        member.loanEnded(fine);
        if (fine == 0) {
            return book.getTitle() + " returned on time";
        }
        return book.getTitle() + " returned " + loan.daysLate(day)
                + " day(s) late, fine " + fine + " Tk";
    }

    String pay(String memberId, int amount) {
        Member member = findMember(memberId);
        if (member == null) {
            return "Unknown member " + memberId;
        }
        if (amount <= 0) {
            return "Amount must be positive";
        }
        int taken = member.pay(amount);
        return member.getName() + " paid " + taken + " Tk, still owes "
                + member.getUnpaidFine() + " Tk";
    }

    ArrayList<Book> search(String keyword) {
        ArrayList<Book> found = new ArrayList<>();
        for (Book b : books) {
            if (b.matches(keyword)) {
                found.add(b);
            }
        }
        return found;
    }

    ArrayList<Book> getBooks() {
        return new ArrayList<>(books);
    }

    /** Loans that are past their due day on the given day, in issue order. */
    ArrayList<Loan> overdueOn(int day) {
        ArrayList<Loan> late = new ArrayList<>();
        for (Loan loan : loans) {
            if (loan.daysLate(day) > 0) {
                late.add(loan);
            }
        }
        return late;
    }

    private Book findBook(String id) {
        for (Book b : books) {
            if (b.getId().equalsIgnoreCase(id)) {
                return b;
            }
        }
        return null;
    }

    Member findMember(String id) {
        for (Member m : members) {
            if (m.getId().equalsIgnoreCase(id)) {
                return m;
            }
        }
        return null;
    }

    private Loan findLoan(Member member, Book book) {
        for (Loan loan : loans) {
            if (loan.getMember() == member && loan.getBook() == book) {
                return loan;
            }
        }
        return null;
    }
}

public class LibraryManagementSystem {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Library library = new Library();
        while (in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (line.isEmpty()) {
                continue;
            }
            System.out.println("> " + line);
            String[] w = line.split("\\s+");
            String command = w[0].toUpperCase();
            if (command.equals("QUIT")) {
                break;
            }
            if (command.equals("BOOK") && w.length >= 3 && isNumber(w[2])) {
                // BOOK <id> <copies> <title> | <author>
                String[] four = line.split("\\s+", 4);
                String text = four.length == 4 ? four[3] : "";
                String[] titleAuthor = text.split("\\|");
                String author = titleAuthor.length > 1 ? titleAuthor[1].trim() : "";
                System.out.println(library.addBook(w[1], Integer.parseInt(w[2]),
                        titleAuthor[0].trim(), author));
            } else if (command.equals("MEMBER") && w.length >= 3) {
                System.out.println(library.addMember(w[1], line.split("\\s+", 3)[2]));
            } else if (command.equals("ISSUE") && w.length == 4 && isNumber(w[3])) {
                System.out.println(library.issue(w[1], w[2], Integer.parseInt(w[3])));
            } else if (command.equals("RETURN") && w.length == 4 && isNumber(w[3])) {
                System.out.println(library.giveBack(w[1], w[2], Integer.parseInt(w[3])));
            } else if (command.equals("PAY") && w.length == 3 && isNumber(w[2])) {
                System.out.println(library.pay(w[1], Integer.parseInt(w[2])));
            } else if (command.equals("SEARCH") && w.length == 2) {
                printBooks(library.search(w[1]));
            } else if (command.equals("BOOKS")) {
                printBooks(library.getBooks());
            } else if (command.equals("OVERDUE") && w.length == 2 && isNumber(w[1])) {
                printOverdue(library.overdueOn(Integer.parseInt(w[1])),
                        Integer.parseInt(w[1]));
            } else if (command.equals("MEMBERINFO") && w.length == 2) {
                printMember(library.findMember(w[1]));
            } else {
                System.out.println("Invalid command");
            }
        }
    }

    private static void printBooks(ArrayList<Book> list) {
        if (list.isEmpty()) {
            System.out.println("No books found");
        }
        for (Book b : list) {
            System.out.println(b);
        }
    }

    private static void printOverdue(ArrayList<Loan> late, int day) {
        if (late.isEmpty()) {
            System.out.println("Nothing overdue on day " + day);
        }
        for (Loan loan : late) {
            System.out.printf("%-14s %-26s %2d day(s) late, fine so far %d Tk%n",
                    loan.getMember().getName(), loan.getBook().getTitle(),
                    loan.daysLate(day), loan.fineOn(day));
        }
    }

    private static void printMember(Member m) {
        if (m == null) {
            System.out.println("Unknown member");
            return;
        }
        System.out.println(m.getId() + " " + m.getName() + ": " + m.getLoanCount()
                + " book(s) on loan, unpaid fine " + m.getUnpaidFine() + " Tk");
    }

    /** True if text is 1 to 9 digits, so Integer.parseInt cannot fail. */
    private static boolean isNumber(String text) {
        if (text.isEmpty() || text.length() > 9) {
            return false;
        }
        for (int i = 0; i < text.length(); i++) {
            if (!Character.isDigit(text.charAt(i))) {
                return false;
            }
        }
        return true;
    }
}
```

**Input:**

```text
BOOK B101 2 Java for Beginners | Arif Hossain
BOOK B102 1 Data Structures in Java | Sadia Karim
BOOK B103 1 Discrete Mathematics | Imran Kabir
BOOK B104 0 Empty Shelf | Nobody
MEMBER M01 Nusrat Jahan
MEMBER M02 Rafi Ahmed
ISSUE M01 B101 1
ISSUE M01 B101 2
ISSUE M01 B102 2
ISSUE M01 B103 3
ISSUE M02 B102 3
ISSUE M02 B103 4
OVERDUE 20
RETURN M01 B101 20
ISSUE M01 B103 21
PAY M01 20
PAY M01 50
RETURN M02 B103 40
SEARCH java
MEMBERINFO M01
MEMBERINFO M02
BOOKS
ISSUE M02 B101 10
QUIT
BOOKS
```

**Output:**

```text
> BOOK B101 2 Java for Beginners | Arif Hossain
Added book B101: Java for Beginners
> BOOK B102 1 Data Structures in Java | Sadia Karim
Added book B102: Data Structures in Java
> BOOK B103 1 Discrete Mathematics | Imran Kabir
Added book B103: Discrete Mathematics
> BOOK B104 0 Empty Shelf | Nobody
Copies must be between 1 and 10
> MEMBER M01 Nusrat Jahan
Added member M01: Nusrat Jahan
> MEMBER M02 Rafi Ahmed
Added member M02: Rafi Ahmed
> ISSUE M01 B101 1
Java for Beginners issued to Nusrat Jahan, due on day 15
> ISSUE M01 B101 2
Refused: Nusrat Jahan already has Java for Beginners
> ISSUE M01 B102 2
Data Structures in Java issued to Nusrat Jahan, due on day 16
> ISSUE M01 B103 3
Refused: Nusrat Jahan already has 2 books
> ISSUE M02 B102 3
Refused: no copy of Data Structures in Java is available
> ISSUE M02 B103 4
Discrete Mathematics issued to Rafi Ahmed, due on day 18
> OVERDUE 20
Nusrat Jahan   Java for Beginners          5 day(s) late, fine so far 25 Tk
Nusrat Jahan   Data Structures in Java     4 day(s) late, fine so far 20 Tk
Rafi Ahmed     Discrete Mathematics        2 day(s) late, fine so far 10 Tk
> RETURN M01 B101 20
Java for Beginners returned 5 day(s) late, fine 25 Tk
> ISSUE M01 B103 21
Refused: Nusrat Jahan has an unpaid fine of 25 Tk
> PAY M01 20
Nusrat Jahan paid 20 Tk, still owes 5 Tk
> PAY M01 50
Nusrat Jahan paid 5 Tk, still owes 0 Tk
> RETURN M02 B103 40
Discrete Mathematics returned 22 day(s) late, fine 100 Tk
> SEARCH java
B101  Java for Beginners         Arif Hossain    2/2
B102  Data Structures in Java    Sadia Karim     0/1
> MEMBERINFO M01
M01 Nusrat Jahan: 1 book(s) on loan, unpaid fine 0 Tk
> MEMBERINFO M02
M02 Rafi Ahmed: 0 book(s) on loan, unpaid fine 100 Tk
> BOOKS
B101  Java for Beginners         Arif Hossain    2/2
B102  Data Structures in Java    Sadia Karim     0/1
B103  Discrete Mathematics       Imran Kabir     1/1
> ISSUE M02 B101 10
Day 10 is before today (day 40)
> QUIT
```

</details>

### How It Works

- **`Book`** keeps `totalCopies` (fixed, `final`) and `availableCopies` (changes). The
  only ways to change the count are `lendCopy()`, which refuses at zero, and
  `receiveCopy()`, which never goes above the total. The invariant
  `0 <= available <= total` therefore always holds. `matches` hides *how* searching
  works (lower-case both strings, check title and author): that is abstraction.
- **`Member`** knows its loan count and unpaid fine. `borrowBlocker()` returns `null`
  when borrowing is allowed and otherwise the reason, so the library can show a
  precise message. `pay` uses `Math.min` so a member can never pay more than owed.
- **`Loan`** computes the due day once in the constructor. `daysLate` and `fineOn` are
  pure calculations; the constants `LOAN_DAYS`, `FINE_PER_DAY` and `MAX_FINE` are
  `static final`, shared by all loans, and easy to change in one place.
- **`Library`** is the only class that sees all three lists. `issue` checks the rules
  in a fixed order and returns at the first problem (a "guard clause" style), so the
  happy path at the bottom runs only when everything is valid. It also remembers
  `today` so time can never run backwards. `findLoan` compares references with `==`
  because it asks "is this the *same* member object?", not "do they look equal?".
- **`LibraryManagementSystem`** splits each line into words. For `BOOK` it uses
  `split("\\s+", 4)` so the title and author (which contain spaces) stay in one piece,
  then splits that piece at `|`. Each command is checked for the right number of words
  and numeric fields before any `parseInt`, so bad input gives `Invalid command`.

### Extension Ideas

- Let members reserve a book that has no free copy; give it to the first reserver on
  return.
- Different member types (student: 2 books, 14 days; teacher: 5 books, 30 days). This
  is a natural place for inheritance, which Project 3 uses.
- A `HISTORY <member>` command that lists all past loans, not only active ones.
- Save the catalogue to a text file (see Project 4).

## Project 3: Banking System

A small bank offers two kinds of accounts that follow different rules. You build a
system where the *same* operations (deposit, withdraw, month-end) behave differently
for each account type, and where every refusal is a **custom checked exception**.

### Requirements

- Open a **savings** account (minimum opening deposit and minimum balance 500 Tk; earns
  6% yearly interest, added monthly) or a **current** account (no interest; may go
  below zero down to an overdraft limit of 10,000 Tk; a negative balance is charged 2%
  per month).
- Account numbers are generated automatically, starting at 1001.
- Deposit, withdraw and transfer. A withdrawal that would break the account's rule is
  refused with `InsufficientFundsException`, which also reports the shortfall.
- A transfer either fully happens or does not happen at all.
- Month-end applies each account's own rule. Every change is recorded in the account's
  transaction history, which can be printed as a statement.
- Errors (unknown account, non-positive amount, unknown type, badly formed command) are
  reported and the program continues.

| Command | Meaning |
|---|---|
| `OPEN <SAVINGS\|CURRENT> <deposit> <owner>` | open an account |
| `DEPOSIT <no> <amount>` / `WITHDRAW <no> <amount>` | change one account |
| `TRANSFER <from> <to> <amount>` | move money |
| `MONTHEND` | interest and overdraft charges |
| `STATEMENT <no>` / `ACCOUNTS` | reports |

### Class Design

```text
                 +-------------------------------+
                 | <<abstract>> Account          |
                 |  number, owner, balance       |
                 |  history: ArrayList<Trans.>   |
                 |  deposit(), withdraw()        |
                 |  availableToWithdraw() (abs.) |
                 |  monthEnd()            (abs.) |
                 +---------------+---------------+
                                 ^ extends
                   +-------------+-------------+
                   |                           |
        +----------+----------+     +----------+----------+
        | SavingsAccount      |     | CurrentAccount      |
        | min balance 500     |     | overdraft 10,000    |
        | monthEnd: interest  |     | monthEnd: OD charge |
        +---------------------+     +---------------------+

  Bank: ArrayList<Account>, open, find, transfer, monthEnd
  BankConsole: parses commands, catches exceptions, prints

           Exception
               ^
         BankException  (checked)
     ^         ^               ^
     |         |               |
 InvalidAmount AccountNotFound InsufficientFunds (+ shortfall)
```

### Concepts Used

- Chapter 09: Inheritance (`extends`, `super(...)`, `protected` helper methods,
  `@Override`)
- Chapter 10: Polymorphism, Abstract Classes and Interfaces (abstract class, abstract
  methods, dynamic method dispatch in `Bank.monthEnd`)
- Chapter 11: Exception Handling (custom checked exceptions, an exception hierarchy,
  `throws`, catch order from specific to general, multi-catch)
- Chapter 07: Static and Instance Members (a `static` counter for account numbers)
- Chapter 08: Arrays, Object References and Collections (`ArrayList<Transaction>`)

### The Program

The sample run tries both invalid openings, a withdrawal that breaks the savings
minimum, a negative amount, a transfer that uses the current account's overdraft, a
withdrawal beyond the overdraft, an unknown account and a non-numeric amount. Then the
month-end rules run and the statements show every transaction.

<details>
<summary>Full code and sample run: BankingSystem.java (about 350 lines)</summary>

```java
import java.util.ArrayList;
import java.util.Scanner;

/** Base class of every banking error. Checked: callers must handle it. */
class BankException extends Exception {
    BankException(String message) {
        super(message);
    }
}

class InvalidAmountException extends BankException {
    InvalidAmountException(String message) {
        super(message);
    }
}

class AccountNotFoundException extends BankException {
    AccountNotFoundException(int number) {
        super("no account with number " + number);
    }
}

class InsufficientFundsException extends BankException {
    private final double shortfall;

    InsufficientFundsException(String message, double shortfall) {
        super(message);
        this.shortfall = shortfall;
    }

    double getShortfall() {
        return shortfall;
    }
}

/** One line of an account statement. Immutable. */
class Transaction {
    private final int number;
    private final String type;
    private final double amount;
    private final double balanceAfter;

    Transaction(int number, String type, double amount, double balanceAfter) {
        this.number = number;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
    }

    @Override
    public String toString() {
        return String.format("%3d  %-12s %10.2f %12.2f",
                number, type, amount, balanceAfter);
    }
}

/** What every account has in common. The month-end rule differs per type. */
abstract class Account {
    private static int nextNumber = 1001;

    private final int number;
    private final String owner;
    private double balance;
    private final ArrayList<Transaction> history = new ArrayList<>();

    protected Account(String owner, double openingDeposit) {
        this.number = nextNumber;
        nextNumber++;
        this.owner = owner;
        this.balance = openingDeposit;
        record("OPEN", openingDeposit);
    }

    int getNumber() {
        return number;
    }

    String getOwner() {
        return owner;
    }

    double getBalance() {
        return balance;
    }

    ArrayList<Transaction> getHistory() {
        return new ArrayList<>(history);
    }

    void deposit(double amount, String label) throws InvalidAmountException {
        checkPositive(amount);
        balance += amount;
        record(label, amount);
    }

    void withdraw(double amount, String label)
            throws InvalidAmountException, InsufficientFundsException {
        checkPositive(amount);
        double available = availableToWithdraw();
        if (amount > available) {
            String message = String.format("account %d can pay out at most %.2f Tk",
                    number, available);
            throw new InsufficientFundsException(message, amount - available);
        }
        balance -= amount;
        record(label, amount);
    }

    /** Used by subclasses for interest and charges; no limit checks. */
    protected void adjust(String label, double change) {
        balance += change;
        record(label, Math.abs(change));
    }

    private void record(String label, double amount) {
        history.add(new Transaction(history.size() + 1, label, amount, balance));
    }

    private static void checkPositive(double amount) throws InvalidAmountException {
        if (amount <= 0) {
            throw new InvalidAmountException("amount must be positive");
        }
    }

    /** Rounds to whole paisa (2 decimal places). */
    protected static double roundTk(double value) {
        return Math.round(value * 100) / 100.0;
    }

    abstract String typeName();

    abstract double availableToWithdraw();

    abstract void monthEnd();
}

/** Earns interest; must keep a minimum balance. */
class SavingsAccount extends Account {
    static final double MIN_BALANCE = 500;
    static final double ANNUAL_RATE = 0.06;

    SavingsAccount(String owner, double openingDeposit) {
        super(owner, openingDeposit);
    }

    @Override
    String typeName() {
        return "Savings";
    }

    @Override
    double availableToWithdraw() {
        return Math.max(0, getBalance() - MIN_BALANCE);
    }

    @Override
    void monthEnd() {
        double interest = roundTk(getBalance() * ANNUAL_RATE / 12);
        if (interest > 0) {
            adjust("INTEREST", interest);
        }
    }
}

/** No interest, but may go below zero up to an overdraft limit. */
class CurrentAccount extends Account {
    static final double OVERDRAFT_LIMIT = 10000;
    static final double OVERDRAFT_MONTHLY_RATE = 0.02;

    CurrentAccount(String owner, double openingDeposit) {
        super(owner, openingDeposit);
    }

    @Override
    String typeName() {
        return "Current";
    }

    @Override
    double availableToWithdraw() {
        return getBalance() + OVERDRAFT_LIMIT;
    }

    @Override
    void monthEnd() {
        if (getBalance() < 0) {
            double charge = roundTk(-getBalance() * OVERDRAFT_MONTHLY_RATE);
            adjust("OD CHARGE", -charge);
        }
    }
}

/** The bank keeps the accounts and offers the operations customers use. */
class Bank {
    private final ArrayList<Account> accounts = new ArrayList<>();

    Account open(String type, String owner, double deposit) throws BankException {
        Account account;
        if (type.equals("SAVINGS")) {
            if (deposit < SavingsAccount.MIN_BALANCE) {
                String message = String.format("a savings account needs at least %.2f Tk",
                        SavingsAccount.MIN_BALANCE);
                throw new InvalidAmountException(message);
            }
            account = new SavingsAccount(owner, deposit);
        } else if (type.equals("CURRENT")) {
            if (deposit < 0) {
                throw new InvalidAmountException("opening deposit cannot be negative");
            }
            account = new CurrentAccount(owner, deposit);
        } else {
            throw new BankException("unknown account type " + type);
        }
        accounts.add(account);
        return account;
    }

    Account find(int number) throws AccountNotFoundException {
        for (Account a : accounts) {
            if (a.getNumber() == number) {
                return a;
            }
        }
        throw new AccountNotFoundException(number);
    }

    /** Withdraw first: if it fails, nothing has changed anywhere. */
    void transfer(int from, int to, double amount) throws BankException {
        Account source = find(from);
        Account target = find(to);
        if (source == target) {
            throw new BankException("cannot transfer to the same account");
        }
        source.withdraw(amount, "TO " + to);
        target.deposit(amount, "FROM " + from);
    }

    /** Runs each account's own month-end rule (dynamic method dispatch). */
    void monthEnd() {
        for (Account a : accounts) {
            a.monthEnd();
        }
    }

    ArrayList<Account> getAccounts() {
        return new ArrayList<>(accounts);
    }
}

/** Turns command lines into calls on the Bank and prints the results. */
class BankConsole {
    private final Bank bank = new Bank();

    void execute(String line) {
        System.out.println("> " + line);
        String[] w = line.split("\\s+");
        try {
            switch (w[0].toUpperCase()) {
                case "OPEN" -> open(line);
                case "DEPOSIT" -> {
                    bank.find(number(w, 1)).deposit(amount(w, 2), "DEPOSIT");
                    printBalance(number(w, 1));
                }
                case "WITHDRAW" -> {
                    bank.find(number(w, 1)).withdraw(amount(w, 2), "WITHDRAW");
                    printBalance(number(w, 1));
                }
                case "TRANSFER" -> {
                    bank.transfer(number(w, 1), number(w, 2), amount(w, 3));
                    printBalance(number(w, 1));
                    printBalance(number(w, 2));
                }
                case "MONTHEND" -> {
                    bank.monthEnd();
                    System.out.println("Month-end rules applied");
                }
                case "STATEMENT" -> statement(bank.find(number(w, 1)));
                case "ACCOUNTS" -> listAccounts();
                default -> System.out.println("Unknown command " + w[0]);
            }
        } catch (InsufficientFundsException e) {
            System.out.printf("Refused: %s (short by %.2f Tk)%n",
                    e.getMessage(), e.getShortfall());
        } catch (BankException e) {
            System.out.println("Error: " + e.getMessage());
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
            System.out.println("Error: badly formed command");
        }
    }

    private void open(String line) throws BankException {
        String[] parts = line.split("\\s+", 4);
        if (parts.length < 4) {
            throw new BankException("usage: OPEN <SAVINGS|CURRENT> <deposit> <owner>");
        }
        Account a = bank.open(parts[1].toUpperCase(), parts[3], amount(parts, 2));
        System.out.printf("Opened %s account %d for %s%n",
                a.typeName(), a.getNumber(), a.getOwner());
    }

    private void printBalance(int number) throws AccountNotFoundException {
        Account a = bank.find(number);
        System.out.printf("Account %d balance: %.2f Tk%n", number, a.getBalance());
    }

    private void statement(Account a) {
        System.out.println("Statement of " + a.getNumber() + " (" + a.typeName()
                + ", " + a.getOwner() + ")");
        System.out.printf("%3s  %-12s %10s %12s%n", "No", "Type", "Amount", "Balance");
        for (Transaction t : a.getHistory()) {
            System.out.println(t);
        }
    }

    private void listAccounts() {
        double total = 0;
        for (Account a : bank.getAccounts()) {
            System.out.printf("%d  %-8s %-14s %10.2f%n", a.getNumber(), a.typeName(),
                    a.getOwner(), a.getBalance());
            total += a.getBalance();
        }
        System.out.printf("Total held: %.2f Tk%n", total);
    }

    private static int number(String[] words, int index) {
        return Integer.parseInt(words[index]);
    }

    private static double amount(String[] words, int index) {
        return Double.parseDouble(words[index]);
    }
}

public class BankingSystem {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        BankConsole console = new BankConsole();
        while (in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (!line.isEmpty()) {
                console.execute(line);
            }
        }
        System.out.println("Bank closed for the day.");
    }
}
```

**Input:**

```text
OPEN SAVINGS 5000 Rahim Uddin
OPEN CURRENT 2000 Karim Traders
OPEN SAVINGS 300 Mitu Akter
OPEN FIXED 1000 Sadia Islam
DEPOSIT 1001 1500
WITHDRAW 1001 6200
WITHDRAW 1001 -50
TRANSFER 1002 1001 5000
WITHDRAW 1002 8000
TRANSFER 1001 1009 100
DEPOSIT 1002 abc
MONTHEND
STATEMENT 1001
STATEMENT 1002
ACCOUNTS
```

**Output:**

```text
> OPEN SAVINGS 5000 Rahim Uddin
Opened Savings account 1001 for Rahim Uddin
> OPEN CURRENT 2000 Karim Traders
Opened Current account 1002 for Karim Traders
> OPEN SAVINGS 300 Mitu Akter
Error: a savings account needs at least 500.00 Tk
> OPEN FIXED 1000 Sadia Islam
Error: unknown account type FIXED
> DEPOSIT 1001 1500
Account 1001 balance: 6500.00 Tk
> WITHDRAW 1001 6200
Refused: account 1001 can pay out at most 6000.00 Tk (short by 200.00 Tk)
> WITHDRAW 1001 -50
Error: amount must be positive
> TRANSFER 1002 1001 5000
Account 1002 balance: -3000.00 Tk
Account 1001 balance: 11500.00 Tk
> WITHDRAW 1002 8000
Refused: account 1002 can pay out at most 7000.00 Tk (short by 1000.00 Tk)
> TRANSFER 1001 1009 100
Error: no account with number 1009
> DEPOSIT 1002 abc
Error: badly formed command
> MONTHEND
Month-end rules applied
> STATEMENT 1001
Statement of 1001 (Savings, Rahim Uddin)
 No  Type             Amount      Balance
  1  OPEN            5000.00      5000.00
  2  DEPOSIT         1500.00      6500.00
  3  FROM 1002       5000.00     11500.00
  4  INTEREST          57.50     11557.50
> STATEMENT 1002
Statement of 1002 (Current, Karim Traders)
 No  Type             Amount      Balance
  1  OPEN            2000.00      2000.00
  2  TO 1001         5000.00     -3000.00
  3  OD CHARGE         60.00     -3060.00
> ACCOUNTS
1001  Savings  Rahim Uddin      11557.50
1002  Current  Karim Traders    -3060.00
Total held: 8497.50 Tk
Bank closed for the day.
```

</details>

### How It Works

- **The exceptions** form a small hierarchy under `BankException`, which extends
  `Exception`, so all of them are *checked*: the compiler forces every caller to catch
  or declare them. `InsufficientFundsException` carries extra data (the shortfall)
  besides its message. `BankConsole` catches it first, then the general
  `BankException`; the reverse order would not compile, because the specific catch
  would be unreachable.
- **`Transaction`** is immutable: one statement line, created and never changed.
- **`Account`** is `abstract`: you cannot create a plain "account", only a savings or
  current one. It keeps `balance` private; subclasses change it only through
  `deposit`, `withdraw` and the `protected` method `adjust`. `withdraw` is written once
  and asks the abstract method `availableToWithdraw()` how much may be paid out. Each
  subclass answers differently: that is the *template* idea, shared steps in the
  superclass and the varying step in the subclasses.
- **`SavingsAccount`** allows paying out only down to 500 Tk and adds interest of
  `balance * 6% / 12` at month-end, rounded to whole paisa by `roundTk`.
- **`CurrentAccount`** allows going down to -10,000 Tk and charges 2% on a negative
  balance at month-end.
- **`Bank.monthEnd`** loops over `ArrayList<Account>` and calls `a.monthEnd()`. The JVM
  picks the method of the *actual* object (dynamic method dispatch), so there is no
  `if (type == ...)` anywhere. `transfer` withdraws first: if that throws, the deposit
  line is never reached and no money has moved.
- **`BankConsole`** turns text into calls. `number` and `amount` use `parseInt` and
  `parseDouble`; a bad number throws `NumberFormatException` and a missing word throws
  `ArrayIndexOutOfBoundsException`, both caught by one multi-catch.
- The account number counter is `static`: one counter shared by all accounts. A failed
  opening never reaches the constructor, so no number is wasted.

### Extension Ideas

- A `FixedDepositAccount` that refuses all withdrawals before a maturity month and pays
  a higher rate. Only a new subclass is needed; `Bank` does not change.
- Limit savings accounts to 4 withdrawals per month (reset in `monthEnd`).
- Store money as `long` paisa instead of `double` and compare the two designs.
- A `CLOSE <no>` command that refuses to close an account with a negative balance.

## Project 4: Inventory Management System

A campus stationery shop tracks products, suppliers and stock levels, and must keep
its data between runs. You build a **generic repository** that stores any kind of
object with an ID, use it twice (for suppliers and for products), sort the stock with
`Comparator`s, and save everything to a text file.

### Requirements

- Add suppliers (ID, name) and products (ID, name, supplier ID, quantity, unit price
  in Tk, reorder level). A product's supplier must exist; numbers must be valid and not
  negative; IDs must be unique.
- Sell (refuse if not enough stock) and restock products; remove a product.
- Low-stock report: every product whose quantity is at or below its reorder level,
  with the supplier to contact.
- List products sorted by name, by quantity (lowest first) or by stock value (highest
  first). Report the total stock value.
- `SAVE <file>` writes all data to a text file in the working directory;
  `LOAD <file>` reads it back and replaces the data in memory, but only if the whole
  file is valid. A missing file gives a message, not a crash.

| Command | Meaning |
|---|---|
| `SUPPLIER <id>,<name>` | add a supplier |
| `PRODUCT <id>,<name>,<supplier>,<qty>,<price>,<reorder>` | add a product |
| `SELL <id> <qty>` / `RESTOCK <id> <qty>` / `REMOVE <id>` | change stock |
| `LOWSTOCK` / `LIST <name\|quantity\|value>` / `REPORT` | reports |
| `SAVE <file>` / `LOAD <file>` / `CLEAR` | persistence |

### Class Design

```text
   <<interface>> Identifiable
        getId()
          ^            ^
          | implements |
   +------+----+  +----+-----------------------+
   | Supplier  |  | Product                    |
   | id, name  |  | id, name, supplierId       |
   +-----------+  | quantity, price, reorder   |
                  | sell(), restock(),         |
                  | isLowStock(), toFileLine() |
                  +----------------------------+

   Repository<T extends Identifiable>     (one class, used twice)
     items: ArrayList<T>
     add(T), findById(id), remove(id), findAll()

   Inventory
     suppliers: Repository<Supplier>
     products:  Repository<Product>
     sell, restock, sorted(key), lowStock, save(file), load(file)

   InventoryManagementSystem: command loop, catches exceptions

   inventory.txt  <--- PrintWriter (save)
                  ---> BufferedReader (load)
```

### Concepts Used

- Chapter 13: Generic Programming (a generic class `Repository<T>`, a bounded type
  parameter `T extends Identifiable`, `Comparator<Product>`, a short lambda)
- Chapter 12: Object-Oriented I/O (`PrintWriter` over `FileWriter`, `BufferedReader`
  over `FileReader`, try-with-resources, CSV lines with `split`)
- Chapter 11: Exception Handling (a custom checked `InventoryException`, wrapping a
  low-level error into a clearer one, `FileNotFoundException` vs `IOException`)
- Chapter 10: Polymorphism, Abstract Classes and Interfaces (the `Identifiable`
  interface)
- Chapter 08: Arrays, Object References and Collections

### The Program

The sample run adds suppliers and products (three of them invalid), sells, restocks,
prints the low-stock report and two sorted lists, then saves. `CLEAR` empties memory,
a load from a missing file fails safely, and loading `inventory.txt` brings
everything back. The program creates `inventory.txt` itself during the run; its
expected content is shown after the output.

<details>
<summary>Full code and sample run: InventoryManagementSystem.java (about 390 lines)</summary>

```java
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Scanner;

/** Anything that can be stored in a Repository needs a unique ID. */
interface Identifiable {
    String getId();
}

/** A generic in-memory store. T is any type that has an ID. */
class Repository<T extends Identifiable> {
    private final ArrayList<T> items = new ArrayList<>();

    boolean add(T item) {
        if (findById(item.getId()) != null) {
            return false;
        }
        items.add(item);
        return true;
    }

    T findById(String id) {
        for (T item : items) {
            if (item.getId().equalsIgnoreCase(id)) {
                return item;
            }
        }
        return null;
    }

    boolean remove(String id) {
        T item = findById(id);
        if (item == null) {
            return false;
        }
        items.remove(item);
        return true;
    }

    /** A copy, so callers can sort it without changing the repository. */
    ArrayList<T> findAll() {
        return new ArrayList<>(items);
    }

    int size() {
        return items.size();
    }
}

/** Thrown for any rule the inventory refuses (unknown ID, bad quantity, bad file). */
class InventoryException extends Exception {
    InventoryException(String message) {
        super(message);
    }
}

class Supplier implements Identifiable {
    private final String id;
    private final String name;

    Supplier(String id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public String getId() {
        return id;
    }

    String getName() {
        return name;
    }

    String toFileLine() {
        return "SUPPLIER," + id + "," + name;
    }
}

class Product implements Identifiable {
    private final String id;
    private final String name;
    private final String supplierId;
    private final int unitPrice;
    private final int reorderLevel;
    private int quantity;

    Product(String id, String name, String supplierId, int quantity, int unitPrice,
            int reorderLevel) {
        this.id = id;
        this.name = name;
        this.supplierId = supplierId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.reorderLevel = reorderLevel;
    }

    @Override
    public String getId() {
        return id;
    }

    String getName() {
        return name;
    }

    String getSupplierId() {
        return supplierId;
    }

    int getQuantity() {
        return quantity;
    }

    int getReorderLevel() {
        return reorderLevel;
    }

    int stockValue() {
        return quantity * unitPrice;
    }

    boolean isLowStock() {
        return quantity <= reorderLevel;
    }

    void restock(int amount) {
        quantity += amount;
    }

    boolean sell(int amount) {
        if (amount > quantity) {
            return false;
        }
        quantity -= amount;
        return true;
    }

    String toFileLine() {
        return "PRODUCT," + id + "," + name + "," + supplierId + "," + quantity + ","
                + unitPrice + "," + reorderLevel;
    }

    @Override
    public String toString() {
        return String.format("%-5s %-18s %4d x %4d Tk = %6d Tk", id, name, quantity,
                unitPrice, stockValue());
    }
}

/** The business rules: uses two repositories and saves/loads a text file. */
class Inventory {
    private Repository<Supplier> suppliers = new Repository<>();
    private Repository<Product> products = new Repository<>();

    void addSupplier(String[] f) throws InventoryException {
        // f = {id, name}
        if (f.length != 2) {
            throw new InventoryException("supplier needs id,name");
        }
        if (!suppliers.add(new Supplier(f[0].trim(), f[1].trim()))) {
            throw new InventoryException("supplier " + f[0] + " already exists");
        }
    }

    void addProduct(String[] f) throws InventoryException {
        // f = {id, name, supplierId, quantity, unitPrice, reorderLevel}
        if (f.length != 6) {
            throw new InventoryException("product needs 6 fields");
        }
        if (suppliers.findById(f[2].trim()) == null) {
            throw new InventoryException("unknown supplier " + f[2]);
        }
        int quantity = toNumber(f[3]);
        int price = toNumber(f[4]);
        int reorder = toNumber(f[5]);
        Product p = new Product(f[0].trim(), f[1].trim(), f[2].trim(), quantity, price,
                reorder);
        if (!products.add(p)) {
            throw new InventoryException("product " + f[0] + " already exists");
        }
    }

    Product product(String id) throws InventoryException {
        Product p = products.findById(id);
        if (p == null) {
            throw new InventoryException("unknown product " + id);
        }
        return p;
    }

    void sell(String id, int amount) throws InventoryException {
        Product p = product(id);
        if (amount <= 0 || !p.sell(amount)) {
            throw new InventoryException("cannot sell " + amount + " of " + p.getName()
                    + " (in stock: " + p.getQuantity() + ")");
        }
    }

    void restock(String id, int amount) throws InventoryException {
        if (amount <= 0) {
            throw new InventoryException("restock amount must be positive");
        }
        product(id).restock(amount);
    }

    void remove(String id) throws InventoryException {
        if (!products.remove(id)) {
            throw new InventoryException("unknown product " + id);
        }
    }

    /** All products, sorted by the chosen key with a Comparator. */
    ArrayList<Product> sorted(String key) throws InventoryException {
        Comparator<Product> order;
        if (key.equals("name")) {
            order = (a, b) -> a.getName().compareTo(b.getName());
        } else if (key.equals("quantity")) {
            order = (a, b) -> Integer.compare(a.getQuantity(), b.getQuantity());
        } else if (key.equals("value")) {
            order = (a, b) -> Integer.compare(b.stockValue(), a.stockValue());
        } else {
            throw new InventoryException("sort by name, quantity or value");
        }
        ArrayList<Product> list = products.findAll();
        list.sort(order);
        return list;
    }

    ArrayList<Product> lowStock() {
        ArrayList<Product> low = new ArrayList<>();
        for (Product p : products.findAll()) {
            if (p.isLowStock()) {
                low.add(p);
            }
        }
        return low;
    }

    long totalValue() {
        long total = 0;
        for (Product p : products.findAll()) {
            total += p.stockValue();
        }
        return total;
    }

    String supplierName(String id) {
        Supplier s = suppliers.findById(id);
        return s == null ? "?" : s.getName();
    }

    int productCount() {
        return products.size();
    }

    void clear() {
        suppliers = new Repository<>();
        products = new Repository<>();
    }

    void save(String fileName) throws IOException {
        try (PrintWriter out = new PrintWriter(new FileWriter(fileName))) {
            for (Supplier s : suppliers.findAll()) {
                out.println(s.toFileLine());
            }
            for (Product p : products.findAll()) {
                out.println(p.toFileLine());
            }
        }
    }

    /** Loads into a fresh Inventory; keeps the old data if any line is bad. */
    void load(String fileName) throws IOException, InventoryException {
        Inventory fresh = new Inventory();
        try (BufferedReader reader = new BufferedReader(new FileReader(fileName))) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String[] parts = line.split(",", 2);
                try {
                    if (parts[0].equals("SUPPLIER") && parts.length == 2) {
                        fresh.addSupplier(parts[1].split(","));
                    } else if (parts[0].equals("PRODUCT") && parts.length == 2) {
                        fresh.addProduct(parts[1].split(","));
                    } else {
                        throw new InventoryException("unknown record type");
                    }
                } catch (InventoryException e) {
                    throw new InventoryException(fileName + " line " + lineNumber + ": "
                            + e.getMessage());
                }
            }
        }
        suppliers = fresh.suppliers;
        products = fresh.products;
    }

    private static int toNumber(String text) throws InventoryException {
        try {
            int value = Integer.parseInt(text.trim());
            if (value < 0) {
                throw new InventoryException("negative number " + value);
            }
            return value;
        } catch (NumberFormatException e) {
            throw new InventoryException("not a number: " + text.trim());
        }
    }
}

public class InventoryManagementSystem {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Inventory inventory = new Inventory();
        while (in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (line.isEmpty()) {
                continue;
            }
            System.out.println("> " + line);
            String[] w = line.split("\\s+", 2);
            String arg = w.length > 1 ? w[1].trim() : "";
            try {
                run(inventory, w[0].toUpperCase(), arg);
            } catch (FileNotFoundException e) {
                System.out.println("Error: cannot open file " + arg);
            } catch (IOException e) {
                System.out.println("Error: file problem: " + e.getMessage());
            } catch (InventoryException e) {
                System.out.println("Error: " + e.getMessage());
            } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                System.out.println("Error: badly formed command");
            }
        }
    }

    private static void run(Inventory inv, String command, String arg)
            throws IOException, InventoryException {
        String[] a = arg.split("\\s+");
        switch (command) {
            case "SUPPLIER" -> inv.addSupplier(arg.split(","));
            case "PRODUCT" -> inv.addProduct(arg.split(","));
            case "SELL" -> inv.sell(a[0], Integer.parseInt(a[1]));
            case "RESTOCK" -> inv.restock(a[0], Integer.parseInt(a[1]));
            case "REMOVE" -> inv.remove(arg);
            case "LIST" -> {
                for (Product p : inv.sorted(arg.isEmpty() ? "name" : arg)) {
                    System.out.println(p);
                }
            }
            case "LOWSTOCK" -> lowStockReport(inv);
            case "REPORT" -> System.out.println(inv.productCount()
                    + " product(s), stock value " + inv.totalValue() + " Tk");
            case "SAVE" -> inv.save(arg);
            case "CLEAR" -> inv.clear();
            case "LOAD" -> inv.load(arg);
            default -> {
                System.out.println("Unknown command " + command);
                return;
            }
        }
        if (!command.equals("LIST") && !command.equals("LOWSTOCK")
                && !command.equals("REPORT")) {
            System.out.println("OK");
        }
    }

    private static void lowStockReport(Inventory inv) {
        ArrayList<Product> low = inv.lowStock();
        if (low.isEmpty()) {
            System.out.println("All products are above their reorder level");
        }
        for (Product p : low) {
            System.out.printf("REORDER %-18s have %3d, level %3d, supplier %s%n",
                    p.getName(), p.getQuantity(), p.getReorderLevel(),
                    inv.supplierName(p.getSupplierId()));
        }
    }
}
```

**Input:**

```text
SUPPLIER S1,Rahman Traders
SUPPLIER S2,Campus Print House
SUPPLIER S1,Duplicate Ltd
PRODUCT P101,Blue Pen,S1,200,10,50
PRODUCT P102,A4 Notebook,S2,60,45,20
PRODUCT P103,Lab Coat,S1,12,350,5
PRODUCT P104,Whiteboard Marker,S2,40,60,10
PRODUCT P105,Calculator,S3,10,900,3
PRODUCT P106,Graph Paper,S2,ten,5,30
SELL P101 170
SELL P103 20
RESTOCK P102 15
SELL P102 60
LOWSTOCK
LIST quantity
LIST value
SAVE inventory.txt
CLEAR
REPORT
LOAD missing.txt
LOAD inventory.txt
REPORT
LIST name
LIST price
```

**Output:**

```text
> SUPPLIER S1,Rahman Traders
OK
> SUPPLIER S2,Campus Print House
OK
> SUPPLIER S1,Duplicate Ltd
Error: supplier S1 already exists
> PRODUCT P101,Blue Pen,S1,200,10,50
OK
> PRODUCT P102,A4 Notebook,S2,60,45,20
OK
> PRODUCT P103,Lab Coat,S1,12,350,5
OK
> PRODUCT P104,Whiteboard Marker,S2,40,60,10
OK
> PRODUCT P105,Calculator,S3,10,900,3
Error: unknown supplier S3
> PRODUCT P106,Graph Paper,S2,ten,5,30
Error: not a number: ten
> SELL P101 170
OK
> SELL P103 20
Error: cannot sell 20 of Lab Coat (in stock: 12)
> RESTOCK P102 15
OK
> SELL P102 60
OK
> LOWSTOCK
REORDER Blue Pen           have  30, level  50, supplier Rahman Traders
REORDER A4 Notebook        have  15, level  20, supplier Campus Print House
> LIST quantity
P103  Lab Coat             12 x  350 Tk =   4200 Tk
P102  A4 Notebook          15 x   45 Tk =    675 Tk
P101  Blue Pen             30 x   10 Tk =    300 Tk
P104  Whiteboard Marker    40 x   60 Tk =   2400 Tk
> LIST value
P103  Lab Coat             12 x  350 Tk =   4200 Tk
P104  Whiteboard Marker    40 x   60 Tk =   2400 Tk
P102  A4 Notebook          15 x   45 Tk =    675 Tk
P101  Blue Pen             30 x   10 Tk =    300 Tk
> SAVE inventory.txt
OK
> CLEAR
OK
> REPORT
0 product(s), stock value 0 Tk
> LOAD missing.txt
Error: cannot open file missing.txt
> LOAD inventory.txt
OK
> REPORT
4 product(s), stock value 7575 Tk
> LIST name
P102  A4 Notebook          15 x   45 Tk =    675 Tk
P101  Blue Pen             30 x   10 Tk =    300 Tk
P103  Lab Coat             12 x  350 Tk =   4200 Tk
P104  Whiteboard Marker    40 x   60 Tk =   2400 Tk
> LIST price
Error: sort by name, quantity or value
```

**Output file `inventory.txt`:**

```text
SUPPLIER,S1,Rahman Traders
SUPPLIER,S2,Campus Print House
PRODUCT,P101,Blue Pen,S1,30,10,50
PRODUCT,P102,A4 Notebook,S2,15,45,20
PRODUCT,P103,Lab Coat,S1,12,350,5
PRODUCT,P104,Whiteboard Marker,S2,40,60,10
```

</details>

### How It Works

- **`Identifiable`** is a one-method interface. Anything that can say `getId()` can be
  stored in a repository.
- **`Repository<T extends Identifiable>`** is written once and works for any such type.
  The bound `extends Identifiable` is what allows the code inside to call
  `item.getId()`: without it, `T` could be any type and the compiler would refuse.
  `Repository<Supplier>` and `Repository<Product>` are two uses of the same class, and
  each is type-safe: you cannot put a `Supplier` into the product repository, and
  `findById` on it returns a `Product` with no cast.
- **`Product`** guards its own stock: `sell` returns `false` instead of going negative.
  `toFileLine` builds the CSV line for saving, so the file format of a product is
  defined in the product class.
- **`Inventory`** holds the rules. `sorted` chooses a `Comparator<Product>`. A
  comparator is an object with one method, `compare(a, b)`, that returns a negative
  number when `a` should come first, zero for a tie and a positive number when `b`
  should come first. The lambda `(a, b) -> Integer.compare(a.getQuantity(),
  b.getQuantity())` is a short way to write such an object (Chapter 13). Swapping `a`
  and `b`, as in the value comparator, gives descending order. `list.sort(order)` sorts
  a *copy*, so the repository keeps its insertion order.
- **Saving** uses `new PrintWriter(new FileWriter(fileName))`: the writer is wrapped in
  a printer that offers `println` (the decorator idea from Chapter 12).
  Try-with-resources closes the file, which also flushes the data to disk.
- **Loading** reads with `BufferedReader.readLine()` until it returns `null`. Each line
  is fed to the *same* `addSupplier`/`addProduct` methods that commands use, so the
  file is validated by exactly the same rules. The data goes into a fresh `Inventory`
  first; only when the whole file was read successfully are the repositories swapped
  in. A bad line is reported with its line number and the old data stays untouched.
- **`main`** catches `FileNotFoundException` before `IOException`, because it is a
  subclass and deserves a friendlier message.

### Extension Ideas

- `LOAD` reports how many suppliers and products were read.
- Keep a sales log: every `SELL` is appended to `sales.txt` with
  `new FileWriter(name, true)` (append mode).
- A `PRICE <id> <new price>` command with validation, and a report of the five most
  valuable products.
- Make `Repository` also offer `findAll(Comparator<T> order)` that returns a sorted
  copy, and use it for both suppliers and products.

## Project 5: Course Registration System

Every trimester students register for courses. Courses have limited seats and
prerequisites; students have a credit limit that depends on their CGPA; a full course
puts students on a waitlist that moves when someone drops. You build this system with
**interfaces** for the rules, **maps** for fast lookups, and **file save/load**.

### Requirements

- Add courses (code, credits, seat capacity, title) and prerequisites between courses.
- Add students (ID, CGPA, name) and mark courses they have completed.
- Register a student in a course. These rules are checked in order:
  1. not already registered in, or completed, the course;
  2. all prerequisites completed;
  3. the new total stays within the credit limit (hypothetical: 9 credits when CGPA is
     below 2.00, otherwise 15).
- If all rules pass but the course is full, the student joins the end of the waitlist.
- Dropping a course frees a seat. The seat goes to the first waiting student *who
  still passes the rules*; students who no longer qualify are removed from the
  waitlist with a message.
- `COURSES` lists all courses in code order; output order must not depend on the order
  of insertion.
- `SAVE`/`LOAD` store and restore everything, including enrolment and waitlist order.

| Command | Meaning |
|---|---|
| `COURSE <code> <credits> <capacity> <title>` | add a course |
| `PREREQ <course> <required course>` | add a prerequisite |
| `STUDENT <id> <cgpa> <name>` / `DONE <id> <course>` | add student / completed course |
| `REGISTER <id> <course>` / `DROP <id> <course>` | register / drop |
| `COURSES` | table of all courses |
| `SAVE <file>` / `LOAD <file>` | persistence |

### Class Design

```text
  <<interface>> RegistrationRule
      String check(Student, Course)   null = allowed, else the reason
         ^              ^                ^
   NotTakenRule   PrerequisiteRule   CreditLimitRule

  +---------------------------------------------+
  | Registry                                    |
  |  courses:  Map<String, Course>  (TreeMap)   |
  |  students: Map<String, Student> (TreeMap)   |
  |  rules:    RegistrationRule[]               |
  |  register(), drop(), printCourses()         |
  |  save(file), static load(file)              |
  +------------+-----------------------+--------+
               |                       |
               v                       v
  +------------------------+  +------------------------+
  | Course                 |  | Student                |
  |  code, title, credits  |  |  id, name, cgpa        |
  |  capacity              |  |  completed: TreeSet    |
  |  prerequisites: List   |  |  registered: TreeSet   |
  |  enrolled: List        |  |  registeredCredits     |
  |  waitlist: List (FIFO) |  |  creditLimit()         |
  +------------------------+  +------------------------+

  CourseRegistrationSystem: command loop, catches RegistrationException
```

### Concepts Used

- Chapter 10: Polymorphism, Abstract Classes and Interfaces (one interface, three
  implementations, an array of the interface type, interface-based polymorphism)
- Chapter 13: Generic Programming (`Map<String, Course>` with `TreeMap`, `TreeSet`,
  `List.of`)
- Chapter 11: Exception Handling (a custom checked exception, catching it inside a
  loop to skip one waitlisted student and continue)
- Chapter 12: Object-Oriented I/O (saving and loading a `|`-separated text file)
- Chapter 08: Arrays, Object References and Collections (`ArrayList` as a FIFO
  waitlist)

### The Program

The sample run adds six courses out of alphabetical order and six students. Tanvir is
refused for a missing prerequisite; CSE1115 fills up and three students join its
waitlist (one tries twice). Mitu, on probation, reaches her 9-credit limit. When
Nusrat drops CSE1115, Mitu is first in line but no longer fits her credit limit, so
she is skipped and Sadia gets the seat. Then the data is saved, a course is added
*after* saving, and loading the file brings back exactly the saved state (the new
course disappears).

<details>
<summary>Full code and sample run: CourseRegistrationSystem.java (about 410 lines)</summary>

```java
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;
import java.util.TreeSet;

class RegistrationException extends Exception {
    RegistrationException(String message) {
        super(message);
    }
}

/** A course section with a seat limit, prerequisites and a waitlist. */
class Course {
    private final String code;
    private final String title;
    private final int credits;
    private final int capacity;
    private final ArrayList<String> prerequisites = new ArrayList<>();
    private final ArrayList<String> enrolled = new ArrayList<>();
    private final ArrayList<String> waitlist = new ArrayList<>();

    Course(String code, int credits, int capacity, String title) {
        this.code = code;
        this.credits = credits;
        this.capacity = capacity;
        this.title = title;
    }

    String getCode() {
        return code;
    }

    String getTitle() {
        return title;
    }

    int getCredits() {
        return credits;
    }

    int getCapacity() {
        return capacity;
    }

    boolean isFull() {
        return enrolled.size() >= capacity;
    }

    void addPrerequisite(String courseCode) {
        prerequisites.add(courseCode);
    }

    ArrayList<String> getPrerequisites() {
        return new ArrayList<>(prerequisites);
    }

    ArrayList<String> getEnrolled() {
        return new ArrayList<>(enrolled);
    }

    ArrayList<String> getWaitlist() {
        return new ArrayList<>(waitlist);
    }

    void enroll(String studentId) {
        enrolled.add(studentId);
    }

    void unenroll(String studentId) {
        enrolled.remove(studentId);
    }

    void joinWaitlist(String studentId) {
        waitlist.add(studentId);
    }

    int waitlistPosition(String studentId) {
        return waitlist.indexOf(studentId) + 1;
    }

    String nextWaiting() {
        return waitlist.isEmpty() ? null : waitlist.remove(0);
    }
}

class Student {
    private final String id;
    private final String name;
    private final double cgpa;
    private final TreeSet<String> completed = new TreeSet<>();
    private final TreeSet<String> registered = new TreeSet<>();
    private int registeredCredits;

    Student(String id, double cgpa, String name) {
        this.id = id;
        this.cgpa = cgpa;
        this.name = name;
    }

    String getId() {
        return id;
    }

    String getName() {
        return name;
    }

    double getCgpa() {
        return cgpa;
    }

    int getRegisteredCredits() {
        return registeredCredits;
    }

    // Hypothetical rule: 9 credits on probation (CGPA below 2.00), otherwise 15.
    int creditLimit() {
        return cgpa < 2.0 ? 9 : 15;
    }

    boolean hasCompleted(String code) {
        return completed.contains(code);
    }

    boolean isRegistered(String code) {
        return registered.contains(code);
    }

    void markCompleted(String code) {
        completed.add(code);
    }

    void addRegistration(Course c) {
        registered.add(c.getCode());
        registeredCredits += c.getCredits();
    }

    void removeRegistration(Course c) {
        registered.remove(c.getCode());
        registeredCredits -= c.getCredits();
    }

    TreeSet<String> getCompleted() {
        return new TreeSet<>(completed);
    }
}

/** A registration rule: returns null when allowed, otherwise the reason it is not. */
interface RegistrationRule {
    String check(Student student, Course course);
}

class NotTakenRule implements RegistrationRule {
    @Override
    public String check(Student s, Course c) {
        if (s.hasCompleted(c.getCode())) {
            return s.getName() + " has already completed " + c.getCode();
        }
        if (s.isRegistered(c.getCode())) {
            return s.getName() + " is already registered in " + c.getCode();
        }
        return null;
    }
}

class PrerequisiteRule implements RegistrationRule {
    @Override
    public String check(Student s, Course c) {
        for (String pre : c.getPrerequisites()) {
            if (!s.hasCompleted(pre)) {
                return s.getName() + " has not completed " + pre + ", needed for "
                        + c.getCode();
            }
        }
        return null;
    }
}

class CreditLimitRule implements RegistrationRule {
    @Override
    public String check(Student s, Course c) {
        int total = s.getRegisteredCredits() + c.getCredits();
        if (total > s.creditLimit()) {
            return s.getName() + " would have " + total + " credits (limit "
                    + s.creditLimit() + ")";
        }
        return null;
    }
}

/** All courses and students, looked up by key in sorted TreeMaps. */
class Registry {
    private final Map<String, Course> courses = new TreeMap<>();
    private final Map<String, Student> students = new TreeMap<>();
    private final RegistrationRule[] rules = {
        new NotTakenRule(), new PrerequisiteRule(), new CreditLimitRule()
    };

    void addCourse(String code, int credits, int capacity, String title)
            throws RegistrationException {
        if (courses.containsKey(code)) {
            throw new RegistrationException("course " + code + " already exists");
        }
        courses.put(code, new Course(code, credits, capacity, title));
    }

    void addPrerequisite(String code, String pre) throws RegistrationException {
        course(pre);
        course(code).addPrerequisite(pre);
    }

    void addStudent(String id, double cgpa, String name) throws RegistrationException {
        if (students.containsKey(id)) {
            throw new RegistrationException("student " + id + " already exists");
        }
        students.put(id, new Student(id, cgpa, name));
    }

    void markCompleted(String id, String code) throws RegistrationException {
        student(id).markCompleted(course(code).getCode());
    }

    Course course(String code) throws RegistrationException {
        Course c = courses.get(code);
        if (c == null) {
            throw new RegistrationException("unknown course " + code);
        }
        return c;
    }

    Student student(String id) throws RegistrationException {
        Student s = students.get(id);
        if (s == null) {
            throw new RegistrationException("unknown student " + id);
        }
        return s;
    }

    String register(String id, String code) throws RegistrationException {
        Student s = student(id);
        Course c = course(code);
        if (c.waitlistPosition(id) > 0) {
            throw new RegistrationException(s.getName() + " is already waiting");
        }
        checkRules(s, c);
        if (c.isFull()) {
            c.joinWaitlist(id);
            return code + " is full: " + s.getName() + " is #" + c.waitlistPosition(id)
                    + " on the waitlist";
        }
        enroll(s, c);
        return s.getName() + " registered in " + code + " (" + s.getRegisteredCredits()
                + " credits)";
    }

    void drop(String id, String code) throws RegistrationException {
        Student s = student(id);
        Course c = course(code);
        if (!s.isRegistered(code)) {
            throw new RegistrationException(s.getName() + " is not in " + code);
        }
        c.unenroll(id);
        s.removeRegistration(c);
        System.out.println(s.getName() + " dropped " + code);
        // A seat is free: offer it to waiting students in order.
        while (!c.isFull()) {
            String nextId = c.nextWaiting();
            if (nextId == null) {
                break;
            }
            Student next = students.get(nextId);
            try {
                checkRules(next, c);
                enroll(next, c);
                System.out.println(next.getName() + " got the free seat in " + code);
            } catch (RegistrationException e) {
                System.out.println("Skipped waitlist: " + e.getMessage());
            }
        }
    }

    void printCourses() {
        for (Course c : courses.values()) {
            String pre = c.getPrerequisites().isEmpty() ? "-" : "" + c.getPrerequisites();
            System.out.printf("%-8s %-28s %d cr %3d/%-3d wait %d  pre %s%n",
                    c.getCode(), c.getTitle(), c.getCredits(), c.getEnrolled().size(),
                    c.getCapacity(), c.getWaitlist().size(), pre);
        }
    }

    private void checkRules(Student s, Course c) throws RegistrationException {
        for (RegistrationRule rule : rules) {
            String reason = rule.check(s, c);
            if (reason != null) {
                throw new RegistrationException(reason);
            }
        }
    }

    private void enroll(Student s, Course c) {
        c.enroll(s.getId());
        s.addRegistration(c);
    }

    /** Writes one line per fact, separated by '|', in TreeMap (sorted) order. */
    void save(String fileName) throws IOException {
        try (PrintWriter out = new PrintWriter(new FileWriter(fileName))) {
            for (Course c : courses.values()) {
                out.println("COURSE|" + c.getCode() + "|" + c.getCredits() + "|"
                        + c.getCapacity() + "|" + c.getTitle());
            }
            for (Student s : students.values()) {
                out.printf("STUDENT|%s|%.2f|%s%n", s.getId(), s.getCgpa(), s.getName());
                for (String code : s.getCompleted()) {
                    out.println("DONE|" + s.getId() + "|" + code);
                }
            }
            // Written after all COURSE and STUDENT lines, so the loader knows both sides.
            for (Course c : courses.values()) {
                for (String pre : c.getPrerequisites()) {
                    out.println("PREREQ|" + c.getCode() + "|" + pre);
                }
                for (String id : c.getEnrolled()) {
                    out.println("ENROLLED|" + id + "|" + c.getCode());
                }
                for (String id : c.getWaitlist()) {
                    out.println("WAITING|" + id + "|" + c.getCode());
                }
            }
        }
    }

    static Registry load(String fileName) throws IOException, RegistrationException {
        Registry r = new Registry();
        try (BufferedReader reader = new BufferedReader(new FileReader(fileName))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] f = line.split("\\|");
                switch (f[0]) {
                    case "COURSE" -> r.addCourse(f[1], Integer.parseInt(f[2]),
                            Integer.parseInt(f[3]), f[4]);
                    case "PREREQ" -> r.addPrerequisite(f[1], f[2]);
                    case "STUDENT" -> r.addStudent(f[1], Double.parseDouble(f[2]), f[3]);
                    case "DONE" -> r.markCompleted(f[1], f[2]);
                    case "ENROLLED" -> r.enroll(r.student(f[1]), r.course(f[2]));
                    case "WAITING" -> r.course(f[2]).joinWaitlist(f[1]);
                    default -> throw new RegistrationException("bad line: " + line);
                }
            }
        }
        return r;
    }
}

public class CourseRegistrationSystem {
    /** Commands that print only "OK" when they succeed. */
    private static final List<String> CONFIRMED =
            List.of("COURSE", "PREREQ", "STUDENT", "DONE", "SAVE", "LOAD");
    private static Registry registry = new Registry();

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (line.isEmpty()) {
                continue;
            }
            System.out.println("> " + line);
            try {
                execute(line.split("\\s+"), line);
            } catch (RegistrationException e) {
                System.out.println("Refused: " + e.getMessage());
            } catch (FileNotFoundException e) {
                System.out.println("Error: file not found");
            } catch (IOException e) {
                System.out.println("Error: " + e.getMessage());
            } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                System.out.println("Error: badly formed command");
            }
        }
    }

    private static void execute(String[] w, String line)
            throws RegistrationException, IOException {
        String command = w[0].toUpperCase();
        switch (command) {
            case "COURSE" -> registry.addCourse(w[1], Integer.parseInt(w[2]),
                    Integer.parseInt(w[3]), line.split("\\s+", 5)[4]);
            case "PREREQ" -> registry.addPrerequisite(w[1], w[2]);
            case "STUDENT" -> registry.addStudent(w[1], Double.parseDouble(w[2]),
                    line.split("\\s+", 4)[3]);
            case "DONE" -> registry.markCompleted(w[1], w[2]);
            case "REGISTER" -> System.out.println(registry.register(w[1], w[2]));
            case "DROP" -> registry.drop(w[1], w[2]);
            case "COURSES" -> registry.printCourses();
            case "SAVE" -> registry.save(w[1]);
            case "LOAD" -> registry = Registry.load(w[1]);
            default -> System.out.println("Unknown command " + w[0]);
        }
        if (CONFIRMED.contains(command)) {
            System.out.println("OK");
        }
    }
}
```

**Input:**

```text
COURSE MAT1151 3 40 Fundamental Calculus
COURSE CSE1115 3 2 Object Oriented Programming
COURSE CSE1111 3 40 Structured Programming
COURSE ENG1011 3 40 English I
COURSE CSE2213 3 40 Discrete Mathematics
COURSE PHY1101 3 40 Physics I
COURSE CSE1111 3 40 Duplicate
PREREQ CSE1115 CSE1111
STUDENT 011 3.62 Nusrat Jahan
STUDENT 012 2.75 Rafi Ahmed
STUDENT 013 1.85 Mitu Akter
STUDENT 014 3.10 Tanvir Hasan
STUDENT 015 3.80 Sadia Islam
STUDENT 016 3.20 Farhana Haque
DONE 011 CSE1111
DONE 012 CSE1111
DONE 013 CSE1111
DONE 015 CSE1111
DONE 016 CSE1111
REGISTER 014 CSE1115
REGISTER 011 CSE1115
REGISTER 012 CSE1115
REGISTER 013 CSE1115
REGISTER 015 CSE1115
REGISTER 016 CSE1115
REGISTER 015 CSE1115
REGISTER 013 CSE2213
REGISTER 013 MAT1151
REGISTER 013 ENG1011
REGISTER 013 PHY1101
REGISTER 013 CSE1111
REGISTER 011 CSE1115
DROP 011 CSE1115
DROP 014 CSE1111
REGISTER 014 ENG1011
COURSES
SAVE registration.txt
COURSE ART1001 2 30 Bangla Literature
LOAD backup.txt
LOAD registration.txt
COURSES
REGISTER 017 CSE1111
```

**Output:**

```text
> COURSE MAT1151 3 40 Fundamental Calculus
OK
> COURSE CSE1115 3 2 Object Oriented Programming
OK
> COURSE CSE1111 3 40 Structured Programming
OK
> COURSE ENG1011 3 40 English I
OK
> COURSE CSE2213 3 40 Discrete Mathematics
OK
> COURSE PHY1101 3 40 Physics I
OK
> COURSE CSE1111 3 40 Duplicate
Refused: course CSE1111 already exists
> PREREQ CSE1115 CSE1111
OK
> STUDENT 011 3.62 Nusrat Jahan
OK
> STUDENT 012 2.75 Rafi Ahmed
OK
> STUDENT 013 1.85 Mitu Akter
OK
> STUDENT 014 3.10 Tanvir Hasan
OK
> STUDENT 015 3.80 Sadia Islam
OK
> STUDENT 016 3.20 Farhana Haque
OK
> DONE 011 CSE1111
OK
> DONE 012 CSE1111
OK
> DONE 013 CSE1111
OK
> DONE 015 CSE1111
OK
> DONE 016 CSE1111
OK
> REGISTER 014 CSE1115
Refused: Tanvir Hasan has not completed CSE1111, needed for CSE1115
> REGISTER 011 CSE1115
Nusrat Jahan registered in CSE1115 (3 credits)
> REGISTER 012 CSE1115
Rafi Ahmed registered in CSE1115 (3 credits)
> REGISTER 013 CSE1115
CSE1115 is full: Mitu Akter is #1 on the waitlist
> REGISTER 015 CSE1115
CSE1115 is full: Sadia Islam is #2 on the waitlist
> REGISTER 016 CSE1115
CSE1115 is full: Farhana Haque is #3 on the waitlist
> REGISTER 015 CSE1115
Refused: Sadia Islam is already waiting
> REGISTER 013 CSE2213
Mitu Akter registered in CSE2213 (3 credits)
> REGISTER 013 MAT1151
Mitu Akter registered in MAT1151 (6 credits)
> REGISTER 013 ENG1011
Mitu Akter registered in ENG1011 (9 credits)
> REGISTER 013 PHY1101
Refused: Mitu Akter would have 12 credits (limit 9)
> REGISTER 013 CSE1111
Refused: Mitu Akter has already completed CSE1111
> REGISTER 011 CSE1115
Refused: Nusrat Jahan is already registered in CSE1115
> DROP 011 CSE1115
Nusrat Jahan dropped CSE1115
Skipped waitlist: Mitu Akter would have 12 credits (limit 9)
Sadia Islam got the free seat in CSE1115
> DROP 014 CSE1111
Refused: Tanvir Hasan is not in CSE1111
> REGISTER 014 ENG1011
Tanvir Hasan registered in ENG1011 (3 credits)
> COURSES
CSE1111  Structured Programming       3 cr   0/40  wait 0  pre -
CSE1115  Object Oriented Programming  3 cr   2/2   wait 1  pre [CSE1111]
CSE2213  Discrete Mathematics         3 cr   1/40  wait 0  pre -
ENG1011  English I                    3 cr   2/40  wait 0  pre -
MAT1151  Fundamental Calculus         3 cr   1/40  wait 0  pre -
PHY1101  Physics I                    3 cr   0/40  wait 0  pre -
> SAVE registration.txt
OK
> COURSE ART1001 2 30 Bangla Literature
OK
> LOAD backup.txt
Error: file not found
> LOAD registration.txt
OK
> COURSES
CSE1111  Structured Programming       3 cr   0/40  wait 0  pre -
CSE1115  Object Oriented Programming  3 cr   2/2   wait 1  pre [CSE1111]
CSE2213  Discrete Mathematics         3 cr   1/40  wait 0  pre -
ENG1011  English I                    3 cr   2/40  wait 0  pre -
MAT1151  Fundamental Calculus         3 cr   1/40  wait 0  pre -
PHY1101  Physics I                    3 cr   0/40  wait 0  pre -
> REGISTER 017 CSE1111
Refused: unknown student 017
```

**Output file `registration.txt`:**

```text
COURSE|CSE1111|3|40|Structured Programming
COURSE|CSE1115|3|2|Object Oriented Programming
COURSE|CSE2213|3|40|Discrete Mathematics
COURSE|ENG1011|3|40|English I
COURSE|MAT1151|3|40|Fundamental Calculus
COURSE|PHY1101|3|40|Physics I
STUDENT|011|3.62|Nusrat Jahan
DONE|011|CSE1111
STUDENT|012|2.75|Rafi Ahmed
DONE|012|CSE1111
STUDENT|013|1.85|Mitu Akter
DONE|013|CSE1111
STUDENT|014|3.10|Tanvir Hasan
STUDENT|015|3.80|Sadia Islam
DONE|015|CSE1111
STUDENT|016|3.20|Farhana Haque
DONE|016|CSE1111
PREREQ|CSE1115|CSE1111
ENROLLED|012|CSE1115
ENROLLED|015|CSE1115
WAITING|016|CSE1115
ENROLLED|013|CSE2213
ENROLLED|013|ENG1011
ENROLLED|014|ENG1011
ENROLLED|013|MAT1151
```

</details>

### How It Works

- **`RegistrationRule`** is the key design decision. Each rule is a separate class
  with one method, `check`, that returns `null` when the registration is allowed or a
  message explaining why not. `Registry` keeps the rules in a `RegistrationRule[]` and
  calls `check` on each one without knowing which rule it is (interface-based
  polymorphism). Adding a new rule, for example a time-clash rule, means writing one
  new class and adding it to the array; `register` and `drop` do not change.
- **`Registry`** stores courses and students in `TreeMap`s, declared with the
  interface type `Map`. A map finds a course by its code directly with `get(code)`, no
  loop needed. A `TreeMap` keeps its keys sorted, so `courses.values()` always comes
  out in code order (CSE1111 before MAT1151) no matter in which order courses were
  added. A `HashMap` would also look things up quickly, but its iteration order is not
  predictable, so the printed table could change between runs.
- **`register`** runs every rule first and only then looks at seats. That way a
  student who could never take the course is refused instead of waiting in a line
  they can never leave.
- **`drop`** frees the seat, then loops while there is a free seat and someone waiting.
  `nextWaiting()` removes the first student (first in, first out). The rules are
  checked again *now*, because the student may have registered for other courses
  since joining the waitlist. A `RegistrationException` here is caught inside the
  loop, printed, and the loop continues with the next student.
- **`Course`** and **`Student`** keep their collections private and return copies.
  `Student` uses `TreeSet` for completed and registered courses: no duplicates and
  always sorted.
- **`save`** writes one fact per line. The order matters: all `COURSE` and `STUDENT`
  lines come first, and the lines that *connect* them (`PREREQ`, `ENROLLED`,
  `WAITING`) come last, so the loader can always find both sides of a link.
- **`load`** is `static` and builds a *new* `Registry` by calling the normal
  `addCourse`/`addStudent` methods. `main` assigns it to `registry` only if loading
  finished without an exception, so a missing or broken file leaves the current data
  as it was. Enrolments are restored directly (without re-checking the rules) because
  they were valid when saved.
- **`CONFIRMED`** is a fixed list made with `List.of`; commands in it print `OK` when
  they succeed, so every command produces at least one line of output.

### Extension Ideas

- A `TimeClashRule`: give each course a day and time slot and refuse overlapping
  registrations. Only one new class and one line in the rules array are needed.
- A `STUDENTINFO <id>` command that shows completed and registered courses.
- Let students with CGPA 3.50 or more take up to 18 credits.
- An advising report: for each student, the courses whose prerequisites they now meet.

## Project Ideas

These twelve ideas are for you to design and build on your own, in order of
difficulty. For each one, follow the planning steps at the start of this lab: write the
requirements, find the classes with "Should this be a class?", give each class its
responsibilities, and build one class at a time. All rules and amounts are
hypothetical.

### Idea 1: Hostel Room Allocation

**Description:** The hostel office assigns students to rooms. Each room has a number,
a floor and a fixed number of beds. The program allocates a student to a room with a
free bed, moves students between rooms and lists rooms with their occupants.

**Concepts Used:** Classes and objects, encapsulation, constructors, `ArrayList`.

**Suggested Classes:** `Room`, `Resident`, `Hostel`, `HostelApp`.

**Main Features:**
- Add rooms and students; allocate a student to the first room with a free bed.
- Move a student to another room; vacate a bed.
- List all rooms with free beds, and print who lives in a given room.

**Implementation Plan:**
1. Write `Room` with a private list of residents and a `hasFreeBed()` method.
2. Write `Hostel` with `allocate`, `move` and `vacate`, each returning `true`/`false`.
3. Add a command loop (`ADD`, `ALLOCATE`, `MOVE`, `VACATE`, `ROOMS`).
4. Test the edge cases: full hostel, moving into a full room, unknown student.

### Idea 2: Canteen Ordering System

**Description:** The design from the worked example at the start of this lab. Students
order items from a menu; the program computes line totals, a discount for large orders
and the daily sales summary.

**Concepts Used:** Classes, `enum`, encapsulation, calculated values instead of stored
ones, `ArrayList`.

**Suggested Classes:** `MenuItem`, `Category` (enum), `Menu`, `OrderLine`, `Order`,
`Status` (enum), `Canteen`.

**Main Features:**
- Show the menu by category; create an order and add lines to it.
- Total with a 5% discount at 300 Tk or more; mark orders paid or cancelled.
- End-of-day report: number of paid orders, revenue, best-selling item.

**Implementation Plan:**
1. Write `MenuItem` and `Menu` and print the menu.
2. Add `OrderLine` and `Order` with `total()` and `discount()`; test with fixed data.
3. Add order status changes and refuse changes to a cancelled order.
4. Write the daily report by looping over all paid orders.

### Idea 3: Hospital Appointment Scheduler

**Description:** Patients book appointments with doctors. Each doctor has fixed time
slots per day; a slot can hold one patient. Patients can cancel, and the program shows
each doctor's schedule.

**Concepts Used:** Encapsulation, constructors with validation, arrays of objects,
static ID counters, searching.

**Suggested Classes:** `Doctor`, `Patient`, `Appointment`, `Slot`, `Clinic`.

**Main Features:**
- Register doctors (name, department) and patients (auto-generated patient ID).
- Book the first free slot of a doctor, or a specific slot; cancel a booking.
- Print a doctor's day as a table of slots, and a patient's upcoming appointments.

**Implementation Plan:**
1. Model a day as an array of `Slot` objects inside `Doctor`.
2. Write `Clinic.book` and `Clinic.cancel` with clear refusal messages.
3. Add a static counter for patient IDs and test that IDs never repeat.
4. Add the printing commands and a sample input file.

### Idea 4: Parking Garage Manager

**Description:** A multi-level garage parks motorcycles, cars and microbuses. Each
vehicle type needs a different spot size and pays a different hourly rate. The program
parks vehicles, removes them and prints a bill.

**Concepts Used:** Inheritance, abstract classes, polymorphism, `instanceof` (only
where needed), `ArrayList`.

**Suggested Classes:** `Vehicle` (abstract), `Motorcycle`, `Car`, `Microbus`,
`ParkingSpot`, `Level`, `Garage`, `Ticket`.

**Main Features:**
- Park a vehicle in the nearest suitable free spot; refuse when the garage is full.
- Unpark by ticket number; the bill depends on hours and the vehicle's own rate.
- Occupancy report per level.

**Implementation Plan:**
1. Write the `Vehicle` hierarchy with an abstract `hourlyRate()` and `size()`.
2. Write `ParkingSpot.canFit(Vehicle)` and `Level.findSpot`.
3. Add `Ticket` (entry hour as a number, as in Project 2) and compute the bill.
4. Test each vehicle type and the full-garage case.

### Idea 5: Event Ticketing with Seat Maps

**Description:** An auditorium sells tickets for campus events. Each event has a seat
map (rows A to J, seats 1 to 20) with price zones. Buyers choose seats; the program
prints the seat map with sold seats marked.

**Concepts Used:** 2D arrays, encapsulation, custom checked exceptions, polymorphism
for ticket types (regular, student, VIP).

**Suggested Classes:** `Event`, `SeatMap`, `Seat`, `Ticket` (abstract),
`RegularTicket`, `StudentTicket`, `VipTicket`, `BookingException`, `BoxOffice`.

**Main Features:**
- Print the seat map, e.g. `[ ]` free and `[X]` sold.
- Buy several seats in one booking; the whole booking fails if any seat is taken.
- Refunds and a revenue report per event and per ticket type.

**Implementation Plan:**
1. Write `SeatMap` with a `Seat[][]` and a `print()` method.
2. Add the ticket hierarchy with an overridden `price()`.
3. Implement all-or-nothing booking: check every seat first, then mark them sold;
   throw `BookingException` with the first taken seat.
4. Add refunds and reports; test a booking that overlaps a sold seat.

### Idea 6: Payroll System with File Persistence

**Description:** A small company pays salaried, hourly and commission-based staff each
month. Employee data is loaded from a text file, payslips are computed and a payroll
report is written to another file.

**Concepts Used:** Abstract classes, interfaces (`Payable`), polymorphism, text file
I/O with `BufferedReader` and `PrintWriter`, exception handling for bad lines.

**Suggested Classes:** `Employee` (abstract), `SalariedEmployee`, `HourlyEmployee`,
`CommissionEmployee`, `Payable`, `Payslip`, `PayrollFile`, `Payroll`.

**Main Features:**
- Load `employees.txt` (one CSV line per employee); report bad lines with line numbers
  and skip them.
- Compute gross pay, a hypothetical tax and net pay per employee.
- Write `payroll.txt` with one payslip line per employee and a total.

**Implementation Plan:**
1. Write the employee hierarchy and test `pay()` for each type in code.
2. Write `PayrollFile.load` that builds the right subclass from the first CSV field.
3. Write the report with `PrintWriter` and `printf` (`%.2f` for money).
4. Test with a file that contains one broken line.

### Idea 7: Bus Reservation System

**Description:** An intercity bus company runs several trips a day. Passengers reserve
seats on a trip, choose a boarding point and receive a ticket code. Cancellations
close to departure receive a smaller refund.

**Concepts Used:** Classes and collections, `TreeMap` for trips by code, custom
exceptions, `Comparator` to sort trips by departure time, file save/load.

**Suggested Classes:** `Route`, `Trip`, `Seat`, `Passenger`, `Reservation`,
`ReservationException`, `BookingSystem`, `BookingStore`.

**Main Features:**
- Search trips by route, sorted by departure time.
- Reserve, show and cancel reservations with a refund policy by hours before
  departure.
- Save all reservations at the end and load them at start.

**Implementation Plan:**
1. Model `Route` and `Trip`; store trips in a `TreeMap<String, Trip>`.
2. Write `reserve` and `cancel` that throw `ReservationException` for every refusal.
3. Add the refund rules as a separate small class so they are easy to change.
4. Add `BookingStore` for the text file and test save, restart, load.

### Idea 8: Online Quiz Platform

**Description:** Teachers create quizzes with different question types; students take
them and get a score with per-question feedback. Results are kept per student.

**Concepts Used:** Interfaces and abstract classes, polymorphism (each question type
checks its own answer), generics (`Repository<T>` from Project 4), `Map` for results.

**Suggested Classes:** `Question` (abstract), `MultipleChoiceQuestion`,
`TrueFalseQuestion`, `ShortAnswerQuestion`, `Quiz`, `Attempt`, `Repository<T>`,
`QuizPlatform`.

**Main Features:**
- Create a quiz from a text file of questions.
- Take a quiz from standard input; each question type validates and grades its answer.
- Leaderboard per quiz and history per student, sorted with a `Comparator`.

**Implementation Plan:**
1. Write the `Question` hierarchy with `isCorrect(String answer)` and
   `points()`.
2. Write a loader that reads a question file and builds the right subclass.
3. Add `Attempt` to record answers and scores; store attempts in a map by student.
4. Add the leaderboard and test with a fixed answer file.

### Idea 9: Multithreaded Download Simulator

**Description:** A program simulates downloading several files at once. Each download
is a task with a size and speed; worker threads process the tasks and a shared
progress tracker reports completed bytes. No real network is used.

**Concepts Used:** Threads with `Runnable`, `ExecutorService`, `synchronized` shared
state or `AtomicInteger`, `join`/`awaitTermination`, deterministic final reporting.

**Suggested Classes:** `DownloadTask` (implements `Runnable` or `Callable`),
`ProgressTracker`, `DownloadManager`, `DownloadResult`.

**Main Features:**
- Queue several downloads and run them with a fixed thread pool of 3 workers.
- A thread-safe total of downloaded bytes.
- After all tasks finish, print a summary sorted by file name.

**Implementation Plan:**
1. Write `DownloadTask` that "downloads" in chunks with a short `sleep`.
2. Share one `ProgressTracker`; first show the lost-update bug, then fix it with
   `synchronized`.
3. Run tasks with `Executors.newFixedThreadPool(3)`, `shutdown` and
   `awaitTermination`.
4. Collect `DownloadResult`s and print them only after all threads are done.

### Idea 10: Chat Log Analyzer

**Description:** A group-chat export is a text file with lines like
`[day 3 21:15] Nusrat: see you at the library`. The program reads it and reports
statistics: messages per person, the busiest hour, the most used words and the
longest conversation gap.

**Concepts Used:** File I/O, string parsing, `TreeMap` and `TreeSet`, generic methods,
`Comparator`, exceptions for malformed lines.

**Suggested Classes:** `Message`, `ChatLog`, `LogParser`, `WordCounter`,
`ReportWriter`, `ParseException` (your own).

**Main Features:**
- Parse every line into a `Message`; report and skip malformed lines.
- Counts per sender and per hour; top 10 words, ignoring a list of common words.
- Write the report to `report.txt`.

**Implementation Plan:**
1. Write `LogParser.parse(String line)` and test it on correct and broken lines.
2. Count with `TreeMap<String, Integer>`; write a generic `topN` method.
3. Add the gap calculation by walking the messages in order.
4. Write the report file and compare it with an expected file.

### Idea 11: Swing Expense Tracker

**Description:** A desktop app for a student's monthly expenses. The window shows a
form to add an expense (date as text, category, amount), a list of expenses and the
totals per category. Data is saved to a file on exit and loaded on start.

**Concepts Used:** Swing (`JFrame`, `JPanel`, `JTextField`, `JComboBox`, `JList`
with `DefaultListModel`, `JOptionPane`), event handling, model-view separation, file
I/O, exceptions for invalid input.

**Suggested Classes:** `Expense`, `Category` (enum), `ExpenseBook` (the model),
`ExpenseStore` (file I/O), `ExpenseFrame` (the view), `ExpenseApp`.

**Main Features:**
- Add, delete and filter expenses by category.
- Totals per category and for the month, updated after every change.
- A monthly budget with a warning dialog when it is exceeded.

**Implementation Plan:**
1. Build and test `ExpenseBook` and `ExpenseStore` as a console program first.
2. Build the window layout with an empty list.
3. Connect buttons to model methods; refresh the list and totals after each change.
4. Load on start and save in a window listener on close; build everything on the
   Event Dispatch Thread with `SwingUtilities.invokeLater`.

### Idea 12: Mini Spreadsheet

**Description:** A console spreadsheet with cells A1 to J20. A cell holds a number, a
text or a formula such as `=A1+B2*2` or `=SUM(A1:A5)`. Changing a cell updates every
formula that depends on it, and a sheet can be saved and loaded.

**Concepts Used:** Interfaces and polymorphism (cell content types), recursion
(evaluating formulas that refer to other cells), maps, custom exceptions (bad formula,
circular reference), file I/O, generics.

**Suggested Classes:** `Sheet`, `CellAddress`, `CellContent` (interface),
`NumberContent`, `TextContent`, `FormulaContent`, `FormulaParser`, `Expression`
(interface) with `NumberExpr`, `CellRefExpr`, `BinaryExpr`, `SumExpr`,
`CircularReferenceException`.

**Main Features:**
- `SET A1 10`, `SET B1 =A1*2`, `PRINT` (a grid with fixed-width columns).
- Formulas with `+ - * /`, parentheses, cell references and `SUM` over a range.
- Detect circular references (`A1` uses `B1`, `B1` uses `A1`) and report them.
- `SAVE`/`LOAD` the sheet as text (one cell per line).

**Implementation Plan:**
1. Write `CellAddress` (parse `B7` into row and column) and a `Sheet` backed by a
   `TreeMap<CellAddress, CellContent>` (make `CellAddress` implement `Comparable`).
2. Support numbers and text, then `PRINT`.
3. Write a recursive-descent `FormulaParser` that builds an `Expression` tree;
   evaluate it recursively.
4. Track the cells being evaluated in a set to detect cycles.
5. Add `SUM` ranges, then save and load.
