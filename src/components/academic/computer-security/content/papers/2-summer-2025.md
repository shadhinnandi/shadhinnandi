# Summer 2025

**Exam:** Final Exam, Summer 2025
**Course:** CSE 4531: Computer Security
**Total marks:** 40
**Time:** 2 hours

## 1(a) [3]
**Topics:** 06

### Question
Bob and Simon are working on a secure messaging app for their university project. They want to make sure that whenever Bob sends a message to Simon, he can verify that the message truly came from Bob and that it was not modified during transmission. To achieve this, they decide to use a special Authentication mechanism. Explain how this particular mechanism helps Bob and Simon ensure both message integrity and authenticity in their communication. Support your explanation with a suitable diagram showing the working process of the mechanism.

### Solution
The mechanism is a **digital signature**: a hash of the message encrypted with the sender's private key.

**Working process:**
1. **Bob signs:** he computes the hash h = H(m) and encrypts it with **his private key**: S = h<sup>d</sup> mod n. He sends (m, S).
2. **Simon verifies:** he computes h = H(m) from the received message, and decrypts the signature with **Bob's public key**: h′ = S<sup>e</sup> mod n.
3. If **h = h′**, the message is accepted. Otherwise it is rejected.

```seq
Bob | Simon
Bob: h = H(m); S = h^{d} mod n (Bob's private key)
Bob -> Simon: message m + signature S
Simon: h = H(m); h′ = S^{e} mod n (Bob's public key)
Simon: h = h′ means valid
```

**Integrity:** if anyone changes m on the way, Simon's hash h changes and no longer matches h′.

**Authenticity:** only Bob has his private key, so only Bob can make a signature that opens correctly with Bob's public key. It also gives **non-repudiation**: Bob cannot later deny sending the message.

## 1(b) [3]
**Topics:** 13

### Question
What is a Ransomware attack? What is its impact on the victim? How can you prevent such an attack?

### Solution
**Ransomware** is malware that **encrypts the victim's files or locks the system** and demands a ransom payment (often in cryptocurrency) for the decryption key. It usually enters through phishing emails, infected downloads or unpatched software.

**Impact on the victim:**
- Important files and systems become unavailable (loss of **availability**).
- Work or services stop, for example a hospital or a business.
- Money is lost on ransom and recovery; paying does not guarantee the files come back.
- Data may also be stolen and leaked, damaging reputation.

**Prevention:**
- Regular **offline / offsite backups** that are tested.
- Keep the OS and software **patched**.
- **Email filtering** and user training against phishing; do not open unknown attachments.
- Anti-virus / endpoint protection and least privilege for users.

## 1(c) [4]
**Topics:** 01

### Question
What is the number of 10-character passwords that could be constructed from a character set that includes all 128 characters in the ASCII character set. How long, on average, would it take an attacker to guess such a password if he could test a password every microsecond?

### Solution
**Given:** character set c = 128, length L = 10, time per guess = 1 µs = 10<sup>−6</sup> s.

**Number of passwords**

```calc
Number of passwords = c^{L}
                    = 128^{10}
                    = (2^{7})^{10}
                    = 2^{70}
                    = 1180591620717411303424
∴ Number of passwords = 2^{70} ≈ 1.18 × 10^{21}
```

**Average time.** On average the attacker finds the password after trying **half** of all passwords.

```calc
Average guesses = 2^{70} / 2
                = 2^{69}
                = 590295810358705651712
# Time at one guess per microsecond
Average time = 2^{69} µs
             ≈ 5.9 × 10^{20} µs
             ≈ 5.9 × 10^{14} seconds
             ≈ 5.9 × 10^{14} / 31536000 years   [1 year = 365 × 24 × 3600 = 31536000 s]
             ≈ 1.87 × 10^{7} years
∴ Average time ≈ 18.7 million years
```

Trying all passwords (the worst case) would take twice as long, about 37.4 million years.

