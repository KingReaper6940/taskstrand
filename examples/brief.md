# Taskstrand

Elapsed-minute finish-to-start precedence model with unlimited parallel capacity. No staffing, calendars, costs, risk or execution guarantee.

Baseline finish: 50 minutes. Scenario finish: 55 minutes. Shift: +5 minutes.

```text
Plan: Small release
Overrun task: C
Extra minutes: 20
```

## baseline

```text
One representative longest chain: A → B → D → E
All zero-slack task IDs: A, B, D, E

A | Confirm scope | duration 10 | needs none | early 0–10 | late 0–10 | total slack 0
B | Build the change | duration 30 | needs A | early 10–40 | late 10–40 | total slack 0
C | Prepare assets | duration 15 | needs A | early 10–25 | late 25–40 | total slack 15
D | Review together | duration 10 | needs B,C | early 40–50 | late 40–50 | total slack 0
E | Ready to ship | duration 0 | needs D | early 50–50 | late 50–50 | total slack 0
```

## scenario

```text
One representative longest chain: A → C → D → E
All zero-slack task IDs: A, C, D, E

A | Confirm scope | duration 10 | needs none | early 0–10 | late 0–10 | total slack 0
B | Build the change | duration 30 | needs A | early 10–40 | late 15–45 | total slack 5
C | Prepare assets | duration 35 | needs A | early 10–45 | late 10–45 | total slack 0
D | Review together | duration 10 | needs B,C | early 45–55 | late 45–55 | total slack 0
E | Ready to ship | duration 0 | needs D | early 55–55 | late 55–55 | total slack 0
```

## Earliest timing differences

```text
A | start Δ 0 | finish Δ 0 | total slack Δ 0
B | start Δ 0 | finish Δ 0 | total slack Δ 5
C | start Δ 0 | finish Δ 20 | total slack Δ -15
D | start Δ 5 | finish Δ 5 | total slack Δ 0
E | start Δ 5 | finish Δ 5 | total slack Δ 0
```
