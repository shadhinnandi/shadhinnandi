# Completion Challenges

Original scenario problems that combine several modules. Each one explains why the obvious approach fails under the constraints, so choosing the right data structure is part of the task.

## DSA-C01 · Course Registration Planner
**Difficulty:** Hard · **Subtopic:** Prerequisite graphs · **Tags:** graph, DAG, heap, topological order · **Source:** Original
**Modules:** 12, 13, 14

### Statement
A university has n courses and m prerequisite rules "a must be taken before b". A student takes one course at a time and, whenever several courses are available, chooses the smallest course number. Print the resulting order, or `IMPOSSIBLE` if the rules contain a cycle.

### Input
n m, then m lines a b.

### Output
The course order or `IMPOSSIBLE`.

### Constraints
- 1 ≤ n, m ≤ 2·10^5

### Sample Input
```text
4 3
1 2
1 3
3 2
```

### Sample Output
```text
1 3 2 4
```

### Sample Explanation
Available {1, 4} → take 1; then {3, 4} → 3; then {2, 4} → 2; then 4.

### Target
O((n + m) log n).

### Hints
1. Track each course's number of unfinished prerequisites (in-degree).
2. Keep the available courses in a min-heap.
3. If fewer than n courses are taken, a cycle blocks the rest.

### Approach
Kahn's algorithm with a min-heap instead of a queue (topological sorting is an extension of the syllabus built from graphs, queues and heaps).

### Naive Pitfall
Rescanning all n courses after each choice to find the smallest available one costs O(n²) = 4·10^10 steps for n = 2·10^5. The heap returns it in O(log n).

### Solution
```cpp
#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> next(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; ++i) { int a, b; cin >> a >> b; next[a].push_back(b); ++indeg[b]; }
    priority_queue<int, vector<int>, greater<int>> available;
    for (int c = 1; c <= n; ++c) if (indeg[c] == 0) available.push(c);
    vector<int> order;
    while (!available.empty()) {
        int c = available.top(); available.pop();
        order.push_back(c);
        for (int d : next[c]) if (--indeg[d] == 0) available.push(d);
    }
    if (static_cast<int>(order.size()) < n) { cout << "IMPOSSIBLE\n"; return 0; }
    for (int i = 0; i < n; ++i) cout << order[i] << (i + 1 < n ? ' ' : '\n');
}
```

### Explanation
A course becomes available exactly when its last prerequisite is taken; the heap enforces the "smallest first" rule. Courses on a cycle never reach in-degree 0.

### Edge Cases
- No rules: 1..n in order.
- A two-course cycle.

### Tests
#### Cycle
```text
2 2
1 2
2 1
```
```text
IMPOSSIBLE
```

## DSA-C02 · Campus Navigation with Closures
**Difficulty:** Medium · **Subtopic:** Shortest hops with blocked vertices · **Tags:** BFS, graph, queries · **Source:** Original
**Modules:** 12, 13

### Statement
Buildings 1..n are joined by m walkways. Some buildings are closed for maintenance and cannot be entered. For q destinations, print the minimum number of walkways from the main gate (building 1, always open) or −1.

### Input
n m; m walkways; k and k closed buildings; q and q destinations.

### Output
One distance per destination.

### Constraints
- 1 ≤ n, m, q ≤ 2·10^5

### Sample Input
```text
5 5
1 2
2 3
3 5
1 4
4 5
1
4
3
5
3
4
```

### Sample Output
```text
3
2
-1
```

### Sample Explanation
With building 4 closed, 1–2–3–5 is the shortest route to 5; 4 itself is unreachable.

### Target
O(n + m + q).

### Hints
1. All queries start at building 1: one BFS answers them all.
2. Never enqueue a closed building.

### Approach
A single BFS from 1 that skips closed vertices, then O(1) per query.

### Naive Pitfall
Running a BFS per query costs O(q·(n + m)) ≈ 8·10^10 steps.

### Solution
```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; ++i) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }
    int k;
    cin >> k;
    vector<char> closed(n + 1, 0);
    for (int i = 0; i < k; ++i) { int c; cin >> c; closed[c] = 1; }
    vector<int> dist(n + 1, -1);
    queue<int> q;
    dist[1] = 0;
    q.push(1);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u])
            if (!closed[v] && dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
    }
    int queries;
    cin >> queries;
    while (queries--) { int t; cin >> t; cout << dist[t] << '\n'; }
}
```

### Explanation
Removing closed vertices from the graph and running BFS once gives every shortest hop count.

### Edge Cases
- Destination is the gate: 0.

### Tests
#### Gate itself
```text
2 1
1 2
0
1
1
```
```text
0
```

## DSA-C03 · Nearest Fire Station
**Difficulty:** Medium · **Subtopic:** Multi-source BFS · **Tags:** BFS, multi-source, graph · **Source:** Original
**Modules:** 10, 13

### Statement
A city has n junctions and m roads; k junctions have fire stations. For every junction print the number of roads to the nearest station (−1 if none can reach it).

### Input
n m; m roads; k and the station junctions.

### Output
n distances.

### Constraints
- 1 ≤ n, m ≤ 2·10^5, 1 ≤ k ≤ n

### Sample Input
```text
6 5
1 2
2 3
3 4
4 5
5 6
2
1 6
```

### Sample Output
```text
0 1 2 2 1 0
```

### Sample Explanation
Junctions 3 and 4 are two roads from a station.

### Target
O(n + m).

### Hints
1. Put every station in the queue at distance 0 before starting.
2. BFS then computes the distance to the nearest source.

### Approach
Multi-source BFS.

### Naive Pitfall
One BFS per station costs O(k·(n + m)), up to 4·10^10.

### Solution
```cpp
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; ++i) { int u, v; cin >> u >> v; adj[u].push_back(v); adj[v].push_back(u); }
    int k;
    cin >> k;
    vector<int> dist(n + 1, -1);
    queue<int> q;
    for (int i = 0; i < k; ++i) { int s; cin >> s; if (dist[s] == -1) { dist[s] = 0; q.push(s); } }
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
    }
    for (int u = 1; u <= n; ++u) cout << dist[u] << (u < n ? ' ' : '\n');
}
```

### Explanation
Equivalent to BFS from a virtual source joined to every station.

### Edge Cases
- Isolated junction: −1.

### Tests
#### Isolated
```text
2 0
1
1
```
```text
0 -1
```

## DSA-C04 · Hospital Triage with Updates
**Difficulty:** Hard · **Subtopic:** Priority queue with lazy deletion · **Tags:** heap, priority queue, lazy deletion · **Source:** Original
**Modules:** 02, 10, 14

### Statement
Patients arrive with a severity; a nurse may later update a waiting patient's severity. The doctor always treats the most severe waiting patient (ties: earliest arrival). Process `arrive id s`, `update id s` and `treat` (print the id or `NONE`).

### Input
q, then q operations.

### Output
One line per `treat`.

### Constraints
- 1 ≤ q ≤ 2·10^5; ids are distinct; updates refer to waiting patients

### Sample Input
```text
8
arrive 1 3
arrive 2 5
arrive 3 5
update 1 9
treat
treat
treat
treat
```

