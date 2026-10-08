# Classes and Objects

Designing classes with fields and methods, creating objects and making them work
together (Chapter 04 and earlier). Programs read input without prompts and print
exactly the sample output.

## Problem 1: Overlapping Rooms
**Level:** Basic

### Problem Statement
On a floor plan, rooms are rectangles with sides parallel to the axes. Write a class
`Rect` with fields `x1, y1, x2, y2` (bottom-left and top-right corners, `x1 < x2` and
`y1 < y2`) and methods `int area()`, `boolean overlaps(Rect other)` (true only if they
share an area greater than 0; touching edges do not count) and
`int overlapArea(Rect other)`.

Input: `q`, then `q` lines with eight integers (two rectangles). Print
`areas <a1> <a2>, overlap <o>` followed by ` (overlapping)` or ` (separate)`.

### Hint
Two intervals `[a1, a2]` and `[b1, b2]` overlap by `min(a2, b2) − max(a1, b1)` if that
is positive. The overlap of two rectangles is the product of the overlaps of their x
intervals and their y intervals.

### Sample Input
```text
3
0 0 4 3 2 1 6 5
0 0 2 2 2 0 4 2
1 1 9 9 3 3 5 5
```

### Sample Output
```text
areas 12 16, overlap 4 (overlapping)
areas 4 4, overlap 0 (separate)
areas 64 4, overlap 4 (overlapping)
```

### Solution
```java
import java.util.Scanner;

class Rect {
    int x1;
    int y1;
    int x2;
    int y2;

    int area() {
        return (x2 - x1) * (y2 - y1);
    }

    int overlapArea(Rect other) {
        int w = Math.min(x2, other.x2) - Math.max(x1, other.x1);
        int h = Math.min(y2, other.y2) - Math.max(y1, other.y1);
        if (w <= 0 || h <= 0) {
            return 0;
        }
        return w * h;
    }

    boolean overlaps(Rect other) {
        return overlapArea(other) > 0;
    }
}

public class OverlappingRooms {
    static Rect read(Scanner in) {
        Rect r = new Rect();
        r.x1 = in.nextInt();
        r.y1 = in.nextInt();
        r.x2 = in.nextInt();
        r.y2 = in.nextInt();
        return r;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            Rect a = read(in);
            Rect b = read(in);
            System.out.println("areas " + a.area() + " " + b.area() + ", overlap " + a.overlapArea(b)
                    + (a.overlaps(b) ? " (overlapping)" : " (separate)"));
        }
    }
}
```

### Explanation
Each `Rect` object holds its own four numbers, and the methods answer questions about
"this" rectangle compared with another one passed as a parameter. Inside `overlapArea`,
`x2` means this object's field and `other.x2` the other object's field. Requiring both
the width and the height of the overlap to be positive handles all the edge cases at
once: rectangles that only touch along an edge get a width or height of 0, and
rectangles far apart get a negative value. `overlaps` reuses `overlapArea` instead of
repeating the logic. The helper `read` returns a new object filled from the input,
which keeps `main` short.

## Problem 2: Fraction Calculator
**Level:** Intermediate

### Problem Statement
Write a class `Fraction` with a numerator and a denominator that is always stored in
lowest terms with a positive denominator. Methods: `Fraction add(Fraction o)`,
`Fraction subtract(Fraction o)`, `Fraction multiply(Fraction o)`,
`Fraction divide(Fraction o)` (each returns a new `Fraction`) and `toString()`
returning `n/d`, or just `n` when the denominator is 1.

Input: `q`, then `q` lines `a/b op c/d` with `op` one of `+ - * /`. Denominators are
not zero; for division by a zero fraction print `undefined`. Print
`<a/b> <op> <c/d> = <result>` using the **reduced** forms of the operands.

### Hint
Reduce in one place: a constructor (or a private method) that divides both parts by
their greatest common divisor and moves a negative sign to the numerator. Every
operation then just builds a new `Fraction` from the textbook formula.

### Sample Input
```text
5
1/2 + 1/3
3/4 - 5/4
2/-6 * 9/4
5/8 / 0/3
10/4 / 5/2
```

### Sample Output
```text
1/2 + 1/3 = 5/6
3/4 - 5/4 = -1/2
-1/3 * 9/4 = -3/4
5/8 / 0 = undefined
5/2 / 5/2 = 1
```

### Solution
```java
import java.util.Scanner;

class Fraction {
    long num;
    long den;

    Fraction(long num, long den) {
        if (den < 0) {
            num = -num;
            den = -den;
        }
        long g = gcd(Math.abs(num), den);
        this.num = num / g;
        this.den = den / g;
    }

    static long gcd(long a, long b) {
        while (b != 0) {
            long t = a % b;
            a = b;
            b = t;
        }
        return a == 0 ? 1 : a;
    }

    static Fraction parse(String text) {
        int slash = text.indexOf('/');
        return new Fraction(Long.parseLong(text.substring(0, slash)),
                Long.parseLong(text.substring(slash + 1)));
    }

    Fraction add(Fraction o) {
        return new Fraction(num * o.den + o.num * den, den * o.den);
    }

    Fraction subtract(Fraction o) {
        return new Fraction(num * o.den - o.num * den, den * o.den);
    }

    Fraction multiply(Fraction o) {
        return new Fraction(num * o.num, den * o.den);
    }

    Fraction divide(Fraction o) {
        return new Fraction(num * o.den, den * o.num);
    }

    boolean isZero() {
        return num == 0;
    }

    @Override
    public String toString() {
        return den == 1 ? Long.toString(num) : num + "/" + den;
    }
}

public class FractionCalculator {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            Fraction a = Fraction.parse(in.next());
            String op = in.next();
            Fraction b = Fraction.parse(in.next());
            String result;
            if (op.equals("+")) {
                result = a.add(b).toString();
            } else if (op.equals("-")) {
                result = a.subtract(b).toString();
            } else if (op.equals("*")) {
                result = a.multiply(b).toString();
            } else if (b.isZero()) {
                result = "undefined";
            } else {
                result = a.divide(b).toString();
            }
            System.out.println(a + " " + op + " " + b + " = " + result);
        }
    }
}
```

