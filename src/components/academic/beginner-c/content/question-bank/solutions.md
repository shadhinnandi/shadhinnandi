
# Practice Solutions

This file contains the solutions and explanations for the problems in `questions.md`.

---

## Chapter 05 & 06: Conditionals & Loops

### 🟢 Easy

**1. The Busy Waiter**
```c
#include <stdio.h>

int main() {
    float bill, tip;
    printf("Enter the bill amount: $");
    scanf("%f", &bill);

    if (bill > 100) {
        tip = bill * 0.15;
    } else if (bill >= 40 && bill <= 100) {
        tip = bill * 0.10;
    } else {
        tip = 5.0;
    }

    printf("Suggested tip: $%.2f\n", tip);
    printf("Total amount: $%.2f\n", bill + tip);
    return 0;
}
```
*   **Explanation:** The code uses an `if-else if-else` ladder to check the bill amount against the specified ranges. It starts from the most specific case (over 100) and moves down. This ensures that only one block of code is executed for any given bill amount.

**2. Grade Calculator**
```c
#include <stdio.h>

int main() {
    int score;
    char grade;
    printf("Enter student's score (0-100): ");
    scanf("%d", &score);

    if (score >= 90 && score <= 100) {
        grade = 'A';
    } else if (score >= 80 && score < 90) {
        grade = 'B';
    } else if (score >= 70 && score < 80) {
        grade = 'C';
    } else if (score >= 60 && score < 70) {
        grade = 'D';
    } else if (score >= 0 && score < 60) {
        grade = 'F';
    } else {
        printf("Invalid score entered.\n");
        return 1; // Exit with an error
    }

    printf("The student's grade is: %c\n", grade);
    return 0;
}
```
*   **Explanation:** This is a direct implementation of the grading rules. Each `else if` block checks a non-overlapping range of scores. An initial check for invalid scores (like > 100 or < 0) makes the program more robust.

**3. FizzBuzz with a Twist**
```c
#include <stdio.h>
#include <math.h>

// Helper function to check for primality
int isPrime(int n) {
    if (n <= 1) return 0;
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) return 0;
    }
    return 1;
}

int main() {
    for (int i = 1; i <= 100; i++) {
        if (i % 3 == 0 && i % 5 == 0) { // or i % 15 == 0
            printf("FizzBuzz\n");
        } else if (i % 3 == 0) {
            printf("Fizz\n");
        } else if (i % 5 == 0) {
            printf("Buzz\n");
        } else if (isPrime(i)) {
            printf("Prime\n");
        } else {
            printf("%d\n", i);
        }
    }
    return 0;
}
```
*   **Explanation:** The order of checks is important. The `FizzBuzz` condition (`i % 15 == 0`) must be checked before the individual `Fizz` and `Buzz` conditions. The `isPrime` check is added as another condition in the chain, making sure it doesn't override the Fizz/Buzz logic for numbers like 3 and 5.

**4. Sum of Digits**
```c
#include <stdio.h>

int main() {
    int number, sum = 0, digit;
    printf("Enter an integer: ");
    scanf("%d", &number);

    int originalNumber = number; // Store original for printing

    while (number != 0) {
        digit = number % 10; // Get the last digit
        sum += digit;        // Add it to the sum
        number /= 10;        // Remove the last digit
    }

    printf("The sum of the digits of %d is %d.\n", originalNumber, sum);
    return 0;
}
```
*   **Explanation:** The `while` loop systematically dismantles the number. The modulo operator (`%`) isolates the rightmost digit, and the integer division (`/`) removes it. This process repeats until the number becomes 0.

**5. Prime Number Checker**
```c
#include <stdio.h>
#include <math.h>

int isPrime(int n) {
    if (n <= 1) {
        return 0; // 1 and numbers less than 1 are not prime
    }
    // We only need to check for divisors up to the square root of n
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) {
            return 0; // Found a divisor, so not prime
        }
    }
    return 1; // No divisors found, so it's prime
}

int main() {
    int num;
    printf("Enter a number to check: ");
    scanf("%d", &num);
    if (isPrime(num)) {
        printf("%d is a prime number.\n", num);
    } else {
        printf("%d is not a prime number.\n", num);
    }
    return 0;
}
```
*   **Explanation:** The function `isPrime` implements the trial division method. It efficiently checks for primality by only testing divisors up to the square root of the number, which is a common optimization.

---

### 🟡 Medium

