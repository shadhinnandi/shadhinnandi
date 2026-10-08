# Lab L2: Games

Games are a good place to practise object-oriented programming. A game has clear
"things" (a board, a player, a ball, a score), clear rules about how those things change,
and an immediate result you can see. If your class design is poor, the game becomes hard
to change very quickly, so games teach you design by experience.

This lab builds eight games, from a small console game to a falling-blocks game with
graphics. Each game shows the class design first, then the complete program, then a
walk-through of every class.

**In this lab you will practise:**

- finding the classes, fields and methods of a game from its rules
- writing a turn-based game loop for the console
- writing a real-time game loop for Swing with `javax.swing.Timer`
- separating the game state (model) from drawing (view) and input (controller)
- drawing with `paintComponent`, reading keys with key bindings, detecting collisions
- making random games repeatable with a seed

> Every program is one file you can compile with one command, for example
> `javac TicTacToe.java` and then `java TicTacToe`. In a real project each public class
> lives in its own file; here we keep each game in one file so it is easy to run.

## Games as OOP Practice

A game is a small world with rules. Object-oriented programming (OOP) models a world as
objects that hold state and react to messages. That match is why games are such good
practice:

- **State is obvious.** The board, the position of the ball and the number of lives are
  all fields of some object.
- **Rules belong to objects.** "A cell that is taken cannot be used again" is a rule of
  the `Board`, so the method that checks it belongs in `Board`.
- **Change is constant.** You will want new levels, new pieces and new scoring rules.
  Good class design makes each change touch one class.

Ask the course's recurring question for every noun in the rules: **"Should this be a
class?"** If the thing has its own data *and* its own rules, the answer is usually yes.
If it is only a number (the score of a simple game), a field is often enough.

## Identifying the Classes in a Game

Read the rules and underline the nouns and verbs. Nouns become classes or fields; verbs
become methods.

> "Two **players** take turns placing their **mark** on a 3 x 3 **board**. A player
> **wins** when three marks form a **line**. The **game** ends in a draw when the board
> is **full**."

| Word in the rules | Becomes |
|---|---|
| player | class `Player` (name, symbol) |
| board | class `Board` (cells, `place`, `isFull`, `hasLine`) |
| mark | a `char` field, not a class (it has no rules of its own) |
| score | class `Score` when it has rules (points, bonuses); else an `int` |
| game | class `Game` (whose turn it is, when the game ends) |
| take turns, win | methods of `Game` and `Board` |

Bigger programs often add a `GameManager` that starts new games and keeps the overall
results. The picture below is a typical design. Arrows mean "uses" or "has".

```text
+----------------+        +----------------+
|  GameManager   |------->|      Game      |
+----------------+ starts +----------------+
| newGame()      |        | turn           |
| results        |        | play()         |
+----------------+        | isOver()       |
                          +----------------+
                             |    |     |
                 has 2       |    |has 1| has 1
                 v           |    v     v
        +-------------+      | +-------------+   +-------------+
        |   Player    |<-----+ |    Board    |   |    Score    |
        +-------------+        +-------------+   +-------------+
        | name        |        | cells       |   | points      |
        | symbol      |        | place()     |   | add()       |
        | getName()   |        | isFull()    |   | report()    |
        +-------------+        +-------------+   +-------------+
```

The `main` method should be short: create the objects, start the game, done. If `main`
grows to 100 lines, the design is telling you a class is missing.

## Two Kinds of Game Loop

Every game repeats the same cycle: **read input, update the state, show the state.**
How that cycle runs is different in a console game and in a graphical game.

### Turn-based console loop

A console game waits for the player. Nothing happens until the player types something.
A plain `while` loop is enough:

```java
while (!game.isOver() && in.hasNext()) {
    String input = in.next();   // 1. read input (waits for the player)
    game.handle(input);         // 2. update the state
    game.show();                // 3. show the state
}
```

The check `in.hasNext()` matters. When the input ends (for example when input comes
from a file, or the user presses Ctrl+D), `hasNext()` returns `false` and the loop stops
instead of crashing with `NoSuchElementException`.

### Real-time Swing loop with javax.swing.Timer

In Snake or Breakout the world moves even when the player presses nothing. You might
think of writing `while (true) { update(); repaint(); }`, but in Swing that freezes the
window: the loop would block the **Event Dispatch Thread (EDT)**, the one thread that
handles clicks, key presses and painting.

Instead, a `javax.swing.Timer` calls an `ActionListener` on the EDT at a fixed rate.
Each call is one **tick** (one frame) of the game:

```java
Timer timer = new Timer(16, new ActionListener() {   // about 60 ticks per second
    @Override
    public void actionPerformed(ActionEvent e) {
        game.update();   // move everything one small step
        repaint();       // ask Swing to call paintComponent soon
    }
});
timer.start();
```

```text
 console (turn-based)              Swing (real-time)

 +--> read input (waits)           Timer tick --> update model --> repaint
 |        |                            ^                              |
 |        v                            |   key press --> change model |
 |    update state                     +------------------------------+
 |        |                         (the EDT runs ticks, keys and paints
 +--- show state                     one after another, never at once)
```

Import `javax.swing.Timer` by name. `java.util.Timer` is a different class that runs on
its own thread and must not touch Swing components.

## Model, View and Controller

Larger games split the code into three roles. This split is called
**model-view-controller (MVC)**.

| Role | Plain meaning | In our Swing games |
|---|---|---|
| Model | the game state and the rules | `Snake`, `Ball`, `Board`, `Piece`, `...Game` |
| View | draws the model, changes nothing | `paintComponent` in the panel |
| Controller | turns input into requests to the model | key bindings, the `Timer` |

Why bother? The model has no Swing code, so you can test it with a plain `main` and
print its state. You can change how the game looks without touching the rules. And the
rules live in one place, so the panel cannot "cheat" by moving the ball through a wall.

```text
   keys, timer           requests            reads
  +------------+   turn(), step()   +-------+   getters   +------------+
  | Controller | -----------------> | Model | <---------- |    View    |
  +------------+                    +-------+             +------------+
                                                     paintComponent(g)
```

In this lab the controller and the view share one class (the panel), which is common in
small Swing programs. The model classes are always separate.

## Painting, Keys and Collisions

### Painting with paintComponent

You never call `paintComponent` yourself. You call `repaint()`, and Swing later calls
`paintComponent(Graphics g)` on the EDT. Override it in a `JPanel` subclass, call
`super.paintComponent(g)` first (it clears the background), then draw the model:

```java
@Override
protected void paintComponent(Graphics g) {
    super.paintComponent(g);
    g.setColor(Color.ORANGE);
    g.fillOval(ball.getX(), ball.getY(), 12, 12);   // x, y, width, height
}
```

Screen coordinates start at the top-left corner. `x` grows to the right and `y` grows
**downwards**, so "moving up" means decreasing `y`.

### Keyboard input with key bindings

A `KeyListener` only receives keys while its component has the keyboard focus, which
often fails after a click somewhere else. **Key bindings** are more reliable. You map a
key to a name in the panel's `InputMap`, and the name to an `Action` in its `ActionMap`:

```java
InputMap keys = getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
keys.put(KeyStroke.getKeyStroke("LEFT"), "moveLeft");
getActionMap().put("moveLeft", new MoveLeftAction());   // extends AbstractAction
```

`"pressed LEFT"` and `"released LEFT"` are separate keystrokes, which is how Breakout
moves the paddle only while the key is held down. A `KeyListener` still works for quick
experiments; if you use one, call `setFocusable(true)` and `requestFocusInWindow()`.

### Collision detection with rectangles

Most simple games treat every object as a rectangle, its **bounding box**.
`java.awt.Rectangle` already knows how to test overlap:

```java
Rectangle ballBox = new Rectangle(ballX, ballY, 12, 12);
Rectangle brickBox = new Rectangle(brickX, brickY, 52, 20);
if (ballBox.intersects(brickBox)) {
    // the ball touches the brick
}
```

```text
   +--------+                 +--------+
   |  ball  |                 |  ball +-+------+
   +--------+  +-------+      +-------+-+      |
               | brick |              | brick  |
               +-------+              +--------+
   intersects() == false      intersects() == true
```

Grid games (Snake, Block Drop) are even simpler: two things collide when they occupy the
same grid cell, which is a comparison of row and column numbers.

## Deterministic Randomness with a Seed

`java.util.Random` is a **pseudo-random** number generator: it computes a sequence from a
starting number called the **seed**. The same seed always gives the same sequence.

```java
Random a = new Random(42);
Random b = new Random(42);
// a.nextInt(100) and b.nextInt(100) give the same number, every time
Random c = new Random();     // seed chosen by Java: different each run
```

Games here accept an optional seed as a command-line argument: `java NumberGuessing 7`
plays the same secret number every time, which makes bugs repeatable and lets two
friends play the same game. Without an argument, the game is different each run.

> Two notes on syntax used in the Swing games. `() -> showWindow(random)` is a
> **lambda**, a short way to write an object with one method (here a `Runnable`); it is
> explained in Chapter 13: Generic Programming and was used in Lab L1. And
> `case ROCK -> ...` is the arrow form of `switch` from Chapter 02.

## Game 1: Number Guessing Game
**Level:** Basic

### Overview and rules

The computer picks a secret whole number from 1 to 100. You guess; after each guess the
game says "Too low." or "Too high.". You have 7 attempts. Guesses outside 1 to 100 do not
use up an attempt, and words that are not numbers are rejected politely.

Run it with `java NumberGuessing` for a new number each time, or `java NumberGuessing 7`
to replay the same number.

### Class design

```text
+------------------+     +-------------------+     +-------------+
|  GuessingGame    |---->|   SecretNumber    |---->| Hint (enum) |
+------------------+     +-------------------+     +-------------+
| MAX_ATTEMPTS = 7 |     | low, high, value  |     | TOO_LOW     |
| won              |     | isInRange(guess)  |     | TOO_HIGH    |
| guess(number)    |     | check(guess)      |     | CORRECT     |
| isOver()         |     +-------------------+     +-------------+
| result()         |
+------------------+     +-------------------+
          |              |      Player       |
          +------------->+-------------------+
                         | name, attempts    |
                         | countAttempt()    |
                         +-------------------+
```

### Concepts used

- Chapter 02: Conditional Statements and Loops (the game loop, `if`/`else`)
- Chapter 05: Encapsulation, Abstraction and Access Control (the secret is `private`)
- Chapter 06: Constructors and Object Lifecycle (`final` fields set once)
- Chapter 07: Static and Instance Members (`static final` constants, an `enum`)
- Chapter 11: Exception Handling (a bad seed is caught, not a crash)

### The program

