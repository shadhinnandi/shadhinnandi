# Generics

Generic classes and methods, bounded type parameters, wildcards and generic
collections (Chapter 13 and earlier). Programs read input without prompts and print
exactly the sample output.

## Problem 1: A Bounded Generic Stack
**Level:** Basic

### Problem Statement
Write a generic class `BoundedStack<T>` with a fixed capacity, backed by an
`ArrayList<T>`, with `boolean push(T item)` (false when full), `T pop()` (`null` when
empty), `T peek()`, `int size()` and `boolean isFull()`.

Use **two** stacks in `main`: a `BoundedStack<String>` for undoable editor actions and a
`BoundedStack<Integer>` for page numbers visited. Input: the capacity, then `n`, then `n`
commands: `DO action`, `UNDO`, `VISIT page`, `BACK`. Print:

- `DO`: `done <action>` or `history full, <action> not saved`;
- `UNDO`: `undo <action>` or `nothing to undo`;
- `VISIT`: `at page <p>` or `too many pages`;
- `BACK`: `back to page <p>` (the new top) or `no previous page` (if fewer than two
  pages are stacked, nothing is popped).

### Hint
Only the class is generic; each stack object is created with a concrete type, so
`pop()` on the page stack returns an `Integer` without a cast.

### Sample Input
```text
2
9
DO type
DO bold
DO italic
UNDO
VISIT 1
VISIT 5
VISIT 9
BACK
BACK
```

### Sample Output
```text
done type
done bold
history full, italic not saved
undo bold
at page 1
at page 5
too many pages
back to page 1
no previous page
```

### Solution
```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

class BoundedStack<T> {
    private final List<T> items = new ArrayList<>();
    private final int capacity;

    BoundedStack(int capacity) {
        this.capacity = capacity;
    }

    boolean push(T item) {
        if (isFull()) {
            return false;
        }
        items.add(item);
        return true;
    }

    T pop() {
        return items.isEmpty() ? null : items.remove(items.size() - 1);
    }

    T peek() {
        return items.isEmpty() ? null : items.get(items.size() - 1);
    }

    int size() {
        return items.size();
    }

    boolean isFull() {
        return items.size() == capacity;
    }
}

public class GenericStacks {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int capacity = in.nextInt();
        BoundedStack<String> actions = new BoundedStack<>(capacity);
        BoundedStack<Integer> pages = new BoundedStack<>(capacity);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String command = in.next();
            if (command.equals("DO")) {
                String action = in.next();
                System.out.println(actions.push(action) ? "done " + action
                        : "history full, " + action + " not saved");
            } else if (command.equals("UNDO")) {
                String last = actions.pop();
                System.out.println(last == null ? "nothing to undo" : "undo " + last);
            } else if (command.equals("VISIT")) {
                int page = in.nextInt();
                System.out.println(pages.push(page) ? "at page " + page : "too many pages");
            } else if (pages.size() < 2) {
                System.out.println("no previous page");
            } else {
                pages.pop();
                System.out.println("back to page " + pages.peek());
            }
        }
    }
}
```

### Explanation
`BoundedStack<T>` is written once and the compiler creates no separate copies; instead
it checks each use: `actions.push(5)` would be a compile error, and
`pages.peek()` is known to be an `Integer`. `pages.push(page)` passes an `int`, which
is autoboxed to `Integer` because generics work only with reference types. Returning
`null` for an empty stack is simple, but callers must check for it; the program does so
before printing.

## Problem 2: The Best by Any Rule
**Level:** Intermediate

### Problem Statement
Write a generic method

```java
static <T> T maxBy(List<? extends T> items, Comparator<? super T> rule)
```

returning the largest element according to `rule` (the first one on a tie), or `null`
for an empty list. Use it, without changing it, with:

- a `List<Student>` and a `Comparator<Student>` by CGPA;
- the same list and a `Comparator<Person>` by name length (`Student extends Person`),
  which works because of `? super T`;
- a `List<Integer>` and `Comparator.naturalOrder()`.

Input: `n` students `name cgpa`, then `m` integers. Print
`Top CGPA: <name> (<cgpa 2 decimals>)`, `Longest name: <name>`,
`Largest number: <x>` (`none` for empty lists).

### Hint
`? extends T` lets you **read** `T` values from a list of any subtype. `? super T` lets
you pass a comparator written for any supertype. Together they make the method
accept far more combinations than `List<T>` and `Comparator<T>` would.

### Sample Input
```text
3
Ayesha 3.85
Muhammad 3.40
Rafi 3.85
4
7 42 -3 42
```

### Sample Output
```text
Top CGPA: Ayesha (3.85)
Longest name: Muhammad
Largest number: 42
```

