---
title: Compiler optimisations on Jimple IR
thread: compilers
period: Jan–Apr 2026
context: CS6004 · Prof. Manas Thakur
tech: [Java, Soot]
repo: https://github.com/balaji1029/method-inlining
order: 2
---
- Static analyses on Jimple with Soot: object-structure prediction (class hierarchies, field layouts, vtables) and flow- and path-sensitive dataflow for redundant-load detection and scalar replacement.
- A method-inlining pass driven by pointer analysis, a class hierarchy graph for virtual calls, and type inference from casts; compared static vs profile-driven heuristics on DaCapo.
