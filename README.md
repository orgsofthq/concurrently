# concurrently

Allows running concurrent shell commands and supports multiple levels of
nesting. Commands have alternating colors and are prefixed with their index.

## Usage

CLI:

```bash
# Run multiple commands concurrently
concurrently "deno lint" "deno fmt" "sleep 1 && echo 'it worked!'"

# Nested concurrent commands
concurrently \
  "concurrently 'deno lint' 'deno fmt'" \
  "sleep 1 && echo 'it worked!'"
```

Code:

```ts
import concurrently from "jsr:@orgsoft/concurrently";

await concurrently(["deno lint", "deno fmt", "sleep 1 && echo 'it worked!'"]);
```

## Installation

Recommended:

```sh
deno install -frAg -n concurrently jsr:@orgsoft/concurrently
```

More restrictive:

```sh
deno install -frg --allow-env=SHELL -n concurrently jsr:@orgsoft/concurrently
```

[`deno`](https://deno.com) is required to install and use `concurrently`. You can change
the name of the globally installed command by changing `-n concurrently` to
`-n mycommandname`.