### Sample Output
```text
1
2
3
NONE
```

### Sample Explanation
Patient 1 jumps to severity 9; 2 and 3 tie at 5 and 2 arrived first.

### Target
O(q log q).

### Hints
1. A heap cannot change a stored priority, but it can store a new entry.
2. Keep each patient's current severity; when an entry reaches the top, discard it if it is stale or the patient was already treated.

### Approach
Heap of (severity, −arrival, id) with lazy deletion.

### Naive Pitfall
Scanning all waiting patients for each treatment is O(q²) = 4·10^10; a sorted array makes updates O(q) each.

### Solution
```cpp
#include <iostream>
#include <queue>
#include <string>
#include <tuple>
#include <unordered_map>
using namespace std;

int main() {
    int q;
    cin >> q;
    priority_queue<tuple<long long, long long, long long>> heap;   // (severity, -arrival, id)
    unordered_map<long long, long long> severity, arrival;           // waiting patients only
    long long clock = 0;
    while (q--) {
        string op;
        cin >> op;
        if (op == "treat") {
            bool done = false;
            while (!heap.empty() && !done) {
                auto [s, negArrival, id] = heap.top();
                heap.pop();
                auto it = severity.find(id);
                if (it == severity.end() || it->second != s) continue;    // stale entry
                cout << id << '\n';
                severity.erase(it);
                done = true;
            }
            if (!done) cout << "NONE\n";
            continue;
        }
        long long id, s;
        cin >> id >> s;
        if (op == "arrive") arrival[id] = clock++;
        severity[id] = s;
        heap.emplace(s, -arrival[id], id);
    }
}
```

### Explanation
Each entry is pushed and popped at most once, so lazy deletion keeps O(log q) amortised per operation.

### Edge Cases
- Updating to the same severity creates a duplicate entry; only one is used.

### Tests
#### Empty treat
```text
1
treat
```
```text
NONE
```

## DSA-C05 · Browser History
**Difficulty:** Medium · **Subtopic:** Two stacks for history · **Tags:** stack, design, simulation · **Source:** Original
**Modules:** 02, 09

### Statement
A browser starts at `home`. `visit url` opens a page (clearing forward history). `back k` and `forward k` move up to k steps; after each, print the current page.

### Input
q, then q operations.

### Output
One line per back/forward.

### Constraints
- 1 ≤ q ≤ 2·10^5, sum of min(k, possible moves) ≤ 10^6

### Sample Input
```text
8
visit a
visit b
visit c
back 1
back 5
forward 2
visit d
forward 1
```

### Sample Output
```text
b
home
b
d
```

### Sample Explanation
Visiting d discards the forward page c.

### Target
O(1) per step moved.

### Hints
1. Back stack: pages behind the current one; forward stack: pages ahead.
2. A new visit clears the forward stack.

### Approach
Current page plus two stacks.

### Naive Pitfall
Storing history in one list and erasing the forward part with `vector::erase` from the middle on every visit can cost O(q) per visit.

### Solution
```cpp
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    int q;
    cin >> q;
    string current = "home";
    vector<string> back, forward;
    while (q--) {
        string op;
        cin >> op;
        if (op == "visit") {
            back.push_back(current);
            cin >> current;
            forward.clear();
            continue;
        }
        long long k;
        cin >> k;
        auto& from = (op == "back") ? back : forward;
        auto& to = (op == "back") ? forward : back;
        for (long long i = 0; i < k && !from.empty(); ++i) {
            to.push_back(current);
            current = from.back();
            from.pop_back();
        }
        cout << current << '\n';
    }
}
```

### Explanation
Moving back pushes the current page onto the forward stack, so going forward reverses it exactly.

### Edge Cases
- Back at the first page.

### Tests
#### Nothing to go back to
```text
1
back 3
```
```text
home
```

## DSA-C06 · Print Server Farm
**Difficulty:** Medium · **Subtopic:** Earliest-free resource · **Tags:** heap, queue, scheduling · **Source:** Original
**Modules:** 10, 14

### Statement
k printers serve a FIFO queue of n jobs (all waiting at time 0). A job of p pages takes p seconds. Each job goes to the printer that becomes free earliest (ties: lowest printer number). Print each job's finishing time.

### Input
n k, then n page counts.

### Output
n finishing times.

### Constraints
- 1 ≤ n, k ≤ 2·10^5, 1 ≤ p ≤ 10^9

### Sample Input
```text
4 2
3 2 4 1
```

### Sample Output
```text
3 2 6 4
```

### Sample Explanation
Job 3 goes to printer 2 (free at 2), job 4 to printer 1 (free at 3).

### Target
O(n log k).

### Hints
1. A min-heap of (free time, printer).
2. Pop, assign, push back with the new free time.

### Approach
Event-driven assignment with a heap.

### Naive Pitfall
Scanning all k printers per job is O(n·k) = 4·10^10.

### Solution
```cpp
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> printers;
    for (int i = 1; i <= k; ++i) printers.push({0, i});
    for (int j = 0; j < n; ++j) {
        long long pages;
        cin >> pages;
        auto [free, id] = printers.top();
        printers.pop();
        long long finish = free + pages;
        cout << finish << (j + 1 < n ? ' ' : '\n');
        printers.push({finish, id});
    }
}
```

### Explanation
The heap always exposes the earliest free printer; tie-breaking by printer id is built into the pair ordering.

### Edge Cases
- More printers than jobs.

### Tests
#### One printer
```text
3 1
1 1 1
```
```text
1 2 3
```

## DSA-C07 · Live Sales Leaderboard
**Difficulty:** Hard · **Subtopic:** Ordered set with updates · **Tags:** ordered set, hash map, ranking · **Source:** Original
**Modules:** 02, 15, 17

### Statement
`sell id qty` adds qty to a product's total sales. `top k` prints the ids of the k best-selling products (sales descending, ties id ascending; fewer if fewer products have sold).

### Input
q, then q operations.

### Output
One line per `top`.

### Constraints
- 1 ≤ q ≤ 2·10^5, sum of k ≤ 2·10^5

### Sample Input
```text
6
sell 5 10
sell 2 10
sell 7 3
top 2
sell 7 20
top 3
```

### Sample Output
```text
2 5
7 2 5
```

### Sample Explanation
Product 7 overtakes after its second sale.

### Target
O(log n) per sale, O(k) per query.

### Hints
1. Keep (−sales, id) in a balanced BST (`std::set`).
2. On a sale, erase the old pair and insert the new one.

### Approach
`set` plus a hash map of current totals.

### Naive Pitfall
Sorting all products for every `top` query is O(n log n) per query, up to 10^11 operations overall.

### Solution
```cpp
#include <iostream>
#include <set>
#include <string>
#include <unordered_map>
#include <utility>
using namespace std;

int main() {
    int q;
    cin >> q;
    set<pair<long long, long long>> board;          // (-sales, id)
    unordered_map<long long, long long> sales;
    while (q--) {
        string op;
        cin >> op;
        if (op == "sell") {
            long long id, qty;
            cin >> id >> qty;
            auto it = sales.find(id);
            if (it != sales.end()) board.erase({-it->second, id});
            long long total = (it == sales.end() ? 0 : it->second) + qty;
            sales[id] = total;
            board.insert({-total, id});
        } else {
            int k;
            cin >> k;
            int printed = 0;
            for (auto it = board.begin(); it != board.end() && printed < k; ++it, ++printed)
                cout << (printed ? " " : "") << it->second;
            cout << '\n';
        }
    }
}
```

