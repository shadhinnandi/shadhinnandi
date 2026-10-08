# Lab L1: GUI Programming with Swing

Until now every program you wrote talked to the user through the console: it printed
text and read typed input with `Scanner`. Real desktop applications show windows,
buttons and text boxes instead. In this lab you build such programs with **Swing**,
the GUI toolkit that ships with every JDK.

Swing is also excellent OOP practice. Every window, button and text box is an object.
You create them with `new`, configure them by calling methods, and connect them with
listener objects. You will also practise one important design habit: keep the logic
(conversion, grading, account rules) in plain classes and keep the GUI class thin.

**In this lab you will learn:**

- what a graphical user interface (GUI) is and how event-driven programs differ from
  console programs
- the Swing component tree: `JFrame`, content pane, `JPanel` and components
- the common components: `JLabel`, `JButton`, `JTextField`, `JTextArea`,
  `JPasswordField`, `JComboBox`, `JList`, `JScrollPane` and `JOptionPane` dialogs
- the layout managers `FlowLayout`, `BorderLayout` and `GridLayout`, and nesting panels
- events: `ActionListener`, `ActionEvent`, `getSource()` and `getActionCommand()`
- the Event Dispatch Thread and `SwingUtilities.invokeLater`
- how to compile and run a Swing program

## From Console Programs to GUIs

### What is a GUI?

A **graphical user interface (GUI)** lets the user work with a program through
windows, buttons, menus and text boxes, using the mouse and keyboard. Each visible
piece (a button, a label, a text box) is called a **component** or *widget*.

### Event-driven programming

Your console programs ran **top to bottom**. The program decided the order: "ask for a
number, then ask for another number, then print the sum". The user could only answer
the question the program was asking right now.

A GUI program works the other way round. It builds the window, shows it, and then
**waits**. The user decides what happens next: they may type in any box or click any
button in any order. Each such action is an **event**. Your code reacts to events.
This style is called **event-driven programming**.

```text
 Console program                 GUI program (event-driven)
 ---------------                 --------------------------
 read a                          build the window, show it
   |                                 |
   v                                 v
 read b                     +--> wait for an event <-----+
   |                        |        |                    |
   v                        |        v                    |
 print a + b                |   which event happened?     |
   |                        |    click "Add" --> add()  --+
   v                        |    click "Clear" -> clear()-+
 end                        +--- window closed --> end
```

| Console program | GUI program |
|---|---|
| The program controls the order of steps | The user controls the order |
| `Scanner` reads input when the code asks | Components hold input until an event |
| Output with `System.out.println` | Output by changing components (`setText`) |
| `main` runs to the end, then the program stops | `main` builds the window and returns; the window keeps running |

### Where is the loop?

You never write the "wait for an event" loop yourself. Swing runs it for you on a
special thread, the **Event Dispatch Thread** (more on it below). Your job is to:

1. create the components,
2. arrange them with layout managers,
3. register **listener** objects that say "call this method when that event happens".

## The Swing Component Tree

A Swing window is a tree of objects. Containers hold components, and a container can
hold other containers.

```text
 JFrame  (the window: title bar, border, close button)
   |
   +-- content pane  (the area inside the border)
         |
         +-- JPanel  (an invisible box that groups components)
         |     +-- JLabel      "Name:"
         |     +-- JTextField  [          ]
         |
         +-- JPanel
               +-- JButton  [ OK ]
               +-- JButton  [ Cancel ]
```

- **`JFrame`** is a *top-level window*. It has a title bar and can be moved, resized
  and closed.
- The **content pane** is the area inside the frame. When you call `frame.add(c)`,
  the frame passes `c` to its content pane for you.
- **`JPanel`** is a plain container. You use panels to group components and give each
  group its own layout.
- **Components** such as `JLabel` and `JButton` are the leaves of the tree.

Most Swing class names start with `J` (`JFrame`, `JButton`). The older AWT toolkit
used `Frame` and `Button` without the `J`; do not mix the two in one window.

> **A note on files:** in a real project each public class lives in its own file;
> here we keep each program in one file so you can compile it with one command.

## Your First Window, Step by Step

```java
JFrame frame = new JFrame("My First Window");        // 1. create the window
frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // 2. close = end program
frame.add(new JLabel("Hello from Swing!"));           // 3. add a component
frame.setSize(300, 120);                              // 4. width x height in pixels
frame.setLocationRelativeTo(null);                    // 5. centre on the screen
frame.setVisible(true);                               // 6. show it (always last)
```

- `setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE)` ends the program when the user
  closes the window. Without it, the window disappears but the program keeps running.
- `setSize(w, h)` gives a fixed size. The alternative `pack()` asks the layout manager
  to choose a size that just fits the components.
- `setVisible(true)` should come last, after all components are added.

### Two ways to organise the GUI class

Many tutorials write `class MyWindow extends JFrame`. That works, but it makes your
class *be* a window with hundreds of inherited methods. In this lab the main class
**has a** `JFrame` (composition, Chapter 09): the frame is a field or a local
variable, and the class only adds the behaviour it needs.

## Common Components

| Component | What it is | Useful methods |
|---|---|---|
| `JLabel` | Text the user cannot edit | `setText`, `getText` |
| `JButton` | A clickable button | `addActionListener`, `setEnabled` |
| `JTextField` | One line of editable text | `getText`, `setText`, `requestFocus` |
| `JPasswordField` | A text field that hides what is typed | `getPassword` (a `char[]`) |
| `JTextArea` | Many lines of editable text | `getText`, `setText`, `append` |
| `JScrollPane` | Adds scroll bars around another component | `new JScrollPane(area)` |
| `JComboBox<E>` | A drop-down list to choose one item | `getSelectedItem`, `getSelectedIndex` |
| `JList<E>` | A visible list of items | `getSelectedIndex`, `getSelectedValue` |
| `DefaultListModel<E>` | The data behind a `JList` | `addElement`, `remove`, `get`, `set` |
| `JOptionPane` | Ready-made pop-up dialogs | `showMessageDialog`, `showConfirmDialog` |

A few fragments show how they are created:

```java
JLabel title = new JLabel("Student Portal");
JTextField nameField = new JTextField(15);      // about 15 characters wide
JPasswordField passwordField = new JPasswordField(15);
JTextArea notes = new JTextArea(10, 40);        // 10 rows, 40 columns
JScrollPane scroller = new JScrollPane(notes);  // add scroller, not notes

String[] shifts = {"Morning", "Day", "Evening"};
JComboBox<String> shiftBox = new JComboBox<>(shifts);
String shift = (String) shiftBox.getSelectedItem();

DefaultListModel<String> model = new DefaultListModel<>();
JList<String> courseList = new JList<>(model);
model.addElement("CSE 1115 Object Oriented Programming");
```

`JComboBox<String>`, `JList<String>` and `DefaultListModel<String>` use generics, the
same `<...>` you met with `ArrayList<String>`; Chapter 13 explains them.

### JList and its model

A `JList` does not store the items itself. It *shows* the items of a **model**
object, usually a `DefaultListModel`. You change the model, and the list redraws
itself automatically. This split between data (model) and display (view) appears
everywhere in GUI programming.

```text
  your code --addElement()--> DefaultListModel --notifies--> JList (on screen)
```

### Dialogs with JOptionPane

`JOptionPane` shows small pop-up windows with one method call. They are *modal*: the
user must close the dialog before using the main window again.

```java
JOptionPane.showMessageDialog(frame, "Saved successfully.");
JOptionPane.showMessageDialog(frame, "Marks must be 0 to 100.",
        "Invalid input", JOptionPane.ERROR_MESSAGE);
int answer = JOptionPane.showConfirmDialog(frame, "Delete all tasks?");
if (answer == JOptionPane.YES_OPTION) {
    model.clear();
}
```