### Explanation
The constructor is the single place that normalises a fraction, so every `Fraction`
that exists is already in lowest terms with a positive denominator; the operations
never have to think about it. The operations return **new** objects and leave both
operands unchanged, which is why `a` and `b` can still be printed afterwards. Division
by a zero fraction is checked before dividing, because `divide` would otherwise build a
fraction with denominator 0. For a zero numerator, `gcd(0, d)` is `d`, so `0/3` is
stored as `0/1` and printed as `0`. The example `2/-6` shows the sign rule: it is
stored as `-1/3`.

## Problem 3: Two Elevators
**Level:** Advanced

### Problem Statement
An academic building has two elevators, `A` and `B`, serving floors 0 to 12. Write a
class `Elevator` (name, current floor, floors travelled, trips) with
`int distanceTo(int floor)` and `void moveTo(int floor)`, and a class `Dispatcher` that
holds both elevators and handles calls.

For each call from floor `f`, the dispatcher sends the elevator that is **closer**; on
a tie it sends the one with **fewer trips**, and if that is also tied, elevator `A`.
The chosen elevator moves to `f`. Both elevators start at floor 0.

Input: `n`, then `n` calls `f` (a floor). An invalid floor prints
`Call from <f> ignored`. Otherwise print
`Call from <f>: <name> moves <from> -> <f> (<distance> floors)`. Finally print, for
each elevator, `<name>: floor <floor>, trips <t>, travelled <d> floors`.

### Hint
Let the `Elevator` objects own their data and update it in `moveTo`. The dispatcher's
only job is to compare the two elevators using their methods and pick one; keep the tie
rules together in one method.

### Sample Input
```text
6
5
3
9
13
3
0
```

### Sample Output
```text
Call from 5: A moves 0 -> 5 (5 floors)
Call from 3: A moves 5 -> 3 (2 floors)
Call from 9: A moves 3 -> 9 (6 floors)
Call from 13 ignored
Call from 3: B moves 0 -> 3 (3 floors)
Call from 0: B moves 3 -> 0 (3 floors)
A: floor 9, trips 3, travelled 13 floors
B: floor 0, trips 2, travelled 6 floors
```

### Solution
```java
import java.util.Scanner;

class Elevator {
    String name;
    int floor;
    int travelled;
    int trips;

    Elevator(String name) {
        this.name = name;
    }

    int distanceTo(int target) {
        return Math.abs(target - floor);
    }

    void moveTo(int target) {
        travelled += distanceTo(target);
        floor = target;
        trips++;
    }

    String report() {
        return name + ": floor " + floor + ", trips " + trips + ", travelled " + travelled + " floors";
    }
}

class Dispatcher {
    static final int TOP_FLOOR = 12;
    Elevator a = new Elevator("A");
    Elevator b = new Elevator("B");

    Elevator choose(int floor) {
        int da = a.distanceTo(floor);
        int db = b.distanceTo(floor);
        if (da != db) {
            return da < db ? a : b;
        }
        if (a.trips != b.trips) {
            return a.trips < b.trips ? a : b;
        }
        return a;
    }

    String call(int floor) {
        if (floor < 0 || floor > TOP_FLOOR) {
            return "Call from " + floor + " ignored";
        }
        Elevator e = choose(floor);
        int from = e.floor;
        int distance = e.distanceTo(floor);
        e.moveTo(floor);
        return "Call from " + floor + ": " + e.name + " moves " + from + " -> " + floor
                + " (" + distance + " floors)";
    }
}

public class TwoElevators {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Dispatcher d = new Dispatcher();
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            System.out.println(d.call(in.nextInt()));
        }
        System.out.println(d.a.report());
        System.out.println(d.b.report());
    }
}
```

### Explanation
Two classes share the work. Each `Elevator` knows its own state and how to move, so the
distance and trip counting are never duplicated. The `Dispatcher` "has" two elevators
and makes decisions by asking them questions (`distanceTo`, `trips`). `choose` returns a
**reference** to one of the two objects; calling `moveTo` on that reference changes the
real elevator, not a copy. Tracing the sample by hand is the best way to check the
rules: the first call (floor 5) is a complete tie, so `A` goes; for the call from 3,
`A` (at 5) is 2 floors away and `B` (at 0) is 3, so `A` goes again; the second call
from 3 finds `A` at 9 and `B` at 0, so `B` finally moves.
