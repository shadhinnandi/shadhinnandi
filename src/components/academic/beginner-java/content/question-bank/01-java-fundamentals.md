# Java Fundamentals

Variables, operators, control flow, loops, methods and recursion (Chapters 00–03).
Programs read input without prompts and print exactly the sample output.

## Problem 1: Reverse an Integer Safely
**Level:** Basic

### Problem Statement
Reverse the digits of an `int` without converting it to a string, keeping its sign
(`-123` becomes `-321`, `1200` becomes `21`). If the reversed value does not fit in an
`int`, print `overflow` instead.

Input: `n`, then `n` integers (each fits in an `int`). Print one result per line.

### Hint
Build the reversed number digit by digit with `% 10` and `/ 10`. Do the work in a
`long` and compare with `Integer.MAX_VALUE` and `Integer.MIN_VALUE` at the end. In Java,
`%` of a negative number is negative, so the sign takes care of itself.

### Sample Input
```text
5
123
-450
1200
2147483647
0
```

### Sample Output
```text
321
-54
21
overflow
0
```

### Solution
```java
import java.util.Scanner;

public class ReverseInteger {
    static String reverse(int x) {
        long reversed = 0;
        int rest = x;
        while (rest != 0) {
            reversed = reversed * 10 + rest % 10;
            rest /= 10;
        }
        if (reversed > Integer.MAX_VALUE || reversed < Integer.MIN_VALUE) {
            return "overflow";
        }
        return Long.toString(reversed);
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            System.out.println(reverse(in.nextInt()));
        }
    }
}
```

### Explanation
`rest % 10` gives the last digit and `rest / 10` removes it; appending the digit to
`reversed` with `reversed * 10 + digit` builds the number backwards. For negative input
both operations keep the minus sign (`-450 % 10` is `0`, `-45 % 10` is `-5`), so no
special case is needed. The reversal of `2147483647` is `7463847412`, which is larger
than the largest `int`; an `int` variable would silently wrap around to a wrong
negative number, so the computation uses a `long` and checks the range before
returning. Leading zeros disappear naturally: `0021` is just `21`.

## Problem 2: Longest Collatz Chain
**Level:** Intermediate

### Problem Statement
The Collatz rule turns a positive number `x` into `x / 2` if it is even and `3x + 1` if
it is odd; repeating it always seems to reach `1`. The **chain length** of `x` is the
number of values in the sequence from `x` down to `1`, both included (the chain of `1`
has length 1; the chain of `6` is 6, 3, 10, 5, 16, 8, 4, 2, 1, length 9).

Input: `q`, then `q` limits `N` (1 to 100000). For each limit, print the starting value
`x ≤ N` with the longest chain (the smallest such `x` on a tie) as
`N=<N>: start <x>, length <len>, peak <highest value in its chain>`.

### Hint
Write `chainLength(long x)` and `peak(long x)` as separate methods. Intermediate values
grow far above the start (over 1.5 billion for one start below 100000, close to the
`int` limit), so use `long` inside the sequence. A plain loop over all starts is fast
enough.

### Sample Input
```text
3
1
10
1000
```

### Sample Output
```text
N=1: start 1, length 1, peak 1
N=10: start 9, length 20, peak 52
N=1000: start 871, length 179, peak 190996
```

### Solution
```java
import java.util.Scanner;

public class LongestCollatz {
    static long next(long x) {
        return x % 2 == 0 ? x / 2 : 3 * x + 1;
    }

    static int chainLength(long x) {
        int length = 1;
        while (x != 1) {
            x = next(x);
            length++;
        }
        return length;
    }

    static long peak(long x) {
        long highest = x;
        while (x != 1) {
            x = next(x);
            highest = Math.max(highest, x);
        }
        return highest;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            int limit = in.nextInt();
            int bestStart = 1;
            int bestLength = 1;
            for (int x = 2; x <= limit; x++) {
                int length = chainLength(x);
                if (length > bestLength) {
                    bestLength = length;
                    bestStart = x;
                }
            }
            System.out.println("N=" + limit + ": start " + bestStart + ", length " + bestLength
                    + ", peak " + peak(bestStart));
        }
    }
}
```

### Explanation
Splitting the work into `next`, `chainLength` and `peak` keeps each method trivial to
check by hand (for example, `chainLength(6)` must be 9). The search loop keeps the best
start seen so far and only replaces it when a chain is strictly longer, which gives the
smallest start on a tie. The values inside a chain can grow much larger than the start
(the chain of 27 peaks at 9232; the chain of 77671 reaches 1,570,824,736, about 73% of
the largest `int`). One more `3x + 1` step at that size would overflow an `int`, so
`next` works on `long` to be safe for larger limits too. Passing the `int` loop variable to
`chainLength(long)` is a safe widening conversion.

## Problem 3: Fast Modular Power
**Level:** Advanced

### Problem Statement
Compute `a^b mod m` for very large exponents (up to `10^18`) using a **recursive**
method based on these facts:

- `a^0 = 1`;
- if `b` is even, `a^b = (a^(b/2))²`;
- if `b` is odd, `a^b = a × a^(b−1)`.

Also count how many times the method is called. Input: `q`, then `q` lines `a b m`
(`0 ≤ a < 10^9`, `0 ≤ b ≤ 10^18`, `1 ≤ m ≤ 10^9`). Print
`<a>^<b> mod <m> = <result> (<calls> calls)`.

### Hint
Take every intermediate result `% m` so products stay below `10^18`, which fits in a
`long`. Compute the half power once and square it; calling the method twice for the
two halves would destroy the speed-up. Note that `x mod 1` is always 0.

### Sample Input
```text
4
2 10 1000
3 0 7
7 1000000000000000000 1000000007
5 3 1
```

### Sample Output
```text
2^10 mod 1000 = 24 (6 calls)
3^0 mod 7 = 1 (1 calls)
7^1000000000000000000 mod 1000000007 = 259616729 (84 calls)
5^3 mod 1 = 0 (4 calls)
```

### Solution
```java
import java.util.Scanner;

public class FastPower {
    static long calls = 0;

    static long power(long a, long b, long m) {
        calls++;
        if (b == 0) {
            return 1 % m;
        }
        if (b % 2 == 0) {
            long half = power(a, b / 2, m);
            return half * half % m;
        }
        return a % m * power(a, b - 1, m) % m;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int q = in.nextInt();
        for (int i = 0; i < q; i++) {
            long a = in.nextLong();
            long b = in.nextLong();
            long m = in.nextLong();
            calls = 0;
            long result = power(a, b, m);
            System.out.println(a + "^" + b + " mod " + m + " = " + result + " (" + calls + " calls)");
        }
    }
}
```

### Explanation
Halving the exponent at every even step means the recursion depth grows with the
number of **bits** of `b`, not with `b` itself: about 60 bits for `10^18`, so roughly
a hundred calls instead of a quintillion multiplications. Every odd step is followed by
an even one, so at most two calls are made per bit. Reducing with `% m` after every
multiplication keeps both factors below `m ≤ 10^9`, so their product is below `10^18`
and never overflows a `long`. The base case returns `1 % m` rather than `1`, so the
answer is correct even when `m = 1`. This technique is used in cryptography and in
competitive programming.