The first argument is the parent window, so the dialog appears centred over it.

## Layout Managers

A **layout manager** is an object that decides the position and size of every
component in a container. You do not give pixel positions; you choose a layout and
the manager recalculates everything when the window is resized.

### FlowLayout

Places components left to right in a row, like words in a sentence. When the row is
full, it wraps to the next row. It is the default layout of `JPanel`.

```text
+---------------------------------------------+
|   [ Open ]  [ Save ]  [ Print ]  [ Close ]  |
+---------------------------------------------+
```

```java
JPanel buttons = new JPanel(new FlowLayout());
buttons.add(new JButton("Open"));
buttons.add(new JButton("Save"));
```

### BorderLayout

Divides the container into five regions. The centre gets all the remaining space. It
is the default layout of a `JFrame`'s content pane.

```text
+-------------------------------------+
|               NORTH                 |
+--------+-------------------+--------+
|        |                   |        |
|  WEST  |      CENTER       |  EAST  |
|        |                   |        |
+--------+-------------------+--------+
|               SOUTH                 |
+-------------------------------------+
```

```java
frame.add(titleLabel, BorderLayout.NORTH);
frame.add(new JScrollPane(textArea), BorderLayout.CENTER);
frame.add(buttonPanel, BorderLayout.SOUTH);
```

Each region holds **one** component. If you add two components to the same region,
the second replaces the first. To put several components in a region, put them in a
`JPanel` first.

### GridLayout

Arranges components in a grid of equal-sized cells, filled row by row. It is ideal
for forms ("label, field" pairs) and keypads.

```text
 new GridLayout(3, 2)          new GridLayout(2, 3, 5, 5)
+-----------+-----------+      +-------+-------+-------+
| Name:     | [       ] |      |  [1]  |  [2]  |  [3]  |
+-----------+-----------+      +-------+-------+-------+
| ID:       | [       ] |      |  [4]  |  [5]  |  [6]  |
+-----------+-----------+      +-------+-------+-------+
| Program:  | [       ] |       (5, 5 = gaps between cells)
+-----------+-----------+
```

### Nesting panels

Real windows combine layouts. Each `JPanel` has its own layout manager, and panels go
inside other containers. Here a `BorderLayout` frame holds a `GridLayout` form in the
centre and a `FlowLayout` button row in the south.

```text
+------------------------------------------+
| frame content pane: BorderLayout         |
| +--------------------------------------+ |
| | CENTER: JPanel with GridLayout(2, 2) | |
| |   Name:   [               ]          | |
| |   Email:  [               ]          | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | SOUTH: JPanel with FlowLayout        | |
| |        [ Submit ]  [ Reset ]         | |
| +--------------------------------------+ |
+------------------------------------------+
```

`BoxLayout` and `GridBagLayout` give finer control, but the three layouts above are
enough for every example in this lab.

## Events and Listeners

### The idea

When the user clicks a button, Swing creates an **event object** describing what
happened and calls a method on every **listener** registered with that button. A
listener is an object of a class that implements a listener interface.

```text
 user clicks [Add]
        |
        v
 JButton "Add" --creates--> ActionEvent
        |
        v  calls actionPerformed(event) on each registered listener
 your AddListener object --> reads fields, updates labels
```

### ActionListener and ActionEvent

`ActionListener` is an interface (Chapter 10) from `java.awt.event` with one method:

```java
public interface ActionListener {
    void actionPerformed(ActionEvent e);
}
```

An **action event** happens when a button is clicked, when the user presses Enter in
a `JTextField`, or when an item is chosen in a `JComboBox`. The `ActionEvent` object
tells you about it:

| Method | Returns |
|---|---|
| `e.getSource()` | The component that fired the event (an `Object` reference) |
| `e.getActionCommand()` | A `String`; for a button, its text by default |

Use `getSource()` when one listener serves several components:

```java
if (e.getSource() == saveButton) {   // == compares references: same object?
    save();
} else if (e.getSource() == openButton) {
    open();
}
```

Here `==` is correct: you want to know whether the source *is the same object* as
`saveButton`, not whether two buttons look equal.

### Three ways to write a listener

**1. A named inner class.** An inner class is declared inside another class. Its
objects can use the outer object's fields directly, which is exactly what a listener
needs (it must read text fields and update labels).

```java
private class ClearListener implements ActionListener {
    @Override
    public void actionPerformed(ActionEvent e) {
        nameField.setText("");      // a field of the outer class
    }
}

clearButton.addActionListener(new ClearListener());
```

**2. An anonymous class.** When a listener is used once, you can declare the class
and create its only object in one expression. The class has no name.

```java
clearButton.addActionListener(new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        nameField.setText("");
    }
});
```

**3. A lambda (preview).** `ActionListener` has exactly one abstract method, so Java
also accepts a short *lambda expression* in its place:

```java
clearButton.addActionListener(e -> nameField.setText(""));
```

Lambdas are explained properly in Chapter 13. This lab uses named inner classes and
anonymous classes so that you always see which interface and method are involved.

### Keep logic out of the listener

A listener should be short: read input, call a method on a logic object, show the
result. The real work goes in a plain class that knows nothing about Swing.

```text
 +------------------+   calls    +----------------------+
 | GUI class        | ---------> | Logic class          |
 | (fields, layout, |            | (TemperatureConverter|
 |  listeners)      | <--------- |  Account, Quiz ...)  |
 +------------------+  results   +----------------------+
```

Benefits: the logic can be tested from a console program, reused in another GUI, and
read without scrolling past layout code.

### Handling bad input

`Integer.parseInt` and `Double.parseDouble` throw `NumberFormatException` when the
text is not a number (Chapter 11). A GUI must never crash because of a typo, so every
example catches it and explains the problem in a dialog:

```java
try {
    double celsius = Double.parseDouble(inputField.getText().trim());
    resultLabel.setText(String.format("%.2f F", celsius * 9 / 5 + 32));
} catch (NumberFormatException ex) {
    JOptionPane.showMessageDialog(frame, "Please type a number, e.g. 36.5",
            "Invalid input", JOptionPane.ERROR_MESSAGE);
}
```

## The Event Dispatch Thread

Swing uses one special thread, the **Event Dispatch Thread (EDT)**, to draw
components and to call your listeners. Swing components are **not thread-safe**: they
must be created and changed only on the EDT.

The `main` method runs on a different thread (the "main" thread). So `main` should not
build the window directly. Instead it hands the job to the EDT:

```java
// the body of main in every example of this lab
SwingUtilities.invokeLater(new Runnable() {
    @Override
    public void run() {
        new HelloGui().createAndShow();   // runs on the EDT
    }
});
```

`invokeLater` puts the `Runnable` object in the EDT's queue and returns at once.
`main` then ends, but the program keeps running because the window is open.

Two rules follow:

- Listeners already run on the EDT, so they may update components directly.
- A listener must finish quickly. While it runs, the EDT cannot repaint the window,
  and the window looks frozen. Long tasks (big downloads, long loops) belong on
  another thread (Chapter 14; Swing offers `SwingWorker` for this).

## Compiling and Running

A Swing program is compiled and run exactly like a console program:

```text
javac HelloGui.java
java HelloGui
```

Since Java 11 you can also run a single-file program directly with
`java HelloGui.java`.

A GUI needs a **desktop session** (Windows, macOS, or Linux with a graphical
desktop). On a remote server over SSH or inside a CI build there is no screen, and
creating a `JFrame` throws `java.awt.HeadlessException`. The examples in this lab are
compiled automatically when this course is checked, but they are not run, so they have
no Output blocks. Run them on your own computer to see the windows.

### Common mistakes

- Forgetting `setVisible(true)`, or calling it before adding components.
- Forgetting `setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE)`: the program keeps
  running after the window is closed.
