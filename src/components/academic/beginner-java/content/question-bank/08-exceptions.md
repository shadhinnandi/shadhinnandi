# Exception Handling

`try`, `catch`, `finally`, checked and unchecked exceptions, custom exceptions,
exception chaining and keeping data consistent when something fails (Chapter 11 and
earlier). Programs read input without prompts and print exactly the sample output.

## Problem 1: Trace the Flow
**Level:** Basic

### Problem Statement
Predicting the order of `try`, `catch` and `finally` is a common exam question. Write
`static int divide(String a, String b)` that prints a trace while it works:

```text
  try: parsing <a> and <b>
  try: result <r>                  (only if the division succeeds)
  catch: bad number                (on NumberFormatException)
  catch: division by zero          (on ArithmeticException)
  finally
```

It returns the quotient (integer division), or `-1` when an exception was caught.
`main` reads `n` pairs and, for each, prints `divide(<a>, <b>)` before the call and
`returned <value>` after it.

### Hint
Return the result from inside `try` and `-1` from inside the `catch` blocks. The
`finally` block still runs **before** the method actually returns, so its line appears
before `returned ...`.

### Sample Input
```text
3
20 3
seven 2
5 0
```

### Sample Output
```text
divide(20, 3)
  try: parsing 20 and 3
  try: result 6
  finally
returned 6
divide(seven, 2)
  try: parsing seven and 2
  catch: bad number
  finally
returned -1
divide(5, 0)
  try: parsing 5 and 0
  catch: division by zero
  finally
returned -1
```

### Solution
```java
import java.util.Scanner;

public class TraceFlow {
    static int divide(String a, String b) {
        try {
            System.out.println("  try: parsing " + a + " and " + b);
            int x = Integer.parseInt(a);
            int y = Integer.parseInt(b);
            int r = x / y;
            System.out.println("  try: result " + r);
            return r;
        } catch (NumberFormatException e) {
            System.out.println("  catch: bad number");
            return -1;
        } catch (ArithmeticException e) {
            System.out.println("  catch: division by zero");
            return -1;
        } finally {
            System.out.println("  finally");
        }
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        for (int i = 0; i < n; i++) {
            String a = in.next();
            String b = in.next();
            System.out.println("divide(" + a + ", " + b + ")");
            System.out.println("returned " + divide(a, b));
        }
    }
}
```

### Explanation
When `parseInt` throws, the rest of the `try` block is skipped and the matching
`catch` runs. Integer division by zero throws `ArithmeticException` (floating-point
division would give infinity instead). Whatever happens, `finally` runs last, even
though the `try` and `catch` blocks contain `return` statements: the return value is
remembered, `finally` runs, and only then does the method return. Never put a `return`
in `finally` itself; it would silently replace the value (and hide exceptions).

## Problem 2: Errors with a Cause
**Level:** Intermediate

### Problem Statement
A payment importer reads lines `id,amount` and must report **which line** failed and
**why**, without losing the original exception. Write a checked exception
`RecordException` with a constructor `RecordException(int line, String message,
Throwable cause)` (call `super(message, cause)`) and a `getLine()` method.

`static Payment parse(int line, String text) throws RecordException` must throw:

- `record needs 2 fields` (no cause) for a wrong number of fields;
- `bad amount` with the `NumberFormatException` as the cause;
- `amount must be positive` (no cause) for amounts ≤ 0.

Input: `n` lines. Print `ok <id> <amount>` for good lines and
`line <k>: <message>` plus ` (caused by <SimpleClassName>: <cause message>)` if there is
a cause. Finally print `Total: <sum of good amounts>`.

### Hint
`getCause()` returns the wrapped exception or `null`;
`getClass().getSimpleName()` gives a short class name. Chaining keeps the low-level
details for debugging while the message stays meaningful for users.

### Sample Input
```text
4
P01,1500
P02,15OO
P03
P04,-20
```

### Sample Output
```text
ok P01 1500
line 2: bad amount (caused by NumberFormatException: For input string: "15OO")
line 3: record needs 2 fields
line 4: amount must be positive
Total: 1500
```

### Solution
```java
import java.util.Scanner;

class RecordException extends Exception {
    private final int line;

    RecordException(int line, String message, Throwable cause) {
        super(message, cause);
        this.line = line;
    }

    int getLine() {
        return line;
    }
}

class Payment {
    final String id;
    final long amount;

    Payment(String id, long amount) {
        this.id = id;
        this.amount = amount;
    }
}

public class PaymentImport {
    static Payment parse(int line, String text) throws RecordException {
        String[] parts = text.split(",");
        if (parts.length != 2) {
            throw new RecordException(line, "record needs 2 fields", null);
        }
        long amount;
        try {
            amount = Long.parseLong(parts[1].trim());
        } catch (NumberFormatException e) {
            throw new RecordException(line, "bad amount", e);
        }
        if (amount <= 0) {
            throw new RecordException(line, "amount must be positive", null);
        }
        return new Payment(parts[0].trim(), amount);
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int n = Integer.parseInt(in.nextLine().trim());
        long total = 0;
        for (int i = 1; i <= n; i++) {
            try {
                Payment p = parse(i, in.nextLine());
                System.out.println("ok " + p.id + " " + p.amount);
                total += p.amount;
            } catch (RecordException e) {
                String text = "line " + e.getLine() + ": " + e.getMessage();
                Throwable cause = e.getCause();
                if (cause != null) {
                    text += " (caused by " + cause.getClass().getSimpleName() + ": " + cause.getMessage() + ")";
                }
                System.out.println(text);
            }
        }
        System.out.println("Total: " + total);
    }
}
```

