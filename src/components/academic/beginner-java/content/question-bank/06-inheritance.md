# Inheritance

`extends`, `super`, overriding, constructor order, `protected`, `final`, the `Object`
methods and multiple inheritance of type through interfaces (Chapter 09 and earlier).
Programs read input without prompts and print exactly the sample output.

## Problem 1: Raises Up the Hierarchy
**Level:** Basic

### Problem Statement
Every employee gets a yearly raise of 5% of their salary. A `Manager` also gets 2,000
Tk for each person in their team, and a `Director` (a kind of manager) also gets a
flat 10,000 Tk leadership bonus. Write `Employee`, `Manager extends Employee` and
`Director extends Manager`, each with `long raise()` that **adds to**
`super.raise()`, and `String describe()` returning
`<name> (<role>): salary <s>, raise <r>`.

Input: `n`, then `n` lines `E name salary`, `M name salary team` or
`D name salary team`. Print every description, then `Total raises: <sum>`.

### Hint
The 5% rule belongs only in `Employee`. A manager's raise is "whatever an employee
gets, plus the team part", which is exactly `super.raise() + ...`.

### Sample Input
```text
3
E Karim 40000
M Nusrat 90000 6
D Hasan 150000 4
```

### Sample Output
```text
Karim (Employee): salary 40000, raise 2000
Nusrat (Manager): salary 90000, raise 16500
Hasan (Director): salary 150000, raise 25500
Total raises: 44000
```

### Solution
```java
import java.util.ArrayList;
import java.util.Scanner;

class Employee {
    private final String name;
    protected final long salary;

    Employee(String name, long salary) {
        this.name = name;
        this.salary = salary;
    }

    long raise() {
        return salary * 5 / 100;
    }

    String role() {
        return "Employee";
    }

    String describe() {
        return name + " (" + role() + "): salary " + salary + ", raise " + raise();
    }
}

class Manager extends Employee {
    private final int team;

    Manager(String name, long salary, int team) {
        super(name, salary);
        this.team = team;
    }

    @Override
    long raise() {
        return super.raise() + 2000L * team;
    }

    @Override
    String role() {
        return "Manager";
    }
}

class Director extends Manager {
    Director(String name, long salary, int team) {
        super(name, salary, team);
    }

    @Override
    long raise() {
        return super.raise() + 10000;
    }

    @Override
    String role() {
        return "Director";
    }
}

public class RaiseHierarchy {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        ArrayList<Employee> staff = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = in.next();
            String name = in.next();
            long salary = in.nextLong();
            if (type.equals("E")) {
                staff.add(new Employee(name, salary));
            } else if (type.equals("M")) {
                staff.add(new Manager(name, salary, in.nextInt()));
            } else {
                staff.add(new Director(name, salary, in.nextInt()));
            }
        }
        long total = 0;
        for (Employee e : staff) {
            System.out.println(e.describe());
            total += e.raise();
        }
        System.out.println("Total raises: " + total);
    }
}
```

### Explanation
`Director.raise()` calls `super.raise()`, which is `Manager.raise()`, which calls
`Employee.raise()`: each level adds only its own part. `describe()` is written once in
`Employee` but calls `role()` and `raise()`, which are overridden, so it prints the
right role and the right raise for every class. `2000L * team` makes the product a
`long` from the start. `salary` is `protected final`: subclasses may read it, but no one
can change it.

## Problem 2: Equality in a Hierarchy
**Level:** Intermediate

### Problem Statement
A campus map stores `Point` objects (x, y) and `LabelledPoint` objects (x, y and a
label, e.g. a building name). Two points are equal if they have the same class and the
same coordinates; two labelled points must also have equal labels. A `Point` is
**never** equal to a `LabelledPoint`, even with the same coordinates (otherwise
`equals` would not be symmetric).

Override `equals` and `hashCode` in both classes using `getClass()`, and `toString()`
(`(x, y)` or `label(x, y)`). Read `n` points (`P x y` or `L x y label`) into an
`ArrayList<Point>`; for each new point print `added <p>` or `duplicate <p>`
(use `contains`, which calls `equals`). Finally print `Distinct points: <k>`.

### Hint
Start `equals` with `if (this == o) return true;` and
`if (o == null || getClass() != o.getClass()) return false;`. In the subclass, call
`super.equals(o)` for the coordinates and compare only the label yourself.
`Objects.hash(...)` builds a matching `hashCode`.

### Sample Input
```text
5
P 2 3
L 2 3 Library
P 2 3
L 2 3 Library
L 2 3 Canteen
```

### Sample Output
```text
added (2, 3)
added Library(2, 3)
duplicate (2, 3)
duplicate Library(2, 3)
added Canteen(2, 3)
Distinct points: 3
```

