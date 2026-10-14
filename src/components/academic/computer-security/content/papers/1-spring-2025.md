# Spring 2025

**Exam:** Final Exam, Spring 2025
**Course:** CSE 4531: Computer Security
**Total marks:** 40
**Time:** 2 hours

## 1(a) [3]
**Topics:** 06

### Question
Suppose you have received a digitally signed message that claims to have been signed by Alice and that you want to verify this signature. Discuss why you need a Certification Authority here.

### Solution
To verify Alice's signature, I decrypt the signature with **Alice's public key** and compare it with the hash of the message. So everything depends on having Alice's **real** public key.

- **Problem without a CA:** anyone can create a key pair and claim "this public key is Alice's". An attacker could give me their own public key in Alice's name, sign a fake message with their private key, and it would verify correctly. I would wrongly trust it.
- **What the CA does:** a Certification Authority is a trusted third party. It checks Alice's identity and issues a **digital certificate** that binds Alice's name to her public key, signed with the **CA's private key**.
- **How I use it:** I already trust the CA's public key (built into my system). I verify the CA's signature on Alice's certificate. If it is valid, I know the public key really belongs to Alice, and then I can verify her signature on the message.

So the CA gives **trust in the public key**, which makes the signature check meaningful and gives authentication and non-repudiation.

## 1(b) [3]
**Topics:** 13

### Question
What are zero-day exploits and how to prevent them? Give an example of such an attack.

### Solution
**Zero-day exploit:** an attack that uses a software or hardware vulnerability that is **unknown to the vendor or not yet patched**. The developers have had "zero days" to fix it, so normal patching and signature-based anti-virus cannot stop it at first.

**Example:** **Stuxnet** (2010) used several unknown Windows vulnerabilities to infect industrial control systems and damage centrifuges.

**Prevention:**
- Apply security updates as soon as a patch is released, to keep the exposure window short.
- Use **behaviour-based (heuristic) detection**, intrusion detection and prevention systems, and sandboxing to catch unknown attacks.
- **Least privilege** and **network segmentation**, so a successful exploit can do limited damage.
- Firewalls, disabling unused services, and vendor workarounds until a patch is available.

## 1(c) [4]
**Topics:** 11, 01

### Question
Suppose you just got a call from the University System Administrator, who says that he has checked the network configurations and traffic and finds that you are flooding the varsity BSCSE results website with excessive requests to overload the system so that other students cannot access the portal and resources. (i) Which attack are you supposed to conduct? However, you know you are not doing this, rather, someone is using your network credentials, such as IP or MAC address. (ii) In this case, which attack are you facing? (iii) Among interruption, interception, modification, and fabrication, in which categories do these two attacks lie? In each part, justify your answer with short explanations.

### Solution
**(i) Denial-of-Service (DoS) attack.**
Flooding the results website with excessive requests so that it is overloaded and other students cannot use it is a DoS attack. If many machines are used together, it is a DDoS attack. It attacks **availability**.

**(ii) Spoofing attack (IP / MAC address spoofing).**
Someone else is sending traffic using my IP or MAC address as the source, so the traffic looks as if it comes from my computer. Pretending to be another host by faking its address is spoofing. (On a LAN, this is often combined with ARP spoofing.)

**(iii) Categories:**

| Attack | Category | Reason |
|---|---|---|
| DoS | **Interruption** | The service is made unavailable to real users, so the flow of information is stopped. It attacks availability. |
| Spoofing | **Fabrication** | The attacker creates fake traffic that claims to come from me. It inserts counterfeit data and attacks authenticity. |

## 2(a) [3]
**Topics:** 13

### Question
A banking system suddenly experiences fraudulent transactions after an employee in the software division is fired. What kind of malware could be responsible for such activities, and what are the countermeasures to prevent them?

### Solution
**Likely malware: a logic bomb (and/or a backdoor) planted by the insider.**

- A **logic bomb** is malicious code hidden inside normal software that runs only when a condition becomes true. Here the condition could be "this employee is removed from the payroll or user list". After the firing, the code activates and makes fraudulent transactions.
- A **backdoor** is a hidden way to bypass login, which the fired developer could use to access the system after leaving.
- Since a developer had access to the source code, this is an **insider threat**.

**Countermeasures:**
- **Code review** of every change by another developer before deployment, and change management.
- **Separation of duties** and **least privilege**: no single developer can write, approve and deploy code to production.
- **Remove all access immediately** when an employee leaves (accounts, keys, VPN).
- **Audit logs and transaction monitoring** to detect unusual transactions quickly.
- Integrity checking of deployed software against approved versions.

## 2(b) [3]
**Topics:** 14

### Question
Explain buffer overflow attacks with an example. How to protect such attacks?

### Solution
**Buffer overflow:** a program copies more data into a fixed-size buffer than it can hold, so the extra data overwrites the memory next to it. It happens when input length is not checked (common in C with `strcpy`, `gets`).