```java
import java.util.Random;
import java.util.Scanner;

enum Hint {
    TOO_LOW, TOO_HIGH, CORRECT
}

class SecretNumber {
    private final int low;
    private final int high;
    private final int value;

    SecretNumber(int low, int high, Random random) {
        this.low = low;
        this.high = high;
        this.value = low + random.nextInt(high - low + 1);
    }

    boolean isInRange(int guess) {
        return guess >= low && guess <= high;
    }

    Hint check(int guess) {
        if (guess < value) {
            return Hint.TOO_LOW;
        }
        if (guess > value) {
            return Hint.TOO_HIGH;
        }
        return Hint.CORRECT;
    }

    int reveal() {
        return value;
    }
}

class Player {
    private final String name;
    private int attempts;

    Player(String name) {
        this.name = name;
    }

    void countAttempt() {
        attempts++;
    }

    String getName() {
        return name;
    }

    int getAttempts() {
        return attempts;
    }
}

class GuessingGame {
    static final int LOW = 1;
    static final int HIGH = 100;
    static final int MAX_ATTEMPTS = 7;

    private final SecretNumber secret;
    private final Player player;
    private boolean won;

    GuessingGame(Player player, Random random) {
        this.player = player;
        this.secret = new SecretNumber(LOW, HIGH, random);
    }

    boolean isOver() {
        return won || player.getAttempts() >= MAX_ATTEMPTS;
    }

    String guess(int number) {
        if (!secret.isInRange(number)) {
            return "Out of range: choose " + LOW + " to " + HIGH + ".";
        }
        player.countAttempt();
        Hint hint = secret.check(number);
        if (hint == Hint.CORRECT) {
            won = true;
            return "Correct!";
        }
        int left = MAX_ATTEMPTS - player.getAttempts();
        String direction = (hint == Hint.TOO_LOW) ? "Too low." : "Too high.";
        return direction + " Attempts left: " + left;
    }

    String result() {
        if (won) {
            return player.getName() + " found it in " + player.getAttempts()
                    + " attempts.";
        }
        return "Out of attempts. The number was " + secret.reveal() + ".";
    }
}

public class NumberGuessing {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.println("What is your name?");
        String name = in.hasNextLine() ? in.nextLine().trim() : "Player";
        GuessingGame game = new GuessingGame(new Player(name), createRandom(args));
        System.out.println("I am thinking of a number from " + GuessingGame.LOW
                + " to " + GuessingGame.HIGH + ". You have "
                + GuessingGame.MAX_ATTEMPTS + " attempts.");

        while (!game.isOver() && in.hasNext()) {
            if (in.hasNextInt()) {
                System.out.println(game.guess(in.nextInt()));
            } else {
                System.out.println("'" + in.next() + "' is not a whole number.");
            }
        }
        if (game.isOver()) {
            System.out.println(game.result());
        } else {
            System.out.println("Input ended. Goodbye!");
        }
    }

    private static Random createRandom(String[] args) {
        if (args.length > 0) {
            try {
                return new Random(Long.parseLong(args[0]));
            } catch (NumberFormatException e) {
                System.out.println("The seed must be a number; using a random one.");
            }
        }
        return new Random();
    }
}
```

### How it works

- **`Hint`** is an `enum` with the three possible answers. Returning a `Hint` instead
  of a `String` keeps `SecretNumber` free of wording; the game decides what to print.
- **`SecretNumber`** owns the secret. The field `value` is `private final`: nothing
  outside can read it except through `reveal()`, which the game calls only at the end.
  This is encapsulation: the object protects the one fact that makes the game a game.
- **`Player`** counts attempts. The count only goes up through `countAttempt()`.
- **`GuessingGame`** holds the rules: out-of-range guesses are free, a correct guess
  sets `won`, and `isOver()` combines both ways the game can end.
- **`main`** only reads input and passes it on. `hasNext()` stops the loop when input
  ends; `hasNextInt()` decides whether the next word is a number before reading it, so
  `nextInt()` never throws `InputMismatchException`.
- **`createRandom`** shows the seed idea: with an argument the secret is repeatable.

### Extensions

- Let the player choose a difficulty (`1-50`, `1-100`, `1-1000`) and adjust the attempts.
- Keep a best score: play several rounds and print the fewest attempts.
- Add "warmer/colder" hints by comparing the distance with the previous guess.
- Swap roles: the player thinks of a number and the computer guesses with binary search.

## Game 2: Rock Paper Scissors
**Level:** Basic

### Overview and rules

You play against the computer. Rock beats scissors, scissors beats paper, paper beats
rock; the same move is a draw. The first player to win 3 rounds wins the match. Type
`r`, `p` or `s` for a move, or `q` to stop early. An optional seed controls the
computer's moves: `java RockPaperScissors 3`.

### Class design

```text
                 +--------------------+
                 |  Player (abstract) |
                 +--------------------+
                 | name               |
                 | chooseMove()       |  <- abstract
                 +--------------------+
                    ^              ^
                    | extends      | extends
        +---------------+      +----------------+
        |  HumanPlayer  |      | ComputerPlayer |
        | reads Scanner |      | uses Random    |
        +---------------+      +----------------+

+-------------------+     +--------------+     +-------------+
|      RpsGame      |---->|  Scoreboard  |     | Move (enum) |
+-------------------+     +--------------+     +-------------+
| WINS_NEEDED = 3   |     | humanWins    |     | ROCK, PAPER,|
| human, computer   |     | computerWins |     | SCISSORS    |
| play()            |     | record(a, b) |     | beats(m)    |
+-------------------+     +--------------+     +-------------+
```

### Concepts used

- Chapter 07: Static and Instance Members (an `enum` with its own method)
- Chapter 09: Inheritance (`HumanPlayer` and `ComputerPlayer` extend `Player`)
- Chapter 10: Polymorphism, Abstract Classes and Interfaces (`chooseMove()` is
  abstract; the game calls it without knowing which kind of player it has)
- Chapter 02: Conditional Statements and Loops (switch expression with `->`)

### The program

```java
import java.util.Random;
import java.util.Scanner;

enum Move {
    ROCK, PAPER, SCISSORS;

    boolean beats(Move other) {
        return switch (this) {
            case ROCK -> other == SCISSORS;
            case PAPER -> other == ROCK;
            case SCISSORS -> other == PAPER;
        };
    }

    static Move fromLetter(String letter) {
        return switch (letter) {
            case "r" -> ROCK;
            case "p" -> PAPER;
            case "s" -> SCISSORS;
            default -> null;
        };
    }
}

abstract class Player {
    private final String name;

    Player(String name) {
        this.name = name;
    }

    String getName() { return name; }

    /** Returns the next move, or null when the player wants to stop. */
    abstract Move chooseMove();
}

class HumanPlayer extends Player {
    private final Scanner in;

    HumanPlayer(String name, Scanner in) {
        super(name);
        this.in = in;
    }

    @Override
    Move chooseMove() {
        System.out.println(getName() + ", your move (r, p, s or q to quit):");
        while (in.hasNext()) {
            String word = in.next().toLowerCase();
            if (word.equals("q")) {
                return null;
            }
            Move move = Move.fromLetter(word);
            if (move != null) {
                return move;
            }
            System.out.println("Please type r, p, s or q.");
        }
        return null;
    }
}

class ComputerPlayer extends Player {
    private final Random random;

    ComputerPlayer(Random random) {
        super("Computer");
        this.random = random;
    }

    @Override
    Move chooseMove() {
        Move[] moves = Move.values();
        return moves[random.nextInt(moves.length)];
    }
}

class Scoreboard {
    private int humanWins;
    private int computerWins;
    private int draws;

    String record(Move human, Move computer) {
        if (human == computer) {
            draws++;
            return "Both chose " + human + ". Draw.";
        }
        if (human.beats(computer)) {
            humanWins++;
            return human + " beats " + computer + ". You win the round.";
        }
        computerWins++;
        return computer + " beats " + human + ". Computer wins the round.";
    }

    boolean someoneHas(int wins) {
        return humanWins >= wins || computerWins >= wins;
    }

    String summary() {
        String line = "You " + humanWins + " - " + computerWins + " Computer"
                + " (draws: " + draws + ")";
        if (humanWins > computerWins) {
            return line + ". You win the match!";
        }
        if (computerWins > humanWins) {
            return line + ". Computer wins the match.";
        }
        return line + ". No winner.";
    }
}

class RpsGame {
    private static final int WINS_NEEDED = 3;
    private final Player human;
    private final Player computer;
    private final Scoreboard scoreboard = new Scoreboard();

    RpsGame(Player human, Player computer) {
        this.human = human;
        this.computer = computer;
    }

    void play() {
        System.out.println("First to " + WINS_NEEDED + " wins.");
        while (!scoreboard.someoneHas(WINS_NEEDED)) {
            Move humanMove = human.chooseMove();
            if (humanMove == null) {
                System.out.println("Match stopped.");
                break;
            }
            Move computerMove = computer.chooseMove();
            System.out.println(computer.getName() + " chose " + computerMove + ".");
            System.out.println(scoreboard.record(humanMove, computerMove));
        }
        System.out.println(scoreboard.summary());
    }
}

public class RockPaperScissors {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Random random = new Random();
        if (args.length > 0) {
            random = new Random(Long.parseLong(args[0]));
        }
        new RpsGame(new HumanPlayer("Ayesha", in), new ComputerPlayer(random)).play();
    }
}
```

### How it works

- **`Move`** is an `enum` that knows the rules: `ROCK.beats(SCISSORS)` is `true`. The
  switch expression must cover every constant, so the compiler reminds you if you ever
  add a move (for example `LIZARD`) and forget a rule. `fromLetter` turns user input
  into a `Move`, or `null` for anything else.
- **`Player`** is abstract: every player has a name and *some way* of choosing a move.
  `chooseMove()` returns `null` to mean "stop", which also covers the end of input.
- **`HumanPlayer`** reads from the `Scanner` and repeats until it gets a valid letter.
- **`ComputerPlayer`** picks a random constant from `Move.values()`.
- **`Scoreboard`** updates the counts and builds the round message.
- **`RpsGame`** only sees two `Player` references. Because `chooseMove()` is
  dynamically dispatched, the same loop works for human-vs-computer, computer-vs-computer
  (try it) or two humans. This is runtime polymorphism replacing `if (isHuman) ...`.

### Extensions

- Add Lizard and Spock (each move beats two others). Only `Move` should change.
- Write a `PatternPlayer` that remembers the human's last moves and counters the most
  frequent one. The game class does not change.
- Let the user choose the match length ("best of 3, 5 or 7").
- Pit two `ComputerPlayer`s with different seeds against each other for 1000 rounds and
  print the statistics.

## Game 3: Tic-Tac-Toe
**Level:** Basic

### Overview and rules

Two human players share the keyboard. Nusrat plays `X` and moves first; Tanvir plays
`O`. Each move is a row and a column from 1 to 3. Three marks in a row, column or
diagonal win; a full board without a line is a draw. Taken cells and numbers outside
1 to 3 are rejected and the same player tries again.

### Class design