### Explanation
`parse` translates low-level problems into the language of the importer: callers deal
with one checked `RecordException` that carries the line number. When the failure came
from another exception, that exception is passed as the **cause**, so nothing is lost:
a developer can still see the original `NumberFormatException` and its message
(`For input string: "15OO"`, where the letters O were typed instead of zeros). Catching
and wrapping like this is better than catching `Exception` and printing a vague
message, and better than letting a raw `NumberFormatException` reach the user.

## Problem 3: All-or-Nothing Transfers
**Level:** Advanced

### Problem Statement
A batch of transfers must be applied **completely or not at all**: if any transfer in
the batch fails, every transfer already applied in that batch is undone.

Write a checked exception `TransferException` (message only) and an `Account` class
(id, balance) with `withdraw` (throws `TransferException("<id> has only <b>")` if the
balance is too small) and `deposit`. A `Bank` holds the accounts and has
`void runBatch(List<String> transfers) throws TransferException`: each transfer is
`from to amount`; an unknown account throws `TransferException("no account <id>")`.
Every successful transfer is recorded in an undo list; if an exception occurs, the
recorded transfers are reversed **in reverse order** and the exception is re-thrown.

Input: account lines (`id balance`) until a line `BATCHES`, then `b`, then for each
batch a count `k` and `k` transfer lines. For each batch print
`Batch <i>: committed <k> transfers` or `Batch <i>: rolled back (<message>)`; after all
batches print every account as `<id>: <balance>` in input order.

### Hint
Use `try { ... } catch (TransferException e) { undo...; throw e; }`. Undoing a transfer
means moving the money back with deposit/withdraw the other way round; those calls
cannot fail because the money was just moved.

### Sample Input
```text
A 1000
B 500
C 0
BATCHES
3
2
A B 300
B C 600
2
C A 100
A B 50
3
A C 200
B A 100
C D 10
```

### Sample Output
```text
Batch 1: committed 2 transfers
Batch 2: committed 2 transfers
Batch 3: rolled back (no account D)
A: 750
B: 250
C: 500
```

### Solution
```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

class TransferException extends Exception {
    TransferException(String message) {
        super(message);
    }
}

class Account {
    final String id;
    private long balance;

    Account(String id, long balance) {
        this.id = id;
        this.balance = balance;
    }

    long getBalance() {
        return balance;
    }

    void withdraw(long amount) throws TransferException {
        if (amount > balance) {
            throw new TransferException(id + " has only " + balance);
        }
        balance -= amount;
    }

    void deposit(long amount) {
        balance += amount;
    }
}

class Bank {
    final List<Account> accounts = new ArrayList<>();

    Account find(String id) throws TransferException {
        for (Account a : accounts) {
            if (a.id.equals(id)) {
                return a;
            }
        }
        throw new TransferException("no account " + id);
    }

    void runBatch(List<String> transfers) throws TransferException {
        List<Account> undoFrom = new ArrayList<>();
        List<Account> undoTo = new ArrayList<>();
        List<Long> undoAmount = new ArrayList<>();
        try {
            for (String t : transfers) {
                String[] p = t.split(" ");
                Account from = find(p[0]);
                Account to = find(p[1]);
                long amount = Long.parseLong(p[2]);
                from.withdraw(amount);
                to.deposit(amount);
                undoFrom.add(from);
                undoTo.add(to);
                undoAmount.add(amount);
            }
        } catch (TransferException e) {
            for (int i = undoFrom.size() - 1; i >= 0; i--) {
                undoTo.get(i).withdraw(undoAmount.get(i));
                undoFrom.get(i).deposit(undoAmount.get(i));
            }
            throw e;
        }
    }
}

public class AllOrNothing {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Bank bank = new Bank();
        while (true) {
            String id = in.next();
            if (id.equals("BATCHES")) {
                break;
            }
            bank.accounts.add(new Account(id, in.nextLong()));
        }
        int b = in.nextInt();
        for (int i = 1; i <= b; i++) {
            int k = in.nextInt();
            in.nextLine();
            List<String> batch = new ArrayList<>();
            for (int j = 0; j < k; j++) {
                batch.add(in.nextLine().trim());
            }
            try {
                bank.runBatch(batch);
                System.out.println("Batch " + i + ": committed " + k + " transfers");
            } catch (TransferException e) {
                System.out.println("Batch " + i + ": rolled back (" + e.getMessage() + ")");
            }
        }
        for (Account a : bank.accounts) {
            System.out.println(a.id + ": " + a.getBalance());
        }
    }
}
```

### Explanation
Without rollback, a failure halfway through a batch would leave the accounts in a
state that no one asked for. The undo lists remember exactly what was done, and
reversing them in reverse order restores the original balances step by step (the same
idea databases use for transactions). The `catch` block does not handle the error, it
**cleans up and re-throws** it, so the caller still learns that the batch failed and
why. The `withdraw` calls during undo can never fail, because each one takes back money
that was just deposited, but the compiler still requires them to be inside code that
can throw `TransferException`, which they are. Tracing the sample: batch 1 leaves A 700, B 200, C 600; batch 2 leaves
A 750, B 250, C 500; batch 3 applies two transfers (A 550, B 150, C 700) and then
fails on the unknown account `D`, so both are undone in reverse order and the balances
return to A 750, B 250, C 500.
