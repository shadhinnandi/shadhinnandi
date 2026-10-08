# Polymorphism and Interfaces

Dynamic dispatch, abstract classes, interfaces and designs where new kinds of objects
can be added without changing existing code (Chapter 10 and earlier). Programs read
input without prompts and print exactly the sample output.

## Problem 1: Equipment Rental Pricing
**Level:** Basic

### Problem Statement
The CSE club rents equipment to members. Write an abstract class `Rental` (item name,
days) with an abstract `int dailyRate()` and a concrete `int cost()`:
`dailyRate() × days`, with a 20% discount (integer) on the whole cost for rentals of
7 days or more. Subclasses: `CameraRental` (rate 500), `LaptopRental` (rate 300) and
`MicRental` (rate 100, but **never** discounted: it overrides `cost()`).

Input: `n`, then `n` lines `camera|laptop|mic name days`. Print
`<name>: <days> days x <rate> = <cost>` and finally `Total: <sum>`.

### Hint
Put the discount rule in the abstract class's `cost()`. The microphone overrides
`cost()` to skip it; everyone else inherits it unchanged.

### Sample Input
```text
4
camera Canon-1 3
laptop Dell-7 7
mic Shure-2 10
camera Nikon-4 8
```

### Sample Output
```text
Canon-1: 3 days x 500 = 1500
Dell-7: 7 days x 300 = 1680
Shure-2: 10 days x 100 = 1000
Nikon-4: 8 days x 500 = 3200
Total: 7380
```

### Solution
```java
import java.util.ArrayList;
import java.util.Scanner;

abstract class Rental {
    private final String name;
    protected final int days;

    Rental(String name, int days) {
        this.name = name;
        this.days = days;
    }

    abstract int dailyRate();

    int cost() {
        int full = dailyRate() * days;
        return days >= 7 ? full - full * 20 / 100 : full;
    }

    String line() {
        return name + ": " + days + " days x " + dailyRate() + " = " + cost();
    }
}

class CameraRental extends Rental {
    CameraRental(String name, int days) {
        super(name, days);
    }

    @Override
    int dailyRate() {
        return 500;
    }
}

class LaptopRental extends Rental {
    LaptopRental(String name, int days) {
        super(name, days);
    }

    @Override
    int dailyRate() {
        return 300;
    }
}

class MicRental extends Rental {
    MicRental(String name, int days) {
        super(name, days);
    }

    @Override
    int dailyRate() {
        return 100;
    }

    @Override
    int cost() {
        return dailyRate() * days;
    }
}

public class EquipmentRental {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        ArrayList<Rental> rentals = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String type = in.next();
            String name = in.next();
            int days = in.nextInt();
            if (type.equals("camera")) {
                rentals.add(new CameraRental(name, days));
            } else if (type.equals("laptop")) {
                rentals.add(new LaptopRental(name, days));
            } else {
                rentals.add(new MicRental(name, days));
            }
        }
        int total = 0;
        for (Rental r : rentals) {
            System.out.println(r.line());
            total += r.cost();
        }
        System.out.println("Total: " + total);
    }
}
```

### Explanation
Two methods vary. `dailyRate()` is abstract, so every subclass must supply it.
`cost()` is concrete with a default rule, and only `MicRental` overrides it. Inside
`line()`, the call `cost()` is dispatched on the actual object, so microphones are
never discounted even though `line()` is written in `Rental`. The total loop works only
with the `Rental` type.

## Problem 2: Composite Tax Rules
**Level:** Intermediate

### Problem Statement
An invoice can be taxed by several rules at once. Write an interface `TaxRule` with
`long taxOn(long amount)` and `String describe()`, and classes:

- `PercentTax(name, percent)`: `amount × percent / 100`; describes as `<name> <p>%`;
- `FixedTax(name, fee, threshold)`: `fee` if `amount >= threshold`, else 0; describes
  as `<name> <fee> over <threshold>`;
- `CompositeTax(name)`: holds a `List<TaxRule>` and its tax is the **sum** of its
  rules' taxes; it describes itself as `<name>[<rule>, <rule>, ...]`. A composite can
  contain other composites.

Input: lines defining rules, one per line, in the form `PERCENT id name p`,
`FIXED id name fee threshold`, `GROUP id name` and `ADD groupId ruleId` (add an already
defined rule to a group), ended by a line `END`; then `q` lines `ruleId amount`. For
each query print `<describe()> on <amount>: <tax>`.

### Hint
The composite implements the same interface as the simple rules, so code that uses a
`TaxRule` cannot tell the difference. Keep the defined rules in an `ArrayList` together
with their ids and look them up by id; groups also go in a second list with their
concrete type, so that `ADD` can call the group's `add` method.

