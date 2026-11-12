# TypeScript Coding Standards

## Files

- One type per file for substantial types; avoid nesting except for
  low-visibility helpers.
- Simple one-line types (aliases, small option shapes) can be defined in
  another module's file IFF the type is a simple declaration and is primarily
  used by that module.  Bonus points if it is prefixed with the module's
  dominant type name (eg: `SomeTool` and simple type `SomeToolResult`).
  - These secondary types should be at the *end* of the file.

## Variable Naming

- Variable names should be lowerCamelCase, clear, and informative. While
  abbreviations are permitted, they should be common jargon and not invented
  (eg `cfg` for `config` is good).
- Hyper-brief one-or-two character names are okay for loop indexes and lambda
  parameters, but they should still be informative: `i` for a for-loop counter,
  or the first char of the object's name
  (`books.map(b => b.title)`).

### Imports

- Use explicit named imports; do not import whole modules as namespaces unless
  disambiguation is required.
- Do not redundantly import symbols already in lexical scope.

## Indentation

- Use **spaces** for indentation (not tabs).
- When breaking up an expression of peer-level tokens across multiple lines,
  indent the successive lines. Eg:

  ```typescript
  const result = myCollection
      .someOperation()
      .someOtherOperation()
      .toList();
  ```

- Child levels of the parse-tree should almost always be indented.
- Avoid horizontal alignment.

## Braces (OTBS - Open on Same Line)

- Open braces on the same line as the declaration, closing brace on its own
  line.
- For functions:

  ```typescript
  function doThing(arg: string) {
      // body
  }
  ```

- Always brace ifs.
- Single-line braced statements should only be done in hyper-trivial cases,
  like empty object literals `{ }`.

## Parens

- Use parens where operators are mixed and order-of-operations is
  less-well-known, even if it is not necessary.
- `||` operations should almost always be in parens in expressions with mixed
  operators.
- Existing code is inconsistent for trailing parens in multi-line blocks,
  whether or not it should be linebreak-before `)` or not.  Use whichever
  convention is common in the codebase.  So both of the following examples are
  valid, but a codebase should pick one and stick to it.

  ```typescript
  longFunctionCall(
      param,
      secondParam,
      thirdParam
  );
  ```

  ```typescript
  longFunctionCall(
      param,
      secondParam,
      thirdParam);
  ```

## Linebreaks

- Break logical statements on new lines if they're too long. A line of code
  should have only one or two concerns.  Multiple sequenced statements on one
  line is a red flag.
- Use whitespace after commas in multi-parameter calls.
- If a multi-parameter signature exceeds the line-length limit, put each
  parameter on its own line.  Short signatures that fit on one line are fine
  to keep on one line.
- Soft length limit at 80 char, hard limit at 120 char.  Avoid complicated logic
  on a single line.
- Put one blank line between any sibling multi-line expressions or declarations, eg:

  ```typescript
  const myResult = myCollection
      .doSomething()
      .doSomethingElse();

  someSecondOperationAfterABlankLine();
  ```

- For ternary expressions, unless it is absolutely the simplest possible case,
  break onto multiple lines with the `?` and `:` at the start of their own
  lines:

  ```typescript
  const result = someCondition
      ? doSomething()
      : doSomethingElse();
  ```

## Comments

- Use **JSDoc comments** (`/** ... */`) for documentation on exported
  functions, types, and public APIs.
- Use **inline comments** (`//`) for brief in-line explanations.
- Do not write trivial comments that just restate the name of the object. Do
  not document parameters that have a clear name and require no elaboration.

  ```typescript
  /**
   * Helper to draw a border row of the board.
   *
   * @returns The index of the next board to draw if it needs another row of
   * boards.
   */
  function drawBorderRow(someWellDocumentedNumberParameter: number): number {
      ...
  }
  ```

- Keep inline comments brief and relevant.

## Public API Naming

When making members or types that will be used in another language (eg. JSON
members or CLI option names), follow the convention of the other platform.  For
example, JSON members generally will not have the `is` prefix common in
boolean property names.

### Boolean Parameters

- Boolean parameters should be at the end of the parameter-set.
- Use `is`, `can`, `are`, or `do` prefix for boolean parameters where helpful
  for readability:

  ```typescript
  function runGame(players: char[], isRandomPlayerOrder: boolean, isSynchronousMode: boolean) {
      ...
  }

  function canTakeTurn(player?: char): boolean {
      ...
  }
  ```

- When calling complex parameter-sets with boolean parameters, pass an options
  object with named booleans if using raw `true` or `false` values.

### Boolean Return Values

- For boolean return values, prefer `Is` prefix for the return type name when
  naming conventions allow:

  ```typescript
  const isSynchronousMode = false;
  function isResignedPlayer(player: char): boolean { ... }
  function isGameOver: boolean { ... }
  ```

- Other simple verbs are also allowed (non-exclusive list): `has`, `can`,
  `does`.

## Null Handling

- Model "absent" values explicitly: use `null` for JSON-facing data, and
  `undefined` only where the platform expects it (optional properties).
- Prefer `?.` (optional chaining) for safe navigation and `??` for fallbacks.
- For "found or not" cases, prefer returning a named union
  (`Result | undefined`) or a collection the caller can iterate, so the empty
  case falls out naturally as a no-op.
- Do not return `null` to mean "a very different event occurred"; name the
  alternative case instead.

## Miscellaneous Patterns

- Use template literals for building strings:

  ```typescript
  console.log(` - player '${resignedPlayer}' is resigned.`);
  ```

- Prefer `const` and immutable data; use `let` only when reassignment is
  required.
- Use `async`/`await` over raw promise chains.
- Dispose of resources with `try`/`finally` (or explicit cleanup) rather than
  relying on finalizers.

## Testing

- **Do not test private members via reflection or by reaching into module
  internals.**  Instead:
  - Export the member for tests when it is part of the module's contract.
  - Keep complex logic in pure, testable modules (see `src/pi-thinking.ts`)
    and keep thin wrappers thin.
- Tests live in `tests/`, one file per source module, `*.test.ts`.