## 2(a) [3]
**Topics:** 11, 01

### Question
Consider that you have just got a call from the University Hall administrator, who notified that either you or your roommate is issuing denial-of-service attacks against other students from your shared network segment. You know you are not doing this, but you are unsure about your roommate. How can you tell if this accusation is true or not? And if it is true, what should you do about it?

### Solution
**How to check:**
1. **Check my own computer first:** look at running processes and network usage for unknown programs or very high outgoing traffic, and run a full anti-virus / anti-malware scan. My PC may be an infected **bot** without my knowledge.
2. **Observe the shared segment:** with permission, use a network monitor (e.g. Wireshark) to see which MAC/IP addresses send unusually heavy or repeated traffic to other students.
3. **Compare with the administrator's logs:** ask which source MAC and IP addresses the attack traffic came from, and compare them with my and my roommate's devices. Note that addresses can be spoofed, so look at the traffic pattern too.

**If the accusation is true:**
- **If it is my computer (infected):** disconnect it from the network, remove the malware or reinstall the OS, patch everything, change passwords, and inform the administrator.
- **If it is my roommate:** do not take part; ask them to stop and report it to the hall administrator, and cooperate with the investigation by sharing the evidence. Keep my own device secured (firewall, updates, separate network access if possible).

## 2(b) [3]
**Topics:** 14

### Question
Explain stack smashing attacks with an example. How to protect such attacks?

### Solution
**Stack smashing** is a stack-based buffer overflow. A local buffer on the stack is filled with more data than its size, and the extra data overwrites the values above it, including the saved **return address**. When the function returns, control goes to a location chosen by the input instead of the real caller, so the program crashes or runs unintended code.

```text
High memory   | return address       |  <- overwritten
              | saved frame pointer  |
              | buf[8]               |  <- long input written here, upward
Low memory
```

**Example:**

```c
void login(char *input) {
    char buf[8];
    strcpy(buf, input);   /* no length check */
}
```

**Protection:**
- Bounds checking and safe functions (`fgets`, `snprintf`).
- **Stack canaries** that detect the overwrite before the function returns.
- **Non-executable stack (NX/DEP)** and **ASLR**.
- Memory-safe languages, code review and testing.

## 2(c) [4]
**Topics:** 12

### Question
How is an encrypted virus formed by the attackers? How can you detect encrypted viruses? Explain briefly.

### Solution
**Formation of an encrypted virus:**
- The virus has two parts: a small **decryption engine** and an **encrypted virus body**.
- For each new copy, a new **random key** is chosen and the body is encrypted with it, so the body bytes look different in every infected file.
- When the infected file runs, the decryption engine decrypts the body in memory and then the virus runs.

```text
[ Decryption engine (same in each copy) ][ Virus body encrypted with key k1 ]
[ Decryption engine (same in each copy) ][ Virus body encrypted with key k2 ]
```

Since the body changes every time, scanning for the body's signature does not work.

**Detection:**
1. **Signature of the decryption engine:** the engine stays the same in every copy, so scanners look for its pattern.
2. **Generic decryption / emulation:** the scanner runs the file in a CPU emulator for some instructions. The virus decrypts itself inside the emulator, and the decrypted body is matched with known signatures.
3. **Heuristic analysis:** suspicious code or behaviour (such as self-decrypting code) is flagged.
4. **Integrity checking:** changes in file size or checksum show that a file was infected.

## 3(a) [3]
**Topics:** 15

### Question
Explain CSRF attack on a website with necessary steps. What is its impact on the victim?

### Solution
**CSRF (Cross-Site Request Forgery)** tricks a logged-in user's browser into sending an unwanted request to a trusted website. The site accepts it because the browser automatically includes the user's session cookie.

**Steps:**
1. The victim logs in to a website (e.g. a bank) and the session stays active.
2. The victim opens a malicious page or link made by the attacker.
3. That page silently makes the victim's browser send a request to the bank (e.g. "transfer money" or "change email").
4. The browser attaches the valid session cookie.
5. The bank thinks the victim sent it and performs the action.