```text
+-------------------+  has 2  +-------------+
|   TicTacToeGame   |-------->|   Player    |
+-------------------+         +-------------+
| players[2], turn  |         | name        |
| play()            |         | symbol      |
| readMove()        |         +-------------+
+-------------------+
          | has 1
          v
+-------------------------+
|         Board           |
+-------------------------+
| cells: char[3][3]       |
| filled                  |
| isInside(r, c)          |
| isFree(r, c)            |
| place(r, c, symbol)     |
| hasLine(symbol)         |
| isFull(), print()       |
+-------------------------+
```

### Concepts used

- Chapter 08: Arrays, Object References and Collections (a 2D `char` array, an array of
  `Player` objects)
- Chapter 05: Encapsulation, Abstraction and Access Control (only `Board` changes
  `cells`, so `filled` always matches the board)
- Chapter 02: Conditional Statements and Loops (`continue` to retry a move)
- Chapter 03: Methods and Problem Solving (small methods with one job each)

### The program

```java
import java.util.Scanner;

class Player {
    private final String name;
    private final char symbol;

    Player(String name, char symbol) {
        this.name = name;
        this.symbol = symbol;
    }

    String getName() {
        return name;
    }

    char getSymbol() {
        return symbol;
    }
}

class Board {
    static final int SIZE = 3;
    private static final char EMPTY = '.';
    private final char[][] cells = new char[SIZE][SIZE];
    private int filled;

    Board() {
        for (int r = 0; r < SIZE; r++) {
            for (int c = 0; c < SIZE; c++) {
                cells[r][c] = EMPTY;
            }
        }
    }

    boolean isInside(int row, int col) {
        return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
    }

    boolean isFree(int row, int col) {
        return cells[row][col] == EMPTY;
    }

    void place(int row, int col, char symbol) {
        cells[row][col] = symbol;
        filled++;
    }

    boolean isFull() {
        return filled == SIZE * SIZE;
    }

    boolean hasLine(char s) {
        for (int i = 0; i < SIZE; i++) {
            if (cells[i][0] == s && cells[i][1] == s && cells[i][2] == s) {
                return true;
            }
            if (cells[0][i] == s && cells[1][i] == s && cells[2][i] == s) {
                return true;
            }
        }
        boolean diagonal = cells[0][0] == s && cells[1][1] == s && cells[2][2] == s;
        boolean antiDiagonal = cells[0][2] == s && cells[1][1] == s && cells[2][0] == s;
        return diagonal || antiDiagonal;
    }

    void print() {
        System.out.println("  1 2 3");
        for (int r = 0; r < SIZE; r++) {
            StringBuilder line = new StringBuilder();
            line.append(r + 1);
            for (int c = 0; c < SIZE; c++) {
                line.append(' ').append(cells[r][c]);
            }
            System.out.println(line);
        }
    }
}

class TicTacToeGame {
    private final Board board = new Board();
    private final Player[] players;
    private final Scanner in;
    private int turn;

    TicTacToeGame(Player first, Player second, Scanner in) {
        this.players = new Player[] {first, second};
        this.in = in;
    }

    void play() {
        board.print();
        while (true) {
            Player current = players[turn % 2];
            System.out.println(current.getName() + " (" + current.getSymbol()
                    + "), enter row and column:");
            int[] move = readMove();
            if (move == null) {
                System.out.println("Input ended. Game stopped.");
                return;
            }
            int row = move[0] - 1;
            int col = move[1] - 1;
            if (!board.isInside(row, col)) {
                System.out.println("Row and column must be 1 to 3.");
                continue;
            }
            if (!board.isFree(row, col)) {
                System.out.println("That cell is taken. Try again.");
                continue;
            }
            board.place(row, col, current.getSymbol());
            board.print();
            if (board.hasLine(current.getSymbol())) {
                System.out.println(current.getName() + " wins!");
                return;
            }
            if (board.isFull()) {
                System.out.println("It's a draw.");
                return;
            }
            turn++;
        }
    }

    /** Reads two numbers; returns null when the input ends. */
    private int[] readMove() {
        int[] move = new int[2];
        for (int i = 0; i < move.length; i++) {
            while (in.hasNext() && !in.hasNextInt()) {
                System.out.println("'" + in.next() + "' is not a number.");
            }
            if (!in.hasNext()) {
                return null;
            }
            move[i] = in.nextInt();
        }
        return move;
    }
}

public class TicTacToe {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        Player nusrat = new Player("Nusrat", 'X');
        Player tanvir = new Player("Tanvir", 'O');
        System.out.println(nusrat.getName() + " plays X, "
                + tanvir.getName() + " plays O.");
        new TicTacToeGame(nusrat, tanvir, in).play();
    }
}
```

**Input:**

```text
1 1
2 2
1 2
1 1
4 1
3 3
1 3
```

**Output:**

```text
Nusrat plays X, Tanvir plays O.
  1 2 3
1 . . .
2 . . .
3 . . .
Nusrat (X), enter row and column:
  1 2 3
1 X . .
2 . . .
3 . . .
Tanvir (O), enter row and column:
  1 2 3
1 X . .
2 . O .
3 . . .
Nusrat (X), enter row and column:
  1 2 3
1 X X .
2 . O .
3 . . .
Tanvir (O), enter row and column:
That cell is taken. Try again.
Tanvir (O), enter row and column:
Row and column must be 1 to 3.
Tanvir (O), enter row and column:
  1 2 3
1 X X .
2 . O .
3 . . O
Nusrat (X), enter row and column:
  1 2 3
1 X X X
2 . O .
3 . . O
Nusrat wins!
```

In the sample run Tanvir forgets to block the top row, and Nusrat wins with `1 3`. The
two rejected moves (`1 1` and `4 1`) do not change whose turn it is.

### How it works

- **`Player`** is a tiny immutable class: a name and a symbol, both `final`.
- **`Board`** hides the 2D array. Users of the board ask questions (`isFree`,
  `hasLine`, `isFull`) instead of reading cells. Because `place` is the only way to
  write a cell, `filled` is always correct, and `isFull()` does not need to scan.
- **`hasLine`** checks row `i` and column `i` in the same loop, then both diagonals.
  It only checks the symbol that just moved, because only that player can have made a
  new line.
- **`TicTacToeGame`** decides whose turn it is with `turn % 2`. Invalid moves use
  `continue`, which skips `turn++`, so the same player tries again.
- **`readMove`** skips words that are not numbers and returns `null` when the input
  ends. Returning `null` here is a clear signal to the caller: "there is no move".
- **`main`** creates the two players and starts the game. That is all it should do.

### Extensions

- Add a `ComputerPlayer` that picks the first free cell, then one that wins or blocks
  when it can. Make `Player` abstract with a `chooseMove(Board)` method (as in Game 2).
- Generalise to an `n x n` board with `k` in a row to win (`hasLine` needs loops).
- Keep a match score over several games and swap who starts each time.
- Add an "undo last move" command using an `ArrayList` of moves.

## Game 4: Quiz Game
**Level:** Basic

### Overview and rules

A short quiz about Java. There are three kinds of question: multiple choice (answer
`A` to `D`), true/false, and a one-word short answer. Each question is worth some
points. Answers are not case-sensitive. At the end the program prints the number of
correct answers, the points and a percentage.

### Class design

```text
                    +-------------------------+
                    |  Question (abstract)    |
                    +-------------------------+
                    | text, points            |
                    | showChoices()  abstract |
                    | isCorrect(a)   abstract |
                    | correctAnswer() abstract|
                    +-------------------------+
                       ^                    ^
         +-------------+                    +-----------+
         |                                              |
+------------------------+                 +---------------------+
| MultipleChoiceQuestion |                 | ShortAnswerQuestion |
| options[], letter      |                 | expected: String    |
+------------------------+                 +---------------------+
                                                       ^
                                           +---------------------+
                                           |  TrueFalseQuestion  |
                                           | showChoices() only  |
                                           +---------------------+

+------------------------+          +---------------------+
|          Quiz          |  uses    |        Score        |
+------------------------+--------->+---------------------+
| questions: List<...>   |          | earned, possible    |
| add(q), run(in)        |          | correct, asked      |
+------------------------+          | record(q, ok)       |
                                    +---------------------+
```

### Concepts used

- Chapter 09: Inheritance (two question types extend `Question`; `TrueFalseQuestion`
  extends `ShortAnswerQuestion` and reuses its answer checking)
- Chapter 10: Polymorphism, Abstract Classes and Interfaces (`Quiz` stores
  `List<Question>` and calls `isCorrect` on each, whatever its real class)
- Chapter 08: Arrays, Object References and Collections (`ArrayList`, options array)
- Chapter 01: Java Fundamentals (`equalsIgnoreCase`, integer percentage)

### The program

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

abstract class Question {
    private final String text;
    private final int points;

    Question(String text, int points) {
        this.text = text;
        this.points = points;
    }

    String getText() { return text; }

    int getPoints() { return points; }

    abstract void showChoices();

    abstract boolean isCorrect(String answer);

    abstract String correctAnswer();
}

class MultipleChoiceQuestion extends Question {
    private final String[] options;
    private final char correctLetter;

    MultipleChoiceQuestion(String text, int points, String[] options, char letter) {
        super(text, points);
        this.options = options;
        this.correctLetter = letter;
    }

    @Override
    void showChoices() {
        for (int i = 0; i < options.length; i++) {
            System.out.println("  " + (char) ('A' + i) + ") " + options[i]);
        }
    }

    @Override
    boolean isCorrect(String answer) {
        String a = answer.trim().toUpperCase();
        return a.length() == 1 && a.charAt(0) == correctLetter;
    }

    @Override
    String correctAnswer() { return correctLetter + ") " + options[correctLetter - 'A']; }
}

class ShortAnswerQuestion extends Question {
    private final String expected;

    ShortAnswerQuestion(String text, int points, String expected) {
        super(text, points);
        this.expected = expected;
    }

    @Override
    void showChoices() {
        System.out.println("  (one word)");
    }

    @Override
    boolean isCorrect(String answer) { return answer.trim().equalsIgnoreCase(expected); }

    @Override
    String correctAnswer() { return expected; }
}

/** A true/false question is a short-answer question with only two answers. */
class TrueFalseQuestion extends ShortAnswerQuestion {
    TrueFalseQuestion(String text, int points, boolean expected) {
        super(text, points, Boolean.toString(expected));
    }

    @Override
    void showChoices() {
        System.out.println("  (true or false)");
    }
}

class Score {
    private int earned;
    private int possible;
    private int correct;
    private int asked;

    void record(Question question, boolean right) {
        asked++;
        possible += question.getPoints();
        if (right) {
            correct++;
            earned += question.getPoints();
        }
    }

    void print() {
        int percent = possible == 0 ? 0 : earned * 100 / possible;
        System.out.println("Correct answers: " + correct + " of " + asked);
        System.out.println("Score: " + earned + " of " + possible + " points ("
                + percent + "%)");
    }
}

class Quiz {
    private final List<Question> questions = new ArrayList<>();

    void add(Question question) {
        questions.add(question);
    }

