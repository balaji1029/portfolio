---
title: Compiler for a C-like language
thread: compilers
period: Jan–Apr 2026
context: CS306 · Prof. Uday Khedkar
tech: [C++, Flex, Bison]
featured: true
order: 1
---
- Built from scratch: Flex lexer, Bison grammar that allows declarations anywhere, AST, and a hierarchically scoped symbol table that reuses stack offsets across non-overlapping scopes.
- Lowered to three-address code and built a control-flow graph over it — unreachable-code elimination and missing-return detection fall out of reachability.
- Backward dataflow with GEN/KILL sets drives iterative dead-code elimination and use-before-definition warnings.