In a **stack** overflow, the buffer is a local variable stored below the function's **return address**. Over-long input overwrites the return address, so when the function returns, control goes to a place chosen by the attacker instead of the real caller. The program may crash or run unintended code.

**Example:**

```c
char buf[8];
strcpy(buf, input);   /* no length check: input longer than 7 characters overflows buf */
```

**Protection:**
- Check input length and use safe functions (`fgets`, `snprintf`, `strncpy`).
- **Stack canaries**: a random value before the return address is checked before returning.
- **Non-executable stack (NX/DEP)** and **ASLR** (random memory addresses).
- Memory-safe languages, code review and testing.

## 2(c) [4]
**Topics:** 11

### Question
How is a botnet used to launch DDoS attacks? Explain with a figure.

### Solution
A **botnet** is a network of compromised computers (**bots** or **zombies**) controlled by an attacker (**botmaster**) through **Command and Control (C&C)** servers.

```text
             Botmaster
                 |
            C&C server(s)
           /     |      \
        Bot     Bot     Bot    ... thousands of zombies
           \     |      /
             Victim server   (overloaded, real users refused)
```

**How a DDoS is launched with a botnet:**
1. **Recruit:** the attacker infects many computers with bot malware (through worms, phishing, infected downloads). Owners do not notice.
2. **Wait:** each bot connects to the C&C server and waits for commands.
3. **Command:** the botmaster sends one command naming the victim and the time of the attack.
4. **Attack:** all bots send traffic to the victim at the same time (floods such as TCP, UDP or ICMP), using up its bandwidth, CPU or memory.
5. **Result:** the victim cannot serve real users. Because traffic comes from thousands of real machines everywhere, it is very hard to filter.

## 3(a) [3]
**Topics:** 15

### Question
Assume a web server that has a database table that contains user login credential stored without any encryption or hashing techniques. The website also has a form that is vulnerable to SQL Injection attacks. Explain potential exploitation of the website and design a SQL Injection attack that can retrieve the users' username and passwords. Assume the names of the database tables and columns as needed.

### Solution
**Assumed table:** `users(id, username, password)`, with passwords stored in **plain text**. A search or login form builds its query by gluing user input into the SQL text, for example:

```sql
SELECT * FROM users WHERE username = '<input>';
```

**How the attack works (concept):**
1. The attacker types input that contains SQL syntax instead of a normal name: a quote that **closes the string**, then extra SQL.
2. Because the input is not validated, the database treats that extra text as part of the **command**.
3. The added SQL either makes the WHERE condition **always true** (so every row of `users` is returned) or **joins a second query** (UNION) that selects the `username` and `password` columns.
4. The page then displays the result, revealing all usernames and passwords.

**Potential exploitation:**
- Logging in as any user (or the admin) without a password.
- Dumping all credentials. Since passwords are plain text, they can be used immediately, and on other sites where users reuse them.
- Changing or deleting data in the database.

**Prevention:** parameterized queries (prepared statements), input validation with whitelisting, least privilege database accounts, and storing passwords as salted hashes (bcrypt).

## 3(b) [3]
**Topics:** 15

### Question
An attacker crafts a malicious web page that contains a hidden form which, when visited by a logged-in user of the e-commerce site, automatically submits a request to change the user's email address to the attacker's address. The victim, while logged into their e-commerce account, clicks a link on a social media post and unknowingly loads the malicious web page. As a result, their registered email is silently updated to the attacker's email. Briefly describe what kind of attack is occured here and what steps could have been implemented to stop it?

### Solution
**Attack: Cross-Site Request Forgery (CSRF).**

The victim was logged in, so the browser held a valid session cookie. The hidden form on the attacker's page made the browser send a "change email" request to the e-commerce site, and the browser attached the session cookie automatically. The site could not tell this from a real request and changed the email. The attacker can now reset the password and take over the account.

**Steps to stop it:**
- **Anti-CSRF tokens:** a secret random token in every form, checked by the server. The attacker's page cannot know it.
- **SameSite cookies**, so the session cookie is not sent with requests from other sites.
- **Check the Origin / Referer header** of sensitive requests.
- **Re-authentication** (current password or OTP) before changing the email, plus a confirmation sent to the old email.
- Users should log out after use and avoid browsing other sites while logged in.

## 3(c) [4]
**Topics:** 07

### Question
Employees within a large corporation report unauthorized access to their accounts. Security investigations reveal that an attacker within the internal network is manipulating the Address Resolution Protocol to redirect network traffic to a malicious server under their control. Explain how this attack enables the attacker to steal employee credentials. Then, describe some security measures that can be implemented to prevent and mitigate this type of attack.

### Solution
**Attack: ARP spoofing (ARP cache poisoning), used as a man-in-the-middle attack.**

**How credentials are stolen:**
1. ARP maps IP addresses to MAC addresses on a LAN. It is **stateless and unauthenticated**, so hosts accept any ARP reply.
2. The attacker sends **fake ARP replies** saying that the IP of the gateway (or the login server) belongs to the attacker's MAC address.
3. Employees' ARP tables are poisoned, so their traffic goes to the attacker's machine or malicious server first.
4. The attacker relays the traffic so everything seems normal, but **captures usernames, passwords and session cookies** sent without strong encryption, or shows a fake login page.
5. Using the stolen credentials, the attacker logs in to employees' accounts.

