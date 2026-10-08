# Encapsulation and Abstraction

Protecting an object's rules with private fields and careful methods, immutable
classes, and exposing what an object does while hiding how (Chapter 05 and earlier).
Programs read input without prompts and print exactly the sample output.

## Problem 1: A Thermostat That Cannot Be Misconfigured
**Level:** Basic

### Problem Statement
A thermostat has a minimum, a target and a maximum temperature, and the rule
`min <= target <= max` must **always** hold. Write a class `Thermostat` (starting at
min 16, target 24, max 30) with private fields and methods `boolean setMin(int)`,
`boolean setMax(int)` and `boolean setTarget(int)` that refuse any change that would
break the rule. Provide `toString()` returning `min <a>, target <b>, max <c>`.

Input: `n`, then `n` commands `MIN v`, `MAX v` or `TARGET v`. Print `OK: <state>` or
`REFUSED: <state>` after each command.

### Hint
Each setter must check the new value against the **other two** fields before
changing anything. Raising the minimum above the current target, for example, must be
refused, even though the new minimum is below the maximum.

### Sample Input
```text
6
TARGET 31
MIN 25
TARGET 26
MIN 25
MAX 25
MAX 26
```

### Sample Output
```text
REFUSED: min 16, target 24, max 30
REFUSED: min 16, target 24, max 30
OK: min 16, target 26, max 30
OK: min 25, target 26, max 30
REFUSED: min 25, target 26, max 30
OK: min 25, target 26, max 26
```

### Solution
```java
import java.util.Scanner;

class Thermostat {
    private int min = 16;
    private int target = 24;
    private int max = 30;

    public boolean setMin(int value) {
        if (value > target) {
            return false;
        }
        min = value;
        return true;
    }

    public boolean setMax(int value) {
        if (value < target) {
            return false;
        }
        max = value;
        return true;
    }

    public boolean setTarget(int value) {
        if (value < min || value > max) {
            return false;
        }
        target = value;
        return true;
    }

    @Override
    public String toString() {
        return "min " + min + ", target " + target + ", max " + max;
    }
}

public class ThermostatRules {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Thermostat t = new Thermostat();
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String what = in.next();
            int value = in.nextInt();
            boolean ok;
            if (what.equals("MIN")) {
                ok = t.setMin(value);
            } else if (what.equals("MAX")) {
                ok = t.setMax(value);
            } else {
                ok = t.setTarget(value);
            }
            System.out.println((ok ? "OK: " : "REFUSED: ") + t);
        }
    }
}
```

### Explanation
The invariant involves three fields, so a setter that only checks its own value is not
enough: `setMin(25)` looks reasonable on its own (25 < 30), but with the target at 24
it would break `min <= target`. Because all three fields are private and every change
goes through a checking method, the invariant holds from the moment the object is
created until it disappears. Sometimes the **order** of changes matters, as in the
sample: raising the minimum to 25 works only after the target has moved up to 26.

## Problem 2: Immutable Time Ranges
**Level:** Intermediate

### Problem Statement
Write an immutable class `TimeRange` for a booking on one day, stored as minutes since
midnight (`private final int start, end`, with `start < end`). Provide a static factory
`TimeRange.of(String text)` for text like `09:30-11:00` (returns `null` for an invalid
or empty range), `boolean overlaps(TimeRange o)` (touching ranges like 10:00–11:00 and
11:00–12:00 do **not** overlap), `TimeRange merge(TimeRange o)` returning a **new**
range covering both (only for overlapping or touching ranges), and `toString()` in the
same `HH:MM-HH:MM` form.

Input: `q`, then `q` lines with two ranges. Print
`<r1> and <r2>: overlap` / `<r1> and <r2>: no overlap`, followed by
`, merged <m>` when they overlap or touch. If either range is invalid print
`invalid range`.

### Hint
Do the conversion between text and minutes in exactly one place each way (`of` and
`toString`). Two ranges overlap when each starts before the other ends. They touch
when one ends exactly where the other starts.

### Sample Input
```text
4
09:30-11:00 10:15-12:00
10:00-11:00 11:00-12:30
08:00-09:00 13:00-14:00
12:00-11:00 08:00-09:00
```

### Sample Output
```text
09:30-11:00 and 10:15-12:00: overlap, merged 09:30-12:00
10:00-11:00 and 11:00-12:30: no overlap, merged 10:00-12:30
08:00-09:00 and 13:00-14:00: no overlap
invalid range
```

