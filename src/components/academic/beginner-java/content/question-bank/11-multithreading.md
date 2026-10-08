# Multithreading

Threads, `join`, `synchronized`, `AtomicInteger` and thread pools, with programs whose
output is the same on every run (Chapter 14 and earlier). Programs read input without
prompts and print exactly the sample output.

## Problem 1: Counting Vowels in Parallel
**Level:** Basic

### Problem Statement
Split a line of text into `k` nearly equal parts (part `i` covers characters
`i × len / k` up to, not including, `(i + 1) × len / k`). Count the vowels
(`aeiouAEIOU`) of each part on its own thread, store each count in an `int[]` at the
part's index, join all threads, then print `Part <i>: <count>` for each part (from 1)
and `Total vowels: <sum>`.

Input: `k` on the first line, the text on the second.

### Hint
Give each thread its own index into the result array. Different threads writing
different array elements do not interfere, and `join()` makes their writes visible to
`main`.

### Sample Input
```text
3
Object oriented programming in Java
```

### Sample Output
```text
Part 1: 5
Part 2: 3
Part 3: 4
Total vowels: 12
```

### Solution
```java
import java.util.Scanner;

public class ParallelVowels {
    static int countVowels(String s) {
        int count = 0;
        for (int i = 0; i < s.length(); i++) {
            if ("aeiouAEIOU".indexOf(s.charAt(i)) >= 0) {
                count++;
            }
        }
        return count;
    }

    public static void main(String[] args) throws InterruptedException {
        Scanner in = new Scanner(System.in);
        int k = Integer.parseInt(in.nextLine().trim());
        String text = in.nextLine();
        int len = text.length();
        int[] counts = new int[k];
        Thread[] threads = new Thread[k];
        for (int i = 0; i < k; i++) {
            final int index = i;
            final String part = text.substring(i * len / k, (i + 1) * len / k);
            threads[i] = new Thread(() -> counts[index] = countVowels(part));
            threads[i].start();
        }
        int total = 0;
        for (int i = 0; i < k; i++) {
            threads[i].join();
            System.out.println("Part " + (i + 1) + ": " + counts[i]);
            total += counts[i];
        }
        System.out.println("Total vowels: " + total);
    }
}
```

### Explanation
The text is split into parts that do not overlap, and `i × len / k` with integer
division makes the parts as equal as possible while covering every character exactly
once. Each thread is a lambda that writes one array element. A lambda can only use
local variables that are effectively final, which is why the loop copies `i` and the
part into `final` variables. `main` joins the threads in order and prints after each
join, so the output order is fixed even though the threads finish in any order.

## Problem 2: Relay Printing with join
**Level:** Intermediate

### Problem Statement
`k` threads must each print one line, **in a fixed order**, without `synchronized` or
locks: thread 1 prints first, then thread 2, and so on. Each thread is given a
reference to the previous thread and calls `previous.join()` before printing, so it
cannot print until its predecessor has finished.

Start the threads in **reverse** order (thread `k` first) to show that start order does
not matter. Each thread prints `runner <i>: <message>` where the messages are read from
input. After joining the last thread, `main` prints `relay finished`.

Input: `k`, then `k` lines of messages.

### Hint
Create all thread objects first (thread `i` needs a reference to thread `i − 1`), then
start them from the last to the first. Thread 1 has no predecessor. Handle
`InterruptedException` inside `run()` by restoring the interrupt flag.

### Sample Input
```text
4
Ready
Set
Go
Done
```

### Sample Output
```text
runner 1: Ready
runner 2: Set
runner 3: Go
runner 4: Done
relay finished
```

### Solution
```java
import java.util.Scanner;

class Runner extends Thread {
    private final int number;
    private final String message;
    private final Thread previous;

    Runner(int number, String message, Thread previous) {
        this.number = number;
        this.message = message;
        this.previous = previous;
    }

    @Override
    public void run() {
        try {
            if (previous != null) {
                previous.join();
            }
            System.out.println("runner " + number + ": " + message);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

public class RelayPrinting {
    public static void main(String[] args) throws InterruptedException {
        Scanner in = new Scanner(System.in);
        int k = Integer.parseInt(in.nextLine().trim());
        Runner[] runners = new Runner[k];
        for (int i = 0; i < k; i++) {
            Thread previous = i == 0 ? null : runners[i - 1];
            runners[i] = new Runner(i + 1, in.nextLine(), previous);
        }
        for (int i = k - 1; i >= 0; i--) {
            runners[i].start();
        }
        runners[k - 1].join();
        System.out.println("relay finished");
    }
}
```