- Adding two components to the same `BorderLayout` region (only the last one shows).
- Adding a `JTextArea` instead of the `JScrollPane` that wraps it (no scroll bars).
- Comparing text with `==` instead of `equals` (`getText()` returns a `String`).
- Doing slow work inside `actionPerformed`, which freezes the window.

## GUI Example 1: Hello GUI

**What it does:** shows a window with a label and a button. Each click on the button
changes the label and counts the clicks.

```text
+--------------------------------------------------+
| Hello GUI                                 _ [] X |
+--------------------------------------------------+
|  Hello, Swing! (clicks: 3)      [ Say Hello ]    |
+--------------------------------------------------+
```

- **Components:** `JFrame`, `JPanel`, `JLabel`, `JButton`
- **Layout:** `FlowLayout` in the panel
- **Events:** an `ActionListener` written as a named inner class, `HelloListener`

```java
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class HelloGui {
    private JLabel messageLabel;
    private int clicks;

    private void createAndShow() {
        JFrame frame = new JFrame("Hello GUI");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel panel = new JPanel(new FlowLayout());
        messageLabel = new JLabel("Press the button.");
        JButton helloButton = new JButton("Say Hello");
        helloButton.addActionListener(new HelloListener());

        panel.add(messageLabel);
        panel.add(helloButton);

        frame.add(panel);
        frame.setSize(360, 100);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    // A named inner class: its methods can use the fields of HelloGui.
    private class HelloListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            clicks++;
            messageLabel.setText("Hello, Swing! (clicks: " + clicks + ")");
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new HelloGui().createAndShow();
            }
        });
    }
}
```

### How it works

- `main` does not build the window itself. It passes an anonymous `Runnable` to
  `SwingUtilities.invokeLater`, so `createAndShow()` runs on the Event Dispatch Thread.
- `createAndShow()` builds the component tree: frame → content pane → panel → label
  and button. `frame.add(panel)` puts the panel in the content pane.
- `helloButton.addActionListener(new HelloListener())` registers a listener object.
  Nothing happens yet; the code only says "call this object when the button is
  clicked".
- On each click Swing calls `actionPerformed`. The inner class can change `clicks`
  and `messageLabel` because an inner-class object is linked to the `HelloGui` object
  that created it.
- `messageLabel` and `clicks` are fields, not local variables, because the listener
  needs them long after `createAndShow()` has returned.

### Try this

1. Add a second button "Reset" that sets the counter back to 0.
2. Replace `setSize(360, 100)` with `frame.pack()` and compare the window size.
3. Add a `JTextField` for a name and greet the user by name ("Hello, Nusrat!").

## GUI Example 2: Simple Calculator

**What it does:** the user types two numbers and clicks `+`, `-`, `*` or `/`. The
result appears at the bottom. Bad numbers and division by zero produce error dialogs.

```text
+-----------------------------------------+
| Simple Calculator                _ [] X |
+-----------------------------------------+
|  First number:    [ 12.5            ]   |
|  Second number:   [ 4               ]   |
|                                         |
|        [ + ]  [ - ]  [ * ]  [ / ]       |
|                                         |
|  Result: 12.50 * 4.00 = 50.00           |
+-----------------------------------------+
```

- **Components:** `JFrame`, `JPanel`, `JLabel`, two `JTextField`s, four `JButton`s,
  `JOptionPane`
- **Layout:** `BorderLayout` (frame), `GridLayout(2, 2)` (form), `FlowLayout`
  (buttons)
- **Events:** **one** listener object shared by four buttons; it reads the operator
  with `getActionCommand()`

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

// The logic: no Swing code here.
class Calculator {
    double calculate(double a, double b, String operator) {
        switch (operator) {
            case "+":
                return a + b;
            case "-":
                return a - b;
            case "*":
                return a * b;
            case "/":
                if (b == 0) {
                    throw new ArithmeticException("Cannot divide by zero.");
                }
                return a / b;
            default:
                throw new IllegalArgumentException("Unknown operator: " + operator);
        }
    }
}

public class SimpleCalculator {
    private final Calculator calculator = new Calculator();
    private JFrame frame;
    private JTextField firstField;
    private JTextField secondField;
    private JLabel resultLabel;

    private void createAndShow() {
        frame = new JFrame("Simple Calculator");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel formPanel = new JPanel(new GridLayout(2, 2, 5, 5));
        firstField = new JTextField(10);
        secondField = new JTextField(10);
        formPanel.add(new JLabel("First number:"));
        formPanel.add(firstField);
        formPanel.add(new JLabel("Second number:"));
        formPanel.add(secondField);

        JPanel buttonPanel = new JPanel(new FlowLayout());
        OperatorListener listener = new OperatorListener();
        String[] operators = {"+", "-", "*", "/"};
        for (String operator : operators) {
            JButton button = new JButton(operator);
            button.addActionListener(listener);
            buttonPanel.add(button);
        }

        resultLabel = new JLabel("Result: ");

        frame.add(formPanel, BorderLayout.NORTH);
        frame.add(buttonPanel, BorderLayout.CENTER);
        frame.add(resultLabel, BorderLayout.SOUTH);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private class OperatorListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            String operator = e.getActionCommand();   // the button's text
            try {
                double a = Double.parseDouble(firstField.getText().trim());
                double b = Double.parseDouble(secondField.getText().trim());
                double result = calculator.calculate(a, b, operator);
                resultLabel.setText(String.format("Result: %.2f %s %.2f = %.2f",
                        a, operator, b, result));
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(frame, "Please type two valid numbers.",
                        "Invalid input", JOptionPane.ERROR_MESSAGE);
            } catch (ArithmeticException ex) {
                JOptionPane.showMessageDialog(frame, ex.getMessage(),
                        "Math error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new SimpleCalculator().createAndShow();
            }
        });
    }
}
```

### How it works

- `Calculator` holds the arithmetic and knows nothing about windows. Division by zero
  is reported by throwing an `ArithmeticException` with a clear message. (For
  `double`, Java would otherwise quietly produce `Infinity`.)
- The four buttons are created in a loop and share **one** `OperatorListener`
  object. `e.getActionCommand()` returns the clicked button's text, so the listener
  knows which operator to use without four separate classes.
- The listener follows the pattern from the lesson: read text, parse, call the logic
  object, show the result.
- `Double.parseDouble` throws `NumberFormatException` for text such as `"12a"` or an
  empty field; the `catch` block shows a dialog instead of crashing.
- `frame.pack()` sizes the window to fit the components.

### Try this

1. Add a `%` (remainder) button. Only `Calculator` and the `operators` array change.
2. Add a "Clear" button that empties both fields and resets the result label.
3. Make pressing Enter in the second field perform addition (a `JTextField` fires an
   action event on Enter).

## GUI Example 3: Temperature Converter

**What it does:** converts a temperature between Celsius and Fahrenheit in either
direction. Values below absolute zero are rejected.

```text
+-------------------------------------------+
| Temperature Converter              _ [] X |
+-------------------------------------------+
|        Temperature: [ 36.6     ]          |
|                                           |
|          [ C -> F ]   [ F -> C ]          |
|                                           |
|           36.60 C = 97.88 F               |
+-------------------------------------------+
```

- **Components:** `JTextField`, two `JButton`s, `JLabel`, `JOptionPane`
- **Layout:** `BorderLayout` (frame) with two `FlowLayout` panels
- **Events:** two **anonymous** `ActionListener` classes, both calling one helper
  method

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingConstants;
import javax.swing.SwingUtilities;

// The logic: two pure conversion methods with validation.
class TemperatureConverter {
    static final double ABSOLUTE_ZERO_C = -273.15;
    static final double ABSOLUTE_ZERO_F = -459.67;

    static double celsiusToFahrenheit(double celsius) {
        if (celsius < ABSOLUTE_ZERO_C) {
            throw new IllegalArgumentException("Below absolute zero (-273.15 C).");
        }
        return celsius * 9 / 5 + 32;
    }

    static double fahrenheitToCelsius(double fahrenheit) {
        if (fahrenheit < ABSOLUTE_ZERO_F) {
            throw new IllegalArgumentException("Below absolute zero (-459.67 F).");
        }
        return (fahrenheit - 32) * 5 / 9;
    }
}

public class TemperatureApp {
    private JFrame frame;
    private JTextField inputField;
    private JLabel resultLabel;

    private void createAndShow() {
        frame = new JFrame("Temperature Converter");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel inputPanel = new JPanel(new FlowLayout());
        inputField = new JTextField(8);
        inputPanel.add(new JLabel("Temperature:"));
        inputPanel.add(inputField);

        JButton toFahrenheit = new JButton("C -> F");
        JButton toCelsius = new JButton("F -> C");
        JPanel buttonPanel = new JPanel(new FlowLayout());
        buttonPanel.add(toFahrenheit);
        buttonPanel.add(toCelsius);

        resultLabel = new JLabel("Type a value and pick a direction.",
                SwingConstants.CENTER);

        toFahrenheit.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                convert(true);
            }
        });
        toCelsius.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                convert(false);
            }
        });

        frame.add(inputPanel, BorderLayout.NORTH);
        frame.add(buttonPanel, BorderLayout.CENTER);
        frame.add(resultLabel, BorderLayout.SOUTH);
        frame.setSize(340, 150);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void convert(boolean fromCelsius) {
        try {
            double value = Double.parseDouble(inputField.getText().trim());
            if (fromCelsius) {
                double f = TemperatureConverter.celsiusToFahrenheit(value);
                resultLabel.setText(String.format("%.2f C = %.2f F", value, f));
            } else {
                double c = TemperatureConverter.fahrenheitToCelsius(value);
                resultLabel.setText(String.format("%.2f F = %.2f C", value, c));
            }
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(frame, "\"" + inputField.getText()
                    + "\" is not a number.", "Invalid input", JOptionPane.ERROR_MESSAGE);
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(frame, ex.getMessage(),
                    "Impossible temperature", JOptionPane.WARNING_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new TemperatureApp().createAndShow();
            }
        });
    }
}
```