### Sample Input
```text
PERCENT vat VAT 15
FIXED svc Service 50 1000
PERCENT city City 2
GROUP local Local
ADD local city
ADD local svc
GROUP all All
ADD all vat
ADD all local
END
3
vat 2000
local 800
all 2000
```

### Sample Output
```text
VAT 15% on 2000: 300
Local[City 2%, Service 50 over 1000] on 800: 16
All[VAT 15%, Local[City 2%, Service 50 over 1000]] on 2000: 390
```

### Solution
```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

interface TaxRule {
    long taxOn(long amount);

    String describe();
}

class PercentTax implements TaxRule {
    private final String name;
    private final int percent;

    PercentTax(String name, int percent) {
        this.name = name;
        this.percent = percent;
    }

    @Override
    public long taxOn(long amount) {
        return amount * percent / 100;
    }

    @Override
    public String describe() {
        return name + " " + percent + "%";
    }
}

class FixedTax implements TaxRule {
    private final String name;
    private final long fee;
    private final long threshold;

    FixedTax(String name, long fee, long threshold) {
        this.name = name;
        this.fee = fee;
        this.threshold = threshold;
    }

    @Override
    public long taxOn(long amount) {
        return amount >= threshold ? fee : 0;
    }

    @Override
    public String describe() {
        return name + " " + fee + " over " + threshold;
    }
}

class CompositeTax implements TaxRule {
    private final String name;
    private final List<TaxRule> rules = new ArrayList<>();

    CompositeTax(String name) {
        this.name = name;
    }

    void add(TaxRule rule) {
        rules.add(rule);
    }

    @Override
    public long taxOn(long amount) {
        long total = 0;
        for (TaxRule r : rules) {
            total += r.taxOn(amount);
        }
        return total;
    }

    @Override
    public String describe() {
        StringBuilder sb = new StringBuilder(name).append('[');
        for (int i = 0; i < rules.size(); i++) {
            if (i > 0) {
                sb.append(", ");
            }
            sb.append(rules.get(i).describe());
        }
        return sb.append(']').toString();
    }
}

public class CompositeTaxes {
    static final List<String> ruleIds = new ArrayList<>();
    static final List<TaxRule> rules = new ArrayList<>();
    static final List<String> groupIds = new ArrayList<>();
    static final List<CompositeTax> groups = new ArrayList<>();

    static void define(String id, TaxRule rule) {
        ruleIds.add(id);
        rules.add(rule);
    }

    static TaxRule rule(String id) {
        return rules.get(ruleIds.indexOf(id));
    }

    static CompositeTax group(String id) {
        return groups.get(groupIds.indexOf(id));
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (true) {
            String kind = in.next();
            if (kind.equals("END")) {
                break;
            }
            String id = in.next();
            if (kind.equals("PERCENT")) {
                String name = in.next();
                define(id, new PercentTax(name, in.nextInt()));
            } else if (kind.equals("FIXED")) {
                String name = in.next();
                long fee = in.nextLong();
                define(id, new FixedTax(name, fee, in.nextLong()));
            } else if (kind.equals("GROUP")) {
                CompositeTax group = new CompositeTax(in.next());
                groupIds.add(id);
                groups.add(group);
                define(id, group);
            } else {
                group(id).add(rule(in.next()));
            }
        }
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            TaxRule rule = rule(in.next());
            long amount = in.nextLong();
            System.out.println(rule.describe() + " on " + amount + ": " + rule.taxOn(amount));
        }
    }
}
```

### Explanation
This is the Composite pattern: a group of rules is itself a rule. `CompositeTax.taxOn`
asks each child for its tax without knowing whether the child is a simple rule or
another group, and dynamic dispatch handles the recursion: `All` asks `Local`, which
asks `City` and `Service`. The query loop treats every rule the same way. The lists of ids
are only a simple lookup table: `indexOf` finds an id's position, and the rule sits at
the same position in the parallel list. Adding a new kind of rule (for example a capped tax) needs one new class
and no change to `CompositeTax` or the query loop.

## Problem 3: Campus Event Notifications
**Level:** Advanced

### Problem Statement
Different parts of the campus app want to react when something happens: the
notice-board shows every event, the SMS service only cares about urgent ones, and the
attendance service counts class events. Write:

- an interface `Listener` with `String onEvent(Event e)` (returns a line to print, or
  `null` to stay silent) and a `default String name()` returning the class's simple
  name;
- an immutable class `Event` (type, text, urgent flag);
- listeners `NoticeBoard` (always `board: <text>`), `SmsAlert` (only urgent:
  `sms: URGENT <text>`) and `AttendanceCounter` (counts events of type `CLASS`, prints
  `attendance: class #<k>` for each);
