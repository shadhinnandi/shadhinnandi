# Spring 2026

**Exam:** Final Examination, Spring 2026
**Course:** CSE 4531: Computer Security
**Total marks:** 40
**Time:** 2 hours

## 1(a) [6]
**Topics:** 04, 02

### Question
Alam wants to send the message M=4 to Samir using the RSA cryptosystem. Samir chooses two prime numbers p=3 and q=11. Furthermore,

- Samir computes his public key (n,e) as (33, 7) and sends it to Alam.
- Alam uses this public key to encrypt the message and sends the ciphertext to Samir.
- Samir decrypts the ciphertext using his private key.

Your tasks are given as follows:

a) Compute the ciphertext C from Alam's encryption.

b) Compute the decrypted message M′ from Samir's decryption.

c) Draw a diagram showing the exchange of keys and messages between Alam and Samir.

### Solution
**Given values**

```calc
M = 4
p = 3
q = 11
n = p × q = 3 × 11 = 33
z = (p − 1)(q − 1) = 2 × 10 = 20
e = 7
```

**a) Ciphertext C (at Alam's side)**

```calc
C = M^{e} mod n
  = 4^{7} mod 33
  = (4^{2})^{3} × 4 mod 33
  = 16^{3} × 4 mod 33
  = 4096 mod 33 × 4 mod 33
  = 4 × 4 mod 33   [4096 mod 33 = 4]
  = 16
∴ C = 16
```

**b) Decrypted message M′ (at Samir's side)**

First Samir finds his private key d:

```calc
d = e^{−1} mod z
  = 7^{−1} mod 20
  = (1 + 20 × k) / 7 mod 20
  = (1 + 20 × 1) / 7 mod 20   [k = 1]
  = 21 / 7 mod 20
  = 3
∴ d = 3
```

Check: 7 × 3 = 21 = 20 + 1.

```calc
M′ = C^{d} mod n
   = 16^{3} mod 33
   = 4096 mod 33
   = 4
∴ M′ = 4
```

M′ = M = 4, so Samir recovers Alam's original message.

**c) Exchange of keys and messages**

```seq
Alam | Samir
Samir: p = 3, q = 11; n = 33, z = 20; e = 7, d = 3
Samir -> Alam: public key (n, e) = (33, 7)
Alam: C = 4^{7} mod 33 = 16
Alam -> Samir: ciphertext C = 16
Samir: M′ = 16^{3} mod 33 = 4
```

## 1(b) [4]
**Topics:** 05, 02

### Question
Suppose Host A and Host B are using a platform to setup secure session between them, and they apply the Diffie-Hellman key exchange protocol with the following parameters:

- Public parameters: modulus p = 13, base g = 11
- Private key of A: 10, Private key of B: 9

Generate the shared secret key between Host A and Host B.

### Solution
**Given:** p = 13, g = 11, X<sub>A</sub> = 10, X<sub>B</sub> = 9.

**Public key of A**

```calc
Y_A = g^{X_A} mod p
    = 11^{10} mod 13
    = (11^{2} mod 13)^{5}
    = 4^{5} mod 13   [121 mod 13 = 4]
    = 1024 mod 13
    = 10
```

**Public key of B**

```calc
Y_B = g^{X_B} mod p
    = 11^{9} mod 13
    = (11^{2} mod 13)^{4} × 11 mod 13
    = 4^{4} × 11 mod 13
    = 256 mod 13 × 11 mod 13
    = 9 × 11 mod 13   [256 mod 13 = 9]
    = 99 mod 13
    = 8
```

A sends Y<sub>A</sub> = 10 to B, and B sends Y<sub>B</sub> = 8 to A.

**Shared key at A**

```calc
K = Y_B^{X_A} mod p
  = 8^{10} mod 13
  = (8^{2} mod 13)^{5}
  = 12^{5} mod 13   [64 mod 13 = 12]
  = (12^{2} mod 13)^{2} × 12 mod 13
  = 1^{2} × 12 mod 13   [144 mod 13 = 1]
  = 12
```

**Shared key at B**

```calc
K = Y_A^{X_B} mod p
  = 10^{9} mod 13
  = (10^{2} mod 13)^{4} × 10 mod 13
  = 9^{4} × 10 mod 13   [100 mod 13 = 9]
  = 6561 mod 13 × 10 mod 13
  = 9 × 10 mod 13   [6561 mod 13 = 9]
  = 90 mod 13
  = 12
∴ Shared secret key K = 12
```

```seq
Host A | Host B
Host A: X_A = 10; Y_A = 11^{10} mod 13 = 10
Host B: X_B = 9; Y_B = 11^{9} mod 13 = 8
Host A -> Host B: Y_A = 10
Host B -> Host A: Y_B = 8
Host A: K = 8^{10} mod 13 = 12
Host B: K = 10^{9} mod 13 = 12
```

