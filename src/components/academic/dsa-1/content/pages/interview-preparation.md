# Interview Preparation

How to use DSA I knowledge in coding interviews. Items marked **(extension)** go beyond the official syllabus.

## The interview method

1. Restate the problem and ask about input size, value ranges, duplicates and empty input.
2. Give a brute-force solution and its complexity.
3. Find the bottleneck and improve it (sorting, hashing, two pointers, a heap, BFS).
4. State time and space before coding; write clean, small functions.
5. Dry-run on the example and on edge cases; explain why it is correct (an invariant).

## Roadmap

| Level | Topics | Practice |
|---|---|---|
| Foundation | complexity, arrays, searching, stacks, queues, linked lists | [DSA04-M02](problem:DSA04-M02), [DSA02-M02](problem:DSA02-M02), [DSA03-M04](problem:DSA03-M04) |
| Intermediate | trees, traversals, BSTs, heaps, sorting, graphs, BFS/DFS, sets | [Module 11](topic:trees), [Module 14](topic:heaps), [Module 13](topic:bfs-dfs) |
| Advanced (within syllabus) | algorithm selection under constraints, combined structures | [DSA02-H01](problem:DSA02-H01), [DSA02-H03](problem:DSA02-H03), [DSA04-H04](problem:DSA04-H04) |

## Common questions and model reasoning

| Question | Model reasoning | Follow-up |
|---|---|---|
| Two numbers summing to K | brute O(n²) → hash map O(n) | count pairs; sorted input → two pointers |
| Stack with O(1) minimum | store the running minimum with each element | queue with O(1) maximum (extension) |
| LRU cache | hash map + doubly linked list, O(1) | LFU cache (extension) |
| Shortest path in a grid | BFS from the start | weighted grid → Dijkstra (extension) |
| k largest elements | min-heap of size k, O(n log k) | streaming data |
| Detect a cycle in a linked list | fast and slow pointers, O(1) space | find the cycle start |

## Mock interview sets (45 minutes each)

- **Mock 1:** [DSA03-M05](problem:DSA03-M05) then [DSA04-H03](problem:DSA04-H03).
- **Mock 2:** [DSA02-M01](problem:DSA02-M01) then [DSA02-H01](problem:DSA02-H01).
- **Mock 3:** [DSA03-H02](problem:DSA03-H02) then [DSA04-H04](problem:DSA04-H04).