    void run(Scanner in) {
        System.out.println("Java Quiz: " + questions.size() + " questions");
        Score score = new Score();
        int number = 1;
        for (Question q : questions) {
            String label = q.getPoints() == 1 ? "1 point" : q.getPoints() + " points";
            System.out.println("Q" + number + " [" + label + "]: " + q.getText());
            q.showChoices();
            if (!in.hasNextLine()) {
                System.out.println("No more answers. The quiz ends early.");
                break;
            }
            boolean ok = q.isCorrect(in.nextLine());
            score.record(q, ok);
            String reply = ok ? "Correct!" : "Wrong. The answer is: " + q.correctAnswer();
            System.out.println(reply);
            number++;
        }
        score.print();
    }
}

public class QuizGame {
    public static void main(String[] args) {
        Quiz quiz = new Quiz();
        quiz.add(new MultipleChoiceQuestion("Which keyword creates a new object?", 2,
                new String[] {"class", "new", "this", "static"}, 'B'));
        quiz.add(new TrueFalseQuestion("A Java class can extend two classes.", 1, false));
        quiz.add(new ShortAnswerQuestion(
                "Which method does the JVM call to start a program?", 2, "main"));
        quiz.add(new MultipleChoiceQuestion(
                "Which type stores a list of objects that grows automatically?", 2,
                new String[] {"int[]", "String", "ArrayList", "Scanner"}, 'C'));
        quiz.add(new TrueFalseQuestion("String objects in Java are immutable.", 1, true));
        quiz.run(new Scanner(System.in));
    }
}
```

**Input:**

```text
b
true
Main
B
TRUE
```

**Output:**

```text
Java Quiz: 5 questions
Q1 [2 points]: Which keyword creates a new object?
  A) class
  B) new
  C) this
  D) static
Correct!
Q2 [1 point]: A Java class can extend two classes.
  (true or false)
Wrong. The answer is: false
Q3 [2 points]: Which method does the JVM call to start a program?
  (one word)
Correct!
Q4 [2 points]: Which type stores a list of objects that grows automatically?
  A) int[]
  B) String
  C) ArrayList
  D) Scanner
Wrong. The answer is: C) ArrayList
Q5 [1 point]: String objects in Java are immutable.
  (true or false)
Correct!
Correct answers: 3 of 5
Score: 5 of 8 points (62%)
```

### How it works

- **`Question`** is abstract: every question has text and points, but *how* it shows
  its choices and *how* it checks an answer depends on the kind of question. Those
  three methods are abstract.
- **`MultipleChoiceQuestion`** prints `A)` to `D)` by adding `i` to the character
  `'A'` (characters are numbers underneath, so `'A' + 1` is `'B'`). To find the correct
  option text it uses `correctLetter - 'A'` as an index.
- **`ShortAnswerQuestion`** compares with `equalsIgnoreCase`, so `Main` is accepted
  for `main`.
- **`TrueFalseQuestion`** is a short-answer question whose expected answer is
  `"true"` or `"false"`. It calls `super(text, points, Boolean.toString(expected))`
  and only overrides `showChoices()`; checking `TRUE` is inherited unchanged.
- **`Score`** keeps all counting in one place and guards against dividing by zero.
  `earned * 100 / possible` is integer division, so 5 of 8 is 62 percent (not 62.5).
- **`Quiz`** loops over `List<Question>`. The call `q.isCorrect(...)` runs the version
  from the object's real class (dynamic method dispatch). Adding a new kind of
  question needs a new subclass, not a new `if` in `Quiz`. If the answers run out,
  `hasNextLine()` is `false` and the quiz ends with a partial score.

### Extensions

- Add a `NumericQuestion` that accepts answers within a tolerance (for example 3.14).
- Load questions from a text file (Chapter 12: Object-Oriented I/O), one question per
  line with `|` between fields.
- Shuffle the questions with a seeded `Random` and `Collections.shuffle`.
- Add a time limit per question, or negative marking for wrong answers.

## Game 5: Hangman
**Level:** Intermediate

### Overview and rules

The computer picks a secret word about programming. You guess one letter at a time.
Correct letters are revealed in every position where they appear. Each wrong letter adds
one part to the drawing; after 6 wrong letters the drawing is complete and you lose.
Guessing a letter twice costs nothing, and anything that is not a single letter is
rejected. An optional seed picks a fixed word: `java Hangman 5`.

### Class design

```text
+---------------------+
|     HangmanGame     |
+---------------------+       +---------------------+
| guess(text): String |------>|     SecretWord      |
| isWon(), isLost()   |       +---------------------+
| show()              |       | letters, revealed[] |
+---------------------+       | reveal(ch): int     |
     |          |             | isSolved()          |
     |          |             | masked()            |
     |          v             +---------------------+
     |   +---------------------+
     |   |    GuessTracker     |     +---------------------+
     |   +---------------------+     |   GallowsDrawing    |
     |   | tried: TreeSet      |     +---------------------+
     |   | wrong               |     | MAX_WRONG = 6       |
     |   | record(ch, hit)     |     | draw(wrong): String |
     |   +---------------------+     +---------------------+
     +---------------------------------------^

Hangman (main class): WORDS array, picks a word with Random
```

### Concepts used

- Chapter 05: Encapsulation, Abstraction and Access Control (the word and the
  `revealed` array are private; the game asks `masked()` for a safe view)
- Chapter 07: Static and Instance Members (the word list is a `static final` array)
- Chapter 08: Arrays, Object References and Collections (`boolean[]`, `char[]`)
- Chapter 13: Generic Programming (`TreeSet<Character>` keeps tried letters sorted)
- Chapter 01: Java Fundamentals (`Character.isLetter`, `toUpperCase`)

### The program

<details>
<summary>Full code: Hangman.java (about 145 lines)</summary>

```java
import java.util.Random;
import java.util.Scanner;
import java.util.TreeSet;

class SecretWord {
    private final char[] letters;
    private final boolean[] revealed;

    SecretWord(String word) {
        this.letters = word.toUpperCase().toCharArray();
        this.revealed = new boolean[letters.length];
    }

    /** Reveals every position of the letter; returns how many were found. */
    int reveal(char letter) {
        int found = 0;
        for (int i = 0; i < letters.length; i++) {
            if (letters[i] == letter) {
                revealed[i] = true;
                found++;
            }
        }
        return found;
    }

    String masked() {
        StringBuilder text = new StringBuilder();
        for (int i = 0; i < letters.length; i++) {
            text.append(revealed[i] ? letters[i] : '_').append(' ');
        }
        return text.toString().trim();
    }

    boolean isSolved() { return masked().indexOf('_') < 0; }

    String fullWord() { return new String(letters); }
}

class GuessTracker {
    private final TreeSet<Character> tried = new TreeSet<>();
    private int wrong;

    boolean hasTried(char letter) { return tried.contains(letter); }

    void record(char letter, boolean hit) {
        tried.add(letter);
        if (!hit) {
            wrong++;
        }
    }

    int getWrong() { return wrong; }

    String triedLetters() { return tried.toString(); }
}

class GallowsDrawing {
    static final int MAX_WRONG = 6;

    String draw(int wrong) {
        char head = wrong >= 1 ? 'O' : ' ';
        char body = wrong >= 2 ? '|' : ' ';
        char leftArm = wrong >= 3 ? '/' : ' ';
        char rightArm = wrong >= 4 ? '\\' : ' ';
        char leftLeg = wrong >= 5 ? '/' : ' ';
        char rightLeg = wrong >= 6 ? '\\' : ' ';
        return "  +---+\n  |   |\n"
                + "  " + head + "   |\n"
                + " " + leftArm + body + rightArm + "  |\n"
                + " " + leftLeg + " " + rightLeg + "  |\n"
                + "      |\n=========";
    }
}

class HangmanGame {
    private final SecretWord secret;
    private final GuessTracker guesses = new GuessTracker();
    private final GallowsDrawing drawing = new GallowsDrawing();

    HangmanGame(String word) {
        this.secret = new SecretWord(word);
    }

    boolean isWon() { return secret.isSolved(); }

    boolean isLost() { return guesses.getWrong() >= GallowsDrawing.MAX_WRONG; }

    boolean isOver() { return isWon() || isLost(); }

    String guess(String input) {
        String text = input.trim().toUpperCase();
        if (text.length() != 1 || !Character.isLetter(text.charAt(0))) {
            return "Type exactly one letter.";
        }
        char letter = text.charAt(0);
        if (guesses.hasTried(letter)) {
            return "You already tried " + letter + ".";
        }
        int found = secret.reveal(letter);
        guesses.record(letter, found > 0);
        if (found == 0) {
            return "No " + letter + " in the word.";
        }
        return "Yes! " + letter + " appears " + found + " time(s).";
    }

    void show() {
        System.out.println(drawing.draw(guesses.getWrong()));
        System.out.println("Word:  " + secret.masked());
        System.out.println("Tried: " + guesses.triedLetters());
        int left = GallowsDrawing.MAX_WRONG - guesses.getWrong();
        System.out.println("Wrong guesses left: " + left);
    }

    String result() {
        String verdict = isWon() ? "You saved him!" : "Game over.";
        return verdict + " The word was " + secret.fullWord() + ".";
    }
}

public class Hangman {
    private static final String[] WORDS = {
        "OBJECT", "CLASS", "METHOD", "INTERFACE", "PACKAGE",
        "COMPILER", "VARIABLE", "INHERITANCE", "EXCEPTION", "THREAD"
    };

    public static void main(String[] args) {
        Random random = new Random();
        if (args.length > 0) {
            random = new Random(Long.parseLong(args[0]));
        }
        HangmanGame game = new HangmanGame(WORDS[random.nextInt(WORDS.length)]);
        Scanner in = new Scanner(System.in);
        System.out.println("Guess the programming word, one letter at a time.");
        game.show();
        while (!game.isOver() && in.hasNextLine()) {
            System.out.println(game.guess(in.nextLine()));
            game.show();
        }
        if (game.isOver()) {
            System.out.println(game.result());
        } else {
            System.out.println("Input ended. The game is not finished.");
        }
    }
}
```

</details>

### How it works

- **`SecretWord`** stores the letters and a parallel `boolean[] revealed`. Nobody
  outside can read the letters directly: the game gets `masked()` (like
  `_ B J E _ T`) for display and `fullWord()` only at the end. `reveal` returns how many
  positions matched, which is exactly what the game needs to decide hit or miss. The
  word is solved when the masked text has no `_` left.
- **`GuessTracker`** remembers tried letters in a `TreeSet<Character>`, so they print
  in alphabetical order (`[A, E, T]`) and duplicates are impossible. It also counts
  wrong guesses.
- **`GallowsDrawing`** turns a number (0 to 6) into a picture. It has no state at all;
  it is the "view" of the console game. Note `'\\'` is how you write one backslash.
- **`HangmanGame`** applies the rules in `guess`: validate, reject repeats, reveal,
  record. Each branch returns a message, and `main` decides to print it.
- **`main`** picks a word from the `static` `WORDS` array with a seeded or unseeded
  `Random`, then runs the turn-based loop until the game is over or the input ends.

### Extensions

- Add categories (animals, Bangladeshi cities, Java keywords) chosen at the start.
- Allow guessing the whole word at once, costing two wrong guesses if it is wrong.
- Two-player mode: one player types the word, the screen is cleared with blank lines,
  and the other guesses.
- Give a hint (reveal one random hidden letter) at the cost of one wrong guess.

## Game 6: Snake
**Level:** Intermediate

### Overview and rules

The snake moves on a 24 x 18 grid, one cell per tick. Arrow keys (or W, A, S, D) turn
it; it cannot reverse straight into itself. Eating the red food adds 10 points and makes
the snake 2 cells longer. Hitting a wall or its own body ends the game; press Enter to
play again. The food position uses `Random`, so `java SnakeApp 42` repeats the same
food sequence.

```text
+------------------------------------------------+
| Score: 30                                      |
|                                                |
|           ####@                                |
|              #             *                   |
|              #                                 |
|                                                |
+------------------------------------------------+
   # body   @ head   * food