### Explanation
The tree keeps products ordered at all times, so a top-k query just walks the first k nodes.

### Edge Cases
- k larger than the number of products.

### Tests
#### Fewer products
```text
2
sell 1 4
top 5
```
```text
1
```

## DSA-C08 · Network Topology Monitor
**Difficulty:** Medium · **Subtopic:** Incremental connectivity · **Tags:** union-find, graph, monitoring · **Source:** Original
**Modules:** 12, 17

### Statement
A data centre has n servers. `link a b` installs a cable; a cable joining already-connected servers is redundant. `status` prints the number of connected groups and the number of redundant cables so far.

### Input
n q, then q operations.

### Output
One line per `status`.

### Constraints
- 1 ≤ n, q ≤ 2·10^5

### Sample Input
```text
4 6
link 1 2
link 2 3
link 1 3
status
link 3 4
status
```

### Sample Output
```text
2 1
1 1
```

### Sample Explanation
1–3 was redundant; after linking 4 everything is one group.

### Target
O(α(n)) per operation.

### Hints
1. DSU tells whether a cable joins two groups.
2. Keep counters for groups and redundant cables.

### Approach
DSU with two counters.

### Naive Pitfall
Recomputing components with BFS on every `status` costs O(q·(n + q)).

### Solution
```cpp
#include <iostream>
#include <numeric>
#include <string>
#include <utility>
#include <vector>
using namespace std;

vector<int> parent, sz;
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }

int main() {
    int n, q;
    cin >> n >> q;
    parent.resize(n + 1);
    sz.assign(n + 1, 1);
    iota(parent.begin(), parent.end(), 0);
    int groups = n;
    long long redundant = 0;
    while (q--) {
        string op;
        cin >> op;
        if (op == "status") { cout << groups << ' ' << redundant << '\n'; continue; }
        int a, b;
        cin >> a >> b;
        a = find(a); b = find(b);
        if (a == b) { ++redundant; continue; }
        if (sz[a] < sz[b]) swap(a, b);
        parent[b] = a;
        sz[a] += sz[b];
        --groups;
    }
}
```

### Explanation
Every cable either merges two groups or is redundant; DSU decides which in near-constant time.

### Edge Cases
- Self-cable `link a a` is redundant.

### Tests
#### Self link
```text
1 2
link 1 1
status
```
```text
1 1
```

## DSA-C09 · Friend Suggestions
**Difficulty:** Hard · **Subtopic:** Neighbourhood counting · **Tags:** graph, hashing, counting · **Source:** Original
**Modules:** 12, 13, 17

### Statement
For each query user u, suggest the non-friend v ≠ u who shares the most mutual friends with u (ties: smallest id). Print −1 if nobody shares a friend.

### Input
n m; m friendships; q and q users.

### Output
One suggestion per query.

### Constraints
- 1 ≤ n ≤ 2·10^5, m ≤ 2·10^5, q ≤ 100, sum over queries of Σ deg(friend) ≤ 2·10^7

### Sample Input
```text
5 4
1 2
1 3
2 4
3 4
3
1
4
5
```

### Sample Output
```text
4
1
-1
```

### Sample Explanation
1 and 4 share friends 2 and 3; user 5 has no friends.

### Target
O(Σ deg(friends of u)) per query.

### Hints
1. Count, for each friend-of-a-friend, how many paths of length 2 reach it.
2. Exclude u and u's direct friends.

### Approach
Counting map over two-step neighbours.

### Naive Pitfall
Intersecting u's friend set with every other user's friend set is O(n · deg) per query, about 10^10 for large inputs.

### Solution
```cpp
#include <iostream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> adj(n + 1);
    for (int i = 0; i < m; ++i) { int a, b; cin >> a >> b; adj[a].push_back(b); adj[b].push_back(a); }
    int q;
    cin >> q;
    while (q--) {
        int u;
        cin >> u;
        unordered_set<int> friends(adj[u].begin(), adj[u].end());
        unordered_map<int, int> mutual;
        for (int f : adj[u])
            for (int w : adj[f])
                if (w != u && !friends.count(w)) ++mutual[w];
        int best = -1, bestCount = 0;
        for (const auto& [w, c] : mutual)
            if (c > bestCount || (c == bestCount && w < best)) { best = w; bestCount = c; }
        cout << best << '\n';
    }
}
```

### Explanation
Each length-2 path u–f–w adds one mutual friend for w, so counting paths counts mutual friends exactly.

### Edge Cases
- Everyone already a friend: −1.

### Tests
#### Triangle
```text
3 3
1 2
2 3
1 3
1
1
```
```text
-1
```

## DSA-C10 · Document Search Ranking
**Difficulty:** Medium · **Subtopic:** Inverted index · **Tags:** hash map, sorting, search · **Source:** Original
**Modules:** 07, 16B, 17

### Statement
n documents have a relevance score and a list of words. For each query (word, k), print the ids of the k highest-scoring documents containing the word (score descending, ties id ascending), or `NONE`.

### Input
n; then n lines: score w followed by w words (document ids are 1..n in input order); q and q lines word k.

### Output
One line per query.

### Constraints
- 1 ≤ n, q ≤ 10^5, total words ≤ 10^6, sum of k ≤ 10^6

### Sample Input
```text
3
50 2 data structures
80 2 graph data
70 2 sorting structures
3
data 2
structures 1
heap 3
```

### Sample Output
```text
2 1
3
NONE
```

### Sample Explanation
"data" appears in documents 1 (50) and 2 (80).

### Target
O(total words · log + Σk).

### Hints
1. Build word → list of documents once (an inverted index).
2. Sort each list by (−score, id) once; queries read prefixes.

### Approach
Hash map of vectors, sorted once.

### Naive Pitfall
Scanning every document's words for every query is O(q · total words) = 10^11.