**1. Armstrong Number**
```c
#include <stdio.h>
#include <math.h>

int main() {
    int number, originalNumber, remainder, result = 0, n = 0;
    printf("Enter an integer: ");
    scanf("%d", &number);

    originalNumber = number;

    // Count number of digits
    while (originalNumber != 0) {
        originalNumber /= 10;
        ++n;
    }

    originalNumber = number;

    // Calculate sum of powers of digits
    while (originalNumber != 0) {
        remainder = originalNumber % 10;
        result += pow(remainder, n);
        originalNumber /= 10;
    }

    if (result == number)
        printf("%d is an Armstrong number.\n", number);
    else
        printf("%d is not an Armstrong number.\n", number);

    return 0;
}
```
*   **Explanation:** The code first runs a loop to count the number of digits (`n`). Then, it runs a second loop to extract each digit and add `pow(digit, n)` to the `result`. Finally, it compares the `result` with the original number.

**2. Perfect Number**
```c
#include <stdio.h>

int main() {
    int n, sum = 0;
    printf("Enter a number: ");
    scanf("%d", &n);

    for (int i = 1; i <= n / 2; i++) {
        if (n % i == 0) {
            sum += i;
        }
    }

    if (sum == n && n > 0) {
        printf("%d is a perfect number.\n", n);
    } else {
        printf("%d is not a perfect number.\n", n);
    }

    return 0;
}
```
*   **Explanation:** The code iterates through all possible proper divisors (from 1 to `n/2`). For each `i` that divides `n` evenly, it adds `i` to `sum`. The final comparison determines if the number is perfect.

**3. Strong Number**
```c
#include <stdio.h>

// Function to calculate factorial
int factorial(int n) {
    int fact = 1;
    for (int i = 1; i <= n; i++) {
        fact *= i;
    }
    return fact;
}

int main() {
    int number, originalNumber, remainder, sum = 0;
    printf("Enter an integer: ");
    scanf("%d", &number);

    originalNumber = number;

    while (number > 0) {
        remainder = number % 10;
        sum += factorial(remainder);
        number /= 10;
    }

    if (sum == originalNumber) {
        printf("%d is a strong number.\n", originalNumber);
    } else {
        printf("%d is not a strong number.\n", originalNumber);
    }

    return 0;
}
```
*   **Explanation:** This solution uses a helper function, `factorial()`, for clarity. The main logic in `main()` extracts each digit and passes it to `factorial()`. The sum of these factorials is then compared to the original number.

**4. Series Sum**
```c
#include <stdio.h>

int main() {
    int n, sum = 0;
    printf("Enter the number of terms (N): ");
    scanf("%d", &n);

    for (int i = 1; i <= n; i++) {
        if (i % 2 != 0) { // Odd term
            sum += i;
        } else { // Even term
            sum -= i;
        }
    }

    printf("The sum of the series is: %d\n", sum);
    return 0;
}
```
*   **Explanation:** A simple `for` loop iterates from 1 to N. The `if` condition checks if the term number `i` is odd or even and performs the addition or subtraction accordingly.

**5. Binary to Decimal**
```c
#include <stdio.h>
#include <math.h>

int main() {
    long long n;
    printf("Enter a binary number: ");
    scanf("%lld", &n);

    int decimalNumber = 0, i = 0, remainder;
    while (n != 0) {
        remainder = n % 10;
        n /= 10;
        decimalNumber += remainder * pow(2, i);
        ++i;
    }

    printf("Decimal equivalent: %d\n", decimalNumber);
    return 0;
}
```
*   **Explanation:** The code treats the binary number as an integer. It extracts the last digit (which is either 0 or 1) and multiplies it by the correct power of 2. The variable `i` acts as the exponent, starting from 0 and incrementing in each step.

---

### 🔴 Hard

**1. Decimal to Binary**
```c
#include <stdio.h>

int main() {
    int n, binary[32];
    int i = 0;
    printf("Enter a decimal number: ");
    scanf("%d", &n);

    if (n == 0) {
        printf("Binary equivalent: 0\n");
        return 0;
    }

    while (n > 0) {
        binary[i] = n % 2;
        n = n / 2;
        i++;
    }

    printf("Binary equivalent: ");
    for (int j = i - 1; j >= 0; j--) {
        printf("%d", binary[j]);
    }
    printf("\n");

    return 0;
}
```
*   **Explanation:** The program repeatedly takes the modulo 2 of the number to get the binary digit and then divides the number by 2. The digits are stored in an array. Since this process generates the binary digits in reverse order, a second loop is used to print the array from the end to the beginning.

