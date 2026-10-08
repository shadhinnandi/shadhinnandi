# Object-Oriented I/O

Reading and writing text files, appending, closing resources reliably, and storing
program state in files (Chapter 12 and earlier). Programs read input without prompts
and print exactly the sample output; `File` blocks show files that exist before the run
(input) or must exist after it (output).

## Problem 1: Numbering the Lines of a File
**Level:** Basic

### Problem Statement
Read `notes.txt` and write `numbered.txt` in which every **non-blank** line is
prefixed with its number among the non-blank lines, right-aligned in 3 characters and
followed by `: ` (`String.format("%3d: %s", ...)`), while blank lines are copied as
empty lines. Standard input contains the two file names. Print
`<total> lines, <blank> blank, <numbered> numbered` to standard output, or
`Cannot open <name>` if the input file does not exist.

### Hint
Read with `BufferedReader.readLine()` and write with `PrintWriter`, both in one
try-with-resources statement. Use `line.isBlank()` to detect blank lines (also lines
that contain only spaces).

### Sample Input
```text
notes.txt numbered.txt
```
**File `notes.txt`**
```text
Classes are blueprints.

Objects are instances.
   
References point to objects.
```

### Sample Output
```text
5 lines, 2 blank, 3 numbered
```
**File `numbered.txt`**
```text
  1: Classes are blueprints.

  2: Objects are instances.

  3: References point to objects.
```

### Solution
```java
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Scanner;

public class NumberLines {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String source = in.next();
        String target = in.next();
        int total = 0;
        int blank = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(source));
             PrintWriter writer = new PrintWriter(target)) {
            String line;
            while ((line = reader.readLine()) != null) {
                total++;
                if (line.isBlank()) {
                    blank++;
                    writer.println();
                } else {
                    writer.println(String.format("%3d: %s", total - blank, line));
                }
            }
        } catch (FileNotFoundException e) {
            System.out.println("Cannot open " + source);
            return;
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
            return;
        }
        System.out.println(total + " lines, " + blank + " blank, " + (total - blank) + " numbered");
    }
}
```

### Explanation
The number of a non-blank line is "lines so far minus blank lines so far", so no
second counter is needed. Both streams are opened in one try-with-resources; if the
input file does not exist, `FileReader` throws `FileNotFoundException` before the
writer is created, so no empty output file is produced. That more specific exception is
caught before the general `IOException`. `PrintWriter` buffers its output, and closing
it (done automatically here) flushes everything to the file.

## Problem 2: Server Log Analyzer
**Level:** Intermediate

### Problem Statement
The university portal writes `server.log` with lines `HH:MM:SS LEVEL message...`,
where `LEVEL` is `INFO`, `WARN` or `ERROR`. Some lines are corrupted. Read the file
(its name is given on standard input) and:

- count lines per level and corrupted lines (fewer than three fields, or an unknown
  level);
- write every `ERROR` line's time and message to `errors.txt` as `<time> <message>`;
- print:

```text
INFO <a>, WARN <b>, ERROR <c>, corrupted <d>
First error: <time or none>
Last error: <time or none>
```

### Hint
`line.split(" ", 3)` splits into at most three parts, so the message keeps its spaces.
Keep the error times as you go: the first one is set once, the last one is updated
every time.

### Sample Input
```text
server.log
```
**File `server.log`**
```text
08:00:01 INFO Portal started
08:15:42 WARN Slow response from results service
08:16:03 ERROR Results service timeout
garbage
08:30:10 DEBUG Cache refreshed
09:02:55 ERROR Login database unreachable
09:03:10 INFO Login database reconnected
```

### Sample Output
```text
INFO 2, WARN 1, ERROR 2, corrupted 2
First error: 08:16:03
Last error: 09:02:55
```
**File `errors.txt`**
```text
08:16:03 Results service timeout
09:02:55 Login database unreachable
```

### Solution
```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Scanner;

class LogSummary {
    int info;
    int warn;
    int error;
    int corrupted;
    String firstError;
    String lastError;

    void add(String line, PrintWriter errors) {
        String[] parts = line.split(" ", 3);
        if (parts.length < 3) {
            corrupted++;
            return;
        }
        String time = parts[0];
        String level = parts[1];
        if (level.equals("INFO")) {
            info++;
        } else if (level.equals("WARN")) {
            warn++;
        } else if (level.equals("ERROR")) {
            error++;
            if (firstError == null) {
                firstError = time;
            }
            lastError = time;
            errors.println(time + " " + parts[2]);
        } else {
            corrupted++;
        }
    }

    void print() {
        System.out.println("INFO " + info + ", WARN " + warn + ", ERROR " + error + ", corrupted " + corrupted);
        System.out.println("First error: " + (firstError == null ? "none" : firstError));
        System.out.println("Last error: " + (lastError == null ? "none" : lastError));
    }
}

public class LogAnalyzer {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        String logName = in.next();
        LogSummary summary = new LogSummary();
        try (BufferedReader reader = new BufferedReader(new FileReader(logName));
             PrintWriter errors = new PrintWriter("errors.txt")) {
            String line;
            while ((line = reader.readLine()) != null) {
                summary.add(line, errors);
            }
        } catch (IOException e) {
            System.out.println("Cannot read " + logName);
            return;
        }
        summary.print();
    }
}
```

