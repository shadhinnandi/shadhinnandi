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
| Intermediate | trees, traversals, BSTs, heaps, sorting, graphs, BFS/DFS, sets | [DSA11-M03](problem:DSA11-M03), [DSA14-M04](problem:DSA14-M04), [DSA13-M01](problem:DSA13-M01), [DSA15-M03](problem:DSA15-M03), [DSA17-M02](problem:DSA17-M02) |
| Advanced (within syllabus) | algorithm selection under constraints, combined structures | [DSA02-H01](problem:DSA02-H01), [DSA09-H01](problem:DSA09-H01), [DSA10-H01](problem:DSA10-H01), [DSA14-H04](problem:DSA14-H04), [DSA-C16](problem:DSA-C16) |

## Common questions and model reasoning

| Question | Model reasoning | Follow-up |
|---|---|---|
| Two numbers summing to K | brute O(n²) → hash map O(n) | count pairs; sorted input → two pointers |
| Stack with O(1) minimum | store the running minimum with each element | queue with O(1) maximum (extension) |
| LRU cache | hash map + doubly linked list, O(1) | LFU cache (extension) |
| Shortest path in a grid | BFS from the start | weighted grid → Dijkstra (extension) |
| k largest elements | min-heap of size k, O(n log k) | streaming data |
| Detect a cycle in a linked list ([DSA08-M05](problem:DSA08-M05)) | fast and slow pointers, O(1) space | find the cycle start ([DSA05-H04](problem:DSA05-H04)) |

## Mock interview sets (45 minutes each)

- **Mock 1:** [DSA03-M05](problem:DSA03-M05) then [DSA04-H03](problem:DSA04-H03).
- **Mock 2:** [DSA02-M01](problem:DSA02-M01) then [DSA02-H01](problem:DSA02-H01).
- **Mock 3:** [DSA03-H02](problem:DSA03-H02) then [DSA04-H04](problem:DSA04-H04).
- **Mock 4:** [DSA08-H01](problem:DSA08-H01) then [DSA13-H02](problem:DSA13-H02).
- **Mock 5:** [DSA14-M03](problem:DSA14-M03) then [DSA-C20](problem:DSA-C20).