### Solution
```java
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Scanner;

class Person {
    private final String name;

    Person(String name) {
        this.name = name;
    }

    String getName() {
        return name;
    }
}

class Student extends Person {
    private final double cgpa;

    Student(String name, double cgpa) {
        super(name);
        this.cgpa = cgpa;
    }

    double getCgpa() {
        return cgpa;
    }
}

class ByCgpa implements Comparator<Student> {
    @Override
    public int compare(Student a, Student b) {
        return Double.compare(a.getCgpa(), b.getCgpa());
    }
}

class ByNameLength implements Comparator<Person> {
    @Override
    public int compare(Person a, Person b) {
        return Integer.compare(a.getName().length(), b.getName().length());
    }
}

public class BestByRule {
    static <T> T maxBy(List<? extends T> items, Comparator<? super T> rule) {
        T best = null;
        for (T item : items) {
            if (best == null || rule.compare(item, best) > 0) {
                best = item;
            }
        }
        return best;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        List<Student> students = new ArrayList<>();
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            students.add(new Student(in.next(), in.nextDouble()));
        }
        List<Integer> numbers = new ArrayList<>();
        int m = in.nextInt();
        for (int i = 0; i < m; i++) {
            numbers.add(in.nextInt());
        }

        Student top = maxBy(students, new ByCgpa());
        Person longest = maxBy(students, new ByNameLength());
        Integer largest = maxBy(numbers, Comparator.naturalOrder());
        System.out.println(top == null ? "Top CGPA: none"
                : String.format("Top CGPA: %s (%.2f)", top.getName(), top.getCgpa()));
        System.out.println("Longest name: " + (longest == null ? "none" : longest.getName()));
        System.out.println("Largest number: " + (largest == null ? "none" : largest));
    }
}
```

### Explanation
In the second call `T` is inferred as `Person`: the `List<Student>` is accepted as a
`List<? extends Person>` and the `Comparator<Person>` as a `Comparator<? super Person>`.
Without wildcards, `maxBy(students, new ByNameLength())` would not compile, because a
`List<Student>` is **not** a `List<Person>` (generic types are not covariant).
`Comparator.naturalOrder()` gives a comparator for any `Comparable` type, here
`Integer`. This "producer extends, consumer super" rule (PECS) is how Java's own
`Collections.max` is declared.

## Problem 3: A Generic LRU Cache
**Level:** Advanced

### Problem Statement
A Least Recently Used (LRU) cache keeps at most `capacity` entries; when a new key
would exceed the capacity, the entry that was used least recently is evicted. Both
`get` and `put` count as use.

Write `class LruCache<K, V> extends LinkedHashMap<K, V>` using the constructor
`super(16, 0.75f, true)` (the `true` makes the map keep **access order**) and override
`removeEldestEntry` so that it returns `true` when `size() > capacity`. Count hits and
misses in a wrapper method `V lookup(K key)`.

Use it as a cache of student names by ID. Input: the capacity, then commands
`PUT id name`, `GET id` and `SHOW`. Print `stored <id>` for PUT, `hit <id> <name>` or
`miss <id>` for GET, and for SHOW the keys from least to most recently used as
`cache: [id, id, ...]`. Finally print `hits <h>, misses <m>`.

### Hint
`LinkedHashMap` already maintains a linked list of entries; with access order, every
`get` and `put` moves the entry to the end. After each `put` the map calls
`removeEldestEntry` with the first (oldest) entry. `keySet().toString()` prints the
keys in that order.

### Sample Input
```text
2
PUT 101 Rahim
PUT 102 Nusrat
GET 101
PUT 103 Imran
GET 102
SHOW
GET 101
PUT 101 Rahim-H
SHOW
```

### Sample Output
```text
stored 101
stored 102
hit 101 Rahim
stored 103
miss 102
cache: [101, 103]
hit 101 Rahim
stored 101
cache: [103, 101]
hits 2, misses 1
```

### Solution
```java
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Scanner;

class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    private int hits;
    private int misses;

    LruCache(int capacity) {
        super(16, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }

    V lookup(K key) {
        V value = get(key);
        if (value == null) {
            misses++;
        } else {
            hits++;
        }
        return value;
    }

    String stats() {
        return "hits " + hits + ", misses " + misses;
    }
}

public class StudentCache {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        LruCache<String, String> cache = new LruCache<>(in.nextInt());
        while (in.hasNext()) {
            String command = in.next();
            if (command.equals("PUT")) {
                String id = in.next();
                cache.put(id, in.next());
                System.out.println("stored " + id);
            } else if (command.equals("GET")) {
                String id = in.next();
                String name = cache.lookup(id);
                System.out.println(name == null ? "miss " + id : "hit " + id + " " + name);
            } else {
                System.out.println("cache: " + cache.keySet());
            }
        }
        System.out.println(cache.stats());
    }
}
```

### Explanation
The class is generic in both the key and the value type, and inherits everything else
from `LinkedHashMap<K, V>`. It customises the map through one protected hook,
`removeEldestEntry`, which the map calls after every insertion: a clean example of
extending a library class without rewriting it. Tracing the sample: after `GET 101`,
101 is the most recent, so inserting 103 evicts 102; the following `GET 102` is a miss.
`PUT 101 Rahim-H` replaces the value and also counts as a use. LRU caches are used
everywhere, from browsers to databases, to keep the most useful data in fast memory.