### Explanation
The file handling stays in `main` and the analysis lives in `LogSummary`, which only
sees one line at a time; this separation makes the analysis easy to test without
files. `split(" ", 3)` limits the number of pieces, so `Results service timeout` stays
one piece. A line with an unknown level (`DEBUG`) is counted as corrupted rather than
crashing the run. The error file is written while reading, in one pass, so even a very
large log never has to fit in memory.

## Problem 3: An Append-Only Key-Value Store
**Level:** Advanced

### Problem Statement
A tiny settings database stores its history in `store.log`, one change per line:
`SET key value` or `DEL key`. At start-up the program **replays** the log to rebuild the
current values. Commands from standard input:

- `SET key value`: store and append the line to the log; print `OK`;
- `DEL key`: if present, remove and append; print `OK` or `NOT FOUND`;
- `GET key`: print the value or `NOT FOUND`;
- `COMPACT`: rewrite `store.log` so it contains only one `SET` line per current key,
  sorted by key; print `compacted <old line count> -> <new line count>`.

Keys and values are single words. Before the commands, print
`replayed <n> entries, <k> keys`. Keep the keys and values in two parallel
`ArrayList<String>`s (maps are covered in Chapter 13).

### Hint
Make one class own the data and one method `apply(String line)` used by both replay and
new commands, so the two can never disagree. Appending uses
`new FileWriter("store.log", true)`; compacting writes a fresh file with
`new PrintWriter("store.log")`.

### Sample Input
```text
GET theme
SET theme light
DEL font
GET lang
COMPACT
GET theme
```
**File `store.log`**
```text
SET theme dark
SET lang bn
SET font Kalpurush
DEL lang
SET lang en
SET font Inter
```

### Sample Output
```text
replayed 6 entries, 3 keys
dark
OK
OK
en
compacted 8 -> 2
light
```
**File `store.log`**
```text
SET lang en
SET theme light
```

### Solution
```java
import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

class KeyValueStore {
    private static final String LOG = "store.log";
    private final List<String> keys = new ArrayList<>();
    private final List<String> values = new ArrayList<>();
    private int logLines;

    int replay() throws IOException {
        int entries = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(LOG))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.isBlank()) {
                    apply(line);
                    entries++;
                }
            }
        } catch (FileNotFoundException e) {
            return 0;
        }
        logLines = entries;
        return entries;
    }

    /** Applies one log line; returns false for a DEL of a missing key. */
    private boolean apply(String line) {
        String[] p = line.trim().split("\\s+");
        int i = keys.indexOf(p[1]);
        if (p[0].equals("SET")) {
            if (i >= 0) {
                values.set(i, p[2]);
            } else {
                keys.add(p[1]);
                values.add(p[2]);
            }
            return true;
        }
        if (i < 0) {
            return false;
        }
        keys.remove(i);
        values.remove(i);
        return true;
    }

    String execute(String command) throws IOException {
        String[] p = command.trim().split("\\s+");
        if (p[0].equals("GET")) {
            int i = keys.indexOf(p[1]);
            return i < 0 ? "NOT FOUND" : values.get(i);
        }
        if (p[0].equals("COMPACT")) {
            return compact();
        }
        if (!apply(command)) {
            return "NOT FOUND";
        }
        try (PrintWriter out = new PrintWriter(new FileWriter(LOG, true))) {
            out.println(command.trim());
        }
        logLines++;
        return "OK";
    }

    private String compact() throws IOException {
        List<String> sorted = new ArrayList<>(keys);
        sorted.sort(null);
        try (PrintWriter out = new PrintWriter(LOG)) {
            for (String key : sorted) {
                out.println("SET " + key + " " + values.get(keys.indexOf(key)));
            }
        }
        String result = "compacted " + logLines + " -> " + sorted.size();
        logLines = sorted.size();
        return result;
    }

    int size() {
        return keys.size();
    }
}

public class KeyValueLog {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        KeyValueStore store = new KeyValueStore();
        try {
            int entries = store.replay();
            System.out.println("replayed " + entries + " entries, " + store.size() + " keys");
            while (in.hasNextLine()) {
                String command = in.nextLine();
                if (!command.isBlank()) {
                    System.out.println(store.execute(command));
                }
            }
        } catch (IOException e) {
            System.out.println("Storage error: " + e.getMessage());
        }
    }
}
```

### Explanation
The log is the single source of truth and the lists are a cache rebuilt from it. Using
the same `apply` method for replayed lines and new commands guarantees that a value
seen now will be the same value after a restart. New changes are **appended**, which
is fast and never damages earlier history; the price is that the log keeps growing,
which is why `COMPACT` rewrites it with only the live keys. Real databases (and tools
such as Redis' append-only file) use the same design. `sorted.sort(null)` sorts strings
in their natural order. A missing log simply means an empty store.
