# Static Members

Class-level data and methods, constants, shared counters, utility methods and `enum`
(Chapter 07 and earlier). Programs read input without prompts and print exactly the
sample output.

## Problem 1: Statistics Across All Readings
**Level:** Basic

### Problem Statement
Each `Reading` object stores one sensor value. The class also keeps statistics about
**all** readings ever created: their count, sum, minimum and maximum, in `private
static` fields updated by the constructor. Provide static methods `count()`,
`average()` (0 when there are none), `min()` and `max()`, and an instance method
`boolean aboveAverage()` that compares this reading with the current class average.

Input: `n` values. Create a `Reading` for each, then print
`Count <c>, average <a with 2 decimals>, min <min>, max <max>`, followed by
`Above average:` and the values above the average, separated by spaces, in input
order (nothing after the colon if there are none).

### Hint
Static fields need sensible starting values for min and max (`Integer.MAX_VALUE` and
`Integer.MIN_VALUE`). Arrays come in Chapter 08, so to remember the readings let each
`Reading` keep a reference to the previous one, and walk this chain at the end.

### Sample Input
```text
5
12 30 18 25 15
```

### Sample Output
```text
Count 5, average 20.00, min 12, max 30
Above average: 30 25
```

### Solution
```java
import java.util.Scanner;

class Reading {
    private static int count = 0;
    private static long sum = 0;
    private static int min = Integer.MAX_VALUE;
    private static int max = Integer.MIN_VALUE;

    private final int value;
    private final Reading previous;

    Reading(int value, Reading previous) {
        this.value = value;
        this.previous = previous;
        count++;
        sum += value;
        min = Math.min(min, value);
        max = Math.max(max, value);
    }

    static int count() {
        return count;
    }

    static double average() {
        return count == 0 ? 0 : (double) sum / count;
    }

    static int min() {
        return min;
    }

    static int max() {
        return max;
    }

    boolean aboveAverage() {
        return value > average();
    }

    int getValue() {
        return value;
    }

    Reading getPrevious() {
        return previous;
    }
}

public class ReadingStats {
    static String aboveList(Reading last) {
        if (last == null) {
            return "";
        }
        String earlier = aboveList(last.getPrevious());
        if (!last.aboveAverage()) {
            return earlier;
        }
        return earlier + " " + last.getValue();
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        Reading last = null;
        for (int i = 0; i < n; i++) {
            last = new Reading(in.nextInt(), last);
        }
        if (Reading.count() == 0) {
            System.out.println("Count 0, average 0.00, min -, max -");
        } else {
            System.out.printf("Count %d, average %.2f, min %d, max %d%n",
                    Reading.count(), Reading.average(), Reading.min(), Reading.max());
        }
        System.out.println("Above average:" + aboveList(last));
    }
}
```

### Explanation
The four statistics describe all readings together, so they are `static`: one copy for
the class, updated by every constructor call. The value is per reading, so it is an
instance field. `aboveAverage()` is an instance method that reads both kinds of data,
which is allowed; a static method could not read `value`, because it has no particular
reading to look at. Without arrays, each reading keeps a reference to the previous
one, forming a simple chain; `aboveList` walks the chain recursively, building the
earlier part first so the values come out in input order.

## Problem 2: Parking Gates Sharing One Capacity
**Level:** Intermediate

### Problem Statement
A campus car park has 3 gates and one shared capacity (set once at the start with a
static method `Gate.configure(int capacity)`). Each `Gate` counts its own entries and
exits; the number of parked cars and the capacity are `static`, shared by all gates.

Methods: `String enter()` (refused when the car park is full) and `String exit()`
(refused when the car park is empty), each returning
`Gate <g>: in` / `Gate <g>: out` / `Gate <g>: FULL` / `Gate <g>: EMPTY` followed by
` (<parked>/<capacity>)`. A static `String summary()` returns
`Parked <p>/<c>`, and an instance `String report()` returns
`Gate <g>: <in> in, <out> out`.

Input: the capacity, then `n` lines `<gate number> IN|OUT`. Print each result, then the
three gate reports and the summary.

### Hint
Ask yourself for every field: is this one value per gate, or one value for the whole
car park? The answer decides `static` or not.

### Sample Input
```text
2
6
1 IN
2 IN
3 IN
2 OUT
3 IN
1 OUT
```

### Sample Output
```text
Gate 1: in (1/2)
Gate 2: in (2/2)
Gate 3: FULL (2/2)
Gate 2: out (1/2)
Gate 3: in (2/2)
Gate 1: out (1/2)
Gate 1: 1 in, 1 out
Gate 2: 1 in, 1 out
Gate 3: 1 in, 0 out
Parked 1/2
```