```

### Class design

```text
 MODEL (no Swing)                                VIEW + CONTROLLER
+------------------+  has  +------------+       +----------------------+
|    SnakeGame     |------>|   Snake    |       |  SnakePanel (JPanel) |
+------------------+       +------------+       +----------------------+
| COLS, ROWS       |       | body: Deque|<-reads| game, timer          |
| score, gameOver  |       | direction  |       | paintComponent(g)    |
| step()           |       | move()     |       | key bindings ->      |
| turn(d), reset() |       | grow(n)    |       |   game.turn(d)       |
+------------------+       | bitesItself|       | Timer tick ->        |
        | has              +------------+       |   game.step()        |
        v                        | made of      +----------------------+
+------------------+             v
|      Food        |       +------------+        +------------------+
| position: Cell   |       |    Cell    |        | Direction (enum) |
| respawn(snake)   |       | x, y       |        | UP DOWN LEFT     |
+------------------+       | step(dir)  |        | RIGHT; dx, dy    |
                           +------------+        +------------------+
```

### Concepts used

- Chapter 07: Static and Instance Members (`Direction` enum with fields and a
  constructor; `static final` sizes)
- Chapter 09: Inheritance (`SnakePanel extends JPanel`, actions extend `AbstractAction`)
- Chapter 05: Encapsulation, Abstraction and Access Control (`Cell` is immutable;
  `Snake` hides its `Deque`)
- Chapter 13: Generic Programming (`Deque<Cell>`, `equals`/`hashCode` so `contains`
  works)
- Lab L1: GUI Programming with Swing (`JFrame`, the EDT, `invokeLater`)

### The program

<details>
<summary>Full code: SnakeApp.java (about 340 lines)</summary>

```java
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Collections;
import java.util.Deque;
import java.util.Objects;
import java.util.Random;
import javax.swing.AbstractAction;
import javax.swing.InputMap;
import javax.swing.JComponent;
import javax.swing.JFrame;
import javax.swing.JPanel;
import javax.swing.KeyStroke;
import javax.swing.SwingUtilities;
import javax.swing.Timer;

enum Direction {
    UP(0, -1), DOWN(0, 1), LEFT(-1, 0), RIGHT(1, 0);

    private final int dx;
    private final int dy;

    Direction(int dx, int dy) {
        this.dx = dx;
        this.dy = dy;
    }

    int getDx() {
        return dx;
    }

    int getDy() {
        return dy;
    }

    boolean isOpposite(Direction other) {
        return dx == -other.dx && dy == -other.dy;
    }
}

/** One grid position. Immutable, so it is safe to share. */
final class Cell {
    private final int x;
    private final int y;

    Cell(int x, int y) {
        this.x = x;
        this.y = y;
    }

    int getX() {
        return x;
    }

    int getY() {
        return y;
    }

    Cell step(Direction d) {
        return new Cell(x + d.getDx(), y + d.getDy());
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Cell other)) {
            return false;
        }
        return x == other.x && y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

class Snake {
    private final Deque<Cell> body = new ArrayDeque<>();
    private Direction direction = Direction.RIGHT;
    private Direction nextDirection = Direction.RIGHT;
    private int pendingGrowth;

    Snake(Cell start, int length) {
        for (int i = 0; i < length; i++) {
            body.addLast(new Cell(start.getX() - i, start.getY()));
        }
    }

    Cell head() {
        return body.peekFirst();
    }

    Collection<Cell> cells() {
        return Collections.unmodifiableCollection(body);
    }

    void turn(Direction wanted) {
        if (!wanted.isOpposite(direction)) {
            nextDirection = wanted;
        }
    }

    void move() {
        direction = nextDirection;
        body.addFirst(head().step(direction));
        if (pendingGrowth > 0) {
            pendingGrowth--;
        } else {
            body.removeLast();
        }
    }

    void grow(int cells) {
        pendingGrowth += cells;
    }

    boolean occupies(Cell cell) {
        return body.contains(cell);
    }

    boolean bitesItself() {
        Cell head = head();
        int count = 0;
        for (Cell cell : body) {
            if (cell.equals(head)) {
                count++;
            }
        }
        return count > 1;
    }
}

class Food {
    private final Random random;
    private Cell position;

    Food(Random random) {
        this.random = random;
    }

    void respawn(Snake snake, int cols, int rows) {
        do {
            position = new Cell(random.nextInt(cols), random.nextInt(rows));
        } while (snake.occupies(position));
    }

    Cell getPosition() {
        return position;
    }
}

class SnakeGame {
    static final int COLS = 24;
    static final int ROWS = 18;
    private static final int POINTS_PER_FOOD = 10;

    private final Food food;
    private Snake snake;
    private int score;
    private boolean gameOver;

    SnakeGame(Random random) {
        this.food = new Food(random);
        reset();
    }

    void reset() {
        snake = new Snake(new Cell(COLS / 2, ROWS / 2), 3);
        score = 0;
        gameOver = false;
        food.respawn(snake, COLS, ROWS);
    }

    void turn(Direction direction) {
        if (!gameOver) {
            snake.turn(direction);
        }
    }

    void step() {
        if (gameOver) {
            return;
        }
        snake.move();
        Cell head = snake.head();
        boolean outside = head.getX() < 0 || head.getX() >= COLS
                || head.getY() < 0 || head.getY() >= ROWS;
        if (outside || snake.bitesItself()) {
            gameOver = true;
            return;
        }
        if (head.equals(food.getPosition())) {
            score += POINTS_PER_FOOD;
            snake.grow(2);
            food.respawn(snake, COLS, ROWS);
        }
    }

    Snake getSnake() {
        return snake;
    }

    Cell getFood() {
        return food.getPosition();
    }

    int getScore() {
        return score;
    }

    boolean isGameOver() {
        return gameOver;
    }
}

class SnakePanel extends JPanel {
    private static final int CELL = 24;
    private static final int TICK_MILLIS = 110;
    private final SnakeGame game;
    private final Timer timer;

    SnakePanel(SnakeGame game) {
        this.game = game;
        setPreferredSize(new Dimension(SnakeGame.COLS * CELL, SnakeGame.ROWS * CELL));
        setBackground(new Color(24, 28, 36));
        bindTurn("UP", Direction.UP);
        bindTurn("DOWN", Direction.DOWN);
        bindTurn("LEFT", Direction.LEFT);
        bindTurn("RIGHT", Direction.RIGHT);
        bindTurn("W", Direction.UP);
        bindTurn("S", Direction.DOWN);
        bindTurn("A", Direction.LEFT);
        bindTurn("D", Direction.RIGHT);
        getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
                .put(KeyStroke.getKeyStroke("ENTER"), "restart");
        getActionMap().put("restart", new RestartAction());
        timer = new Timer(TICK_MILLIS, new TickListener());
    }

    void start() {
        timer.start();
    }

    private void bindTurn(String key, Direction direction) {
        InputMap keys = getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        keys.put(KeyStroke.getKeyStroke(key), "turn" + key);
        getActionMap().put("turn" + key, new TurnAction(direction));
    }

    private class TurnAction extends AbstractAction {
        private final Direction direction;

        TurnAction(Direction direction) {
            this.direction = direction;
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            game.turn(direction);
        }
    }

    private class RestartAction extends AbstractAction {
        @Override
        public void actionPerformed(ActionEvent e) {
            if (game.isGameOver()) {
                game.reset();
                repaint();
            }
        }
    }

    private class TickListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            game.step();
            repaint();
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON);
        Cell food = game.getFood();
        g2.setColor(new Color(230, 70, 70));
        g2.fillOval(food.getX() * CELL + 4, food.getY() * CELL + 4, CELL - 8, CELL - 8);

        boolean isHead = true;
        for (Cell cell : game.getSnake().cells()) {
            g2.setColor(isHead ? new Color(150, 230, 120) : new Color(70, 170, 90));
            g2.fillRoundRect(cell.getX() * CELL + 1, cell.getY() * CELL + 1,
                    CELL - 2, CELL - 2, 8, 8);
            isHead = false;
        }

        g2.setColor(Color.WHITE);
        g2.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 16));
        g2.drawString("Score: " + game.getScore(), 10, 22);
        if (game.isGameOver()) {
            drawCentered(g2, "Game over! Score " + game.getScore(), getHeight() / 2);
            drawCentered(g2, "Press Enter to play again", getHeight() / 2 + 26);
        }
    }

    private void drawCentered(Graphics2D g2, String text, int y) {
        FontMetrics metrics = g2.getFontMetrics();
        int x = (getWidth() - metrics.stringWidth(text)) / 2;
        g2.drawString(text, x, y);
    }
}

public class SnakeApp {
    public static void main(String[] args) {
        long seed = args.length > 0 ? Long.parseLong(args[0]) : System.nanoTime();
        Random random = new Random(seed);
        SwingUtilities.invokeLater(() -> showWindow(random));
    }