### How it works

- `TemperatureConverter` has two `static` methods (Chapter 07): they need no object
  state, only their parameter. They also guard the physical rule "nothing is colder
  than absolute zero".
- Each button gets its own anonymous listener. Both listeners are one line long and
  call the shared helper `convert(...)`, so the parsing and error handling exist only
  once.
- The order of the `catch` blocks matters. `NumberFormatException` is a *subclass* of
  `IllegalArgumentException`, so it must be caught first; otherwise the general block
  would catch typos too and show the wrong message.
- `SwingConstants.CENTER` centres the label's text inside its region.

### Try this

1. Add Kelvin: a third button `C -> K` and a method `celsiusToKelvin` in the
   converter class.
2. Replace the two buttons with a `JComboBox<String>` holding the two directions and
   a single Convert button.
3. Show the result in blue when it is below 0 C and in red when above 40 C
   (`resultLabel.setForeground(java.awt.Color.RED)`).

## GUI Example 4: Student Grade Calculator

**What it does:** the user enters a student's name and marks for Class Tests (out of
20), Mid (out of 30) and Final (out of 50). The program shows the total, letter grade
and grade point using a hypothetical grading scale.

```text
+---------------------------------------------+
| Student Grade Calculator             _ [] X |
+---------------------------------------------+
|  Student name:        [ Ayesha           ]  |
|  Class tests (20):    [ 17               ]  |
|  Mid (30):            [ 24               ]  |
|  Final (50):          [ 41               ]  |
|                                             |
|          [ Calculate ]   [ Clear ]          |
|  Ayesha: total 82/100, grade A (4.00)       |
+---------------------------------------------+
```

- **Components:** four `JTextField`s with `JLabel`s, two `JButton`s, a result
  `JLabel`, `JOptionPane`
- **Layout:** `GridLayout(4, 2)` form in the centre, a `GridLayout(2, 1)` panel in
  the south holding a `FlowLayout` button row and the result label
- **Events:** anonymous listeners for Calculate and Clear

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

// Hypothetical grading rules, kept away from the GUI.
class GradeCalculator {
    static final int CT_MAX = 20;
    static final int MID_MAX = 30;
    static final int FINAL_MAX = 50;

    static int total(int ct, int mid, int fin) {
        checkRange("Class test", ct, CT_MAX);
        checkRange("Mid", mid, MID_MAX);
        checkRange("Final", fin, FINAL_MAX);
        return ct + mid + fin;
    }

    private static void checkRange(String part, int marks, int max) {
        if (marks < 0 || marks > max) {
            throw new IllegalArgumentException(part + " marks must be 0 to " + max + ".");
        }
    }

    static String letter(int total) {
        if (total >= 80) {
            return "A";
        } else if (total >= 70) {
            return "B";
        } else if (total >= 60) {
            return "C";
        } else if (total >= 50) {
            return "D";
        }
        return "F";
    }

    static double gradePoint(int total) {
        if (total >= 80) {
            return 4.0;
        } else if (total >= 70) {
            return 3.0;
        } else if (total >= 60) {
            return 2.0;
        } else if (total >= 50) {
            return 1.0;
        }
        return 0.0;
    }
}

public class GradeCalculatorApp {
    private JFrame frame;
    private final JTextField nameField = new JTextField(12);
    private final JTextField ctField = new JTextField(5);
    private final JTextField midField = new JTextField(5);
    private final JTextField finalField = new JTextField(5);
    private final JLabel resultLabel = new JLabel("Enter marks and press Calculate.");