**Prevention and mitigation:**
- **Dynamic ARP Inspection (DAI)** with DHCP snooping on switches to drop fake ARP replies.
- **Static ARP entries** for critical hosts such as the gateway and servers.
- **ARP monitoring tools** (Arpwatch, XArp) and alerts for one MAC address claiming many IPs.
- **Encrypt all logins** (HTTPS with HSTS, SSH, VPN), so captured traffic is useless.
- **Multi-factor authentication**, so a stolen password alone is not enough.
- Network segmentation (VLANs) and port security to limit who can reach other hosts.

## 4(a) [2]
**Topics:** 02

### Question
Calculate the following big moduli: 7<sup>927</sup> mod 13

### Solution
13 is prime and 13 does not divide 7, so by **Fermat's Little Theorem**, 7<sup>12</sup> mod 13 = 1.

Divide the exponent by 12: 927 = 12 × 77 + 3.

```calc
7^{927} mod 13 = (7^{12})^{77} × 7^{3} mod 13
               = 1^{77} × 7^{3} mod 13   [a^{p−1} mod p = 1]
               = 343 mod 13
               = 5
∴ 7^{927} mod 13 = 5
```

## 4(b) [4]
**Topics:** 03

### Question
Compare symmetric and asymmetric cryptography with example.

### Solution
| Point | Symmetric cryptography | Asymmetric cryptography |
|---|---|---|
| Keys | One shared secret key for encryption and decryption | Key pair: public key to encrypt, private key to decrypt |
| Speed | Fast; good for large data | Slow; used for small data like keys and signatures |
| Key distribution | Key must be shared secretly in advance | Public key can be shared openly |
| Number of keys for n users | n(n − 1)/2 | 2n |
| Non-repudiation | Not possible (both have the same key) | Possible with digital signatures |
| Examples | AES, DES, 3DES | RSA, Diffie-Hellman, ECC |

**Example in practice:** HTTPS uses both. RSA or Diffie-Hellman (asymmetric) is used to agree on a session key, then AES (symmetric) encrypts the actual web traffic.

## 4(c) [4]
**Topics:** 04, 02

### Question
Charlie wants to use RSA for secure communication. He chooses two prime numbers, p=11 and q=17, and selects e=9 as the public exponent.

Determine the private key (d). Then, encrypt the message m=4 with the public key to compute the ciphertext. And verify that decryption retrieves the original message.

### Solution
**Given values**

```calc
p = 11
q = 17
n = p × q = 11 × 17 = 187
z = (p − 1)(q − 1) = 10 × 16 = 160
e = 9
m = 4
```

**Private key d**

```calc
d = e^{−1} mod z
  = 9^{−1} mod 160
  = (1 + 160 × k) / 9 mod 160
  = (1 + 160 × 5) / 9 mod 160   [k = 1 to 4 do not divide by 9; k = 5 does]
  = 801 / 9 mod 160
  = 89
∴ d = 89
```

Check: 9 × 89 = 801 = 5 × 160 + 1.

**Encryption**

```calc
C = m^{e} mod n
  = 4^{9} mod 187
  = (4^{4} mod 187)^{2} × 4 mod 187
  = 69^{2} × 4 mod 187   [256 mod 187 = 69]
  = 86 × 4 mod 187   [4761 mod 187 = 86]
  = 344 mod 187
  = 157
∴ C = 157
```

**Decryption: M = 157<sup>89</sup> mod 187 by square and multiply**

89 = 64 + 16 + 8 + 1. Square repeatedly, reducing mod 187:

```calc
157^{1} mod 187 = 157
157^{2} mod 187 = 24649 mod 187 = 152
157^{4} mod 187 = 152^{2} mod 187 = 23104 mod 187 = 103
157^{8} mod 187 = 103^{2} mod 187 = 10609 mod 187 = 137
157^{16} mod 187 = 137^{2} mod 187 = 18769 mod 187 = 69
157^{32} mod 187 = 69^{2} mod 187 = 4761 mod 187 = 86
157^{64} mod 187 = 86^{2} mod 187 = 7396 mod 187 = 103
```

Multiply the rows for 64, 16, 8 and 1:

```calc
M = C^{d} mod n
  = 157^{89} mod 187
  = 157^{64} × 157^{16} × 157^{8} × 157^{1} mod 187
  = 103 × 69 × 137 × 157 mod 187
  = 157 × 137 mod 187 × 69 × 103 mod 187
  = 4 × 69 × 103 mod 187   [21509 mod 187 = 4]
  = 276 mod 187 × 103 mod 187
  = 89 × 103 mod 187   [276 mod 187 = 89]
  = 9167 mod 187
  = 4
∴ M = 4, the original message
```

Decryption gives back m = 4, so the keys are correct.