### Solution
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> score(n + 1);
    unordered_map<string, vector<int>> index;
    for (int d = 1; d <= n; ++d) {
        int w;
        cin >> score[d] >> w;
        unordered_set<string> seen;
        for (int i = 0; i < w; ++i) {
            string word;
            cin >> word;
            if (seen.insert(word).second) index[word].push_back(d);   // once per document
        }
    }
    for (auto& [word, docs] : index)
        sort(docs.begin(), docs.end(), [&](int a, int b) { return score[a] != score[b] ? score[a] > score[b] : a < b; });
    int q;
    cin >> q;
    while (q--) {
        string word;
        size_t k;
        cin >> word >> k;
        auto it = index.find(word);
        if (it == index.end()) { cout << "NONE\n"; continue; }
        size_t limit = min(k, it->second.size());
        for (size_t i = 0; i < limit; ++i) cout << it->second[i] << (i + 1 < limit ? ' ' : '\n');
    }
}
```

### Explanation
Preprocessing moves the cost from every query to a single sort per word, the principle behind search engines.

### Edge Cases
- Word repeated inside one document counts once.

### Tests
#### Repeated word
```text
1
10 2 x x
1
x 5
```
```text
1
```

## DSA-C11 · Active Users in a Time Window
**Difficulty:** Hard · **Subtopic:** Sliding window over a stream · **Tags:** queue, hash map, sliding window · **Source:** Original
**Modules:** 07, 10, 17

### Statement
Login events (time, user) arrive in non-decreasing time. After each event, print the number of distinct users with an event in (t − W, t].

### Input
n W, then n lines time user.

### Output
n counts.

### Constraints
- 1 ≤ n ≤ 2·10^5, 1 ≤ W ≤ 10^9

### Sample Input
```text
5 10
1 a
5 b
8 a
12 c
20 b
```

### Sample Output
```text
1 2 2 3 2
```

### Sample Explanation
At time 20 the window (10, 20] holds c and b.

### Target
O(n) expected.

### Hints
1. Keep the window's events in a queue and a count per user.
2. Pop expired events, decrementing counts; a user leaves when its count hits 0.

### Approach
Queue plus hash map of counts.

### Naive Pitfall
Rebuilding a set of the window's users for every event is O(n · window) = O(n²) in the worst case.

### Solution
```cpp
#include <iostream>
#include <queue>
#include <string>
#include <unordered_map>
#include <utility>
using namespace std;

int main() {
    int n;
    long long w;
    cin >> n >> w;
    queue<pair<long long, string>> window;
    unordered_map<string, int> count;
    for (int i = 0; i < n; ++i) {
        long long t;
        string user;
        cin >> t >> user;
        window.push({t, user});
        ++count[user];
        while (window.front().first <= t - w) {                 // outside (t - W, t]
            auto it = count.find(window.front().second);
            if (--it->second == 0) count.erase(it);
            window.pop();
        }
        cout << count.size() << (i + 1 < n ? ' ' : '\n');
    }
}
```

### Explanation
Each event enters and leaves the queue once; the map size is the number of distinct active users.

### Edge Cases
- Events exactly W apart (the older one has expired).

### Tests
#### Boundary
```text
2 5
0 a
5 b
```
```text
1 1
```

## DSA-C12 · Memory-Tight Attendance
**Difficulty:** Medium · **Subtopic:** Bitset representation · **Tags:** bitset, memory, bits · **Source:** Original
**Modules:** 01, 17

### Statement
Student IDs are in [1, N] with N up to 10^7. Process q check-ins and print the number of unique students and the first ID that checked in twice (`NONE` if none). Use about N/8 bytes.

### Input
N q, then q IDs.

### Output
Unique count and first duplicate.

### Constraints
- 1 ≤ N ≤ 10^7, 1 ≤ q ≤ 2·10^5

### Sample Input
```text
100 5
7 42 7 99 42
```

### Sample Output
```text
3 7
```

### Sample Explanation
7 is the first repeat.

### Target
O(N/64 + q) time, N/8 bytes.

### Hints
1. One bit per possible ID: word id/64, bit id%64.
2. Test the bit before setting it.

### Approach
`vector<uint64_t>` as a bitset.

### Naive Pitfall
`vector<int>` counts for 10^7 IDs need 40 MB, and a `std::set` of IDs uses dozens of bytes per element; the bitset needs 1.25 MB.

### Solution
```cpp
#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long n;
    int q;
    cin >> n >> q;
    vector<uint64_t> seen(static_cast<size_t>(n / 64 + 1), 0);
    long long unique = 0;
    string firstDup = "NONE";
    for (int i = 0; i < q; ++i) {
        long long id;
        cin >> id;
        uint64_t mask = uint64_t{1} << (id % 64);
        if (seen[id / 64] & mask) { if (firstDup == "NONE") firstDup = to_string(id); }
        else { seen[id / 64] |= mask; ++unique; }
    }
    cout << unique << ' ' << firstDup << '\n';
}
```

### Explanation
Representation decides memory: 10^7 booleans fit in 156 250 words of 64 bits.

### Edge Cases
- No duplicates.

### Tests
#### No duplicates
```text
10 3
1 2 3
```
```text
3 NONE
```

## DSA-C13 · Contest Leaderboard
**Difficulty:** Medium · **Subtopic:** Multi-key sorting and ranking · **Tags:** sorting, comparator, ranking · **Source:** Original
**Modules:** 07, 16B

### Statement
Sort contestants by score descending, then penalty time ascending, then name ascending. Print each contestant's rank and name, where contestants with equal score and time share a rank and the next rank skips (1, 2, 3, 3, 5).

### Input
n, then n lines name score time.

### Output
n lines rank name.

### Constraints
- 1 ≤ n ≤ 2·10^5

### Sample Input
```text
4
ana 90 30
bo 95 40
cy 90 30
di 90 20
```

### Sample Output
```text
1 bo
2 di
3 ana
3 cy
```

### Sample Explanation
ana and cy tie on score and time; names only order them.

### Target
O(n log n).

### Hints
1. Sort by a tuple (−score, time, name).
2. A contestant's rank is its 1-based position unless it ties with the previous one on score and time.

### Approach
`std::sort` with a tuple key, then one ranking pass.

### Naive Pitfall
Computing each rank by counting better contestants is O(n²) = 4·10^10.

### Solution
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<tuple<long long, long long, string>> c(n);         // (-score, time, name)
    for (auto& [s, t, name] : c) { long long score; cin >> name >> score >> t; s = -score; }
    sort(c.begin(), c.end());
    int rank = 0;
    for (int i = 0; i < n; ++i) {
        if (i == 0 || get<0>(c[i]) != get<0>(c[i - 1]) || get<1>(c[i]) != get<1>(c[i - 1])) rank = i + 1;
        cout << rank << ' ' << get<2>(c[i]) << '\n';
    }
}
```

### Explanation
Negating the score turns "descending" into the tuple's natural ascending order, so one comparator handles all three keys.

### Edge Cases
- Everyone tied: all rank 1.

### Tests
#### All tied
```text
2
b 10 5
a 10 5
```
```text
1 a
1 b
```

## DSA-C14 · Streaming Response-Time Median
**Difficulty:** Hard · **Subtopic:** Two-heap median under batches · **Tags:** heap, median, streaming · **Source:** Original
**Modules:** 04, 14

### Statement
A server logs response times. After every b-th measurement, report the lower median of all measurements so far.

### Input
n b, then n times.

### Output
⌊n/b⌋ medians.

### Constraints
- 1 ≤ b ≤ n ≤ 2·10^5

### Sample Input
```text
6 2
5 1 9 3 7 2
```

### Sample Output
```text
1 3 3
```

### Sample Explanation
{1,5} → 1; {1,3,5,9} → 3; {1,2,3,5,7,9} → 3.

### Target
O(n log n).

### Hints
1. Lower half in a max-heap, upper half in a min-heap.
2. Report the max-heap's top at each batch boundary.

### Approach
Running median with rebalancing.

### Naive Pitfall
Sorting all data at each report costs O((n/b) · n log n): with b = 1 that is about 10^11.

