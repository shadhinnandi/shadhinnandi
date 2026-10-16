# Summer 2026

**Exam:** Final Examination, Summer 2026
**Course:** CSE 4531: Computer Security
**Total marks:** 40
**Time:** 2 hours

## 1(a) [6]
**Topics:** 05, 02

### Question
Suppose that Abir and Rubel exchange messages using the Diffie-Hellman algorithm to generate a shared key K. They publicly agree on a prime p = 23 and a primitive root g = 5. Abir chooses his secret key S<sub>A</sub> = 6, while Rubel chooses his secret key S<sub>R</sub> = 15.

Now Abir sends Rubel a ciphertext C of the original message M = 3 using C = K × M mod p. Rubel receives C and finds D using D = K<sup>−1</sup> C mod p. Rubel replies back with C1 using the same encryption on M1 = 5. Abir reads the message D1 after decryption.

**Calculate** the shared key K, and C, D, C1 and D1.

### Solution
**Given:** p = 23, g = 5, S<sub>A</sub> = 6 (Abir), S<sub>R</sub> = 15 (Rubel), M = 3, M1 = 5.

**Public key of Abir**

```calc
Y_A = g^{S_A} mod p
    = 5^{6} mod 23
    = (5^{2} mod 23)^{3}
    = 2^{3} mod 23   [25 mod 23 = 2]
    = 8
```

**Public key of Rubel**

```calc
Y_R = g^{S_R} mod p
    = 5^{15} mod 23
    = (5^{2} mod 23)^{7} × 5 mod 23
    = 2^{7} × 5 mod 23
    = 128 × 5 mod 23
    = 13 × 5 mod 23   [128 mod 23 = 13]
    = 65 mod 23
    = 19
```

Abir sends Y<sub>A</sub> = 8 to Rubel, and Rubel sends Y<sub>R</sub> = 19 to Abir.

**Shared key at Abir**

```calc
K = Y_R^{S_A} mod p
  = 19^{6} mod 23
  = (19^{2} mod 23)^{3}
  = 16^{3} mod 23   [361 mod 23 = 16]
  = 4096 mod 23
  = 2
```

**Shared key at Rubel**

```calc
K = Y_A^{S_R} mod p
  = 8^{15} mod 23
  = (8^{2} mod 23)^{7} × 8 mod 23
  = 18^{7} × 8 mod 23   [64 mod 23 = 18]
  = (18^{2} mod 23)^{3} × 18 × 8 mod 23
  = 2^{3} × 144 mod 23   [324 mod 23 = 2]
  = 8 × 6 mod 23   [144 mod 23 = 6]
  = 48 mod 23
  = 2
∴ Shared key K = 2
```

**Abir encrypts M = 3**

```calc
C = K × M mod p
  = 2 × 3 mod 23
  = 6
∴ C = 6
```

**Rubel finds K<sup>−1</sup> and decrypts**

```calc
K^{−1} = 2^{−1} mod 23
       = (1 + 23 × k) / 2 mod 23
       = (1 + 23 × 1) / 2 mod 23   [k = 1]
       = 24 / 2 mod 23
       = 12
```

Check: 2 × 12 = 24 = 23 + 1.

```calc
D = K^{−1} × C mod p
  = 12 × 6 mod 23
  = 72 mod 23
  = 3
∴ D = 3
```

D = M = 3, so Rubel recovers Abir's message.

**Rubel encrypts the reply M1 = 5**

```calc
C1 = K × M1 mod p
   = 2 × 5 mod 23
   = 10
∴ C1 = 10
```

**Abir decrypts the reply**

```calc
D1 = K^{−1} × C1 mod p
   = 12 × 10 mod 23
   = 120 mod 23
   = 5
∴ D1 = 5
```

D1 = M1 = 5, so Abir recovers Rubel's reply.

```seq
Abir | Rubel
Abir: S_A = 6; Y_A = 5^{6} mod 23 = 8
Rubel: S_R = 15; Y_R = 5^{15} mod 23 = 19
Abir -> Rubel: Y_A = 8
Rubel -> Abir: Y_R = 19
Abir: K = 19^{6} mod 23 = 2
Rubel: K = 8^{15} mod 23 = 2
Abir -> Rubel: C = 2 × 3 mod 23 = 6
Rubel: D = 12 × 6 mod 23 = 3
Rubel -> Abir: C1 = 2 × 5 mod 23 = 10
Abir: D1 = 12 × 10 mod 23 = 5
```