    private static void showWindow(Random random) {
        SnakeGame game = new SnakeGame(random);
        SnakePanel panel = new SnakePanel(game);
        JFrame frame = new JFrame("Snake");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(panel);
        frame.pack();
        frame.setResizable(false);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
        panel.start();
    }
}
```

</details>

### How it works

- **`Direction`** is an `enum` whose constants carry data: `UP` means `dx = 0,
  dy = -1` (up is negative `y` on screen). `isOpposite` stops the snake reversing into
  its own neck.
- **`Cell`** is an immutable grid position. It overrides `equals` *and* `hashCode`
  (Chapter 09: Inheritance), so `body.contains(cell)` and `head.equals(food)` compare
  coordinates instead of object identity. `step` returns a *new* cell.
- **`Snake`** keeps its body in a `Deque<Cell>` (a double-ended queue): moving adds a
  new head at the front and removes the tail at the back, unless the snake is still
  growing. A turn is stored in `nextDirection` and applied at the next `move()`; it is
  checked against the direction actually moved, so two quick key presses inside one
  tick cannot reverse the snake. `cells()` returns a read-only view of the body.
- **`Food`** picks random cells until it finds one that the snake does not occupy.
- **`SnakeGame`** is the model: one `step()` moves the snake, checks walls and
  self-collision, and handles eating. It has no Swing code, so you could drive it from
  a test `main` and print `getSnake().head()` after each step.
- **`SnakePanel`** is the view and controller. Key bindings call `game.turn(...)`, the
  `Timer` calls `game.step()` and `repaint()` every 110 ms, and `paintComponent` only
  reads the model. Grid cells become pixels by multiplying by `CELL`.
- **`SnakeApp.main`** builds the window on the EDT with `SwingUtilities.invokeLater`.

### Extensions

- Speed up as the score grows: call `timer.setDelay(...)` from the tick listener.
- Add a pause key (`P`) that sets a `paused` flag in the model.
- Add walls inside the grid read from a small level map (`String[]` of `#` and `.`).
- Let the snake wrap around the edges instead of dying (use `%` on the coordinates).
- Keep a high score in a file (Chapter 12: Object-Oriented I/O).

## Game 7: Breakout
**Level:** Advanced

### Overview and rules

A wall of 50 bricks sits at the top. You move a paddle along the bottom with the Left
and Right arrow keys and press Space to launch the ball. The ball bounces off the side
walls, the top, the paddle and the bricks; every brick it hits breaks and gives points
(higher rows are worth more). Where the ball hits the paddle controls its angle: the
paddle's edges send it out sideways, the centre sends it almost straight up. If the ball
falls past the paddle you lose a life; with 0 of 3 lives left the game is over. Clear
every brick to win. Space starts a new game after a win or a loss.

```text
+--------------------------------------------------+
| Score: 120                              Lives: 2 |
|  [##][##][##][##][##][##][##][##][##][##]        |
|  [##][##][##]    [##][##][##][##][##][##]        |
|  [##][##][##][##][##][##]    [##][##][##]        |
|                      o                           |
|                                                  |
|                 [=========]                      |
+--------------------------------------------------+
```

### Class design

```text
 MODEL (no Swing components, only java.awt shapes and colours)
+---------------------+ has  +----------------+   +------------------+
|    BreakoutGame     |----->|      Ball      |   |      Paddle      |
+---------------------+      +----------------+   +------------------+
| WIDTH, HEIGHT       |      | x, y, dx, dy   |   | x                |
| score, lives        |      | move()         |   | movingLeft/Right |
| state: GameState    |      | placeOn(p)     |   | move(width)      |
| update()            |      | setDirection(s)|   | bounds()         |
| launchOrRestart()   |      | bounds()       |   | hitOffset(box)   |
| steerLeft/Right(b)  |      +----------------+   +------------------+
+---------------------+------------- has ------------------^
          | has 1
          v
+---------------------+ has 50 +----------------+  +-----------------+
|      BrickWall      |------->|     Brick      |  | GameState (enum)|
| hit(box): Brick     |        | bounds, color  |  | READY, PLAYING, |
| remaining()         |        | points, broken |  | WON, LOST       |
+---------------------+        +----------------+  +-----------------+

 VIEW + CONTROLLER
+--------------------------------------------------------------+
| GamePanel extends JPanel: Timer (16 ms) -> game.update();     |
| key bindings -> steerLeft/steerRight/launchOrRestart;         |
| paintComponent draws bricks, paddle, ball, score, lives       |
+--------------------------------------------------------------+
```

### Concepts used

- Chapter 05: Encapsulation, Abstraction and Access Control (each object guards its
  own state: the paddle clamps itself inside the window, a brick breaks only once)
- Chapter 07: Static and Instance Members (shared sizes as `static final` constants;
  the `GameState` enum)
- Chapter 08: Arrays, Object References and Collections (`List<Brick>`, returning a
  read-only list)
- Chapter 09: Inheritance (`GamePanel extends JPanel`, actions extend `AbstractAction`)
- Chapter 10: Polymorphism, Abstract Classes and Interfaces (Swing calls our overridden
  `paintComponent` and `actionPerformed` methods)

### The program

<details>
<summary>Full code: Breakout.java (about 345 lines)</summary>

```java
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.swing.*;

enum GameState { READY, PLAYING, WON, LOST }

class Paddle {
    static final int WIDTH = 90;
    static final int HEIGHT = 12;
    static final int Y = 440;
    private static final int SPEED = 7;
    private int x;
    private boolean movingLeft;
    private boolean movingRight;

    Paddle(int x) {
        this.x = x;
    }

    void setMovingLeft(boolean moving) { movingLeft = moving; }
    void setMovingRight(boolean moving) { movingRight = moving; }
    int getX() { return x; }
    Rectangle bounds() { return new Rectangle(x, Y, WIDTH, HEIGHT); }

    void move(int fieldWidth) {
        int step = (movingRight ? SPEED : 0) - (movingLeft ? SPEED : 0);
        x = Math.max(0, Math.min(fieldWidth - WIDTH, x + step));   // stay inside
    }

    /** -1.0 at the left edge, 0 at the centre, +1.0 at the right edge. */
    double hitOffset(Rectangle ballBox) {
        double centre = x + WIDTH / 2.0;
        double offset = (ballBox.getCenterX() - centre) / (WIDTH / 2.0);
        return Math.max(-1.0, Math.min(1.0, offset));
    }
}

class Ball {
    static final int SIZE = 12;
    private static final double SPEED = 5.5;
    private double x;
    private double y;
    private double dx;
    private double dy;

    void placeOn(Paddle paddle) {
        x = paddle.getX() + Paddle.WIDTH / 2.0 - SIZE / 2.0;
        y = Paddle.Y - SIZE - 1;
        dx = 0;
        dy = 0;
    }

    /** Sets the velocity from a sideways factor in [-1, 1]; the ball goes up. */
    void setDirection(double sideways) {
        dx = sideways * SPEED * 0.75;
        dy = -Math.sqrt(SPEED * SPEED - dx * dx);
    }

    void move() {
        x += dx;
        y += dy;
    }

    void goLeft() { dx = -Math.abs(dx); }
    void goRight() { dx = Math.abs(dx); }
    void goDown() { dy = Math.abs(dy); }
    void bounceX() { dx = -dx; }
    void bounceY() { dy = -dy; }
    boolean isFalling() { return dy > 0; }
    Rectangle bounds() { return new Rectangle((int) x, (int) y, SIZE, SIZE); }
}

class Brick {
    static final int WIDTH = 52;
    static final int HEIGHT = 20;
    private final Rectangle bounds;
    private final Color color;
    private final int points;
    private boolean broken;

    Brick(int x, int y, Color color, int points) {
        this.bounds = new Rectangle(x, y, WIDTH, HEIGHT);
        this.color = color;
        this.points = points;
    }

    void breakBrick() { broken = true; }
    boolean isBroken() { return broken; }
    Rectangle getBounds() { return new Rectangle(bounds); }
    Color getColor() { return color; }
    int getPoints() { return points; }
}

class BrickWall {
    private static final int GAP = 4;
    private static final Color[] ROW_COLORS = {
        new Color(231, 76, 60), new Color(230, 126, 34), new Color(241, 196, 15),
        new Color(46, 204, 113), new Color(52, 152, 219)
    };
    private final List<Brick> bricks = new ArrayList<>();
    private int remaining;

    BrickWall(int rows, int cols, int left, int top) {
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                int x = left + c * (Brick.WIDTH + GAP);
                int y = top + r * (Brick.HEIGHT + GAP);
                Color color = ROW_COLORS[r % ROW_COLORS.length];
                bricks.add(new Brick(x, y, color, (rows - r) * 10));
            }
        }
        remaining = bricks.size();
    }

    /** Breaks the first unbroken brick touching the box and returns it, or null. */
    Brick hit(Rectangle box) {
        for (Brick brick : bricks) {
            if (!brick.isBroken() && brick.getBounds().intersects(box)) {
                brick.breakBrick();
                remaining--;
                return brick;
            }
        }
        return null;
    }

    int remaining() { return remaining; }
    List<Brick> getBricks() { return Collections.unmodifiableList(bricks); }
}

class BreakoutGame {
    static final int WIDTH = 600;
    static final int HEIGHT = 480;
    private Paddle paddle;
    private Ball ball;
    private BrickWall wall;
    private int score;
    private int lives;
    private GameState state;

    BreakoutGame() {
        newGame();
    }

    private void newGame() {
        paddle = new Paddle((WIDTH - Paddle.WIDTH) / 2);
        ball = new Ball();
        ball.placeOn(paddle);
        wall = new BrickWall(5, 10, 22, 50);
        score = 0;
        lives = 3;
        state = GameState.READY;
    }

    void steerLeft(boolean pressed) { paddle.setMovingLeft(pressed); }
    void steerRight(boolean pressed) { paddle.setMovingRight(pressed); }

    void launchOrRestart() {
        if (state == GameState.READY) {
            ball.setDirection(0.4);
            state = GameState.PLAYING;
        } else if (state == GameState.WON || state == GameState.LOST) {
            newGame();
        }
    }

    /** One tick of the game world. */
    void update() {
        if (state == GameState.WON || state == GameState.LOST) {
            return;
        }
        paddle.move(WIDTH);
        if (state == GameState.READY) {
            ball.placeOn(paddle);
            return;
        }
        ball.move();
        bounceOffWallsAndPaddle();
        hitBricks();
        checkBallLost();
    }

    private void bounceOffWallsAndPaddle() {
        Rectangle box = ball.bounds();
        if (box.x <= 0) {
            ball.goRight();
        }
        if (box.x + box.width >= WIDTH) {
            ball.goLeft();
        }
        if (box.y <= 0) {
            ball.goDown();
        }
        if (ball.isFalling() && box.intersects(paddle.bounds())) {
            ball.setDirection(paddle.hitOffset(box));
        }
    }

    private void hitBricks() {
        Rectangle box = ball.bounds();
        Brick brick = wall.hit(box);
        if (brick == null) {
            return;
        }
        score += brick.getPoints();
        Rectangle overlap = box.intersection(brick.getBounds());
        if (overlap.width < overlap.height) {
            ball.bounceX();
        } else {
            ball.bounceY();
        }
        if (wall.remaining() == 0) {
            state = GameState.WON;
        }
    }

    private void checkBallLost() {
        if (ball.bounds().y > HEIGHT) {
            lives--;
            state = (lives == 0) ? GameState.LOST : GameState.READY;
            ball.placeOn(paddle);
        }
    }

    Paddle getPaddle() { return paddle; }
    Ball getBall() { return ball; }
    BrickWall getWall() { return wall; }
    int getScore() { return score; }
    int getLives() { return lives; }
    GameState getState() { return state; }
}

class GamePanel extends JPanel {
    private final BreakoutGame game;

    GamePanel(BreakoutGame game) {
        this.game = game;
        setPreferredSize(new Dimension(BreakoutGame.WIDTH, BreakoutGame.HEIGHT));
        setBackground(new Color(20, 22, 36));
        bind("pressed LEFT", new SteerAction(true, true));
        bind("released LEFT", new SteerAction(true, false));
        bind("pressed RIGHT", new SteerAction(false, true));
        bind("released RIGHT", new SteerAction(false, false));
        bind("SPACE", new LaunchAction());
        new Timer(16, new FrameListener()).start();   // about 60 frames per second
    }

    private void bind(String keyStroke, AbstractAction action) {
        getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW)
                .put(KeyStroke.getKeyStroke(keyStroke), keyStroke);
        getActionMap().put(keyStroke, action);
    }

    private class SteerAction extends AbstractAction {
        private final boolean left;
        private final boolean pressed;

        SteerAction(boolean left, boolean pressed) {
            this.left = left;
            this.pressed = pressed;
        }

        @Override
        public void actionPerformed(ActionEvent e) {
            if (left) {
                game.steerLeft(pressed);
            } else {
                game.steerRight(pressed);
            }
        }
    }

    private class LaunchAction extends AbstractAction {
        @Override
        public void actionPerformed(ActionEvent e) {
            game.launchOrRestart();
        }
    }

    private class FrameListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            game.update();
            repaint();
        }
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        for (Brick brick : game.getWall().getBricks()) {
            if (!brick.isBroken()) {
                Rectangle r = brick.getBounds();
                g2.setColor(brick.getColor());
                g2.fillRoundRect(r.x, r.y, r.width, r.height, 6, 6);
            }
        }
        Rectangle paddle = game.getPaddle().bounds();
        g2.setColor(new Color(220, 220, 235));
        g2.fillRoundRect(paddle.x, paddle.y, paddle.width, paddle.height, 10, 10);
        Rectangle ball = game.getBall().bounds();
        g2.setColor(Color.WHITE);
        g2.fillOval(ball.x, ball.y, ball.width, ball.height);
        drawHud(g2);
    }

    private void drawHud(Graphics2D g2) {
        g2.setColor(Color.WHITE);
        g2.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 16));
        g2.drawString("Score: " + game.getScore(), 12, 26);
        g2.drawString("Lives: " + game.getLives(), getWidth() - 80, 26);
        String message = switch (game.getState()) {
            case READY -> "Press SPACE to launch";
            case WON -> "You cleared the wall! SPACE to play again";
            case LOST -> "Game over. SPACE to play again";
            case PLAYING -> "";
        };
        FontMetrics metrics = g2.getFontMetrics();
        int x = (getWidth() - metrics.stringWidth(message)) / 2;
        g2.drawString(message, x, getHeight() * 2 / 3);
    }
}

public class Breakout {
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> showWindow());
    }

    private static void showWindow() {
        BreakoutGame game = new BreakoutGame();
        GamePanel panel = new GamePanel(game);
        JFrame frame = new JFrame("Breakout");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(panel);
        frame.pack();
        frame.setResizable(false);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }
}
```