## 2(a) [5]
**Topics:** 09

### Question
Suppose an attacker wants to hijack an active TCP connection (between Alice and Bob) but is not in the same subnetwork of Alice or Bob. What challenges would the attacker face in carrying out this attack? With the help of a diagram, explain how the attack could be performed despite these challenges.

### Solution
**TCP session hijacking** means taking over an established TCP connection by sending packets that carry the **correct sequence (seq) and acknowledgement (ack) numbers** and a **spoofed source IP** of one party. When the attacker is on a different subnet, this is called **blind (off-path) hijacking**.

**Challenges for an attacker outside the subnet:**
1. **Cannot sniff the traffic:** packets between Alice and Bob never pass the attacker, so the current seq/ack numbers cannot be read.
2. **Must guess 32-bit numbers:** seq numbers have 2<sup>32</sup> possible values, and modern systems choose the starting number randomly.
3. **Works blind:** Bob's replies go to Alice's real IP, not to the attacker, so the attacker cannot see whether the attempt worked.
4. **The real client interferes:** Alice keeps sending her own packets or a reset (RST), which breaks the attacker's packets.
5. **Spoofed packets may be filtered:** routers with ingress/egress filtering drop packets whose source IP cannot come from that direction.

**How it could still be done (concept):**
1. **Silence the real party:** Alice is kept busy (for example by a DoS flood) so she cannot answer Bob or reset the connection.
2. **Predict the sequence numbers:** the attacker studies how Bob's TCP stack chooses initial sequence numbers. Old systems used predictable patterns, so the current seq/ack window could be estimated.
3. **Inject spoofed packets:** the attacker sends packets with Alice's IP as the source and the predicted seq/ack numbers.
4. **Bob accepts** any packet whose numbers fall inside the expected window and processes its data as if Alice sent it. The attacker never sees the replies, so it can only send one-way commands.

```seq
Alice | Attacker | Bob
Alice -> Bob: established TCP session
Attacker -> Alice: DoS keeps Alice silent
Attacker: predicts seq/ack of the session
Attacker -> Bob: spoofed packet, src IP = Alice, predicted seq
Bob: accepts if seq is in the window
Bob -> Alice: replies go to Alice (attacker is blind)
```

**Prevention:** random initial sequence numbers, encrypted and authenticated sessions (TLS, SSH, IPsec) so injected packets fail integrity checks, and ingress/egress filtering to drop spoofed source IPs.

## 2(b) [5]
**Topics:** 14

### Question
With the help of a diagram, explain how a stack-based buffer overflow attack overwrites a function's return address. Explain how stack canaries can help prevent buffer overflow attacks.

### Solution
**Stack layout of a function call.** When a function is called, a stack frame is created. The local buffer sits **below** the saved frame pointer and the **return address** (the place the CPU goes back to when the function ends).

```text
High memory
+------------------------------+
| function arguments           |
+------------------------------+
| return address               |  <- overwritten by the overflow
+------------------------------+
| saved frame pointer          |  <- overwritten
+------------------------------+
| canary (when enabled)        |
+------------------------------+
| buffer[8]                    |  <- input copied here, upward
+------------------------------+
Low memory
```

**How the return address is overwritten:**
1. The function copies input into the buffer without checking its length, e.g. `strcpy(buf, input)`.
2. Input longer than the buffer keeps being written upward past the end of the buffer.
3. It overwrites the saved frame pointer and then the **return address**.
4. When the function returns, the CPU jumps to the overwritten address instead of the real caller, so the program crashes or runs code it was never meant to run.

**How stack canaries prevent it:**
1. When the function starts, a **random secret value (canary)** is placed between the buffer and the return address.
2. An overflow that reaches the return address must overwrite the canary first.
3. Just before returning, the function checks whether the canary is unchanged.
4. If it has changed, the program **stops immediately**, so the corrupted return address is never used.

Because the canary is random for each run, it cannot be guessed and rewritten correctly. Other protections that work with canaries: bounds checking and safe functions (`fgets`, `snprintf`), a non-executable stack (NX/DEP) and ASLR.

## 3(a) [6]
**Topics:** 07

### Question
Considering the network scenario shown in Fig. 1, answer the following queries: [3+3]

