# Constructors and Object Lifecycle

Overloaded and chained constructors, copy constructors written by hand, initialization
order, and releasing resources with `AutoCloseable` (Chapter 06 and earlier). Java has
no destructors; the garbage collector reclaims memory and try-with-resources releases
other resources. Programs read input without prompts and print exactly the sample
output.

## Problem 1: One Clock, Many Constructors
**Level:** Basic

### Problem Statement
Write a class `Clock` that stores hours (0–23) and minutes (0–59) and has five
constructors:

- `Clock()`: midnight;
- `Clock(int hours)`;
- `Clock(int hours, int minutes)`: the **only** constructor that assigns the fields;
  it normalises any values, e.g. `(9, 75)` becomes 10:15, `(25, 0)` becomes 01:00 and
  `(0, -30)` becomes 23:30;
- `Clock(String hhmm)` for text like `07:45`;
- `Clock(Clock other)`: a copy.

All others must chain to `Clock(int, int)` with `this(...)`. Add `toString()` (`HH:MM`).

Input: `n`, then `n` lines: `NONE`, `H h`, `HM h m`, `TEXT hh:mm` or `COPY` (copy of the
previous clock). Print each clock.

### Hint
Normalise by converting everything to minutes since midnight, then use `%` with
`24 * 60`. Java's `%` can be negative for negative inputs, so add `24 * 60` and take
`%` again.

### Sample Input
```text
6
NONE
H 7
HM 9 75
TEXT 23:59
COPY
HM 0 -30
```

### Sample Output
```text
00:00
07:00
10:15
23:59
23:59
23:30
```

### Solution
```java
import java.util.Scanner;

class Clock {
    private static final int DAY = 24 * 60;
    private final int hours;
    private final int minutes;

    Clock() {
        this(0, 0);
    }

    Clock(int hours) {
        this(hours, 0);
    }

    Clock(int hours, int minutes) {
        int total = ((hours * 60 + minutes) % DAY + DAY) % DAY;
        this.hours = total / 60;
        this.minutes = total % 60;
    }

    Clock(String hhmm) {
        this(Integer.parseInt(hhmm.substring(0, 2)), Integer.parseInt(hhmm.substring(3, 5)));
    }

    Clock(Clock other) {
        this(other.hours, other.minutes);
    }

    @Override
    public String toString() {
        return String.format("%02d:%02d", hours, minutes);
    }
}

public class ClockConstructors {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        Clock previous = new Clock();
        for (int i = 0; i < n; i++) {
            String kind = in.next();
            Clock c;
            if (kind.equals("NONE")) {
                c = new Clock();
            } else if (kind.equals("H")) {
                c = new Clock(in.nextInt());
            } else if (kind.equals("HM")) {
                int h = in.nextInt();
                c = new Clock(h, in.nextInt());
            } else if (kind.equals("TEXT")) {
                c = new Clock(in.next());
            } else {
                c = new Clock(previous);
            }
            System.out.println(c);
            previous = c;
        }
    }
}
```

### Explanation
Every path into the class ends in the same constructor, so the normalisation rule
exists once and every `Clock` is valid. In the `Clock(String)` constructor the
parsing happens inside the `this(...)` arguments, because `this(...)` must be the first
statement. The copy constructor is written by hand (Java has no automatic one); since
`Clock` holds only `int` fields, copying the values is a complete, independent copy.
`((x % DAY) + DAY) % DAY` turns any whole number of minutes, positive or negative, into
the range 0 to 1439.

## Problem 2: Closing Lab Equipment in Order
**Level:** Intermediate

### Problem Statement
A lab session uses a projector and a sound system. Both are resources that must be
switched off when the session ends, even if the session ends early. Write a class
`Equipment implements AutoCloseable` whose constructor prints `<name> on`, a method
`use(int minutes)` that prints `<name> used <m> min` and increases a counter, and a
`close()` that prints `<name> off after <total> min`.

Write `static void session(String title, int minutes, boolean endEarly)` that prints
`== <title> ==`, opens **both** devices in one try-with-resources statement (projector
first), uses the projector for `minutes`, and then, if `endEarly` is true, prints
`ending early` and returns immediately; otherwise it uses the sound system for
`minutes / 2` and prints `session complete`.

Input: `n`, then `n` lines `title minutes early|normal`.

### Hint
Resources declared in one `try (...)` are closed automatically in the **reverse**
order of their creation, and this also happens when the block is left by `return`.

### Sample Input
```text
2
Seminar 40 normal
Viva 25 early
```

### Sample Output
```text
== Seminar ==
Projector on
Sound on
Projector used 40 min
Sound used 20 min
session complete
Sound off after 20 min
Projector off after 40 min
== Viva ==
Projector on
Sound on
Projector used 25 min
ending early
Sound off after 0 min
Projector off after 25 min
```

### Solution
```java
import java.util.Scanner;

class Equipment implements AutoCloseable {
    private final String name;
    private int totalMinutes;

    Equipment(String name) {
        this.name = name;
        System.out.println(name + " on");
    }

    void use(int minutes) {
        totalMinutes += minutes;
        System.out.println(name + " used " + minutes + " min");
    }

    @Override
    public void close() {
        System.out.println(name + " off after " + totalMinutes + " min");
    }
}

public class LabEquipment {
    static void session(String title, int minutes, boolean endEarly) {
        System.out.println("== " + title + " ==");
        try (Equipment projector = new Equipment("Projector");
             Equipment sound = new Equipment("Sound")) {
            projector.use(minutes);
            if (endEarly) {
                System.out.println("ending early");
                return;
            }
            sound.use(minutes / 2);
            System.out.println("session complete");
        }
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String title = in.next();
            int minutes = in.nextInt();
            session(title, minutes, in.next().equals("early"));
        }
    }
}
```

