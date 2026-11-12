---
title: Closed-loop discrete event simulator
thread: systems
period: Mar 2026
context: CS681 · Prof. Varsha Apte
tech: [C++23]
repo: https://github.com/balaji1029/discrete-event-simulator-closed-loop
order: 1
---
- Models a multi-server web app: per-core thread pools with core affinity, bounded queues, round-robin scheduling with configurable quanta, variable network transit.
- Think time, timeouts and probabilistic routing; fully reproducible via seeded RNG and JSON-driven experiments.
- Automated sweeps over users, cores and threads, emitting CSV traces and throughput–latency plots.