**Answer:** K = 2, C = 6, D = 3, C1 = 10, D1 = 5.

## 1(b) [4]
**Topics:** 06, 04, 02

### Question
Rubel receives a public key (e<sub>S</sub>, n<sub>S</sub>) = (9, 35) along with a digital certificate S of Sazzad from a Certificate Authority (CA). CA uses the RSA digital certificate algorithm with the following parameters:

- p = 7, q = 29
- Consider a smallest possible number for the private key of CA.
- A simple hash function: h(e<sub>S</sub>, n<sub>S</sub>) = (A e<sub>S</sub> + b n<sub>S</sub>) mod u where A = 12, b = 3, and u = 31.

**Calculate** the digital certificate S for the given public key (e<sub>S</sub>, n<sub>S</sub>).

### Solution
The CA signs the **hash of Sazzad's public key** with the **CA's private key d**: S = h<sup>d</sup> mod n. Rubel later checks it with the CA's public key e.

**Given values (the CA's RSA key)**

```calc
p = 7
q = 29
n = p × q = 7 × 29 = 203
z = (p − 1)(q − 1) = 6 × 28 = 168
```

**Smallest private key d of the CA.** d must satisfy 1 < d < z and gcd(d, 168) = 1. Since 168 = 2<sup>3</sup> × 3 × 7:

- d = 2: shares factor 2. Not allowed.
- d = 3: shares factor 3. Not allowed.
- d = 4: shares factor 2. Not allowed.
- d = 5: gcd(5, 168) = 1. **Allowed.**

So **d = 5**. (d = 1 is excluded: it would leave the hash unchanged, so it is no key at all.)

**The CA's public key e** (Rubel needs it to verify)

```calc
e = d^{−1} mod z
  = 5^{−1} mod 168
  = (1 + 168 × k) / 5 mod 168
  = (1 + 168 × 3) / 5 mod 168   [k = 3]
  = 505 / 5 mod 168
  = 101
∴ e = 101
```

Check: 5 × 101 = 505 = 3 × 168 + 1.

**Hash of Sazzad's public key**

```calc
h(e_S, n_S) = (A × e_S + b × n_S) mod u
            = (12 × 9 + 3 × 35) mod 31
            = (108 + 105) mod 31
            = 213 mod 31
            = 27
```

**Digital certificate S (signed by the CA)**

```calc
S = h^{d} mod n
  = 27^{5} mod 203
  = (27^{2} mod 203)^{2} × 27 mod 203
  = 120^{2} × 27 mod 203   [729 mod 203 = 120]
  = 14400 mod 203 × 27 mod 203
  = 190 × 27 mod 203   [14400 mod 203 = 190]
  = 5130 mod 203
  = 55
∴ Digital certificate S = 55
```

**Verification at Rubel's side** (not asked, but it confirms the answer). Repeated squaring of 55:

```calc
# Powers of 55 mod 203
55^{2} mod 203 = 3025 mod 203 = 183
55^{4} mod 203 = 183^{2} mod 203 = 33489 mod 203 = 197
55^{8} mod 203 = 197^{2} mod 203 = 38809 mod 203 = 36
55^{16} mod 203 = 36^{2} mod 203 = 1296 mod 203 = 78
55^{32} mod 203 = 78^{2} mod 203 = 6084 mod 203 = 197
55^{64} mod 203 = 197^{2} mod 203 = 38809 mod 203 = 36
```

```calc
h′ = S^{e} mod n
   = 55^{101} mod 203
   = 55^{64} × 55^{32} × 55^{4} × 55 mod 203   [64 + 32 + 4 + 1 = 101]
   = 36 × 197 × 197 × 55 mod 203
   = 7092 × 10835 mod 203   [36 × 197 = 7092, 197 × 55 = 10835]
   = 190 × 76 mod 203   [7092 mod 203 = 190, 10835 mod 203 = 76]
   = 14440 mod 203
   = 27
∴ h′ = 27 = h, so the certificate is valid
```

```seq
Sazzad | CA | Rubel
Sazzad -> CA: identity and public key (9, 35)
CA: h = (12 × 9 + 3 × 35) mod 31 = 27
CA: S = 27^{5} mod 203 = 55 (d = 5)
CA -> Sazzad: certificate S = 55
Sazzad -> Rubel: public key (9, 35) and certificate S = 55
Rubel: h′ = 55^{101} mod 203 = 27 = h, so the key is Sazzad's
```

**Answer:** d = 5, h = 27, digital certificate **S = 55**.

## 2(a) [5]
**Topics:** 13

### Question
Rafi, an accounts officer, installed a "free full version" of a photo editor from an unofficial website. The software worked normally, but it secretly installed a hidden program that sent his saved passwords to an external server. A few hours later, network traffic on the office LAN jumped sharply. The same suspicious process appeared on 25 other PCs whose users hadn't opened anything. It had spread by itself through unpatched machines on port 445, without changing any existing files.

**Identify** the two types of malware in this scenario and justify each answer. **Recommend** two mitigation strategies for each malware you identified.

### Solution
**Malware 1: Trojan horse (carrying spyware).**

- A **Trojan horse** pretends to be useful software but secretly does something harmful. The "free full version" photo editor looked attractive and **worked normally**, so Rafi installed it himself and suspected nothing.
- In the background it installed a hidden program that **stole his saved passwords** and sent them to an external server. Secretly collecting and sending out information is **spyware** behaviour.

**Mitigation for the Trojan:**
1. Install software **only from official or trusted sources**, and use **application whitelisting** so unapproved programs cannot run. Users should not have admin rights to install software.
2. Keep **anti-malware / endpoint protection** up to date and **monitor outgoing traffic** to block data being sent to unknown servers. Use a password manager and **multi-factor authentication**, so stolen passwords alone are not enough.

**Malware 2: Worm.**

- A **worm** copies itself across the network **by itself**, with no user action and no host file. The process appeared on **25 other PCs whose users had not opened anything**.
- It spread by **exploiting unpatched machines on port 445** (SMB, Windows file sharing), as WannaCry did.
- It **did not change any existing files**, so it is not a virus (a virus attaches itself to other files and needs the user to run them).
- The sudden **jump in LAN traffic** is typical of a worm scanning for and infecting new machines.

**Mitigation for the worm:**
1. **Apply security patches promptly** (here the SMB vulnerability) and disable old protocols such as SMBv1.
2. **Block port 445** at the firewall where it is not needed, **segment the network** so an infection cannot spread to every PC, and use an **IDS/IPS** to detect scanning and spreading.

## 2(b) [5]
**Topics:** 15

### Question
Mitu is logged in to netbank.com. She opens a forum post and clicks a "Read more!" link, which is really:

`http://netbank.com/transfer.do?acct=AttackerA&amount=$100`

Without her knowing, $100 is transferred to the attacker's account. The next day, a second attacker uses a session token he captured from Mitu's earlier session on a public Wi-Fi network. He sends it to netbank.com and gets into her account.

**Name** the attack in each incident. **Explain** why the bank server accepted the request in the first incident, even though the attacker never knew Mitu's password. **Suggest** one way to prevent each attack.

### Solution
**Incident 1: Cross-Site Request Forgery (CSRF).**

The forged "Read more!" link made **Mitu's own browser** send a money-transfer request to netbank.com.

**Why the server accepted it without the password:**
- Mitu was **already logged in**, so her browser held a valid **session cookie** for netbank.com.
- The browser **automatically attaches that cookie** to every request to netbank.com, including the one started by the forum link.
- The server only checks that the session is valid. It **does not check whether Mitu really intended** the request, and the transfer is a simple GET link with no secret value in it.
- So the request looked exactly like a real transfer by Mitu. The attacker never needed her password, because the browser supplied her session.

**Prevention:** use **anti-CSRF tokens** (a secret random token in every transfer form, checked by the server; the attacker cannot know it). Other options: **SameSite cookies**, re-authentication or OTP for transfers, and POST instead of GET for actions that change data.

**Incident 2: Session hijacking** (stealing and replaying the session token).

The attacker **sniffed Mitu's session token** on the public Wi-Fi, because it was sent without encryption. Sending that token to netbank.com makes the server treat him as Mitu, without any password.

**Prevention:** use **HTTPS for the whole site** (with HSTS) and mark the cookie **Secure** and **HttpOnly**, so the token is never sent in plain text and cannot be sniffed. Also expire sessions quickly and issue a new token at login and logout. Users on public Wi-Fi can add a VPN.

## 3(a) [5]
**Topics:** 01

### Question
A doctor sends a patient's medical report to another doctor through an unsecured network. An unauthorized person intercepts the communication and reads the patient's diagnosis and test results. **Identify** which part of the CIA triad is violated and **mention** two ways to defend against such an attack.

### Solution
**Violated: Confidentiality.**

Confidentiality means information is seen **only by authorised people**. Here an unauthorised person **intercepted (eavesdropped on)** the report on the unsecured network and **read** the diagnosis and test results. Nothing was changed or blocked, so integrity and availability are not the issue.

**Two ways to defend:**
1. **Encrypt the data in transit:** send the report over **TLS/HTTPS**, a **VPN**, or as end-to-end encrypted email. An interceptor then sees only ciphertext that he cannot read without the key.
2. **Authentication and access control:** send the report through a secure hospital system where only **authorised doctors can log in** (strong passwords plus two-factor authentication) and the receiving doctor is verified, for example with a digital certificate, before the report is released.

## 3(b) [5]
**Topics:** 10

### Question
The UIU admission server can hold at most 1,024 half-open TCP connections. During the admission result announcement, an attacker sends thousands of SYN packets per second from spoofed IP addresses and never completes the handshake. Soon, real students can't connect. The admin turns on SYN cookies, and the server starts accepting student connections again while the attack is still going on.

**Explain** how SYN cookies let the server keep serving real students during this attack. In your answer, **cover** what the server sends back in the SYN-ACK, why spoofed SYNs no longer fill up its memory, and how it checks a real student's final ACK.

### Solution
This is a **SYN flooding** attack. Normally every SYN creates a half-open entry in the server's queue. The spoofed SYNs never send the final ACK, so they fill all 1,024 slots and real students are refused. **SYN cookies** remove that stored state.

**1. What the server sends in the SYN-ACK.**
Instead of storing the connection, the server puts its details **into the sequence number** of the SYN-ACK. This sequence number is the **SYN cookie**: a keyed hash of
- the client's and server's **IP addresses and ports**,
- a **secret key** known only to the server, and
- a **time value** (so old cookies expire).

**2. Why spoofed SYNs no longer fill memory.**
After sending the SYN-ACK the server **stores nothing**: no queue slot and no connection record. The SYN-ACKs to spoofed addresses are never answered, but since nothing was stored, nothing fills up. The 1,024-entry limit is never reached, however many SYNs arrive.

**3. How it checks a real student's final ACK.**
- A real student receives the SYN-ACK and replies with an ACK whose **acknowledgement number = cookie + 1**.
- The server takes the addresses and ports from this ACK, **recomputes the hash** with its secret key and the recent time value, and checks that it equals **ack number − 1**.
- If it matches and is still fresh, the server **only now allocates memory** and opens the connection.
- An attacker who never saw the SYN-ACK (it went to the spoofed address) cannot guess a valid cookie, because it does not know the secret key.

```seq
Student | Server
Student -> Server: SYN
Server: cookie = hash(IPs, ports, secret key, time); store nothing
Server -> Student: SYN-ACK, seq = cookie
Student -> Server: ACK, ack = cookie + 1
Server: recompute hash; equals ack − 1, so allocate the connection
```

## 4(a) [5]
**Topics:** 16

### Question
A small office uses a stateless packet-filter firewall. So that employees' web browsing works, the admin added this rule:

**Allow inbound TCP packets whose source port is 80.**

One night, an attacker on the Internet sent TCP packets with source port 80 to port 3389 (Remote Desktop) on an internal PC. No one inside the office had contacted the attacker, but the firewall let the packets through.

(i) Why did the stateless firewall allow the attacker's packets? [2]

(ii) The office replaces it with a stateful firewall. **Explain** how the stateful firewall would block this attack, and show the connection-table entry it would keep for a legitimate request from internal host 192.168.1.10:51000 to web server 203.0.113.5:80. [3]

### Solution
**(i) Why the stateless firewall let the packets in [2]**

- A stateless firewall checks **each packet on its own**, using only header fields (IP addresses, ports, protocol). It keeps **no memory** of which connections were started from inside.
- The rule only checks **source port = 80**. The source port is chosen by the sender, so the attacker simply **set his source port to 80**.
- The rule does not restrict the **destination port**, so a packet to port 3389 (Remote Desktop) matched the rule and was allowed. The firewall could not tell that it was not a reply to any request from the office.

**(ii) How the stateful firewall blocks it [3]**

A stateful firewall keeps a **connection (state) table** of connections started from inside. An inbound packet is allowed only if it **belongs to a connection in the table**.

Connection-table entry for the legitimate request:

| Source IP | Source port | Destination IP | Destination port | Protocol | State |
|---|---|---|---|---|---|
| 192.168.1.10 | 51000 | 203.0.113.5 | 80 | TCP | ESTABLISHED |

- Replies are allowed back in only if they match this entry in reverse: **from 203.0.113.5:80 to 192.168.1.10:51000**.
- The attacker's packet (attacker IP:80 to the internal PC:3389) **matches no entry**, because no one inside started a connection to the attacker. It is therefore **dropped**, even though its source port is 80.

## 4(b) [5]
**Topics:** 07

### Question
In a UIU computer lab, all PCs are connected to the same LAN. The default gateway has IP 192.168.10.1 and MAC 00:1A:2B:3C:4D:01. A student's PC has IP 192.168.10.25. An attacker's laptop on the same LAN has IP 192.168.10.66 and MAC 00:1A:2B:3C:4D:66. After some time, the student notices that the MAC address stored for the gateway in her ARP cache has changed. The student's Internet traffic still works, but the passwords she types on an HTTP login page have been captured by the attacker.

**Explain** how the attacker poisoned the ARP caches to place himself between the student's PC and the gateway, and why the PCs accepted the forged ARP messages. **Show** the student's ARP cache entry for the gateway before and after the attack, and **propose** two countermeasures the lab administrator should deploy.

### Solution
**How the attacker poisoned the ARP caches (ARP spoofing, MITM):**
1. The attacker (192.168.10.66, MAC **00:1A:2B:3C:4D:66**) sends a **fake ARP reply** to the student's PC: "192.168.10.1 (gateway) is at **00:1A:2B:3C:4D:66**."
2. He sends a fake ARP reply to the **gateway**: "192.168.10.25 (student) is at **00:1A:2B:3C:4D:66**."
3. Both caches are now poisoned. Frames from the student to the Internet go to the attacker first, and so do the gateway's replies to the student.
4. The attacker turns on **IP forwarding** and passes every frame on to the real owner. The student's Internet still works, so nothing looks wrong.
5. Because the login page uses **HTTP** (no encryption), the passwords she types pass through the attacker in plain text and are captured.
6. He repeats the fake replies regularly so the entries do not expire and get corrected.

```text
Before:  Student PC <------------------------------> Gateway
After:   Student PC ----> Attacker (...4D:66) ----> Gateway
```

**Why the PCs accepted the forged ARP messages:**
- **ARP has no authentication:** any host can claim any IP address, and nothing checks that the reply really comes from the gateway.
- **ARP is stateless:** a host accepts an ARP reply even if it never sent a request, and **overwrites** the existing entry with the newest reply.

**Student's ARP cache entry for the gateway:**

| | IP address | MAC address |
|---|---|---|
| Before the attack | 192.168.10.1 | 00:1A:2B:3C:4D:01 (real gateway) |
| After the attack | 192.168.10.1 | **00:1A:2B:3C:4D:66** (attacker) |

**Two countermeasures for the lab administrator:**
1. **Dynamic ARP Inspection (DAI) with DHCP snooping** on the lab switches: the switch checks every ARP reply against the known IP-to-MAC bindings and drops forged ones.
2. **Static ARP entries** for the gateway on the lab PCs (the gateway's MAC is fixed, so a fake reply cannot change it), together with ARP monitoring (e.g. arpwatch) to alert on changes.

Also, login pages should use **HTTPS**, so even intercepted traffic cannot be read.
