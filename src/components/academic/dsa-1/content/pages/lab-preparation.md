# Lab and Exam Preparation

A DSA I laboratory tests whether you can implement structures from scratch, trace code and explain complexity. The marking scheme below is a **suggested practice rubric**, not the university's official rubric.

## Implementation-from-scratch drills

Write each in under 20 minutes without notes, then check yourself against the linked problem:

| Drill | Practice problem |
|---|---|
| Array stack with overflow/underflow | [DSA02-E01](problem:DSA02-E01) |
| Circular queue | [DSA10-E02](problem:DSA10-E02) |
| Singly linked list: insert, delete, reverse | [DSA08-E01](problem:DSA08-E01), [DSA08-E04](problem:DSA08-E04), [DSA08-E05](problem:DSA08-E05) |
| Doubly linked list with a sentinel | [DSA08-M04](problem:DSA08-M04) |
| Tree traversals, recursive and iterative | [DSA11-E01](problem:DSA11-E01), [DSA11-M01](problem:DSA11-M01) |
| BST insert, search, delete | [DSA15-E01](problem:DSA15-E01), [DSA15-M01](problem:DSA15-M01) |
| Max-heap push/pop and heap sort | [DSA14-E01](problem:DSA14-E01), [DSA16A-E01](problem:DSA16A-E01) |
| Merge sort and quick sort | [DSA16B-E01](problem:DSA16B-E01), [DSA16C-E01](problem:DSA16C-E01) |
| Counting and radix sort | [DSA16D-E01](problem:DSA16D-E01), [DSA16D-E04](problem:DSA16D-E04) |
| BFS distances and DFS | [DSA13-E04](problem:DSA13-E04), [DSA13-E02](problem:DSA13-E02) |
| DSU with path compression | [DSA17-E01](problem:DSA17-E01) |

## Output prediction and tracing

1. Trace insertion sort on [5, 2, 4, 6, 1, 3] after each pass (answer: [Module 05](topic:correctness-and-recurrences)).
2. Give preorder, inorder and postorder of the tree in [Module 11](topic:trees).
3. Show the array after build-heap on [4, 10, 3, 5, 1] (answer: [10, 5, 3, 4, 1]; full trace in [DSA16A-E03](problem:DSA16A-E03)).
4. Give the array after one Lomuto partition of [3, 8, 2, 5, 1, 4, 7, 6] ([DSA16C-E02](problem:DSA16C-E02)).

## Debugging incorrect implementations

- A circular queue reports full when empty: front == rear is ambiguous; keep a count.
- BFS prints a vertex twice: it was marked visited when popped instead of when pushed.
- Quick sort runs forever: the partition can return a range that does not shrink.
- Linked-list reversal loses nodes: `next` was overwritten before it was saved.

## Complexity identification

State the time of: a triangular double loop (Θ(n²)); a halving loop (Θ(log n)); the harmonic double loop (Θ(n log n)); build-heap (Θ(n)); BST search on sorted insertions (Θ(n)).

## Short theory questions with answers

| Question | Answer |
|---|---|
| ADT vs data structure? | Specification of operations vs concrete implementation. |
| Why is vector append O(1) amortised? | Doubling makes total copies < 2n. |
| Full vs complete binary tree? | Full: 0 or 2 children; complete: levels filled left to right. |
| Is heap sort stable? | No. Merge sort and counting sort are. |
| Why can radix sort beat n log n? | It does not compare keys; it uses bounded digits. |
| Set ADT vs DSU? | Membership/algebra vs dynamic partition with find/union. |

## Viva questions

Explain a loop invariant for binary search; why BFS gives shortest paths in unweighted graphs; the three BST deletion cases; when the Master Theorem does not apply; stack memory vs the heap data structure.

## Lab examination simulation (90 minutes, suggested rubric)

1. Implement a circular queue supporting enqueue, dequeue, front with overflow/underflow messages (25%).
2. Read a graph and print BFS distances from vertex 1, -1 if unreachable (35%).
3. Sort n ≤ 2·10^5 integers with your own merge sort and print them (40%).

Suggested rubric per task: correctness on samples 40%, edge cases 30%, complexity 20%, code clarity 10%.