### Solution
```java
import java.util.ArrayList;
import java.util.Objects;
import java.util.Scanner;

class Point {
    protected final int x;
    protected final int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}

class LabelledPoint extends Point {
    private final String label;

    LabelledPoint(int x, int y, String label) {
        super(x, y);
        this.label = label;
    }

    @Override
    public boolean equals(Object o) {
        if (!super.equals(o)) {
            return false;
        }
        LabelledPoint p = (LabelledPoint) o;
        return label.equals(p.label);
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y, label);
    }

    @Override
    public String toString() {
        return label + super.toString();
    }
}

public class PointEquality {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        ArrayList<Point> points = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = in.next();
            int x = in.nextInt();
            int y = in.nextInt();
            Point p = type.equals("P") ? new Point(x, y) : new LabelledPoint(x, y, in.next());
            if (points.contains(p)) {
                System.out.println("duplicate " + p);
            } else {
                points.add(p);
                System.out.println("added " + p);
            }
        }
        System.out.println("Distinct points: " + points.size());
    }
}
```

### Explanation
`equals` must be symmetric: if `a.equals(b)` then `b.equals(a)`. With an `instanceof`
check, `point.equals(labelled)` could be true while `labelled.equals(point)` is false.
Comparing `getClass()` avoids that: objects of different classes are simply not equal.
`LabelledPoint.equals` reuses the superclass check (`super.equals(o)` already verified
the class and coordinates), so the cast is safe. Whenever `equals` is overridden,
`hashCode` must be too, so that equal objects have equal hash codes; hash-based
collections such as `HashSet` depend on it, and the compiler's lint warns if you forget.

## Problem 3: The Constructor Trap
**Level:** Advanced

### Problem Statement
A classic interview question: what happens when a superclass constructor calls a
method that a subclass overrides?

Write a class `Report` whose constructor prints `Report built: ` followed by the result
of an overridable method `String header()` (which returns `Report`). Write
`CourseReport extends Report` with a field `private final String course` set in its
constructor, and an override of `header()` returning `Report for ` + `course`.

Then write the **fixed** design: `SafeReport` whose constructor does not call any
overridable method; instead a separate `final` method `String build()` prints and
returns `Report built: ` + `header()` **after** construction, with `SafeCourseReport`
overriding `header()` the same way.

Input: `n` course codes. For each code, create a `CourseReport` (observe what is
printed during construction), then print `Afterwards: <header()>`. Then create a
`SafeCourseReport`, call `build()`, and print `Afterwards: <header()>` again.

### Hint
Java runs the superclass constructor **before** the subclass's fields are assigned.
During that time, an overridden method already dispatches to the subclass, but it sees
the subclass field still at its default value (`null`).

### Sample Input
```text
2
CSE1115
MAT2105
```

### Sample Output
```text
-- unsafe --
Report built: Report for null
Afterwards: Report for CSE1115
-- safe --
Report built: Report for CSE1115
Afterwards: Report for CSE1115
-- unsafe --
Report built: Report for null
Afterwards: Report for MAT2105
-- safe --
Report built: Report for MAT2105
Afterwards: Report for MAT2105
```

### Solution
```java
import java.util.Scanner;

class Report {
    Report() {
        System.out.println("Report built: " + header());
    }

    String header() {
        return "Report";
    }
}

class CourseReport extends Report {
    private final String course;

    CourseReport(String course) {
        super();
        this.course = course;
    }

    @Override
    String header() {
        return "Report for " + course;
    }
}

class SafeReport {
    String header() {
        return "Report";
    }

    final String build() {
        String text = "Report built: " + header();
        System.out.println(text);
        return text;
    }
}

class SafeCourseReport extends SafeReport {
    private final String course;

    SafeCourseReport(String course) {
        this.course = course;
    }

    @Override
    String header() {
        return "Report for " + course;
    }
}

public class ConstructorTrap {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String course = in.next();
            System.out.println("-- unsafe --");
            CourseReport unsafe = new CourseReport(course);
            System.out.println("Afterwards: " + unsafe.header());
            System.out.println("-- safe --");
            SafeCourseReport safe = new SafeCourseReport(course);
            safe.build();
            System.out.println("Afterwards: " + safe.header());
        }
    }
}
```

### Explanation
`new CourseReport("CSE1115")` first runs `Report()`. Its call to `header()` is
dynamically dispatched to `CourseReport.header()`, because the object really is a
`CourseReport`, but `course` has not been assigned yet (the subclass constructor body
runs only after `super()` returns), so it prints `Report for null`. This happens even
though `course` is `final`: a `final` field is still at its default value until it is
assigned. The rule that follows: **never call overridable methods from a
constructor**. The safe design separates construction from use; `build()` is called on
a fully built object, and making it `final` stops subclasses from breaking that
guarantee.