- an `EventBus` with `subscribe(Listener)`, `unsubscribe(String name)` (by name; returns
  whether it was found) and `publish(Event)`, which calls listeners **in subscription
  order** and prints each non-null line.

Commands: `SUB name`, `UNSUB name`, `PUB type urgent|normal text...`. For SUB print
`subscribed <name>` (or `already subscribed <name>`), for UNSUB print
`unsubscribed <name>` or `not subscribed <name>`, and for PUB print
`event <type>: <k> notified` after the listeners' lines, where `k` is the number of
non-null responses.

### Hint
The bus holds a `List<Listener>` and never checks listener classes. Use
`getClass().getSimpleName()` for the default name. Create a listener object from its
name only in one factory method.

### Sample Input
```text
8
SUB NoticeBoard
SUB SmsAlert
SUB AttendanceCounter
PUB CLASS normal OOP lab moved to 702
PUB EXAM urgent Midterm starts 9:00
UNSUB SmsAlert
PUB CLASS urgent CSE1115 cancelled today
SUB NoticeBoard
```

### Sample Output
```text
subscribed NoticeBoard
subscribed SmsAlert
subscribed AttendanceCounter
board: OOP lab moved to 702
attendance: class #1
event CLASS: 2 notified
board: Midterm starts 9:00
sms: URGENT Midterm starts 9:00
event EXAM: 2 notified
unsubscribed SmsAlert
board: CSE1115 cancelled today
attendance: class #2
event CLASS: 2 notified
already subscribed NoticeBoard
```

### Solution
```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

final class Event {
    private final String type;
    private final String text;
    private final boolean urgent;

    Event(String type, String text, boolean urgent) {
        this.type = type;
        this.text = text;
        this.urgent = urgent;
    }

    String getType() {
        return type;
    }

    String getText() {
        return text;
    }

    boolean isUrgent() {
        return urgent;
    }
}

interface Listener {
    String onEvent(Event e);

    default String name() {
        return getClass().getSimpleName();
    }
}

class NoticeBoard implements Listener {
    @Override
    public String onEvent(Event e) {
        return "board: " + e.getText();
    }
}

class SmsAlert implements Listener {
    @Override
    public String onEvent(Event e) {
        return e.isUrgent() ? "sms: URGENT " + e.getText() : null;
    }
}

class AttendanceCounter implements Listener {
    private int classEvents;

    @Override
    public String onEvent(Event e) {
        if (!e.getType().equals("CLASS")) {
            return null;
        }
        classEvents++;
        return "attendance: class #" + classEvents;
    }
}

class EventBus {
    private final List<Listener> listeners = new ArrayList<>();

    private Listener find(String name) {
        for (Listener l : listeners) {
            if (l.name().equals(name)) {
                return l;
            }
        }
        return null;
    }

    String subscribe(Listener l) {
        if (find(l.name()) != null) {
            return "already subscribed " + l.name();
        }
        listeners.add(l);
        return "subscribed " + l.name();
    }

    boolean unsubscribe(String name) {
        Listener l = find(name);
        return l != null && listeners.remove(l);
    }

    int publish(Event e) {
        int notified = 0;
        for (Listener l : listeners) {
            String line = l.onEvent(e);
            if (line != null) {
                System.out.println(line);
                notified++;
            }
        }
        return notified;
    }
}

public class CampusEvents {
    static Listener create(String name) {
        if (name.equals("NoticeBoard")) {
            return new NoticeBoard();
        } else if (name.equals("SmsAlert")) {
            return new SmsAlert();
        }
        return new AttendanceCounter();
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        EventBus bus = new EventBus();
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String command = in.next();
            if (command.equals("SUB")) {
                System.out.println(bus.subscribe(create(in.next())));
            } else if (command.equals("UNSUB")) {
                String name = in.next();
                System.out.println((bus.unsubscribe(name) ? "unsubscribed " : "not subscribed ") + name);
            } else {
                String type = in.next();
                boolean urgent = in.next().equals("urgent");
                Event e = new Event(type, in.nextLine().trim(), urgent);
                int k = bus.publish(e);
                System.out.println("event " + type + ": " + k + " notified");
            }
        }
    }
}
```

### Explanation
This is the Observer pattern. The `EventBus` knows only the `Listener` interface;
whether a listener prints, filters or counts is decided by its own `onEvent`, chosen
by dynamic dispatch. The default method `name()` gives every listener a name without
writing it three times; `getClass()` returns the **runtime** class, so it says
`SmsAlert` even though the code lives in the interface. Returning `null` lets a listener
decline an event without the bus knowing why. New listeners (an email digest, a
logger) can be added without touching the bus: the code that publishes events is
closed for modification and open for extension.
