# concurrently

Allows running concurrent commands and supports multiple levels of nesting.

## Usage

CLI:

```bash
# Run multiple commands concurrently
concurrently "deno lint" "deno fmt" "sleep 1 && echo 'it worked!'"

# Nested concurrent commands
concurrently \
  "concurrently 'deno lint' 'deno fmt'" \
  "deno run --watch main.ts"
```

Code:

```ts
import concurrently from "@orgsoft/concurrently";

await concurrently(["deno lint", "deno fmt", "sleep 1 && echo 'it worked!'"]);
```

## Installation

Recommended:

- `deno install -rAf -n concurrently @orgsoft/concurrently`

More restrictive:

- `deno install -rf --allow-env=SHELL -n concurrently @orgsoft/concurrently`

(`deno`)[deno.com] is required. You can change the name of the globally installed command by changing `-n concurrently` to `-n mycommandname`.