### Solution
```cpp
#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;

int main() {
    int n, b;
    cin >> n >> b;
    priority_queue<long long> low;
    priority_queue<long long, vector<long long>, greater<long long>> high;
    int reports = n / b, printed = 0;
    for (int i = 1; i <= n; ++i) {
        long long x;
        cin >> x;
        if (low.empty() || x <= low.top()) low.push(x); else high.push(x);
        if (low.size() > high.size() + 1) { high.push(low.top()); low.pop(); }
        else if (high.size() > low.size()) { low.push(high.top()); high.pop(); }
        if (i % b == 0) cout << low.top() << (++printed < reports ? ' ' : '\n');
    }
}
```

### Explanation
Each insertion is O(log n) and the median is always at the top of the lower half.

### Edge Cases
- b = n: one report.

### Tests
#### Single report
```text
3 3
3 1 2
```
```text
2
```

## DSA-C15 · Bridges Closing
**Difficulty:** Hard · **Subtopic:** Offline deletions by reversal · **Tags:** union-find, offline, graph · **Source:** Original
**Modules:** 12, 17

### Statement
n cities are joined by m roads (numbered 1..m). Roads close one at a time in the given order until none remain. After each closure, print `YES` if city 1 can still reach city n, else `NO`.

### Input
n m; m roads; then the closing order (a permutation of 1..m).

### Output
m answers.

### Constraints
- 2 ≤ n ≤ 2·10^5, 1 ≤ m ≤ 2·10^5

### Sample Input
```text
4 4
1 2
2 4
1 3
3 4
2 4 1 3
```

### Sample Output
```text
YES NO NO NO
```

### Sample Explanation
After road 2 closes, 1–3–4 still works; closing road 4 cuts it.

### Target
O((n + m) α(n)).

### Hints
1. DSU supports adding edges, not deleting them.
2. Process the closures backwards: start with no roads and add them in reverse closing order.

### Approach
Reverse the timeline: answer i is the connectivity with roads closed after position i still present.

### Naive Pitfall
Running BFS after every closure costs O(m·(n + m)) ≈ 8·10^10.

### Solution
```cpp
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>
using namespace std;

vector<int> parent, sz;
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;
    sz[a] += sz[b];
}

int main() {
    int n, m;
    cin >> n >> m;
    vector<pair<int, int>> road(m + 1);
    for (int i = 1; i <= m; ++i) cin >> road[i].first >> road[i].second;
    vector<int> order(m);
    for (auto& x : order) cin >> x;
    parent.resize(n + 1);
    sz.assign(n + 1, 1);
    iota(parent.begin(), parent.end(), 0);
    vector<char> answer(m);
    for (int i = m - 1; i >= 0; --i) {
        answer[i] = find(1) == find(n);          // roads order[i+1..] are present
        unite(road[order[i]].first, road[order[i]].second);
    }
    for (int i = 0; i < m; ++i) cout << (answer[i] ? "YES" : "NO") << (i + 1 < m ? ' ' : '\n');
}
```

### Explanation
Deletions in time become insertions when time runs backwards, and DSU handles insertions in near-constant time.

### Edge Cases
- City 1 and n never connected: all NO.

### Tests
#### Direct road only
```text
2 1
1 2
1
```
```text
NO
```

## DSA-C16 · Limit Order Book
**Difficulty:** Hard · **Subtopic:** Two heaps with price-time priority · **Tags:** heap, matching, simulation · **Source:** Original
**Modules:** 10, 14

### Statement
Orders arrive in sequence: `buy p q` or `sell p q`. A buy matches resting sells with price ≤ p, cheapest first (ties: oldest first); a sell matches resting buys with price ≥ p, highest first (ties: oldest). Each match trades at the resting order's price and prints `TRADE price qty`. Unfilled quantity rests. Finally print the best bid and best ask (`NONE` if empty).

### Input
q, then q orders.

### Output
Trades, then the final line.

### Constraints
- 1 ≤ q ≤ 2·10^5, 1 ≤ p, q ≤ 10^9

### Sample Input
```text
5
sell 100 5
sell 101 3
buy 99 4
buy 101 6
sell 98 5
```

### Sample Output
```text
TRADE 100 5
TRADE 101 1
TRADE 99 4
NONE 98
```

### Sample Explanation
The buy at 101 takes all 5 at 100 and 1 at 101; the sell at 98 fills the resting buy at 99, then rests with 1 unit.

### Target
O(q log q).

### Hints
1. Bids in a max-heap of (price, −sequence), asks in a min-heap of (price, sequence).
2. Modify the top's remaining quantity by popping and re-pushing, or store quantities in an array indexed by sequence.

### Approach
Two heaps of (price, sequence) with quantities stored per sequence number.

### Naive Pitfall
Keeping orders in a list and scanning for the best price is O(q) per order, O(q²) overall.

### Solution
```cpp
#include <functional>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int q;
    cin >> q;
    vector<long long> left(q, 0);                                         // remaining quantity by sequence
    priority_queue<pair<long long, long long>> bids;                      // (price, -seq)
    priority_queue<pair<long long, long long>, vector<pair<long long, long long>>, greater<pair<long long, long long>>> asks;   // (price, seq)
    for (int s = 0; s < q; ++s) {
        string side;
        long long price, qty;
        cin >> side >> price >> qty;
        if (side == "buy") {
            while (qty > 0 && !asks.empty() && asks.top().first <= price) {
                auto [ap, seq] = asks.top();
                long long traded = min(qty, left[seq]);
                cout << "TRADE " << ap << ' ' << traded << '\n';
                qty -= traded;
                left[seq] -= traded;
                if (left[seq] == 0) asks.pop();
            }
            if (qty > 0) { left[s] = qty; bids.push({price, -s}); }
        } else {
            while (qty > 0 && !bids.empty() && bids.top().first >= price) {
                auto [bp, negSeq] = bids.top();
                long long seq = -negSeq;
                long long traded = min(qty, left[seq]);
                cout << "TRADE " << bp << ' ' << traded << '\n';
                qty -= traded;
                left[seq] -= traded;
                if (left[seq] == 0) bids.pop();
            }
            if (qty > 0) { left[s] = qty; asks.push({price, s}); }
        }
    }
    cout << (bids.empty() ? "NONE" : to_string(bids.top().first)) << ' ' << (asks.empty() ? "NONE" : to_string(asks.top().first)) << '\n';
}
```

### Explanation
Heaps give the best price instantly; including the sequence number gives time priority among equal prices. Each order is pushed and popped at most once.

### Edge Cases
- Orders that never cross: no trades.

### Tests
#### No trades
```text
2
buy 5 1
sell 6 1
```
```text
5 6
```

## DSA-C17 · Nearest Available Driver
**Difficulty:** Medium · **Subtopic:** Ordered set queries · **Tags:** ordered set, BST, lower bound · **Source:** Original
**Modules:** 15, 17

### Statement
Drivers wait at positions on a straight road. `add p` adds a driver; `request x` assigns and removes the nearest driver (ties: smaller position) and prints its position, or `NONE`.

### Input
q, then q operations.

### Output
One line per request.