    private void createAndShow() {
        frame = new JFrame("Student Grade Calculator");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel form = new JPanel(new GridLayout(4, 2, 5, 5));
        form.add(new JLabel("Student name:"));
        form.add(nameField);
        form.add(new JLabel("Class tests (20):"));
        form.add(ctField);
        form.add(new JLabel("Mid (30):"));
        form.add(midField);
        form.add(new JLabel("Final (50):"));
        form.add(finalField);

        JButton calculateButton = new JButton("Calculate");
        JButton clearButton = new JButton("Clear");
        JPanel buttons = new JPanel(new FlowLayout());
        buttons.add(calculateButton);
        buttons.add(clearButton);
        JPanel bottom = new JPanel(new GridLayout(2, 1));
        bottom.add(buttons);
        bottom.add(resultLabel);

        calculateButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                calculate();
            }
        });
        clearButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                JTextField[] fields = {nameField, ctField, midField, finalField};
                for (JTextField field : fields) {
                    field.setText("");
                }
                resultLabel.setText("Enter marks and press Calculate.");
                nameField.requestFocus();
            }
        });

        frame.add(form, BorderLayout.CENTER);
        frame.add(bottom, BorderLayout.SOUTH);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void calculate() {
        String name = nameField.getText().trim();
        if (name.isEmpty()) {
            JOptionPane.showMessageDialog(frame, "Please enter the student's name.");
            return;
        }
        try {
            int ct = Integer.parseInt(ctField.getText().trim());
            int mid = Integer.parseInt(midField.getText().trim());
            int fin = Integer.parseInt(finalField.getText().trim());
            int total = GradeCalculator.total(ct, mid, fin);
            String letter = GradeCalculator.letter(total);
            double point = GradeCalculator.gradePoint(total);
            resultLabel.setText(String.format("%s: total %d/100, grade %s (%.2f)",
                    name, total, letter, point));
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(frame, "Marks must be whole numbers.",
                    "Invalid input", JOptionPane.ERROR_MESSAGE);
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(frame, ex.getMessage(),
                    "Out of range", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new GradeCalculatorApp().createAndShow();
            }
        });
    }
}
```

### How it works

- `GradeCalculator` owns every rule: the maximum marks per part, the range check and
  the (hypothetical) grade scale. If the department changes the scale, only this class
  changes.
- The text fields are `final` fields created where they are declared. The field
  initializers run inside the constructor call `new GradeCalculatorApp()`, which
  happens inside `invokeLater`, so they are still created on the EDT.
- The south region needs two things (buttons and result), but a `BorderLayout`
  region holds one component. A small `GridLayout(2, 1)` panel solves this.
- The Clear listener uses an array of fields and a loop instead of four almost equal
  lines. `requestFocus()` puts the cursor back in the name field.
- Empty name, non-numeric marks and out-of-range marks each get their own message.

### Try this

1. Use the finer scale A, A-, B+, B, ... by changing only `GradeCalculator`.
2. Add a "Pass/Fail" line: a student fails if the Final mark is below 20 even when
   the total is high.
3. Keep a `JTextArea` log of every calculated student, one line each.

## GUI Example 5: Login Form

**What it does:** a username and password form. Correct demo credentials show a
welcome dialog; after three failed attempts the Login button is disabled.

> **Demo only.** This example keeps one demo username and password inside the program
> so that you can try it. Never do this in real software: anyone can read the values
> from the source or the `.class` file. Real systems keep only **salted password
> hashes** (computed with a slow algorithm such as bcrypt or Argon2) on a **server**,
> and the client sends the typed password over a secure connection to be checked
> there.

```text
+-------------------------------------------+
| Login                              _ [] X |
+-------------------------------------------+
|  Demo user: student / java17              |
|  Username:   [ student            ]       |
|  Password:   [ ******             ]       |
|                                           |
|           [ Login ]   [ Clear ]           |
+-------------------------------------------+
```

- **Components:** `JTextField`, `JPasswordField`, two `JButton`s, `JLabel`s,
  `JOptionPane`
- **Layout:** `BorderLayout` (frame), `GridLayout(2, 2)` (form), `FlowLayout`
  (buttons)
- **Events:** one named inner class `ButtonHandler` that uses `getSource()` to tell
  the two buttons apart

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Arrays;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

// DEMO ONLY: real systems check salted password hashes on a server.
class LoginService {
    static final int MAX_ATTEMPTS = 3;
    private static final String DEMO_USER = "student";
    private static final char[] DEMO_PASSWORD = {'j', 'a', 'v', 'a', '1', '7'};
    private int failedAttempts;

    boolean isLocked() {
        return failedAttempts >= MAX_ATTEMPTS;
    }

    int attemptsLeft() {
        return MAX_ATTEMPTS - failedAttempts;
    }

    boolean login(String user, char[] password) {
        if (isLocked()) {
            return false;
        }
        boolean ok = DEMO_USER.equals(user) && Arrays.equals(DEMO_PASSWORD, password);
        if (ok) {
            failedAttempts = 0;
        } else {
            failedAttempts++;
        }
        return ok;
    }
}

public class LoginForm {
    private final LoginService service = new LoginService();
    private JFrame frame;
    private JTextField userField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JButton clearButton;
    private JLabel statusLabel;

    private void createAndShow() {
        frame = new JFrame("Login");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        statusLabel = new JLabel("Demo user: student / java17");
        userField = new JTextField(14);
        passwordField = new JPasswordField(14);
        JPanel form = new JPanel(new GridLayout(2, 2, 5, 5));
        form.add(new JLabel("Username:"));
        form.add(userField);
        form.add(new JLabel("Password:"));
        form.add(passwordField);

        loginButton = new JButton("Login");
        clearButton = new JButton("Clear");
        ButtonHandler handler = new ButtonHandler();
        loginButton.addActionListener(handler);
        clearButton.addActionListener(handler);
        passwordField.addActionListener(handler);   // Enter in the password box
        JPanel buttons = new JPanel(new FlowLayout());
        buttons.add(loginButton);
        buttons.add(clearButton);

        frame.add(statusLabel, BorderLayout.NORTH);
        frame.add(form, BorderLayout.CENTER);
        frame.add(buttons, BorderLayout.SOUTH);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private class ButtonHandler implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            if (e.getSource() == clearButton) {
                userField.setText("");
                passwordField.setText("");
                return;
            }
            char[] password = passwordField.getPassword();
            boolean ok = service.login(userField.getText().trim(), password);
            Arrays.fill(password, ' ');            // wipe the copy we were given
            passwordField.setText("");
            if (ok) {
                statusLabel.setText("Logged in as " + userField.getText().trim());
                JOptionPane.showMessageDialog(frame, "Welcome!");
            } else if (service.isLocked()) {
                statusLabel.setText("Too many failed attempts. Login locked.");
                loginButton.setEnabled(false);
                passwordField.setEnabled(false);
            } else {
                statusLabel.setText("Wrong username or password. Attempts left: "
                        + service.attemptsLeft());
            }
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new LoginForm().createAndShow();
            }
        });
    }
}
```

### How it works

- `LoginService` hides the attempt counter (`private`) and exposes only what the GUI
  needs: `login`, `isLocked` and `attemptsLeft`. The GUI cannot reset the counter by
  accident.
- `JPasswordField.getPassword()` returns a `char[]`, not a `String`. A `String` is
  immutable and may stay in memory until garbage collection; an array can be wiped
  with `Arrays.fill` as soon as it has been checked.
- `Arrays.equals` compares two arrays element by element. (`==` would only compare
  the two references.)
- One `ButtonHandler` serves three sources: both buttons and the password field
  (Enter key). `getSource() == clearButton` decides which action to take.
- After three failures the login components are disabled with `setEnabled(false)`.

### Try this

1. Show the remaining attempts in red using `statusLabel.setForeground(...)`.
2. Add a "Show password" `JCheckBox` that calls `passwordField.setEchoChar((char) 0)`
   to show the text and `setEchoChar('*')` to hide it again.
3. Move the demo check behind an interface `Authenticator` with a method `boolean
   check(String user, char[] password)`, so a real server-based version could replace
   it without changing the GUI.

## GUI Example 6: Unit Converter

**What it does:** the user types a value, chooses a conversion from a drop-down list
(km to miles, kg to pounds, metres to feet and back) and presses Convert or Enter.

```text
+----------------------------------------------------------+
| Unit Converter                                    _ [] X |
+----------------------------------------------------------+
|  [ 5        ]  [ Kilometres -> Miles  v ]  [ Convert ]   |
|                                                          |
|  5.00 km = 3.11 mi                                       |
+----------------------------------------------------------+
```

- **Components:** `JTextField`, `JComboBox<Conversion>`, `JButton`, `JLabel`,
  `JOptionPane`
- **Layout:** `BorderLayout` (frame), `FlowLayout` (input row)
- **Events:** one anonymous `ActionListener` stored in a variable and registered on
  both the button and the text field

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

// One object per conversion: a name, two unit symbols and a factor.
class Conversion {
    private final String name;
    private final String fromUnit;
    private final String toUnit;
    private final double factor;

    Conversion(String name, String fromUnit, String toUnit, double factor) {
        this.name = name;
        this.fromUnit = fromUnit;
        this.toUnit = toUnit;
        this.factor = factor;
    }

    String describe(double value) {
        if (value < 0) {
            throw new IllegalArgumentException("Length and weight cannot be negative.");
        }
        double result = value * factor;
        return String.format("%.2f %s = %.2f %s", value, fromUnit, result, toUnit);
    }

    @Override
    public String toString() {
        return name;   // the combo box shows this text
    }
}

