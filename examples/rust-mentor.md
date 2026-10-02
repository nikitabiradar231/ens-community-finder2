# Example: Rust Mentor Query

## Question
"Who can mentor me in Rust and is free this month?"

## Preference
User is looking for a community member skilled in Rust who offers 1-on-1 mentoring and has active availability during the current month.

## Expected Candidates
- `alice.community.eth`
- `bob.community.eth`

## Observed API Response
```json
{
  "query": "Who can mentor me in Rust and is free this month?",
  "matches": [
    {
      "ensName": "alice.community.eth",
      "reason": "Alice is a Senior Systems Engineer specializing in Rust. She lists Rust as a primary skill and explicitly states she is available this month for 1-on-1 pairing.",
      "skills": ["Rust", "Tokio", "WebAssembly", "Distributed Systems"],
      "availability": "Available this month for 1-on-1 pairing"
    },
    {
      "ensName": "bob.community.eth",
      "reason": "Bob is a Rust core contributor who helps engineers transition to Rust and is free for weekend mentoring sessions.",
      "skills": ["Rust", "C++", "Embedded Systems", "WebAssembly"],
      "availability": "Free for mentoring sessions on weekends"
    }
  ],
  "noMatch": false
}
```