**2. Collatz Conjecture Steps**
```c
#include <stdio.h>

int main() {
    int n, steps = 0;
    printf("Enter a positive integer: ");
    scanf("%d", &n);

    if (n <= 0) {
        printf("Please enter a positive integer.\n");
        return 1;
    }

    while (n != 1) {
        printf("%d -> ", n);
        if (n % 2 == 0) {
            n = n / 2;
        } else {
            n = 3 * n + 1;
        }
        steps++;
    }
    printf("1\n"); // Print the final 1

    printf("Total steps taken: %d\n", steps);
    return 0;
}
```
*   **Explanation:** The `while` loop continues until `n` becomes 1. Inside the loop, an `if` statement checks if `n` is even or odd and applies the corresponding rule. A `steps` counter is incremented in each iteration.

**3. GCD and LCM**
```c
#include <stdio.h>

// Function to find GCD using Euclidean Algorithm
int findGCD(int a, int b) {
    int temp;
    while (b != 0) {
        temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// Function to find LCM
int findLCM(int a, int b) {
    // LCM * GCD = a * b
    return (a * b) / findGCD(a, b);
}

int main() {
    int num1, num2;
    printf("Enter two positive integers: ");
    scanf("%d %d", &num1, &num2);

    printf("GCD of %d and %d is %d.\n", num1, num2, findGCD(num1, num2));
    printf("LCM of %d and %d is %d.\n", num1, num2, findLCM(num1, num2));

    return 0;
}
```
*   **Explanation:** The code is modularized into two functions. `findGCD` implements the efficient Euclidean algorithm. `findLCM` then uses the mathematical property `LCM(a, b) * GCD(a, b) = a * b` to easily calculate the LCM.

---
---

## Chapter 09: Arrays

### 🟡 Medium

**1. Kadane's Algorithm (Max Subarray Sum)**
```c
#include <stdio.h>
#include <limits.h> // For INT_MIN

int main() {
    int arr[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    int size = sizeof(arr) / sizeof(arr[0]);

    int max_so_far = INT_MIN;
    int current_max = 0;

    for (int i = 0; i < size; i++) {
        current_max += arr[i];

        if (max_so_far < current_max) {
            max_so_far = current_max;
        }

        if (current_max < 0) {
            current_max = 0;
        }
    }

    printf("Maximum subarray sum is %d\n", max_so_far);
    return 0;
}
```
*   **Explanation:** Kadane's algorithm is a dynamic programming approach. `current_max` tracks the maximum sum of a subarray ending at the current index. `max_so_far` tracks the overall maximum sum found anywhere in the array. If `current_max` ever becomes negative, it's discarded (reset to 0) because a negative sum can't contribute to a larger positive sum.

**2. Find the Duplicate Number**
```c
#include <stdio.h>

int findDuplicate(int arr[], int size) {
    int slow = arr[0];
    int fast = arr[0];

    // Phase 1: Find the intersection point in the cycle
    do {
        slow = arr[slow];
        fast = arr[arr[fast]];
    } while (slow != fast);

    // Phase 2: Find the entrance of the cycle
    slow = arr[0];
    while (slow != fast) {
        slow = arr[slow];
        fast = arr[fast];
    }

    return slow;
}

int main() {
    int arr[] = {1, 3, 4, 2, 2};
    int size = sizeof(arr) / sizeof(arr[0]);
    printf("The duplicate number is %d\n", findDuplicate(arr, size));
    return 0;
}
```
*   **Explanation:** This solution uses Floyd's Tortoise and Hare algorithm. The array is treated as a linked list where `arr[i]` points to the next index. The presence of a duplicate number creates a cycle. The algorithm first finds a meeting point within the cycle and then uses that point to find the start of the cycle, which corresponds to the duplicate number.