public class UnitConverterApp {
    private static final Conversion[] CONVERSIONS = {
        new Conversion("Kilometres -> Miles", "km", "mi", 0.621371),
        new Conversion("Miles -> Kilometres", "mi", "km", 1.609344),
        new Conversion("Kilograms -> Pounds", "kg", "lb", 2.204623),
        new Conversion("Pounds -> Kilograms", "lb", "kg", 0.453592),
        new Conversion("Metres -> Feet", "m", "ft", 3.280840),
        new Conversion("Feet -> Metres", "ft", "m", 0.3048)
    };

    private JFrame frame;
    private JTextField valueField;
    private JComboBox<Conversion> conversionBox;
    private JLabel resultLabel;

    private void createAndShow() {
        frame = new JFrame("Unit Converter");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        valueField = new JTextField(8);
        conversionBox = new JComboBox<>(CONVERSIONS);
        JButton convertButton = new JButton("Convert");
        JPanel inputRow = new JPanel(new FlowLayout());
        inputRow.add(valueField);
        inputRow.add(conversionBox);
        inputRow.add(convertButton);
        resultLabel = new JLabel(" Choose a conversion and press Convert.");

        ActionListener convertListener = new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                convert();
            }
        };
        convertButton.addActionListener(convertListener);
        valueField.addActionListener(convertListener);   // Enter key

        frame.add(inputRow, BorderLayout.CENTER);
        frame.add(resultLabel, BorderLayout.SOUTH);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void convert() {
        Conversion chosen = conversionBox.getItemAt(conversionBox.getSelectedIndex());
        try {
            double value = Double.parseDouble(valueField.getText().trim());
            resultLabel.setText(" " + chosen.describe(value));
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(frame, "Please type a number, e.g. 2.5",
                    "Invalid input", JOptionPane.ERROR_MESSAGE);
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(frame, ex.getMessage(),
                    "Invalid value", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new UnitConverterApp().createAndShow();
            }
        });
    }
}
```

### How it works

- Each conversion is an **object** of class `Conversion`. Adding a new conversion
  means adding one line to the `CONVERSIONS` array; no new `if` branch is needed.
  This is the "should this be a class?" question answered with yes: every conversion
  has data (units, factor) and behaviour (`describe`).
- A `JComboBox<Conversion>` can hold any objects. It displays each one using its
  `toString()` method, which is why `Conversion` overrides `toString()`.
- `getItemAt(getSelectedIndex())` returns the chosen item already typed as
  `Conversion`, so no cast is needed.
- The anonymous listener object is stored in the variable `convertListener` and
  registered twice. Clicking Convert and pressing Enter in the field run the same
  code.

### Try this

1. Add litres to gallons and centimetres to inches.
2. Convert automatically whenever the user picks a new item (add the same listener to
   `conversionBox`).
3. Add a Swap button that selects the reverse conversion and puts the last result in
   the value field.

## GUI Example 7: Simple Notepad

**What it does:** a tiny text editor. The user can type text, start a new document,
open a text file and save the text to a file chosen with a file dialog.

```text
+----------------------------------------------------+
| Simple Notepad                              _ [] X |
+----------------------------------------------------+
|  [ New ]  [ Open... ]  [ Save... ]                 |
+----------------------------------------------------+
| Shopping list for the hostel:                     ^|
| - rice                                            #|
| - lentils                                         #|
| - tea                                             v|
+----------------------------------------------------+
| Opened notes.txt                                   |
+----------------------------------------------------+
```

- **Components:** `JTextArea` inside a `JScrollPane`, three `JButton`s, a status
  `JLabel`, `JFileChooser`, `JOptionPane`
- **Layout:** `BorderLayout` (frame: toolbar NORTH, text CENTER, status SOUTH),
  `FlowLayout` (toolbar)
- **Events:** one named inner class `ToolbarListener` that checks `getSource()`
- **File I/O:** `BufferedReader`/`BufferedWriter` in try-with-resources (Chapter 12)

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.swing.JButton;
import javax.swing.JFileChooser;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.SwingUtilities;

// File logic only: reads and writes whole text files.
class TextFileStore {
    String load(File file) throws IOException {
        StringBuilder text = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(
                new FileReader(file, StandardCharsets.UTF_8))) {
            String line = reader.readLine();
            while (line != null) {
                text.append(line).append('\n');
                line = reader.readLine();
            }
        }
        return text.toString();
    }

    void save(File file, String text) throws IOException {
        try (BufferedWriter writer = new BufferedWriter(
                new FileWriter(file, StandardCharsets.UTF_8))) {
            writer.write(text);
        }
    }
}

public class SimpleNotepad {
    private final TextFileStore store = new TextFileStore();
    private final JFileChooser chooser = new JFileChooser();
    private final JTextArea textArea = new JTextArea(15, 45);
    private final JLabel statusLabel = new JLabel("New document");
    private final JButton newButton = new JButton("New");
    private final JButton openButton = new JButton("Open...");
    private final JButton saveButton = new JButton("Save...");
    private JFrame frame;

    private void createAndShow() {
        frame = new JFrame("Simple Notepad");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        JPanel toolbar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        ToolbarListener listener = new ToolbarListener();
        JButton[] buttons = {newButton, openButton, saveButton};
        for (JButton button : buttons) {
            button.addActionListener(listener);
            toolbar.add(button);
        }
        textArea.setLineWrap(true);
        textArea.setWrapStyleWord(true);

        frame.add(toolbar, BorderLayout.NORTH);
        frame.add(new JScrollPane(textArea), BorderLayout.CENTER);
        frame.add(statusLabel, BorderLayout.SOUTH);
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private class ToolbarListener implements ActionListener {
        @Override
        public void actionPerformed(ActionEvent e) {
            if (e.getSource() == newButton) {
                textArea.setText("");
                statusLabel.setText("New document");
            } else if (e.getSource() == openButton) {
                openFile();
            } else if (e.getSource() == saveButton) {
                saveFile();
            }
        }
    }

    private void openFile() {
        if (chooser.showOpenDialog(frame) != JFileChooser.APPROVE_OPTION) {
            return;   // the user pressed Cancel
        }
        File file = chooser.getSelectedFile();
        try {
            textArea.setText(store.load(file));
            textArea.setCaretPosition(0);
            statusLabel.setText("Opened " + file.getName());
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(frame, "Could not open the file:\n"
                    + ex.getMessage(), "Open failed", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void saveFile() {
        if (chooser.showSaveDialog(frame) != JFileChooser.APPROVE_OPTION) {
            return;
        }
        File file = chooser.getSelectedFile();
        try {
            store.save(file, textArea.getText());
            statusLabel.setText("Saved " + file.getName());
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(frame, "Could not save the file:\n"
                    + ex.getMessage(), "Save failed", JOptionPane.ERROR_MESSAGE);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new SimpleNotepad().createAndShow();
            }
        });
    }
}
```

### How it works

- `TextFileStore` contains the file code from Chapter 12. Its methods declare
  `throws IOException`: the store does not know how to tell the user about a problem,
  so it passes the exception to the GUI, which shows a dialog.
- Both streams are opened in **try-with-resources**, so the file is closed even when
  reading or writing fails halfway.
- `JFileChooser` shows the system's file dialog. `showOpenDialog` and
  `showSaveDialog` return `APPROVE_OPTION` only when the user picked a file; on Cancel
  the method returns early.
- The `JTextArea` is wrapped in a `JScrollPane`, and the **scroll pane** is added to
  the frame. Line wrapping breaks long lines at word boundaries.
- The buttons are fields so that `ToolbarListener` can compare `getSource()` with
  each of them.

### Try this

1. Remember the current file in a `File` field, and let Save write to it directly
   without asking again (a separate "Save As..." button still asks).
2. Before New or Open, ask with `JOptionPane.showConfirmDialog` whether to discard
   unsaved changes.
3. Show the number of words and characters in the status label after each open.

## GUI Example 8: To-Do List