### Solution
```java
import java.util.Scanner;

class Gate {
    private static int capacity;
    private static int parked;

    private final int number;
    private int entries;
    private int exits;

    Gate(int number) {
        this.number = number;
    }

    static void configure(int newCapacity) {
        capacity = newCapacity;
        parked = 0;
    }

    private String state() {
        return " (" + parked + "/" + capacity + ")";
    }

    String enter() {
        if (parked == capacity) {
            return "Gate " + number + ": FULL" + state();
        }
        parked++;
        entries++;
        return "Gate " + number + ": in" + state();
    }

    String exit() {
        if (parked == 0) {
            return "Gate " + number + ": EMPTY" + state();
        }
        parked--;
        exits++;
        return "Gate " + number + ": out" + state();
    }

    String report() {
        return "Gate " + number + ": " + entries + " in, " + exits + " out";
    }

    static String summary() {
        return "Parked " + parked + "/" + capacity;
    }
}

public class ParkingGates {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Gate.configure(in.nextInt());
        Gate g1 = new Gate(1);
        Gate g2 = new Gate(2);
        Gate g3 = new Gate(3);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            int number = in.nextInt();
            Gate gate = number == 1 ? g1 : number == 2 ? g2 : g3;
            System.out.println(in.next().equals("IN") ? gate.enter() : gate.exit());
        }
        System.out.println(g1.report());
        System.out.println(g2.report());
        System.out.println(g3.report());
        System.out.println(Gate.summary());
    }
}
```

### Explanation
`parked` and `capacity` belong to the car park, not to any gate, so they are static:
when gate 2 lets a car out, gate 3 immediately sees one free space. `entries` and
`exits` are per gate, so they are instance fields. The sample shows the sharing in
action: gate 3 is refused at first because gates 1 and 2 filled the car park, and
succeeds later after gate 2 let a car out. `configure` is a static method because it
sets up the shared state before any gate is used.

## Problem 3: Order Status with an Enum
**Level:** Advanced

### Problem Statement
The canteen's online orders move through fixed states:
`PLACED → COOKING → READY → DELIVERED`, and an order can be `CANCELLED` only while it
is `PLACED` or `COOKING`. Write an `enum Status` with those five constants and a method
`boolean canMoveTo(Status next)` implementing the rules (a `switch` on `this`).

Write a class `Order` with a static counter that numbers orders from 1, an item name
and a `Status`. `String move(Status next)` returns
`Order <n> (<item>): <old> -> <new>` or `Order <n> (<item>): cannot go from <old> to <new>`.
A static method `String countByStatus(Order a, Order b, Order c)` returns how many of
the three orders are in each status, as `PLACED <k> COOKING <k> READY <k> DELIVERED <k>
CANCELLED <k>` (in the enum's order, using `Status.values()`).

Input: three item names (one line), then `n` lines `orderNumber STATUS`. Print each
move result, then the count line.

### Hint
`Status.valueOf("READY")` converts text to the enum constant. Put the transition
rules in the enum itself so that no other class needs to know them. `values()` returns
all constants in declaration order.

### Sample Input
```text
Biryani Tea Khichuri
6
1 COOKING
2 READY
1 READY
3 CANCELLED
1 DELIVERED
1 CANCELLED
```

### Sample Output
```text
Order 1 (Biryani): PLACED -> COOKING
Order 2 (Tea): cannot go from PLACED to READY
Order 1 (Biryani): COOKING -> READY
Order 3 (Khichuri): PLACED -> CANCELLED
Order 1 (Biryani): READY -> DELIVERED
Order 1 (Biryani): cannot go from DELIVERED to CANCELLED
PLACED 1 COOKING 0 READY 0 DELIVERED 1 CANCELLED 1
```

### Solution
```java
import java.util.Scanner;

enum Status {
    PLACED, COOKING, READY, DELIVERED, CANCELLED;

    boolean canMoveTo(Status next) {
        switch (this) {
            case PLACED:
                return next == COOKING || next == CANCELLED;
            case COOKING:
                return next == READY || next == CANCELLED;
            case READY:
                return next == DELIVERED;
            default:
                return false;
        }
    }
}

class Order {
    private static int nextNumber = 1;

    private final int number;
    private final String item;
    private Status status = Status.PLACED;

    Order(String item) {
        this.number = nextNumber++;
        this.item = item;
    }

    Status getStatus() {
        return status;
    }

    String move(Status next) {
        String head = "Order " + number + " (" + item + "): ";
        if (!status.canMoveTo(next)) {
            return head + "cannot go from " + status + " to " + next;
        }
        Status old = status;
        status = next;
        return head + old + " -> " + next;
    }

    static String countByStatus(Order a, Order b, Order c) {
        StringBuilder sb = new StringBuilder();
        for (Status s : Status.values()) {
            int k = 0;
            if (a.status == s) {
                k++;
            }
            if (b.status == s) {
                k++;
            }
            if (c.status == s) {
                k++;
            }
            if (sb.length() > 0) {
                sb.append(' ');
            }
            sb.append(s).append(' ').append(k);
        }
        return sb.toString();
    }
}

public class OrderStatusMachine {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Order o1 = new Order(in.next());
        Order o2 = new Order(in.next());
        Order o3 = new Order(in.next());
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            int number = in.nextInt();
            Status next = Status.valueOf(in.next());
            Order o = number == 1 ? o1 : number == 2 ? o2 : o3;
            System.out.println(o.move(next));
        }
        System.out.println(Order.countByStatus(o1, o2, o3));
    }
}
```

### Explanation
An `enum` is a class with a fixed set of instances created by Java itself; you cannot
create a sixth `Status`. Because constants are unique objects, comparing them with `==`
is correct. Putting `canMoveTo` inside the enum keeps the state machine's rules in one
place: `Order` asks "may I move?" and does not know the rules itself. The order counter
is static (one numbering for all orders) while each order's status is an instance
field. `countByStatus` is static because it is about several orders, not one; it can
still read their private fields because it is inside the `Order` class.
`Status.values()` returns the constants in declaration order, which fixes the order of
the count line.