### Constraints
- 1 ≤ q ≤ 2·10^5, 0 ≤ positions ≤ 10^9 (several drivers may share a position)

### Sample Input
```text
7
add 10
add 20
add 30
request 24
request 24
request 0
request 5
```

### Sample Output
```text
20
30
10
NONE
```

### Sample Explanation
For 24, 20 is 4 away and 30 is 6 away.

### Target
O(log n) per operation.

### Hints
1. A balanced BST (`multiset`) gives the first driver ≥ x and its predecessor.
2. Compare the two candidates.

### Approach
`multiset::lower_bound` and its predecessor.

### Naive Pitfall
Scanning all drivers per request is O(q²) = 4·10^10.

### Solution
```cpp
#include <iostream>
#include <iterator>
#include <set>
#include <string>
using namespace std;

int main() {
    int q;
    cin >> q;
    multiset<long long> drivers;
    while (q--) {
        string op;
        long long x;
        cin >> op >> x;
        if (op == "add") { drivers.insert(x); continue; }
        if (drivers.empty()) { cout << "NONE\n"; continue; }
        auto right = drivers.lower_bound(x);
        auto best = right;
        if (right == drivers.end() || (right != drivers.begin() && x - *prev(right) <= *right - x)) best = prev(right);
        cout << *best << '\n';
        drivers.erase(best);                         // erase this one driver only
    }
}
```

### Explanation
Only the two drivers around x can be nearest; the ordered set finds them in O(log n). Erasing by iterator removes a single driver at a shared position.

### Edge Cases
- x beyond all drivers.

### Tests
#### Shared position
```text
4
add 5
add 5
request 5
request 100
```
```text
5
5
```

## DSA-C18 · Building Evacuation
**Difficulty:** Hard · **Subtopic:** Multi-source BFS on grids · **Tags:** BFS, grid, multi-source · **Source:** Original
**Modules:** 07, 13

### Statement
A floor plan has exits `E`, people `P`, walls `#` and open cells `.` (people stand on open floor). Everyone walks to the nearest exit simultaneously, one cell per second. Print the time until everyone is out (0 if no people), or −1 if someone cannot reach any exit.

### Input
R C, then the grid.

### Output
The evacuation time or −1.

### Constraints
- 1 ≤ R, C ≤ 1000

### Sample Input
```text
3 4
P..E
.#..
P..P
```

### Sample Output
```text
5
```

### Sample Explanation
The bottom-left person needs 5 moves.

### Target
O(R·C).

### Hints
1. Run BFS from all exits at once instead of from every person.
2. The answer is the largest distance among people.

### Approach
Multi-source grid BFS.

### Naive Pitfall
A BFS per person costs O(people · R · C), up to 10^12.

### Solution
```cpp
#include <algorithm>
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    int r, c;
    cin >> r >> c;
    vector<string> g(r);
    for (auto& row : g) cin >> row;
    vector<vector<int>> dist(r, vector<int>(c, -1));
    queue<pair<int, int>> q;
    for (int i = 0; i < r; ++i)
        for (int j = 0; j < c; ++j)
            if (g[i][j] == 'E') { dist[i][j] = 0; q.push({i, j}); }
    const int dr[] = {1, -1, 0, 0}, dc[] = {0, 0, 1, -1};
    while (!q.empty()) {
        auto [x, y] = q.front(); q.pop();
        for (int d = 0; d < 4; ++d) {
            int nx = x + dr[d], ny = y + dc[d];
            if (nx < 0 || nx >= r || ny < 0 || ny >= c || g[nx][ny] == '#' || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
    int answer = 0;
    for (int i = 0; i < r; ++i)
        for (int j = 0; j < c; ++j)
            if (g[i][j] == 'P') {
                if (dist[i][j] == -1) { cout << -1 << '\n'; return 0; }
                answer = max(answer, dist[i][j]);
            }
    cout << answer << '\n';
}
```

### Explanation
Distances are symmetric, so BFS from the exits computes every person's distance to their nearest exit in one pass.

### Edge Cases
- Trapped person: −1. No people: 0.

### Tests
#### Trapped
```text
1 3
P#E
```
```text
-1
```

## DSA-C19 · Calculator with Variables
**Difficulty:** Hard · **Subtopic:** Expression evaluation with a symbol table · **Tags:** stack, hash map, parsing · **Source:** Original
**Modules:** 09, 17

### Statement
Process lines `let name = expr` and `print expr`. Expressions contain non-negative integers, lowercase variable names, + − * / (truncating) and parentheses, separated by spaces or not. Printing an expression that uses an undefined variable prints `ERROR`. Division by zero never happens.

### Input
q, then q lines.

### Output
One line per `print`.

### Constraints
- 1 ≤ q ≤ 10^4, line length ≤ 1000, values fit in `long long`

### Sample Input
```text
4
let a = 3
let b = a * (2 + 4)
print b - a
print c + 1
```

### Sample Output
```text
15
ERROR
```

### Sample Explanation
b = 18, so b − a = 15; c is undefined.

### Target
O(line length) per line.

### Hints
1. Evaluate with two stacks (values and operators) as in DSA09-M02.
2. Look variables up in a hash map; flag an error instead of crashing.

### Approach
Shunting-yard evaluation with a symbol table.

### Naive Pitfall
Re-evaluating every variable's defining expression on each use (textual substitution) can grow exponentially with chains of definitions; storing values avoids that.

### Solution
```cpp
#include <cctype>
#include <iostream>
#include <sstream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

unordered_map<string, long long> vars;

int prec(char op) { return (op == '*' || op == '/') ? 2 : (op == '+' || op == '-') ? 1 : 0; }

bool evaluate(const string& s, long long& result) {
    vector<long long> vals;
    vector<char> ops;
    auto apply = [&]() {
        long long b = vals.back(); vals.pop_back();
        long long a = vals.back(); vals.pop_back();
        char op = ops.back(); ops.pop_back();
        vals.push_back(op == '+' ? a + b : op == '-' ? a - b : op == '*' ? a * b : a / b);
    };
    for (size_t i = 0; i < s.size(); ++i) {
        char c = s[i];
        if (c == ' ') continue;
        if (isdigit(static_cast<unsigned char>(c)) || isalpha(static_cast<unsigned char>(c))) {
            string tok;
            while (i < s.size() && isalnum(static_cast<unsigned char>(s[i]))) tok += s[i++];
            --i;
            if (isdigit(static_cast<unsigned char>(tok[0]))) vals.push_back(stoll(tok));
            else {
                auto it = vars.find(tok);
                if (it == vars.end()) return false;
                vals.push_back(it->second);
            }
        } else if (c == '(') ops.push_back(c);
        else if (c == ')') { while (ops.back() != '(') apply(); ops.pop_back(); }
        else {
            while (!ops.empty() && ops.back() != '(' && prec(ops.back()) >= prec(c)) apply();
            ops.push_back(c);
        }
    }
    while (!ops.empty()) apply();
    result = vals.back();
    return true;
}

int main() {
    int q;
    cin >> q;
    string line;
    getline(cin, line);
    while (q--) {
        getline(cin, line);
        istringstream in(line);
        string cmd;
        in >> cmd;
        long long value;
        if (cmd == "let") {
            string name, eq;
            in >> name >> eq;
            string rest;
            getline(in, rest);
            if (evaluate(rest, value)) vars[name] = value;
        } else {
            string rest;
            getline(in, rest);
            if (evaluate(rest, value)) cout << value << '\n';
            else cout << "ERROR\n";
        }
    }
}
```