### Solution
```java
import java.util.Scanner;

final class TimeRange {
    private final int start;
    private final int end;

    private TimeRange(int start, int end) {
        this.start = start;
        this.end = end;
    }

    static TimeRange of(String text) {
        if (text.length() != 11 || text.charAt(5) != '-') {
            return null;
        }
        int s = minutes(text.substring(0, 5));
        int e = minutes(text.substring(6));
        if (s < 0 || e < 0 || s >= e) {
            return null;
        }
        return new TimeRange(s, e);
    }

    private static int minutes(String hhmm) {
        int h = Integer.parseInt(hhmm.substring(0, 2));
        int m = Integer.parseInt(hhmm.substring(3, 5));
        if (h > 23 || m > 59) {
            return -1;
        }
        return h * 60 + m;
    }

    boolean overlaps(TimeRange o) {
        return start < o.end && o.start < end;
    }

    boolean touches(TimeRange o) {
        return end == o.start || o.end == start;
    }

    TimeRange merge(TimeRange o) {
        return new TimeRange(Math.min(start, o.start), Math.max(end, o.end));
    }

    @Override
    public String toString() {
        return String.format("%02d:%02d-%02d:%02d", start / 60, start % 60, end / 60, end % 60);
    }
}

public class TimeRanges {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            TimeRange a = TimeRange.of(in.next());
            TimeRange b = TimeRange.of(in.next());
            if (a == null || b == null) {
                System.out.println("invalid range");
                continue;
            }
            String line = a + " and " + b + ": " + (a.overlaps(b) ? "overlap" : "no overlap");
            if (a.overlaps(b) || a.touches(b)) {
                line += ", merged " + a.merge(b);
            }
            System.out.println(line);
        }
    }
}
```

### Explanation
The constructor is private, so the only way to get a `TimeRange` is `of`, which
validates the text; therefore no invalid range can exist, and every other method can
trust `start < end`. The fields are `private final` and the class is `final`, so a
range never changes after creation; `merge` returns a new object and leaves both inputs
untouched. Callers never see minutes-since-midnight: that representation is hidden
behind `of` and `toString`, which is abstraction. If the class later switched to
`java.time.LocalTime`, no caller would need to change.

## Problem 3: Rate-Limited API Key
**Level:** Advanced

### Problem Statement
The university's open data service gives each developer an API key. A key may make
**at most 3 requests in any 10-second window**: a request at time `t` is allowed only
if fewer than 3 allowed requests happened in the interval `(t − 10, t]`. The secret key
string must never be readable from outside the class.

Write a class `ApiKey` with a private secret, three private fields holding the times of
the last three allowed requests (no arrays: this chapter has none yet), and
`String request(String presentedSecret, int time)` returning:

- `DENIED (bad key)` if the secret does not match;
- `DENIED (rate limit, retry at <t>)` if the window is full, where `t` is the earliest
  time at which a request would be allowed;
- `OK` otherwise.

Times are non-decreasing whole seconds. Also provide `int allowedCount()`.

Input: the real secret, then `n` lines `secret time`. Print `t=<time>: <result>` for
each, then `Allowed: <count>`.

### Hint
Keep the last three allowed times in order (oldest first). The window is full when
there are three of them and the oldest is greater than `time − 10`. The retry time is
`oldest + 10`. When a request is allowed, shift the times along and store the new one.

### Sample Input
```text
k3y-CSE
7
k3y-CSE 0
k3y-CSE 2
wrong 3
k3y-CSE 5
k3y-CSE 9
k3y-CSE 10
k3y-CSE 10
```

### Sample Output
```text
t=0: OK
t=2: OK
t=3: DENIED (bad key)
t=5: OK
t=9: DENIED (rate limit, retry at 10)
t=10: OK
t=10: DENIED (rate limit, retry at 12)
Allowed: 4
```

### Solution
```java
import java.util.Scanner;

class ApiKey {
    private static final int LIMIT_WINDOW = 10;
    private final String secret;
    private int oldest = -1;
    private int middle = -1;
    private int newest = -1;
    private int stored = 0;
    private int allowed = 0;

    ApiKey(String secret) {
        this.secret = secret;
    }

    public String request(String presentedSecret, int time) {
        if (!secret.equals(presentedSecret)) {
            return "DENIED (bad key)";
        }
        if (stored == 3 && oldest > time - LIMIT_WINDOW) {
            return "DENIED (rate limit, retry at " + (oldest + LIMIT_WINDOW) + ")";
        }
        oldest = middle;
        middle = newest;
        newest = time;
        if (stored < 3) {
            stored++;
        }
        allowed++;
        return "OK";
    }

    public int allowedCount() {
        return allowed;
    }
}

public class RateLimitedKey {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        ApiKey key = new ApiKey(in.next());
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String presented = in.next();
            int time = in.nextInt();
            System.out.println("t=" + time + ": " + key.request(presented, time));
        }
        System.out.println("Allowed: " + key.allowedCount());
    }
}
```

### Explanation
From the outside, `ApiKey` offers one operation, "make a request", and hides two
things: the secret (stored but never returned) and the sliding-window bookkeeping. A
caller cannot cheat by resetting the counters, because they are private and only
`request` changes them. The three time fields act as a tiny queue: on every allowed
request the oldest drops out and the new time enters at the other end. While fewer than
three requests have been allowed, `stored < 3` means the window cannot be full. At
`t=9` the three allowed times are 0, 2 and 5; 0 is still inside `(−1, 9]`, so the
request waits until `0 + 10 = 10`. Because the class's public behaviour is so small, the
implementation could later switch to a list or a database without changing callers.
