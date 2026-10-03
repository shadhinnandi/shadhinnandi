
# Practice Questions

This file contains only the problem statements and hints. Try your best to solve them before looking at the solutions file.

---

## Chapter 05 & 06: Conditionals & Loops

### 🟢 Easy

**1. The Busy Waiter**
*   **Statement:** A restaurant has a special offer: if the bill is between $40 and $100 (inclusive), a 10% tip is suggested. If the bill is over $100, a 15% tip is suggested. If it's less than $40, a fixed $5 tip is suggested. Write a program that takes the bill amount and calculates the suggested tip.
*   **Hint:** Use a chain of `if-else if-else` statements to check the different ranges of the bill amount.

**2. Grade Calculator**
*   **Statement:** Write a program that takes a student's score (0-100) and prints their grade based on the following rules:
    *   90-100: A
    *   80-89: B
    *   70-79: C
    *   60-69: D
    *   Below 60: F
*   **Hint:** This is a classic use case for `if-else if-else`. Make sure you check from the highest grade downwards.

**3. FizzBuzz with a Twist**
*   **Statement:** Print numbers from 1 to 100.
    *   For multiples of 3, print "Fizz".
    *   For multiples of 5, print "Buzz".
    *   For multiples of both 3 and 5, print "FizzBuzz".
    *   For all other numbers, print the number itself.
    *   **Twist:** For any prime number, print "Prime" instead of the number (unless it's 3 or 5).
*   **Hint:** The check for "FizzBuzz" (`i % 15 == 0`) should come first. For the twist, you'll need a helper function or a nested loop to check for primality.

**4. Sum of Digits**
*   **Statement:** Given an integer, find the sum of its digits. For example, if the input is `12345`, the output should be `1+2+3+4+5 = 15`.
*   **Hint:** Use a `while` loop that continues as long as the number is not 0. In each iteration, use the modulo operator (`% 10`) to get the last digit and the division operator (`/ 10`) to remove the last digit.

**5. Prime Number Checker**
*   **Statement:** Write a function `int isPrime(int n)` that returns 1 if a number is prime and 0 otherwise. A number is prime if it's greater than 1 and has no divisors other than 1 and itself.
*   **Hint:** Loop from 2 up to `sqrt(n)`. If `n` is divisible by any number in this range, it's not prime.

---

### 🟡 Medium

**1. Armstrong Number**
*   **Statement:** An Armstrong number (of three digits) is an integer such that the sum of the cubes of its digits is equal to the number itself. For example, `153` is an Armstrong number because `1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153`. Check if a given number is an Armstrong number.
*   **Hint:** First, count the number of digits. Then, loop through the number, extracting each digit and raising it to the power of the digit count. Sum them up and compare.

**2. Perfect Number**
*   **Statement:** A perfect number is a positive integer that is equal to the sum of its proper positive divisors (the sum of its positive divisors excluding the number itself). For example, 6 is a perfect number because its proper divisors are 1, 2, and 3, and `1 + 2 + 3 = 6`. Check if a number is perfect.
*   **Hint:** Loop from 1 up to `n/2`. If a number `i` divides `n`, add `i` to a sum. After the loop, check if the sum equals `n`.

**3. Strong Number**
*   **Statement:** A strong number is a number in which the sum of the factorial of its digits is equal to the number itself. For example, `145` is a strong number because `1! + 4! + 5! = 1 + 24 + 120 = 145`. Check if a number is strong.
*   **Hint:** You'll need a helper function to calculate the factorial. Then, extract each digit of the input number, find its factorial, and add it to a running sum.

**4. Series Sum**
*   **Statement:** Calculate the sum of the series: `1 - 2 + 3 - 4 + 5 - ...` up to `N` terms.
*   **Hint:** Loop from 1 to N. Inside the loop, check if the current number is even or odd. If it's odd, add it to the sum. If it's even, subtract it.

**5. Binary to Decimal**
*   **Statement:** Convert a binary number (given as an integer, e.g., `1011`) to its decimal equivalent.
*   **Hint:** Use a `while` loop. In each step, get the last digit of the binary number. Multiply it by the appropriate power of 2 (starting with 2^0) and add it to the result.

---

### 🔴 Hard

**1. Decimal to Binary**
*   **Statement:** Convert a decimal number to its binary equivalent.
*   **Hint:** Use the modulo operator (`% 2`) to get the remainder and division (`/ 2`) to update the number. Store the remainders in an array and then print the array in reverse.

**2. Collatz Conjecture Steps**
*   **Statement:** The Collatz conjecture states that for any positive integer `n`, the sequence defined by:
    *   `n → n/2` (if n is even)
    *   `n → 3n + 1` (if n is odd)
    ...will eventually reach 1. Write a program that takes an integer `n` and counts how many steps it takes to reach 1.
*   **Hint:** Use a `while` loop that continues as long as `n` is not 1. Inside, use an `if` statement to apply the correct rule and increment a step counter.

**3. GCD and LCM**
*   **Statement:** Find the Greatest Common Divisor (GCD) and Least Common Multiple (LCM) of two numbers.
*   **Hint:** For GCD, use the Euclidean algorithm. The LCM can be found using the formula: `LCM(a, b) = (a * b) / GCD(a, b)`.

---
---

## Chapter 09: Arrays

### 🟢 Easy

**1. Find Missing Number**
*   **Statement:** You are given an array of `n-1` integers from 1 to `n`. There is one number missing. Find the missing number.
*   **Hint:** Calculate the sum of the first `n` natural numbers using the formula `n*(n+1)/2`. Then, calculate the sum of the elements in the given array. The difference is the missing number.

**2. Count Frequency of Elements**
*   **Statement:** Given an array, count the frequency of each element in it.
*   **Hint:** A simple approach is to use two loops. A more efficient approach for a limited range of numbers is to use a separate "frequency" or "hash" array.

**3. Rotate Array by K positions**
*   **Statement:** Rotate an array to the left by `k` positions. For example, `[1,2,3,4,5]` rotated by 2 becomes `[3,4,5,1,2]`.
*   **Hint:** One way is to create a temporary array. A more efficient "in-place" method involves reversing parts of the array. Reverse the first `k` elements, then reverse the rest, then reverse the entire array.

**4. Find Max and Min**
*   **Statement:** Find the maximum and minimum elements in an array in a single pass.
*   **Hint:** Initialize both `max` and `min` to `arr[0]`. Then loop from the second element, updating `max` and `min` as you go.

**5. Separate Even and Odd**
*   **Statement:** Given an array of integers, rearrange it such that all even numbers appear before all odd numbers.
*   **Hint:** Use a two-pointer approach. One pointer starts at the beginning (`left`) and one at the end (`right`). Move `left` until you find an odd number and `right` until you find an even number, then swap them.

---

### 🟡 Medium

**1. Kadane's Algorithm (Max Subarray Sum)**
*   **Statement:** Find the contiguous subarray within a one-dimensional array of numbers which has the largest sum.
*   **Hint:** Keep track of two variables: `max_so_far` and `current_max`. Loop through the array. `current_max` is the sum of the subarray ending at the current position. If `current_max` becomes negative, reset it to 0. `max_so_far` is the overall maximum sum found.

**2. Find the Duplicate Number**
*   **Statement:** You are given an array of `n+1` integers where each integer is between 1 and `n` (inclusive). There is exactly one duplicate number. Find it without modifying the original array and using constant extra space.
*   **Hint:** This is a classic problem. Think of the array as a linked list. The values are pointers to indices. Since there's a duplicate, there must be a cycle. Use Floyd's Tortoise and Hare (cycle detection) algorithm.

**3. Sort an array of 0s, 1s, and 2s**
*   **Statement:** Given an array containing only 0s, 1s, and 2s, sort the array in-place. This is also known as the Dutch National Flag problem.
*   **Hint:** Use a three-pointer approach: `low`, `mid`, and `high`. `low` points to where the next 0 should go, `high` to where the next 2 should go, and `mid` is the current element being considered.

**4. Find Leaders in an Array**
*   **Statement:** An element is a "leader" if it is greater than all the elements to its right side. The rightmost element is always a leader. Find all leaders in an array.
*   **Hint:** Scan the array from right to left. Keep track of the maximum element found so far from the right. If the current element is greater than the max-from-right, it's a leader.

**5. Majority Element**
*   **Statement:** The majority element is the element that appears more than `n/2` times in an array of size `n`. Find the majority element.
*   **Hint:** Use Moore's Voting Algorithm. Initialize a `candidate` and a `count`. Iterate through the array. If `count` is 0, set the current element as the `candidate`. If the current element is the same as the `candidate`, increment `count`; otherwise, decrement it.

---

### 🔴 Hard

**1. Trapping Rain Water**
*   **Statement:** Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.
*   **Hint:** For each element, the water it can hold is `min(max_left, max_right) - current_height`. You can pre-calculate the maximum height to the left and right of every element in two separate arrays.

**2. Stock Buy and Sell**
*   **Statement:** You are given an array of stock prices for consecutive days. Find the maximum profit that can be achieved. You may complete as many transactions as you like (i.e., buy one and sell one share of the stock multiple times), but you must sell before you can buy again.
*   **Hint:** This is simpler than it looks. You can find the total profit by summing up all the positive differences between consecutive days. If `prices[i] > prices[i-1]`, you can make a profit of `prices[i] - prices[i-1]`.

**3. Merge Two Sorted Arrays without Extra Space**
*   **Statement:** Given two sorted arrays, `arr1` of size `n` and `arr2` of size `m`, merge them into a single sorted array without using any extra space. The first `n` elements should be in `arr1` and the next `m` in `arr2`.
*   **Hint:** This is a tricky problem. One approach is to iterate through `arr1`. If `arr1[i]` is greater than the first element of `arr2`, swap them. Then, sort `arr2` again (or insert the new element in its correct place). A more optimized approach is the Gap method.

**4. Matrix Spiral Traversal**
*   **Statement:** Given a 2D matrix, print its elements in spiral order.
*   **Hint:** Use four pointers: `top`, `bottom`, `left`, and `right` to represent the boundaries of the current layer of the spiral. In a loop, print the top row, then the right column, then the bottom row, then the left column, and then shrink the boundaries inwards.

---
---

## Chapter 10: Strings

### 🟡 Medium

**1. Check for Anagrams**
*   **Statement:** Two strings are anagrams if they contain the same characters, just in a different order (e.g., "listen" and "silent"). Check if two strings are anagrams.
*   **Hint:** A simple way is to sort both strings and then compare them. A more efficient way is to use a frequency/count array (of size 256 for all ASCII characters) for the characters of the first string, and then decrement the counts for the characters of the second string.

**2. Find First Non-Repeating Character**
*   **Statement:** Given a string, find its first non-repeating character. For example, in "swiss", the first non-repeating character is 'w'.
*   **Hint:** Use a frequency/count array to store the number of times each character appears. Then, iterate through the original string a second time and return the first character that has a count of 1 in your frequency array.

**3. Validate an IP Address**
*   **Statement:** Write a function to check whether a given string is a valid IPv4 address. A valid IPv4 address is in the form "x.x.x.x" where each `x` is a number between 0 and 255.
*   **Hint:** Use `strtok()` function with the delimiter "." to split the string into tokens. For each token, check if it's a valid number in the 0-255 range. Also, count the number of tokens; there must be exactly 4.

---

### 🔴 Hard

**1. Longest Common Prefix**
*   **Statement:** Write a function to find the longest common prefix string amongst an array of strings. If there is no common prefix, return an empty string.
*   **Hint:** A simple approach is "character-by-character matching". Take the first string as the reference. Compare its first character with the first character of all other strings. If it matches, move to the second character, and so on, until a mismatch is found.

**2. String to Integer (atoi)**
*   **Statement:** Implement the `atoi` function, which converts a string to an integer. The function should handle optional leading whitespace, an optional sign (`+` or `-`), and stop parsing when it encounters a non-digit character.
*   **Hint:** This is a state-machine problem. First, handle whitespace. Then, check for a sign. Then, loop through the digits, building the number by multiplying the current result by 10 and adding the new digit. Be careful about integer overflow.

**3. Implement strstr() (Find Substring)**
*   **Statement:** Implement the `strstr()` function. It finds the first occurrence of a `needle` string in a `haystack` string. Return the starting index of the first occurrence, or -1 if not found.
*   **Hint:** Use a nested loop. The outer loop iterates through the `haystack`. The inner loop checks if the characters starting from the current `haystack` position match the `needle` string.