**Impact:** unwanted money transfers, changed email or password leading to account takeover, purchases or settings changed in the victim's name, without the victim knowing.

**Prevention (brief):** anti-CSRF tokens, SameSite cookies, Origin/Referer checks, re-authentication for sensitive actions.

## 3(b) [3]
**Topics:** 15

### Question
A website displays user-submitted content (e.g., comments, reviews, or profile bios). An attacker posts a comment that contains malicious JavaScript. Whenever any user views the page, the malicious script runs inside their browser.

Identify the type of attack described in this scenario and explain how it works. List three defensive controls the web team should apply (briefly justify each).

### Solution
**Attack: Stored (persistent) Cross-Site Scripting (XSS).**

**How it works:** the site saves the comment without sanitizing or encoding it, and later includes it in the page as it is. Every visitor's browser receives the script as part of the trusted site and runs it. The script can steal session cookies (session hijacking), change the page, or trick users into giving private information.

**Three defensive controls:**
1. **Output encoding / escaping:** convert characters like `<` and `>` to `&lt;` and `&gt;` before showing user content, so the browser shows it as text and never runs it.
2. **Input validation and sanitization:** allow only safe content (whitelist) and remove script tags and event handlers, so malicious code is not stored.
3. **Content Security Policy (CSP) and HttpOnly cookies:** CSP blocks inline and untrusted scripts from running; HttpOnly stops scripts from reading session cookies, limiting the damage.

## 3(c) [4]
**Topics:** 10

### Question
How can an attacker launch a TCP SYN flooding attack? Explain with respect to the message flow diagram. How can you mitigate such an attack?

### Solution
**SYN flooding** is a DoS attack on the TCP three-way handshake.

**Normal handshake:** client sends SYN, server replies SYN-ACK and stores a half-open entry, client sends ACK and the connection opens.

**In a SYN flood (concept):** the attacker sends a large number of SYNs, usually with **spoofed source IPs**, and never completes the handshake. Each SYN leaves a half-open entry in the server's backlog queue until it times out. The queue fills, and real users' SYNs are refused.

```seq
Attacker | Server | User
Attacker -> Server: SYN (spoofed source)
Server -> Attacker: SYN-ACK
Server: half-open entry stored, waits for ACK
Attacker: final ACK never sent; many more SYNs follow
Server: backlog queue full
User -> Server: SYN
Server: cannot accept, service denied
```

**Mitigation:**
- **SYN cookies:** the server stores nothing on a SYN; it encodes the connection details in the SYN-ACK sequence number (HMAC of secret key, IPs, ports, time) and allocates memory only when a valid ACK returns.
- Larger backlog queue and shorter SYN-ACK timeout.
- Rate-limit SYNs per source and filter spoofed IPs (ingress filtering).
- Firewalls or DDoS protection services that absorb SYN floods.

## 4(a) [3]
**Topics:** 02

### Question
Calculate the following big moduli: 101<sup>735</sup> mod 17

### Solution
First reduce the base, then use the fact that its square is 1.

```calc
101 mod 17 = 16   [17 × 5 = 85, 101 − 85 = 16]
16^{2} mod 17 = 256 mod 17 = 1   [17 × 15 = 255]
```

Since 735 = 2 × 367 + 1:

```calc
101^{735} mod 17 = 16^{735} mod 17
                 = (16^{2})^{367} × 16 mod 17
                 = 1^{367} × 16 mod 17
                 = 16
∴ 101^{735} mod 17 = 16
```

(Check with Fermat: 17 is prime, so 101<sup>16</sup> mod 17 = 1, and 735 = 16 × 45 + 15, giving 16<sup>15</sup> mod 17 = 16 again.)

## 4(b) [3]
**Topics:** 06

### Question
What is the main role of Certification Authority (CA) in digital signature? What will happen if CA is absent?