### Explanation
`join()` is not only for `main`: any thread can wait for any other thread. Thread `i`
waits for thread `i − 1`, which waits for thread `i − 2`, and so on, forming a chain;
the first runner waits for no one. Even if the scheduler runs thread 4 first, it
immediately blocks in `join()` until thread 3 has finished, so the lines always come out
in order. Joining the last runner is enough for `main`, because it cannot finish before
all the others. Catching `InterruptedException` and calling `interrupt()` again keeps
the "please stop" signal visible to whoever owns the thread.

## Problem 3: Parallel Prefix Sums
**Level:** Advanced

### Problem Statement
The prefix sums of an array are `p[i] = a[0] + ... + a[i]`. Compute them with `k`
threads in **two phases**:

1. each thread computes the prefix sums **inside** its own chunk (chunk `t` covers
   indexes `t × n / k` to `(t + 1) × n / k − 1`) and the chunk total;
2. after all threads are joined, `main` computes each chunk's **offset** (the sum of
   all earlier chunk totals); then a second set of threads adds its offset to every
   element of its chunk.

Print `Chunk totals: <t1 t2 ...>`, `Offsets: <o1 o2 ...>`, then the prefix sums on one
line separated by spaces, and finally `Check: OK` if the result equals a simple
sequential computation, otherwise `Check: MISMATCH`.

Input: `n k`, then `n` integers.

### Hint
Phase 1 and phase 2 each only touch their own chunk, so no locks are needed. The
offsets are a tiny prefix-sum problem of their own, which `main` can do sequentially.
Use `long` for the sums.

### Sample Input
```text
10 3
4 1 3 7 2 5 6 2 8 1
```

### Sample Output
```text
Chunk totals: 8 14 17
Offsets: 0 8 22
4 5 8 15 17 22 28 30 38 39
Check: OK
```

### Solution
```java
import java.util.Scanner;

public class ParallelPrefix {
    static void runAll(Thread[] threads) throws InterruptedException {
        for (Thread t : threads) {
            t.start();
        }
        for (Thread t : threads) {
            t.join();
        }
    }

    static String join(long[] values) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                sb.append(' ');
            }
            sb.append(values[i]);
        }
        return sb.toString();
    }

    public static void main(String[] args) throws InterruptedException {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        int k = in.nextInt();
        long[] a = new long[n];
        for (int i = 0; i < n; i++) {
            a[i] = in.nextLong();
        }

        long[] prefix = new long[n];
        long[] totals = new long[k];
        Thread[] phase1 = new Thread[k];
        for (int t = 0; t < k; t++) {
            final int chunk = t;
            final int from = t * n / k;
            final int to = (t + 1) * n / k;
            phase1[t] = new Thread(() -> {
                long running = 0;
                for (int i = from; i < to; i++) {
                    running += a[i];
                    prefix[i] = running;
                }
                totals[chunk] = running;
            });
        }
        runAll(phase1);

        long[] offsets = new long[k];
        for (int t = 1; t < k; t++) {
            offsets[t] = offsets[t - 1] + totals[t - 1];
        }

        Thread[] phase2 = new Thread[k];
        for (int t = 0; t < k; t++) {
            final long offset = offsets[t];
            final int from = t * n / k;
            final int to = (t + 1) * n / k;
            phase2[t] = new Thread(() -> {
                for (int i = from; i < to; i++) {
                    prefix[i] += offset;
                }
            });
        }
        runAll(phase2);

        long running = 0;
        boolean ok = true;
        for (int i = 0; i < n; i++) {
            running += a[i];
            if (prefix[i] != running) {
                ok = false;
            }
        }
        System.out.println("Chunk totals: " + join(totals));
        System.out.println("Offsets: " + join(offsets));
        System.out.println(join(prefix));
        System.out.println("Check: " + (ok ? "OK" : "MISMATCH"));
    }
}
```

### Explanation
A prefix sum looks inherently sequential (each value needs the previous one), yet it
can be parallelised by splitting it into independent work plus a small sequential
step. In phase 1 every chunk is processed as if it started at zero. The offsets then
say how much every element of a chunk is "missing" from the earlier chunks. Phase 2
adds them in parallel. The `join()` calls between phases act as barriers: phase 2 must
not start before every chunk total is known. Comparing with a sequential computation
is a good habit whenever you parallelise an algorithm: a fast wrong answer is worse
than a slow right one.