<figure class="csec-figure">
<svg viewBox="0 0 700 340" role="img" aria-label="Fig 1: Victim V1 (MAC 0xV1, IP 190.168.5.8), Victim V2 (MAC 0xV2, IP 190.168.5.6) and a malicious device (MAC 0xAF, IP 190.168.5.3) connect to a switch. The switch connects to a router (MAC 0xR1, IP 190.168.5.10), which connects to the Internet.">
<line class="csec-fig-line" x1="200" y1="60" x2="280" y2="155"/>
<line class="csec-fig-line" x1="200" y1="175" x2="280" y2="170"/>
<line class="csec-fig-line" x1="200" y1="290" x2="280" y2="185"/>
<line class="csec-fig-line" x1="360" y1="170" x2="410" y2="170"/>
<line class="csec-fig-line" x1="560" y1="170" x2="592" y2="170"/>
<rect class="csec-fig-node" x="20" y="25" width="180" height="70" rx="8"/>
<text class="csec-fig-title" x="34" y="48">Victim V1</text>
<text class="csec-fig-text" x="34" y="68">MAC: 0xV1</text>
<text class="csec-fig-text" x="34" y="86">IP: 190.168.5.8</text>
<rect class="csec-fig-node" x="20" y="140" width="180" height="70" rx="8"/>
<text class="csec-fig-title" x="34" y="163">Victim V2</text>
<text class="csec-fig-text" x="34" y="183">MAC: 0xV2</text>
<text class="csec-fig-text" x="34" y="201">IP: 190.168.5.6</text>
<rect class="csec-fig-node csec-fig-node--bad" x="20" y="255" width="180" height="70" rx="8"/>
<text class="csec-fig-title" x="34" y="278">Malicious device</text>
<text class="csec-fig-text csec-fig-text--bad" x="34" y="298">MAC: 0xAF</text>
<text class="csec-fig-text csec-fig-text--bad" x="34" y="316">IP: 190.168.5.3</text>
<rect class="csec-fig-node" x="280" y="145" width="80" height="50" rx="6"/>
<text class="csec-fig-title" x="296" y="175">Switch</text>
<rect class="csec-fig-node" x="410" y="125" width="150" height="90" rx="8"/>
<text class="csec-fig-title" x="424" y="152">Router</text>
<text class="csec-fig-text" x="424" y="174">MAC: 0xR1</text>
<text class="csec-fig-text" x="424" y="194">IP: 190.168.5.10</text>
<ellipse class="csec-fig-node" cx="640" cy="170" rx="48" ry="26"/>
<text class="csec-fig-title" x="610" y="175">Internet</text>
</svg>
<figcaption>Fig 1: A Network Topology</figcaption>
</figure>

i) **Explain** how the ARP (Address Resolution Protocol) can be exploited to perform a Man-In-The-Middle (MITM) attack by the malicious device against both victims (V1 and V2).

ii) **Find out** the resulting ARP tables of V1, V2 and Router after the MITM attack.

### Solution
**i) ARP spoofing used as a MITM attack**

ARP maps an IP address to a MAC address inside the LAN. It is **stateless** (a host accepts a reply even without asking) and **unauthenticated** (any host can claim any IP), so a host on the same switch can give false answers.

1. The malicious device (0xAF) sends a fake ARP reply to **V1**: "190.168.5.6 (V2) and 190.168.5.10 (Router) are at **0xAF**."
2. It sends a fake ARP reply to **V2**: "190.168.5.8 (V1) and 190.168.5.10 (Router) are at **0xAF**."
3. It sends a fake ARP reply to the **Router**: "190.168.5.8 (V1) and 190.168.5.6 (V2) are at **0xAF**."
4. All three ARP tables are now poisoned, so frames between V1, V2 and the Router are sent to the malicious device first.
5. The malicious device forwards each frame to the real owner (it still knows the true MACs), so the network keeps working and the victims notice nothing. Meanwhile it can **read, change or drop** the traffic, for example to capture passwords.
6. It repeats the fake replies regularly so the entries do not expire.

```text
Before:  V1 <-----------------------> V2        V1 <-------> Router
After:   V1 ----> Malicious (0xAF) ----> V2      V1 ----> Malicious ----> Router
```

**Defence (brief):** Dynamic ARP Inspection on the switch, static ARP entries for the router, ARP monitoring tools, and encryption (HTTPS, SSH, VPN).

**ii) ARP tables after the MITM attack**

**V1's ARP table**

| IP address | MAC address |
|---|---|
| 190.168.5.6 (V2) | **0xAF** (fake; real is 0xV2) |
| 190.168.5.10 (Router) | **0xAF** (fake; real is 0xR1) |
| 190.168.5.3 (Malicious) | 0xAF |

**V2's ARP table**

| IP address | MAC address |
|---|---|
| 190.168.5.8 (V1) | **0xAF** (fake; real is 0xV1) |
| 190.168.5.10 (Router) | **0xAF** (fake; real is 0xR1) |
| 190.168.5.3 (Malicious) | 0xAF |