### Solution
**Main role of a CA:**
- A CA is a **trusted third party** that verifies a person's or organisation's identity.
- It issues a **digital certificate** that binds the owner's name to their **public key**, and signs it with the **CA's private key**.
- Anyone can check the certificate with the CA's trusted public key, so they know a public key really belongs to its owner before using it to verify signatures.
- It also revokes certificates of compromised keys.

**If the CA is absent:**
- There is no way to prove that a public key belongs to the claimed person.
- An attacker can publish a **fake public key** in someone's name, forge signatures that appear valid, and impersonate them.
- **Man-in-the-middle** attacks become easy.
- **Non-repudiation** fails, because a signer can claim the key was never theirs.

## 4(c) [4]
**Topics:** 04, 02

### Question
Alice wants to use RSA for secure communication. She chooses two prime numbers, p=17 and q=13.

Determine a suitable public key (e) for Alice (Take the smallest possible key permitted by the algorithm), the private key (d). Then, encrypt the message m=43 with the public key to compute the ciphertext. And verify that decryption retrieves the original message.

### Solution
**Given values**

```calc
p = 17
q = 13
n = p × q = 17 × 13 = 221
z = (p − 1)(q − 1) = 16 × 12 = 192
m = 43
```

**Smallest public key e.** e must satisfy 1 < e < z and gcd(e, 192) = 1. Since 192 = 2<sup>6</sup> × 3:

- e = 2: shares factor 2. Not allowed.
- e = 3: shares factor 3. Not allowed.
- e = 4: shares factor 2. Not allowed.
- e = 5: gcd(5, 192) = 1. **Allowed.**

So **e = 5**.

**Private key d**

```calc
d = e^{−1} mod z
  = 5^{−1} mod 192
  = (1 + 192 × k) / 5 mod 192
  = (1 + 192 × 2) / 5 mod 192   [k = 1 gives 193, not divisible by 5; k = 2 gives 385]
  = 385 / 5 mod 192
  = 77
∴ d = 77
```

Check: 5 × 77 = 385 = 2 × 192 + 1.

**Encryption**

```calc
C = m^{e} mod n
  = 43^{5} mod 221
  = (43^{2} mod 221)^{2} × 43 mod 221
  = 81^{2} × 43 mod 221   [1849 mod 221 = 81]
  = 152 × 43 mod 221   [6561 mod 221 = 152]
  = 6536 mod 221
  = 127
∴ C = 127
```

**Decryption: M = 127<sup>77</sup> mod 221 by square and multiply**

77 = 64 + 8 + 4 + 1. Square repeatedly, reducing mod 221:

```calc
127^{1} mod 221 = 127
127^{2} mod 221 = 16129 mod 221 = 217
127^{4} mod 221 = 217^{2} mod 221 = 47089 mod 221 = 16
127^{8} mod 221 = 16^{2} mod 221 = 256 mod 221 = 35
127^{16} mod 221 = 35^{2} mod 221 = 1225 mod 221 = 120
127^{32} mod 221 = 120^{2} mod 221 = 14400 mod 221 = 35
127^{64} mod 221 = 35^{2} mod 221 = 1225 mod 221 = 120
```

Multiply the rows for 64, 8, 4 and 1:

```calc
M = C^{d} mod n
  = 127^{77} mod 221
  = 127^{64} × 127^{8} × 127^{4} × 127^{1} mod 221
  = 120 × 35 × 16 × 127 mod 221
  = 127 × 16 mod 221 × 35 × 120 mod 221
  = 43 × 35 × 120 mod 221   [2032 mod 221 = 43]
  = 1505 mod 221 × 120 mod 221
  = 179 × 120 mod 221   [1505 mod 221 = 179]
  = 21480 mod 221
  = 43
∴ M = 43, the original message
```

Public key (e, n) = (5, 221), private key d = 77, ciphertext C = 127, and decryption returns m = 43.