### Explanation
A resource like a projector is not memory, so the garbage collector cannot release it
at a predictable time; Java's tool for predictable cleanup is `AutoCloseable` with
try-with-resources. The sound system is closed before the projector because it was
opened after it, so anything that depends on an earlier resource is shut down first.
The early `return` does not skip the cleanup: leaving the `try` block in any way,
including by an exception, runs `close()` on both resources. In C++ this job is done by
destructors; in Java it is explicit and visible in the code.

## Problem 3: Copy-with-Changes for Course Offerings
**Level:** Advanced

### Problem Statement
A course offering has a code, a title, a section number, a capacity and an instructor.
Most fields are optional when an offering is created. Write an immutable class
`Offering` with:

- `Offering(String code, String title)`: section 1, capacity 40, instructor `TBA`;
- `Offering(String code, String title, int section)`;
- `Offering(String code, String title, int section, int capacity, String instructor)`:
  the only constructor that validates and assigns (section 1–20, capacity 10–200,
  otherwise the value is replaced by the default and a counter of corrections in the
  object is increased);
- "with" methods `withSection(int)`, `withCapacity(int)`, `withInstructor(String)` that
  return a **new** offering with one field changed (and the same validation), leaving
  the original unchanged;
- `toString()`: `<code> <title> s<section> cap <capacity> by <instructor>` plus
  ` [<k> corrected]` if `k > 0`.

Input: a base line `code title`, then `n` commands applied to the **base** offering:
`SECTION s`, `CAPACITY c`, `INSTRUCTOR name`, or `CHAIN s c name` (all three changes
in sequence: `withSection(s).withCapacity(c).withInstructor(name)`). Print the base,
then one line per command with the new offering, then the base again.

### Hint
Let every `with...` method call the full constructor with the current values and the
one new value. Because the full constructor does all validation, the corrections count
must also be passed along (and increased only for new corrections).

### Sample Input
```text
CSE1115 OOP
4
SECTION 3
CAPACITY 5
CHAIN 7 60 DrRahman
INSTRUCTOR MsSultana
```

### Sample Output
```text
CSE1115 OOP s1 cap 40 by TBA
CSE1115 OOP s3 cap 40 by TBA
CSE1115 OOP s1 cap 40 by TBA [1 corrected]
CSE1115 OOP s7 cap 60 by DrRahman
CSE1115 OOP s1 cap 40 by MsSultana
CSE1115 OOP s1 cap 40 by TBA
```

### Solution
```java
import java.util.Scanner;

final class Offering {
    private final String code;
    private final String title;
    private final int section;
    private final int capacity;
    private final String instructor;
    private final int corrections;

    Offering(String code, String title) {
        this(code, title, 1);
    }

    Offering(String code, String title, int section) {
        this(code, title, section, 40, "TBA");
    }

    Offering(String code, String title, int section, int capacity, String instructor) {
        this(code, title, section, capacity, instructor, 0);
    }

    private Offering(String code, String title, int section, int capacity,
            String instructor, int previousCorrections) {
        int fixes = previousCorrections;
        if (section < 1 || section > 20) {
            section = 1;
            fixes++;
        }
        if (capacity < 10 || capacity > 200) {
            capacity = 40;
            fixes++;
        }
        this.code = code;
        this.title = title;
        this.section = section;
        this.capacity = capacity;
        this.instructor = instructor;
        this.corrections = fixes;
    }

    Offering withSection(int newSection) {
        return new Offering(code, title, newSection, capacity, instructor, corrections);
    }

    Offering withCapacity(int newCapacity) {
        return new Offering(code, title, section, newCapacity, instructor, corrections);
    }

    Offering withInstructor(String newInstructor) {
        return new Offering(code, title, section, capacity, newInstructor, corrections);
    }

    @Override
    public String toString() {
        String text = code + " " + title + " s" + section + " cap " + capacity + " by " + instructor;
        return corrections > 0 ? text + " [" + corrections + " corrected]" : text;
    }
}

public class CourseOfferings {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Offering base = new Offering(in.next(), in.next());
        System.out.println(base);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String command = in.next();
            Offering changed;
            if (command.equals("SECTION")) {
                changed = base.withSection(in.nextInt());
            } else if (command.equals("CAPACITY")) {
                changed = base.withCapacity(in.nextInt());
            } else if (command.equals("INSTRUCTOR")) {
                changed = base.withInstructor(in.next());
            } else {
                int s = in.nextInt();
                int c = in.nextInt();
                changed = base.withSection(s).withCapacity(c).withInstructor(in.next());
            }
            System.out.println(changed);
        }
        System.out.println(base);
    }
}
```

### Explanation
All public constructors chain into one private constructor that validates and
assigns, so the rules are written once. That private constructor has an extra
parameter for corrections already made, which lets the `with...` methods carry the
count forward; outside code cannot call it, so nobody can fake the count. Because the
class is immutable, "changing" an offering means building a new one: each `with...`
call is a small copy constructor that changes one field. Chaining them
(`withSection(s).withCapacity(c)...`) works because each returns an `Offering`. The last
line of output proves the base object never changed. The `String` and `int` fields can
be shared between copies safely: strings are immutable and primitives are copied.