</details>

### How it works

Two notes on layout first. Short accessor methods such as `int getX() { return x; }`
are written on one line to keep the file readable; they are ordinary methods. And
`import java.awt.*;` imports every class of the `java.awt` package on demand. The
explicit `import java.util.List;` wins over the wildcard, so `List` means the
collection, not the AWT `java.awt.List` component.

- **`Paddle`** stores its `x` and two flags, `movingLeft` and `movingRight`. The key
  bindings only flip the flags (pressed = `true`, released = `false`); the actual
  movement happens once per tick in `move`, which also clamps `x` so the paddle never
  leaves the window. `hitOffset` says where the ball touched, from -1 to +1.
- **`Ball`** stores its position and velocity as `double` so slow diagonal motion is
  smooth; `bounds()` converts to an `int` `Rectangle` for collisions. `setDirection`
  keeps the speed constant: `dy` is computed with Pythagoras from `dx`.
  `goLeft`/`goRight`/`goDown` use `Math.abs`, so a ball that is already moving away
  from a wall is never flipped back into it (a common "ball stuck in the wall" bug).
- **`Brick`** knows its rectangle, colour and points, and can break once.
  `getBounds()` returns a *copy* of its `Rectangle`, so no caller can move a brick.
- **`BrickWall`** builds 5 rows of 10 bricks, answers "which brick did the ball
  hit?" and keeps a `remaining` counter, so it never has to count all bricks again.
- **`BreakoutGame`** is the model and the referee. `update()` is one tick: move the
  paddle, then (while `PLAYING`) move the ball, bounce off the walls and the paddle,
  hit bricks and check for a lost ball. In `hitBricks` the overlap rectangle decides
  the bounce: a tall, thin overlap means the ball hit the side of a brick, so it
  bounces horizontally; otherwise vertically. The `GameState` enum replaces several
  `boolean` flags and makes illegal combinations (won *and* lost) impossible.
- **`GamePanel`** is the view and controller. Its constructor starts a `Timer` that
  runs about 60 ticks per second; key bindings call the model; `paintComponent` draws
  whatever the model says, and a switch expression on the state picks the message.
  The panel never changes a position itself.

### Extensions

- Add power-ups that fall from some bricks (wider paddle, extra life). A `PowerUp`
  class with its own `move()` and `bounds()` fits the existing design.
- Make some bricks need two hits: give `Brick` a `hitsLeft` field, or create a
  `StrongBrick` subclass that overrides a `hit()` method.
- Load level layouts from text files of `#` and `.` characters.
- Increase the ball speed slightly every 10 bricks.

## Game 8: Block Drop
**Level:** Advanced

### Overview and rules

A Tetris-style falling-blocks game. Pieces made of four squares fall into a well 10
cells wide and 20 cells tall. Left and Right move the piece, Up rotates it, Down moves
it one row down, and Space drops it to the bottom at once (2 bonus points per row). When
a piece cannot fall any further it **locks** into the board. Every full row disappears
and the rows above move down. Clearing 1, 2, 3 or 4 rows at once gives 100, 300, 500 or
800 points times the level; the level rises every 10 rows and the pieces fall faster. If
a piece locks above the top, the game is over (Enter starts a new one). An optional seed
fixes the piece sequence: `java BlockDrop 7`.

```text
+--------------------+---------------+
|                    |  NEXT         |
|        ###         |   ##          |
|         #          |   ##          |
|                    |               |
|                    |  Score  1300  |
|  #       ##        |  Lines  12    |
| ######## ######### |  Level  2     |
|####################|  <- full row: |
+--------------------+   cleared     |
                     +---------------+
```

### Class design

```text
 MODEL
+--------------------+    +------------------------+    +------------------+
|   Shape (enum)     |    |    Piece (immutable)   |    |      Board       |
+--------------------+    +------------------------+    +------------------+
| I O T S Z J L      |<---| shape, cells[4][2]     |    | ROWS=20, COLS=10 |
| offsets, color     |    | row, col               |    | grid: Color[][]  |
| rotates            |    | moved(dr, dc): Piece   |    | canPlace(piece)  |
+--------------------+    | rotated(): Piece       |    | lock(piece)      |
                          | rowOf(i), colOf(i)     |    | clearFullLines() |
                          +------------------------+    +------------------+
                                     ^                           ^
                                     | current                   | has 1
+----------------------------------------------------------------+---+
|                          BlockDropGame                             |
+--------------------------------------------------------------------+
| current: Piece, next: Shape, random, gameOver                      |
| moveLeft(), moveRight(), rotate(), hardDrop(), tick()              |
+--------------------------------------------------------------------+
          | has 1
          v
+---------------------+
|     ScoreKeeper     |  score, lines, level(), delayMillis()
+---------------------+

 VIEW + CONTROLLER
+--------------------------------------------------------------------+
| BlockPanel extends JPanel: Timer -> game.tick(), setDelay(speed);  |
| key bindings -> lambdas that call game methods; paintComponent     |
+--------------------------------------------------------------------+
```

### Concepts used

- Chapter 05: Encapsulation, Abstraction and Access Control (`Piece` is immutable:
  moving or rotating returns a *new* piece, so a rejected move cannot damage the
  current one)
- Chapter 07: Static and Instance Members (enums with fields; `static final` sizes)
- Chapter 08: Arrays, Object References and Collections (2D arrays; swapping row
  references when clearing a line)
- Chapter 09: Inheritance and Chapter 10: Polymorphism, Abstract Classes and Interfaces
  (overriding `paintComponent` and `actionPerformed`)
- Chapter 03: Methods and Problem Solving (rotation as a small, testable formula)
- Chapter 13: Generic Programming (lambdas such as `() -> game.rotate()` passed as
  `Runnable` objects)

### The program

<details>
<summary>Full code: BlockDrop.java (about 350 lines)</summary>