### Explanation
The stacks handle precedence and parentheses; the hash map gives O(1) variable lookups.

### Edge Cases
- Redefining a variable.

### Tests
#### Redefine
```text
3
let x = 2
let x = x * x
print x
```
```text
4
```

## DSA-C20 · Cache Hit Ratio
**Difficulty:** Medium · **Subtopic:** LRU simulation · **Tags:** cache, linked list, hash map · **Source:** Original
**Modules:** 02, 08

### Statement
Simulate an LRU cache of capacity c over a sequence of page requests and print the number of hits and misses.

### Input
c n, then n page ids.

### Output
Hits and misses.

### Constraints
- 1 ≤ c ≤ 10^5, 1 ≤ n ≤ 2·10^5

### Sample Input
```text
2 6
1 2 1 3 2 1
```

### Sample Output
```text
1 5
```

### Sample Explanation
Only the second request for 1 hits; later 3, 2 and 1 each evict another page.

### Target
O(n) expected.

### Hints
1. List ordered by recency, map from page to list node (DSA02-H01).
2. A miss with a full cache evicts the list's back.

### Approach
`std::list` plus `unordered_map`.

### Naive Pitfall
Keeping pages in a vector and searching/erasing on every request is O(c) per request, O(n·c) = 2·10^10.

### Solution
```cpp
#include <iostream>
#include <list>
#include <unordered_map>
using namespace std;

int main() {
    size_t c;
    int n;
    cin >> c >> n;
    list<long long> order;                                          // front = most recent
    unordered_map<long long, list<long long>::iterator> where;
    long long hits = 0, misses = 0;
    for (int i = 0; i < n; ++i) {
        long long page;
        cin >> page;
        auto it = where.find(page);
        if (it != where.end()) {
            ++hits;
            order.splice(order.begin(), order, it->second);
        } else {
            ++misses;
            order.push_front(page);
            where[page] = order.begin();
            if (order.size() > c) { where.erase(order.back()); order.pop_back(); }
        }
    }
    cout << hits << ' ' << misses << '\n';
}
```

### Explanation
The combination of a hash map and a doubly linked list makes every request O(1).

### Edge Cases
- Capacity larger than the number of distinct pages.

### Tests
#### Large capacity
```text
5 4
1 1 1 1
```
```text
3 1
```

## DSA-C21 · Exam ID Audit
**Difficulty:** Medium · **Subtopic:** Radix sort for 64-bit keys · **Tags:** radix sort, duplicates, sorting · **Source:** Original
**Modules:** 07, 16D

### Statement
n exam scripts carry 64-bit IDs. Print the number of distinct IDs, then the IDs that appear more than once in increasing order (or `NONE`).

### Input
n, then n IDs.

### Output
Two lines.

### Constraints
- 1 ≤ n ≤ 10^6, 0 ≤ IDs < 2^63

### Sample Input
```text
6
2025001 2025003 2025001 2024999 2025003 2025003
```

### Sample Output
```text
3
2025001 2025003
```

### Sample Explanation
2025001 twice, 2025003 three times.

### Target
O(n) with radix sort.

### Hints
1. Sort the IDs (16-bit radix passes keep it linear).
2. Equal IDs are then adjacent.

### Approach
Four radix passes, then a scan.

### Naive Pitfall
Comparing every pair of IDs is O(n²) = 10^12.

### Solution
```cpp
#include <cstdint>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<uint64_t> a(n), out(n);
    for (auto& x : a) cin >> x;
    for (int shift = 0; shift < 64; shift += 16) {
        vector<int> count(65537, 0);
        for (auto x : a) ++count[((x >> shift) & 0xFFFF) + 1];
        for (int d = 1; d <= 65536; ++d) count[d] += count[d - 1];
        for (auto x : a) out[count[(x >> shift) & 0xFFFF]++] = x;
        a.swap(out);
    }
    long long distinct = 0;
    vector<uint64_t> dup;
    for (int i = 0; i < n; ++i) {
        if (i == 0 || a[i] != a[i - 1]) ++distinct;
        else if (dup.empty() || dup.back() != a[i]) dup.push_back(a[i]);
    }
    cout << distinct << '\n';
    if (dup.empty()) cout << "NONE\n";
    for (size_t i = 0; i < dup.size(); ++i) cout << dup[i] << (i + 1 < dup.size() ? ' ' : '\n');
}
```

### Explanation
Radix sort is linear in n for fixed-width keys; after sorting, duplicates are detected by comparing neighbours.

### Edge Cases
- All distinct: NONE.

### Tests
#### All distinct
```text
2
5 6
```
```text
2
NONE
```

## DSA-C22 · Organisation Chart Analytics
**Difficulty:** Hard · **Subtopic:** Tree aggregation · **Tags:** tree, parent array, BFS levels · **Source:** Original
**Modules:** 11, 13

### Statement
Employees 0..n−1 report to managers (employee 0 is the CEO with manager −1; every manager has a smaller number). Print the organisation level (depth) with the most employees and its size (ties: smaller level), then answer queries: the size of an employee's whole team (including themselves).

### Input
n; the managers; q and q employees.

### Output
The busiest level and its size, then one team size per query.

### Constraints
- 1 ≤ n ≤ 2·10^5, 1 ≤ q ≤ 2·10^5

### Sample Input
```text
6
-1 0 0 1 1 2
2
1
0
```

### Sample Output
```text
2 3
3
6
```

### Sample Explanation
Level 2 holds employees 3, 4 and 5; employee 1 leads 1, 3 and 4.

### Target
O(n + q).

### Hints
1. Depths follow in index order because managers come first.
2. Subtree sizes accumulate from the highest index downwards.

### Approach
Two linear passes over the parent array.

### Naive Pitfall
Answering each team query with a DFS costs O(n) per query, O(n·q) = 4·10^10.

### Solution
```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> boss(n), depth(n, 0);
    vector<long long> team(n, 1);
    for (auto& b : boss) cin >> b;
    vector<long long> perLevel(n, 0);
    for (int i = 0; i < n; ++i) {
        if (boss[i] != -1) depth[i] = depth[boss[i]] + 1;
        ++perLevel[depth[i]];
    }
    for (int i = n - 1; i >= 1; --i) team[boss[i]] += team[i];
    int bestLevel = 0;
    for (int d = 1; d < n; ++d) if (perLevel[d] > perLevel[bestLevel]) bestLevel = d;
    cout << bestLevel << ' ' << perLevel[bestLevel] << '\n';
    int q;
    cin >> q;
    while (q--) { int e; cin >> e; cout << team[e] << '\n'; }
}
```

### Explanation
The index ordering gives a topological order of the tree, so depths and subtree sizes need no recursion.

### Edge Cases
- Only the CEO.