**What it does:** the user adds tasks, marks a selected task as done (or not done),
removes a task, and clears all finished tasks.

```text
+---------------------------------------------------+
| To-Do List                                 _ [] X |
+---------------------------------------------------+
|  [ Submit OOP lab report        ]  [ Add ]        |
+---------------------------------------------------+
|  [x] Pay hostel fee                              ^|
|  [ ] Revise Chapter 09                           #|
|  [ ] Return library book                         v|
+---------------------------------------------------+
|  [ Done / Undo ]  [ Remove ]  [ Clear finished ]  |
+---------------------------------------------------+
```

- **Components:** `JTextField`, `JList<Task>` inside a `JScrollPane`,
  `DefaultListModel<Task>`, four `JButton`s, `JOptionPane`
- **Layout:** `BorderLayout` (frame) with `FlowLayout` panels in NORTH and SOUTH
- **Events:** anonymous listeners; the Add listener also handles Enter in the text
  field

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.DefaultListModel;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextField;
import javax.swing.ListSelectionModel;
import javax.swing.SwingUtilities;

class Task {
    private final String title;
    private boolean done;

    Task(String title) {
        this.title = title;
    }

    boolean isDone() {
        return done;
    }

    void toggleDone() {
        done = !done;
    }

    @Override
    public String toString() {
        return (done ? "[x] " : "[ ] ") + title;   // what the JList shows
    }
}

public class ToDoListApp {
    private final DefaultListModel<Task> model = new DefaultListModel<>();
    private final JList<Task> taskList = new JList<>(model);
    private final JTextField taskField = new JTextField(20);
    private JFrame frame;

    private void createAndShow() {
        frame = new JFrame("To-Do List");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        taskList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);

        JButton addButton = new JButton("Add");
        JPanel top = new JPanel(new FlowLayout());
        top.add(taskField);
        top.add(addButton);

        JButton toggleButton = new JButton("Done / Undo");
        JButton removeButton = new JButton("Remove");
        JButton clearButton = new JButton("Clear finished");
        JPanel bottom = new JPanel(new FlowLayout());
        bottom.add(toggleButton);
        bottom.add(removeButton);
        bottom.add(clearButton);

        ActionListener addListener = new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String title = taskField.getText().trim();
                if (title.isEmpty()) {
                    JOptionPane.showMessageDialog(frame, "Type a task first.");
                    return;
                }
                model.addElement(new Task(title));
                taskField.setText("");
            }
        };
        addButton.addActionListener(addListener);
        taskField.addActionListener(addListener);

        toggleButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int index = selectedIndexOrWarn();
                if (index >= 0) {
                    Task task = model.get(index);
                    task.toggleDone();
                    model.set(index, task);   // tells the JList to redraw this row
                }
            }
        });
        removeButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int index = selectedIndexOrWarn();
                if (index >= 0) {
                    model.remove(index);
                }
            }
        });
        clearButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Go backwards so removing an item does not shift unchecked ones.
                for (int i = model.size() - 1; i >= 0; i--) {
                    if (model.get(i).isDone()) {
                        model.remove(i);
                    }
                }
            }
        });

        frame.add(top, BorderLayout.NORTH);
        frame.add(new JScrollPane(taskList), BorderLayout.CENTER);
        frame.add(bottom, BorderLayout.SOUTH);
        frame.setSize(420, 300);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private int selectedIndexOrWarn() {
        int index = taskList.getSelectedIndex();
        if (index < 0) {
            JOptionPane.showMessageDialog(frame, "Select a task in the list first.");
        }
        return index;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new ToDoListApp().createAndShow();
            }
        });
    }
}
```

### How it works

- Each task is a `Task` object with its own state (`done`). The list shows each task
  through its `toString()`, so a finished task appears as `[x] ...`.
- The `JList` displays the `DefaultListModel`. `addElement` and `remove` on the model
  update the screen automatically.
- Changing a `Task` object does not notify the model, because the model cannot see
  inside the object. `model.set(index, task)` puts the same object back and tells the
  `JList` that row `index` changed.
- `getSelectedIndex()` returns `-1` when nothing is selected. The helper
  `selectedIndexOrWarn()` handles that case once for two buttons.
- "Clear finished" loops from the end to the start. Removing item `i` shifts later
  items left; going backwards means every unchecked item is still ahead of the loop.

### Try this

1. Show "3 tasks, 1 finished" in a label below the list, updated after every change.
2. Allow editing: double-click (or an Edit button) fills the text field with the
   selected task's title so it can be changed.
3. Save the tasks to `tasks.txt` when the window closes and load them at start-up
   (combine with Example 7).

## GUI Example 9: Quiz Application

**What it does:** shows multiple-choice questions one at a time. The user picks an
answer with a radio button and clicks Next. At the end a dialog shows the score.

```text
+------------------------------------------------+
| Java Quiz - Question 2 of 3             _ [] X |
+------------------------------------------------+
|  Which method starts a Java program?           |
|                                                |
|   ( ) start                                    |
|   ( ) run                                      |
|   (*) main                                     |
|   ( ) init                                     |
|                                                |
+------------------------------------------------+
|                    Next                        |
+------------------------------------------------+
```

- **Components:** a `JLabel`, four `JRadioButton`s in a `ButtonGroup`, `JButton`,
  `JOptionPane`
- **Layout:** `BorderLayout` (frame: question NORTH, options CENTER, button SOUTH),
  `GridLayout(4, 1)` (options)
- **Events:** one anonymous listener on the Next button

```java
import java.awt.BorderLayout;
import java.awt.GridLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import javax.swing.ButtonGroup;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRadioButton;
import javax.swing.SwingUtilities;

class Question {
    private final String text;
    private final String[] options;
    private final int correctIndex;

    Question(String text, String[] options, int correctIndex) {
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
    }

    String getText() {
        return text;
    }

    String getOption(int i) {
        return options[i];
    }

    boolean isCorrect(int choice) {
        return choice == correctIndex;
    }
}

class Quiz {
    private final Question[] questions;
    private int current;
    private int score;

    Quiz(Question[] questions) {
        this.questions = questions;
    }

    Question currentQuestion() {
        return questions[current];
    }

    void answer(int choice) {
        if (questions[current].isCorrect(choice)) {
            score++;
        }
        current++;
    }

    boolean isFinished() {
        return current >= questions.length;
    }

    String progress() {
        return "Question " + (current + 1) + " of " + questions.length;
    }

    String result() {
        return "Your score: " + score + " / " + questions.length;
    }
}

public class QuizApp {
    private final Quiz quiz = new Quiz(new Question[] {
        new Question("Which keyword creates a new object?",
                new String[] {"class", "new", "this", "static"}, 1),
        new Question("Which method starts a Java program?",
                new String[] {"start", "run", "main", "init"}, 2),
        new Question("How do you compare two Strings by content?",
                new String[] {"==", "equals()", "=", "!="}, 1)
    });
    private final JRadioButton[] optionButtons = new JRadioButton[4];
    private final ButtonGroup group = new ButtonGroup();
    private final JLabel questionLabel = new JLabel();
    private final JButton nextButton = new JButton("Next");
    private JFrame frame;