**3. Sort an array of 0s, 1s, and 2s**
```c
#include <stdio.h>

void swap(int arr[], int i, int j) {
    int temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

void sort012(int arr[], int size) {
    int low = 0;
    int mid = 0;
    int high = size - 1;

    while (mid <= high) {
        switch (arr[mid]) {
            case 0:
                swap(arr, low, mid);
                low++;
                mid++;
                break;
            case 1:
                mid++;
                break;
            case 2:
                swap(arr, mid, high);
                high--;
                break;
        }
    }
}

int main() {
    int arr[] = {0, 1, 2, 0, 1, 2};
    int size = sizeof(arr) / sizeof(arr[0]);
    sort012(arr, size);
    printf("Sorted array: ");
    for (int i = 0; i < size; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
    return 0;
}
```
*   **Explanation:** This is the Dutch National Flag algorithm. It maintains three pointers. The `low` pointer tracks the end of the 0s section, `high` tracks the start of the 2s section, and `mid` iterates through the array. When `arr[mid]` is 0, it's swapped with `arr[low]`. When it's 2, it's swapped with `arr[high]`. If it's 1, `mid` simply moves forward.

---
---

## Chapter 10: Strings

### 🔴 Hard

**1. Longest Common Prefix**
```c
#include <stdio.h>
#include <string.h>

char* longestCommonPrefix(char* strs[], int strsSize) {
    if (strsSize == 0) return "";

    char* prefix = strs[0];
    int prefixLen = strlen(prefix);

    for (int i = 1; i < strsSize; i++) {
        while (strncmp(prefix, strs[i], prefixLen) != 0) {
            prefixLen--;
            if (prefixLen == 0) {
                return "";
            }
            prefix[prefixLen] = '\0'; // Shorten the prefix
        }
    }
    return prefix;
}

int main() {
    char* strs[] = {"flower", "flow", "flight"};
    int size = 3;
    printf("Longest Common Prefix: %s\n", longestCommonPrefix(strs, size)); // Output: "fl"
    return 0;
}
```
*   **Explanation:** This approach, often called "Horizontal Scanning," starts by assuming the first string is the common prefix. It then iterates through the rest of the strings. For each string, it checks if it starts with the current prefix. If not, it shortens the prefix from the end by one character and checks again. This continues until a match is found or the prefix becomes empty.

**2. String to Integer (atoi)**
```c
#include <stdio.h>
#include <limits.h>

int my_atoi(char* s) {
    int i = 0;
    int sign = 1;
    long result = 0;

    // 1. Skip leading whitespace
    while (s[i] == ' ') {
        i++;
    }

    // 2. Check for sign
    if (s[i] == '-' || s[i] == '+') {
        sign = (s[i] == '-') ? -1 : 1;
        i++;
    }

    // 3. Convert digits and handle overflow
    while (s[i] >= '0' && s[i] <= '9') {
        result = result * 10 + (s[i] - '0');
        
        // Check for overflow
        if (result * sign > INT_MAX) return INT_MAX;
        if (result * sign < INT_MIN) return INT_MIN;
        
        i++;
    }

    return result * sign;
}

int main() {
    char str[] = "   -42 with words";
    printf("String: \"%s\"\n", str);
    printf("Integer: %d\n", my_atoi(str)); // Output: -42
    return 0;
}
```
*   **Explanation:** The function carefully processes the string in stages. It first consumes any leading whitespace. Then, it looks for an optional sign character. Finally, it enters a loop to convert consecutive digits into a number, checking for potential integer overflow at each step by comparing the intermediate `result` against `INT_MAX` and `INT_MIN`.

**3. Implement strstr() (Find Substring)**
```c
#include <stdio.h>
#include <string.h>

int findSubstring(char* haystack, char* needle) {
    int hLen = strlen(haystack);
    int nLen = strlen(needle);

    if (nLen == 0) return 0; // Empty needle is always found at index 0

    for (int i = 0; i <= hLen - nLen; i++) {
        int j;
        for (j = 0; j < nLen; j++) {
            if (haystack[i + j] != needle[j]) {
                break; // Mismatch, break inner loop
            }
        }
        // If inner loop completed without a break, we found the substring
        if (j == nLen) {
            return i;
        }
    }

    return -1; // Not found
}

int main() {
    char haystack[] = "hello world";
    char needle[] = "world";
    int index = findSubstring(haystack, needle);
    if (index != -1) {
        printf("Substring '%s' found at index %d.\n", needle, index);
    } else {
        printf("Substring not found.\n");
    }
    return 0;
}
```
*   **Explanation:** This is a straightforward "brute-force" implementation. The outer loop iterates through all possible starting positions for the `needle` in the `haystack`. The inner loop then compares the characters of the `needle` with the corresponding characters in the `haystack`. If the inner loop finishes completely (meaning all characters matched), the starting index `i` is returned.