### Tests
#### CEO only
```text
1
-1
1
0
```
```text
0 1
1
```

## DSA-C23 · Room Booking System
**Difficulty:** Medium · **Subtopic:** Interval search in a BST · **Tags:** ordered map, BST, intervals · **Source:** Original
**Modules:** 02, 15

### Statement
A seminar room accepts bookings [s, e). For each request print `OK` (and store it) if it does not overlap any accepted booking, otherwise `CONFLICT`. Touching bookings are fine.

### Input
q, then q lines s e.

### Output
One line per request.

### Constraints
- 1 ≤ q ≤ 2·10^5, 0 ≤ s < e ≤ 10^9

### Sample Input
```text
5
10 20
15 25
20 30
5 10
1 6
```

### Sample Output
```text
OK
CONFLICT
OK
OK
CONFLICT
```

### Sample Explanation
[1, 6) overlaps [5, 10).

### Target
O(log n) per request.

### Hints
1. Accepted bookings never overlap, so only the neighbours by start time matter.
2. Check the next booking (start < e) and the previous one (end > s).

### Approach
`map<start, end>` with `lower_bound`.

### Naive Pitfall
Checking every accepted booking makes the system O(q²) = 4·10^10.

### Solution
```cpp
#include <iostream>
#include <iterator>
#include <map>
using namespace std;

int main() {
    int q;
    cin >> q;
    map<long long, long long> booked;                      // start -> end
    while (q--) {
        long long s, e;
        cin >> s >> e;
        auto next = booked.lower_bound(s);
        bool clash = (next != booked.end() && next->first < e) ||
                     (next != booked.begin() && prev(next)->second > s);
        if (clash) cout << "CONFLICT\n";
        else { booked[s] = e; cout << "OK\n"; }
    }
}
```

### Explanation
Disjoint intervals sorted by start are also sorted by end, so the predecessor and successor are the only possible conflicts.

### Edge Cases
- Identical request twice.

### Tests
#### Duplicate
```text
2
1 2
1 2
```
```text
OK
CONFLICT
```

## DSA-C24 · Students in Several Clubs
**Difficulty:** Hard · **Subtopic:** k-way merge with counting · **Tags:** heap, merging, sets · **Source:** Original
**Modules:** 14, 16B, 17

### Statement
k clubs publish sorted member lists (no repeats within a club). Print, in increasing order, the students who belong to at least t clubs (or `NONE`).

### Input
k t; then k lines: length and the sorted ids.

### Output
The qualifying students.

### Constraints
- 1 ≤ k ≤ 10^4, total ids ≤ 2·10^5

### Sample Input
```text
3 2
3 1 3 5
3 3 4 5
2 5 6
```

### Sample Output
```text
3 5
```

### Sample Explanation
3 is in two clubs, 5 in three.

### Target
O(N log k).

### Hints
1. Merge the lists with a min-heap of heads.
2. Equal ids come out consecutively: count each run.

### Approach
Heap-based k-way merge with run counting.

### Naive Pitfall
Checking each student against every list by linear search is O(N·N), far too slow; even a hash map works but loses the sorted streaming property the merge provides for free.

### Solution
```cpp
#include <functional>
#include <iostream>
#include <queue>
#include <tuple>
#include <vector>
using namespace std;

int main() {
    int k, t;
    cin >> k >> t;
    vector<vector<long long>> club(k);
    for (auto& c : club) { int len; cin >> len; c.resize(len); for (auto& x : c) cin >> x; }
    using T = tuple<long long, int, int>;
    priority_queue<T, vector<T>, greater<T>> heap;
    for (int i = 0; i < k; ++i) if (!club[i].empty()) heap.emplace(club[i][0], i, 0);
    vector<long long> result;
    long long current = -1;
    int run = 0;
    while (!heap.empty()) {
        auto [id, i, j] = heap.top();
        heap.pop();
        if (id != current) {
            if (run >= t) result.push_back(current);
            current = id;
            run = 0;
        }
        ++run;
        if (j + 1 < static_cast<int>(club[i].size())) heap.emplace(club[i][j + 1], i, j + 1);
    }
    if (run >= t) result.push_back(current);
    if (result.empty()) cout << "NONE\n";
    for (size_t i = 0; i < result.size(); ++i) cout << result[i] << (i + 1 < result.size() ? ' ' : '\n');
}
```

### Explanation
The merged stream is sorted, so each student's memberships appear as one run whose length is the club count.

### Edge Cases
- t larger than k: NONE.

### Tests
#### Too demanding
```text
2 3
1 1
1 1
```
```text
NONE
```

## DSA-C25 · Duplicate Document Groups
**Difficulty:** Hard · **Subtopic:** Hashing plus union-find · **Tags:** union-find, hashing, sorting, strings · **Source:** Original
**Modules:** 07, 16A, 17

### Statement
Each document is a single word. Two documents are duplicates if they are anagrams of each other, or if a moderator declared them duplicates; duplication is transitive. Print the number of groups and the size of the largest group.

### Input
n; n words; p and p declared pairs (1-based).

### Output
Groups and largest size.

### Constraints
- 1 ≤ n ≤ 2·10^5, total letters ≤ 10^6, 0 ≤ p ≤ 2·10^5

### Sample Input
```text
5
listen silent enlist google banana
1
4 5
```

### Sample Output
```text
2 3
```

### Sample Explanation
The three anagrams form one group; the declared pair forms the other.

### Target
O(L log 26 + (n + p) α(n)).

### Hints
1. Sorting a word's letters gives an anagram key; equal keys mean anagrams.
2. Union each document with the first document that had the same key, then with declared pairs.

### Approach
Hash map from sorted word to first index, plus DSU.

### Naive Pitfall
Comparing every pair of documents for anagrams is O(n²·len) ≈ 4·10^10 comparisons.

### Solution
```cpp
#include <algorithm>
#include <iostream>
#include <numeric>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>
using namespace std;

vector<int> parent, sz;
int find(int x) { while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
void unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return;
    if (sz[a] < sz[b]) swap(a, b);
    parent[b] = a;
    sz[a] += sz[b];
}

int main() {
    int n;
    cin >> n;
    parent.resize(n + 1);
    sz.assign(n + 1, 1);
    iota(parent.begin(), parent.end(), 0);
    unordered_map<string, int> firstWithKey;
    for (int i = 1; i <= n; ++i) {
        string w;
        cin >> w;
        sort(w.begin(), w.end());                    // anagram key
        auto [it, inserted] = firstWithKey.emplace(w, i);
        if (!inserted) unite(i, it->second);
    }
    int p;
    cin >> p;
    for (int i = 0; i < p; ++i) { int a, b; cin >> a >> b; unite(a, b); }
    int groups = 0, largest = 0;
    for (int i = 1; i <= n; ++i)
        if (find(i) == i) { ++groups; largest = max(largest, sz[i]); }
    cout << groups << ' ' << largest << '\n';
}
```

### Explanation
Hashing finds anagram classes in near-linear time, and DSU merges them with declared pairs while respecting transitivity.

### Edge Cases
- No declared pairs.

### Tests
#### No pairs
```text
3
ab ba cd
0
```
```text
2 2
```