    private void createAndShow() {
        frame = new JFrame();
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        JPanel optionPanel = new JPanel(new GridLayout(4, 1));
        for (int i = 0; i < optionButtons.length; i++) {
            optionButtons[i] = new JRadioButton();
            group.add(optionButtons[i]);       // only one can be selected
            optionPanel.add(optionButtons[i]);
        }
        nextButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                nextClicked();
            }
        });

        frame.add(questionLabel, BorderLayout.NORTH);
        frame.add(optionPanel, BorderLayout.CENTER);
        frame.add(nextButton, BorderLayout.SOUTH);
        showQuestion();
        frame.setSize(400, 240);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void showQuestion() {
        Question q = quiz.currentQuestion();
        frame.setTitle("Java Quiz - " + quiz.progress());
        questionLabel.setText(q.getText());
        for (int i = 0; i < optionButtons.length; i++) {
            optionButtons[i].setText(q.getOption(i));
        }
        group.clearSelection();
    }

    private void nextClicked() {
        int choice = -1;
        for (int i = 0; i < optionButtons.length; i++) {
            if (optionButtons[i].isSelected()) {
                choice = i;
            }
        }
        if (choice < 0) {
            JOptionPane.showMessageDialog(frame, "Please choose an answer.");
            return;
        }
        quiz.answer(choice);
        if (quiz.isFinished()) {
            frame.setTitle("Java Quiz - complete");
            nextButton.setEnabled(false);
            JOptionPane.showMessageDialog(frame, quiz.result());
        } else {
            showQuestion();
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new QuizApp().createAndShow();
            }
        });
    }
}
```

### How it works

- The quiz is modelled with two plain classes. A `Question` knows its text, its four
  options and which one is correct. A `Quiz` knows the order of questions, the current
  position and the score. Neither class imports anything from Swing.
- The GUI only *shows* the current question and *forwards* the user's choice to
  `quiz.answer(choice)`. Scoring rules can change without touching the window code.
- A `ButtonGroup` makes the radio buttons mutually exclusive: selecting one clears
  the others. `clearSelection()` empties the group before each new question.
- The four `JRadioButton`s are created once and reused; only their text changes.
- The progress text ("Question 2 of 3") comes from `quiz.progress()` and is shown in
  the window title with `frame.setTitle(...)`.
- When `isFinished()` becomes `true`, the Next button is disabled so
  `currentQuestion()` is never called past the end of the array.

### Try this

1. Add a Back button, or show after each answer whether it was right.
2. Shuffle the question order with `new java.util.Random(seed)` and a simple swap
   loop.
3. Load the questions from a text file (one question per line, fields separated by
   `;`) instead of writing them in the code.

## GUI Example 10: Mini Banking Interface

**What it does:** a simple window for one bank account. The user deposits and
withdraws amounts in Tk; the balance and a transaction history update after each
operation. All fees and rules here are hypothetical.

```text
+-------------------------------------------------+
| Mini Bank - Account 2026-0042 (Nusrat Jahan)  X |
+-------------------------------------------------+
|  Balance: 4500 Tk                               |
+-------------------------------------------------+
|  Opened with 5000 Tk                           ^|
|  Withdraw  -1500 Tk                            #|
|  Deposit   +1000 Tk                            v|
+-------------------------------------------------+
|  Amount: [ 500     ]  [ Deposit ]  [ Withdraw ] |
+-------------------------------------------------+
```

- **Components:** `JLabel`s, a read-only `JTextArea` in a `JScrollPane`,
  `JTextField`, two `JButton`s, `JOptionPane`
- **Layout:** `BorderLayout` (frame), `FlowLayout` (controls)
- **Events:** one anonymous listener shared by both buttons; it uses
  `getActionCommand()` and calls the encapsulated `Account`
- **Design:** `Account` is a separate, encapsulated class; the GUI never changes the
  balance directly

```java
import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTextArea;
import javax.swing.JTextField;
import javax.swing.SwingUtilities;

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) {
        super(message);
    }
}

// The model: no Swing code, all rules in one place.
class Account {
    private final String number;
    private final String owner;
    private long balance;   // whole Tk
    private final List<String> history = new ArrayList<>();

    Account(String number, String owner, long openingBalance) {
        if (openingBalance < 0) {
            throw new IllegalArgumentException("Opening balance cannot be negative.");
        }
        this.number = number;
        this.owner = owner;
        this.balance = openingBalance;
        history.add("Opened with " + openingBalance + " Tk");
    }

    void deposit(long amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        balance += amount;
        history.add("Deposit   +" + amount + " Tk");
    }

    void withdraw(long amount) throws InsufficientFundsException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive.");
        }
        if (amount > balance) {
            throw new InsufficientFundsException("Balance is only " + balance + " Tk.");
        }
        balance -= amount;
        history.add("Withdraw  -" + amount + " Tk");
    }

    long getBalance() {
        return balance;
    }

    String describe() {
        return "Account " + number + " (" + owner + ")";
    }

    List<String> getHistory() {
        return List.copyOf(history);   // a read-only copy
    }
}

public class MiniBankApp {
    private final Account account = new Account("2026-0042", "Nusrat Jahan", 5000);
    private final JLabel balanceLabel = new JLabel();
    private final JTextArea historyArea = new JTextArea(8, 30);
    private final JTextField amountField = new JTextField(8);
    private JFrame frame;

    private void createAndShow() {
        frame = new JFrame("Mini Bank - " + account.describe());
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        historyArea.setEditable(false);

        JButton depositButton = new JButton("Deposit");
        JButton withdrawButton = new JButton("Withdraw");
        JPanel controls = new JPanel(new FlowLayout());
        controls.add(new JLabel("Amount:"));
        controls.add(amountField);
        controls.add(depositButton);
        controls.add(withdrawButton);

        ActionListener listener = new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handle(e.getActionCommand().equals("Deposit"));
            }
        };
        depositButton.addActionListener(listener);
        withdrawButton.addActionListener(listener);

        frame.add(balanceLabel, BorderLayout.NORTH);
        frame.add(new JScrollPane(historyArea), BorderLayout.CENTER);
        frame.add(controls, BorderLayout.SOUTH);
        refresh();
        frame.pack();
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    private void handle(boolean isDeposit) {
        try {
            long amount = Long.parseLong(amountField.getText().trim());
            if (isDeposit) {
                account.deposit(amount);
            } else {
                account.withdraw(amount);
            }
            amountField.setText("");
            refresh();
        } catch (NumberFormatException ex) {
            showError("Please type a whole number of Tk, e.g. 500");
        } catch (IllegalArgumentException | InsufficientFundsException ex) {
            showError(ex.getMessage());
        }
    }

    private void refresh() {
        balanceLabel.setText(" Balance: " + account.getBalance() + " Tk");
        historyArea.setText("");
        for (String line : account.getHistory()) {
            historyArea.append(line + "\n");
        }
    }

    private void showError(String message) {
        JOptionPane.showMessageDialog(frame, message, "Transaction refused",
                JOptionPane.ERROR_MESSAGE);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            @Override
            public void run() {
                new MiniBankApp().createAndShow();
            }
        });
    }
}
```

### How it works

- `Account` is **encapsulated** (Chapter 05): `balance` and `history` are `private`,
  and the only way to change the balance is through `deposit` and `withdraw`, which
  check the rules first. The GUI cannot set a negative balance even by mistake.
- `getHistory()` returns `List.copyOf(history)`, a read-only copy. The GUI can read
  the history, but it cannot add fake entries to the account's own list.
- `withdraw` declares the checked exception `InsufficientFundsException` (Chapter 11).
  The compiler forces the GUI to handle it; the multi-catch
  `IllegalArgumentException | InsufficientFundsException` shows the message in a
  dialog. `NumberFormatException` is caught first because it is a subclass of
  `IllegalArgumentException` and needs its own message.
- `refresh()` copies the model's state to the screen. It is called once at start-up
  and after every successful operation, so the window always matches the account.
- Money is kept in whole Tk as a `long`, which avoids rounding problems of `double`.

### Try this

1. Add a hypothetical rule: each withdrawal costs a fee of 10 Tk, and the balance
   must stay at least 500 Tk. Only `Account` should change.
2. Add a Transfer feature with a second `Account` and a `transferTo(Account other,
   long amount)` method.
3. Show a confirmation dialog (`JOptionPane.showConfirmDialog`) before any withdrawal
   above 10000 Tk.