```java
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.Random;
import javax.swing.*;

enum Shape {
    I(new int[][] {{0, -1}, {0, 0}, {0, 1}, {0, 2}}, new Color(0, 190, 210), true),
    O(new int[][] {{0, 0}, {0, 1}, {1, 0}, {1, 1}}, new Color(240, 200, 0), false),
    T(new int[][] {{0, -1}, {0, 0}, {0, 1}, {1, 0}}, new Color(160, 80, 200), true),
    S(new int[][] {{0, 0}, {0, 1}, {1, -1}, {1, 0}}, new Color(70, 190, 80), true),
    Z(new int[][] {{0, -1}, {0, 0}, {1, 0}, {1, 1}}, new Color(220, 60, 60), true),
    J(new int[][] {{0, -1}, {0, 0}, {0, 1}, {1, 1}}, new Color(50, 100, 220), true),
    L(new int[][] {{0, -1}, {0, 0}, {0, 1}, {1, -1}}, new Color(240, 140, 30), true);

    private final int[][] offsets;   // {row, col} of each square around the pivot
    private final Color color;
    private final boolean rotates;

    Shape(int[][] offsets, Color color, boolean rotates) {
        this.offsets = offsets;
        this.color = color;
        this.rotates = rotates;
    }

    int[][] copyOffsets() {
        int[][] copy = new int[offsets.length][];
        for (int i = 0; i < offsets.length; i++) {
            copy[i] = offsets[i].clone();
        }
        return copy;
    }

    Color getColor() { return color; }
    boolean rotates() { return rotates; }
}

/** A shape at a position. Immutable: moves and rotations return a new Piece. */
final class Piece {
    private final Shape shape;
    private final int[][] cells;
    private final int row;
    private final int col;

    Piece(Shape shape, int row, int col) {
        this(shape, shape.copyOffsets(), row, col);
    }

    private Piece(Shape shape, int[][] cells, int row, int col) {
        this.shape = shape;
        this.cells = cells;
        this.row = row;
        this.col = col;
    }

    Piece moved(int dRow, int dCol) {
        return new Piece(shape, cells, row + dRow, col + dCol);
    }

    /** Clockwise quarter turn: (r, c) becomes (c, -r). */
    Piece rotated() {
        if (!shape.rotates()) {
            return this;
        }
        int[][] turned = new int[cells.length][2];
        for (int i = 0; i < cells.length; i++) {
            turned[i][0] = cells[i][1];
            turned[i][1] = -cells[i][0];
        }
        return new Piece(shape, turned, row, col);
    }

    int size() { return cells.length; }
    int rowOf(int i) { return row + cells[i][0]; }
    int colOf(int i) { return col + cells[i][1]; }
    Color getColor() { return shape.getColor(); }
}

class Board {
    static final int ROWS = 20;
    static final int COLS = 10;
    private final Color[][] grid = new Color[ROWS][COLS];   // null = empty

    /** Cells above the top (row < 0) are allowed while a piece is falling. */
    boolean canPlace(Piece piece) {
        for (int i = 0; i < piece.size(); i++) {
            int r = piece.rowOf(i);
            int c = piece.colOf(i);
            if (c < 0 || c >= COLS || r >= ROWS) {
                return false;
            }
            if (r >= 0 && grid[r][c] != null) {
                return false;
            }
        }
        return true;
    }

    /** Copies the piece into the grid; returns false if part of it is above the top. */
    boolean lock(Piece piece) {
        for (int i = 0; i < piece.size(); i++) {
            if (piece.rowOf(i) < 0) {
                return false;   // sticks out of the top: the game is over
            }
            grid[piece.rowOf(i)][piece.colOf(i)] = piece.getColor();
        }
        return true;
    }

    int clearFullLines() {
        int cleared = 0;
        int r = ROWS - 1;
        while (r >= 0) {
            if (isFull(r)) {
                removeRow(r);
                cleared++;
            } else {
                r--;
            }
        }
        return cleared;
    }

    private boolean isFull(int r) {
        for (int c = 0; c < COLS; c++) {
            if (grid[r][c] == null) {
                return false;
            }
        }
        return true;
    }

    private void removeRow(int row) {
        for (int r = row; r > 0; r--) {
            grid[r] = grid[r - 1];
        }
        grid[0] = new Color[COLS];
    }

    Color colorAt(int r, int c) { return grid[r][c]; }
}

class ScoreKeeper {
    private static final int[] LINE_POINTS = {0, 100, 300, 500, 800};
    private int score;
    private int lines;

    void addLines(int count) {
        score += LINE_POINTS[count] * level();
        lines += count;
    }

    void addDropBonus(int cells) { score += cells; }
    int level() { return 1 + lines / 10; }
    int delayMillis() { return Math.max(100, 600 - (level() - 1) * 50); }
    int getScore() { return score; }
    int getLines() { return lines; }
}

class BlockDropGame {
    private final Random random;
    private Board board;
    private ScoreKeeper score;
    private Piece current;
    private Shape next;
    private boolean gameOver;

    BlockDropGame(Random random) {
        this.random = random;
        newGame();
    }

    private void newGame() {
        board = new Board();
        score = new ScoreKeeper();
        gameOver = false;
        next = randomShape();
        spawn();
    }

    private Shape randomShape() {
        Shape[] all = Shape.values();
        return all[random.nextInt(all.length)];
    }

    private void spawn() {
        current = new Piece(next, 0, Board.COLS / 2 - 1);
        next = randomShape();
        if (!board.canPlace(current)) {
            gameOver = true;
        }
    }

    private boolean tryMove(Piece candidate) {
        if (!gameOver && board.canPlace(candidate)) {
            current = candidate;
            return true;
        }
        return false;
    }

    void moveLeft() { tryMove(current.moved(0, -1)); }
    void moveRight() { tryMove(current.moved(0, 1)); }

    /** Rotates; if the turned piece hits something, tries small sideways "kicks". */
    void rotate() {
        Piece turned = current.rotated();
        for (int kick : new int[] {0, -1, 1, -2, 2}) {
            if (tryMove(turned.moved(0, kick))) {
                return;
            }
        }
    }

    void hardDrop() {
        while (tryMove(current.moved(1, 0))) {
            score.addDropBonus(2);
        }
        tick();
    }

    /** Gravity: one row down, or lock the piece when it cannot fall. */
    void tick() {
        if (!gameOver && !tryMove(current.moved(1, 0))) {
            lockPiece();
        }
    }

    void newGameIfOver() {
        if (gameOver) {
            newGame();
        }
    }

    private void lockPiece() {
        if (!board.lock(current)) {
            gameOver = true;
            return;
        }
        score.addLines(board.clearFullLines());
        spawn();
    }

    Board getBoard() { return board; }
    Piece getCurrent() { return current; }
    Shape getNext() { return next; }
    ScoreKeeper getScore() { return score; }
    boolean isGameOver() { return gameOver; }
}

class BlockPanel extends JPanel {
    private static final int TILE = 28;
    private static final int SIDE = 160;
    private final BlockDropGame game;

    BlockPanel(BlockDropGame game) {
        this.game = game;
        setPreferredSize(new Dimension(Board.COLS * TILE + SIDE, Board.ROWS * TILE));
        setBackground(new Color(16, 18, 28));
        bind("LEFT", () -> game.moveLeft());
        bind("RIGHT", () -> game.moveRight());
        bind("UP", () -> game.rotate());
        bind("DOWN", () -> game.tick());
        bind("SPACE", () -> game.hardDrop());
        bind("ENTER", () -> game.newGameIfOver());
        new Timer(game.getScore().delayMillis(), e -> {
            game.tick();
            Timer timer = (Timer) e.getSource();
            timer.setDelay(game.getScore().delayMillis());   // faster at higher levels
            repaint();
        }).start();
    }

    private void bind(String key, Runnable command) {
        InputMap keys = getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW);
        keys.put(KeyStroke.getKeyStroke(key), key);
        getActionMap().put(key, new AbstractAction() {
            @Override
            public void actionPerformed(ActionEvent e) {
                command.run();
                repaint();
            }
        });
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        Board board = game.getBoard();
        for (int r = 0; r < Board.ROWS; r++) {
            for (int c = 0; c < Board.COLS; c++) {
                Color color = board.colorAt(r, c);
                if (color != null) {
                    drawTile(g2, c * TILE, r * TILE, TILE, color);
                }
            }
        }
        drawPiece(g2, game.getCurrent(), 0, 0, TILE);
        drawSidebar(g2);
    }

    private void drawPiece(Graphics2D g2, Piece piece, int left, int top, int size) {
        for (int i = 0; i < piece.size(); i++) {
            if (piece.rowOf(i) >= 0) {
                int x = left + piece.colOf(i) * size;
                drawTile(g2, x, top + piece.rowOf(i) * size, size, piece.getColor());
            }
        }
    }

    private void drawSidebar(Graphics2D g2) {
        int left = Board.COLS * TILE + 20;
        g2.setColor(Color.WHITE);
        g2.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 16));
        g2.drawString("NEXT", left, 30);
        drawPiece(g2, new Piece(game.getNext(), 0, 0), left + 30, 50, 20);
        ScoreKeeper score = game.getScore();
        g2.setColor(Color.WHITE);
        g2.drawString("Score  " + score.getScore(), left, 150);
        g2.drawString("Lines  " + score.getLines(), left, 175);
        g2.drawString("Level  " + score.level(), left, 200);
        if (game.isGameOver()) {
            g2.drawString("GAME OVER", left, 250);
            g2.drawString("Enter: new game", left, 275);
        }
    }

    private void drawTile(Graphics2D g2, int x, int y, int size, Color color) {
        g2.setColor(color);
        g2.fillRect(x + 1, y + 1, size - 2, size - 2);
    }
}

public class BlockDrop {
    public static void main(String[] args) {
        long seed = args.length > 0 ? Long.parseLong(args[0]) : System.nanoTime();
        Random random = new Random(seed);
        SwingUtilities.invokeLater(() -> showWindow(random));
    }

    private static void showWindow(Random random) {
        JFrame frame = new JFrame("Block Drop");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.add(new BlockPanel(new BlockDropGame(random)));
        frame.pack();
        frame.setResizable(false);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }
}
```

</details>

### How it works

- **`Shape`** is an `enum` of the seven pieces. Each constant stores four
  `{row, col}` offsets around a pivot cell `(0, 0)`, a colour, and whether it rotates
  (the square `O` does not). `copyOffsets` hands out a copy so no piece can change the
  shared enum data.
- **`Piece`** is immutable. `moved` and `rotated` return *new* pieces. The game asks
  "could this new piece go here?" and only then replaces `current`, so a blocked move
  never leaves a half-moved piece behind. Rotation uses the formula `(r, c) -> (c, -r)`:
  a cell to the right of the pivot `(0, 1)` moves below it `(1, 0)`, which is a
  clockwise turn on a screen where rows grow downwards.
- **`Board`** is a `Color[ROWS][COLS]` grid where `null` means empty. `canPlace`
  checks the walls, the floor and occupied cells (cells above the top are allowed while
  falling). `clearFullLines` scans from the bottom; when a row is full it shifts every
  row above it down by one *reference* and does not move `r`, because the row that
  just fell into position `r` must be checked too.
- **`ScoreKeeper`** holds the scoring table, the level (`1 + lines / 10`) and the
  fall speed (`delayMillis`), so changing the balance of the game touches one class.
- **`BlockDropGame`** holds the rules: spawning, moving, rotating with wall kicks
  (try the turned piece, then shifted by 1 and 2 columns), gravity in `tick()`, and
  locking. A new piece that cannot be placed, or a locked piece sticking out of the
  top, ends the game. The `Random` passed in decides the piece sequence.
- **`BlockDropGame.newGame()`** simply creates a fresh `Board` and `ScoreKeeper`;
  the old ones become unreachable and the garbage collector reclaims them.
- **`BlockPanel`** binds each key to a `Runnable` written as a lambda, for example
  `bind("UP", () -> game.rotate())`. The helper `bind` wraps the `Runnable` in an
  anonymous `AbstractAction` that runs it and repaints. The `Timer` applies gravity
  and updates its own delay (`e.getSource()` is the timer) as the level rises.
  `paintComponent` draws the locked cells, then the falling piece; `drawPiece` is
  reused for the "next" preview at a smaller tile size. The panel only reads the
  model.

### Extensions

- Add a pause key (P): a `paused` flag in the model that `tick()` and the moves check.
- Draw a "ghost" piece: drop a copy of `current` with `moved(1, 0)` until it no longer
  fits and draw its outline, so the player sees where the piece will land.
- Add a "hold" slot (press C to swap the current piece with a stored one, once per
  piece).
- Use a "bag" randomiser: shuffle all seven shapes, deal them in order, then reshuffle.
  This avoids long droughts of the `I` piece.
- Save the top five scores with names in a file (Chapter 12: Object-Oriented I/O).
- Write a console test `main` that drives `BlockDropGame` with a fixed seed and prints
  the board, to test line clearing without opening a window.