**Router's ARP table**

| IP address | MAC address |
|---|---|
| 190.168.5.8 (V1) | **0xAF** (fake; real is 0xV1) |
| 190.168.5.6 (V2) | **0xAF** (fake; real is 0xV2) |
| 190.168.5.3 (Malicious) | 0xAF |

Every IP address in each table now points to **0xAF**, so all traffic between V1, V2 and the Router passes through the malicious device. Only the malicious device keeps the true mappings (0xV1, 0xV2, 0xR1), which it uses to forward the frames.

## 3(b) [4]
**Topics:** 13, 01

### Question
A ransomware attack locks all medical records, thereby preventing doctors from accessing patient data during an emergency. Which part of the CIA Triad is violated? Suggest methods to defend against such attacks.

### Solution
**Violated: Availability.**

Availability means data and systems must be usable by authorised people when they need them. Here the doctors are authorised, but the ransomware has encrypted or locked the records, so they cannot use them during an emergency. (If the attackers also copy and leak the records, **confidentiality** is violated too.)

**Defence methods:**
- **Regular offline / offsite backups**, tested often, so records can be restored without paying.
- **Patch** operating systems and medical software quickly to close known holes.
- **Email filtering and staff training** against phishing, the most common way ransomware enters.
- **Anti-malware / endpoint protection** that blocks suspicious encryption activity.
- **Least privilege and network segmentation**, so one infected PC cannot lock the whole hospital network.
- An **incident response and recovery plan**, including a downtime procedure for emergencies.

## 4(a) [5]
**Topics:** 15

### Question
A company employee logs into the organization's payroll portal and keeps the browser open. Later, the employee visits an unrelated website that contains hidden code. Without the employee's knowledge, the website automatically sends a request to the payroll portal to change the employee's direct-deposit bank account information. Because the employee is already authenticated, the payroll system accepts the request and updates the account details, even though the employee never intended to make the change.

What type of web attack is being demonstrated in this scenario, and why is it successful? Also, mention some prevention strategies to stop this type of attack.

### Solution
**Attack: Cross-Site Request Forgery (CSRF).**

CSRF makes a logged-in user's browser send an unwanted request to a trusted site. Here the hidden code on the unrelated website made the browser send a "change bank account" request to the payroll portal.

**Why it is successful:**
- The employee was still **logged in**, so the browser held a valid session cookie for the payroll portal.
- The browser **automatically attaches that cookie** to every request to the portal, even one started by another website.
- The portal only checks that the session is valid. It **does not check whether the user really intended** the request (no CSRF token, no re-authentication).
- So the portal cannot tell the forged request from a real one and changes the bank details.

**Prevention strategies:**
- **Anti-CSRF tokens:** a secret random token in every form, checked by the server; the other website cannot know it.
- **SameSite cookies**, so the session cookie is not sent with requests from other sites.
- **Check the Origin / Referer header** of sensitive requests.
- **Re-authentication or OTP** before changing bank details, plus an email or SMS confirmation of the change.
- **Short session timeouts**, and users should log out after use and not browse other sites while logged in.

## 4(b) [5]
**Topics:** 13

### Question
Alice installed an unverified mobile application that streams various TV channels in high definition without any payment. After some days, she experienced multiple unrecognized activities in her Facebook account, such as running ads, adding payment information, and so on. She also discovered that her Facebook account has been linked to an Instagram account that does not belong to her.

Identify what kind of malware infected her mobile phone with a proper explanation. Also, mention some prevention strategies to stop this type of attack.

### Solution
**Malware: a Trojan horse carrying spyware** (credential and session stealing).

**Explanation:**
- A **Trojan horse** looks like a useful program but secretly does something harmful. The free HD TV app looked attractive, so Alice installed it herself.
- While appearing to stream TV, the app ran **spyware** in the background: it collected her Facebook login details or session tokens and sent them to the attackers.
- Using her account, the attackers ran ads, added payment information and linked their own Instagram account. This matches the signs: unknown activity only in her accounts, after installing an unverified app.
- It is not a virus or worm, because it did not copy itself to other files or devices; Alice installed it.

**Prevention strategies:**
- Install apps **only from official stores** (Google Play, App Store) and verified developers; avoid "free premium" apps from unknown sources.
- **Check app permissions** and deny those that are not needed (e.g. accessibility, SMS, account access for a TV app).
- Use **mobile security / anti-malware** software and keep the OS and apps updated.
- Turn on **two-factor authentication** for Facebook and other accounts.
- If infected: uninstall the app, change passwords, log out of all sessions, remove unknown linked accounts and payment methods, and check account activity.
