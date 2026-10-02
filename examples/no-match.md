# Example: No Match Query

## Question
"Who can help me with quantum computing and astrophysics algorithms?"

## Preference
Query targets non-existent skills not present in the community index.

## Expected Candidates
None (`[]`)

## Observed API Response
```json
{
  "query": "Who can help me with quantum computing and astrophysics algorithms?",
  "matches": [],
  "noMatch": true,
  "message": "Nobody in the current community matches your request."
}
```
