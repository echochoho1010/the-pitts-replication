# The Pitt MCI Replication

A simulation-based reconstruction of the mass casualty incident (MCI) shown in *The Pitt* Episodes 12-14.

## Overview

This project started from a simple question:

**If we try to reconstruct the MCI event in *The Pitt* as carefully as possible, what can we learn about emergency department flow, resource bottlenecks, and operational tradeoffs?**

The show presents a highly compressed and chaotic emergency room response to a large shooting event. Patients arrive in waves, resources run low, staff are stretched, and the team has to make rapid decisions about who gets treated first and where each patient goes next.

I wanted to move beyond just watching the scene and instead treat it like a systems problem.

So I rewatched the relevant episodes multiple times and manually recorded the operational details shown on screen, including:

- when major resources appeared to run low
- how many patients arrived over time
- how patients seemed to be triaged
- how staff were distributed across spaces
- what immediate clinical dilemmas kept recurring
- how patients flowed from triage to stabilization to next-step care

From there, I built a structured simulation workflow in three parts:
1. **show-grounded data extraction**
2. **scenario reproduction / calibration**
3. **what-if simulation analysis**

---

## Project Goal

This repository is designed to do two things:

### 1. Reproduce the event as plausibly as possible
Because this is a TV show, not a real hospital dataset, many important quantities are not directly observable.

For example:
- you cannot see the entire emergency room at once
- you cannot count every worker on shift
- you do not know the exact patient mix
- you do not know the true inventory of blood, trauma beds, or staffing capacity

So the first goal of the project is to **reconstruct a plausible baseline case** from incomplete visual and narrative evidence.

### 2. Explore what-if scenarios
Once the baseline case is calibrated, the simulation can be used to explore questions such as:

- What if blood resupply arrived later?
- What if staffing were lower?
- What if the hospital had more surge capacity?
- Which bottlenecks matter most?
- Which shortages are dramatic but operationally less important?

---

## Thought Process

My workflow was:

### Step 1: Watch the show like an operations analyst
I first watched the MCI episodes closely and logged the details shown on screen.

This included:
- approximate arrival timing
- approximate number of incoming patients by wave
- moments when supplies appeared to run out
- major treatment actions
- visible room usage
- recurring clinical emergencies such as airway compromise and massive blood loss
- rough evidence about who went to the OR, ICU, or continued ED care

The goal here was not to collect "perfect data" but to build the best possible event trace from the show itself.

### Step 2: Build a codebook to reproduce the scenario
Because many variables are not directly observable from the show, I then built a **codebook of assumptions and parameters**.

This codebook serves two purposes:
- make my assumptions explicit
- calibrate the case until it produces a plausible emergency department picture

For example, one major challenge is staffing.

The show never gives a full overhead shot where you can count everyone in the ED, so I cannot directly observe the true number of doctors, nurses, respiratory therapists, techs, or support staff. Instead, I first try to reproduce the event in a way that implies a realistic staffing level based on:
- pace of treatment
- visible parallel activity
- resource consumption
- throughput
- bottlenecks shown in the story

In other words, I use the reproduction step to infer the hidden operational structure behind the episode.

### Step 3: Use the calibrated baseline to run simulations
Once the scenario is reproduced reasonably well, I use the inferred baseline to construct the actual simulation.

At that point, the model becomes a tool for exploring operational questions:
- how much blood timing matters
- whether staffing or OR access becomes the dominant bottleneck
- how much dynamic reprioritization changes outcomes
- how resilient the system is to small delays

### Step 4: Compare simulation logic with a one-pager and math notes
Alongside the code, I also wrote:
- a **simulation one-pager** summarizing the logic, assumptions, and parameters
- **mathematical / theoretical analysis notes** to compare against the simulation structure

The goal is to make the project readable not only as code, but also as a reasoning process.

---

## Repository Structure

This repo contains three main layers of work:

### 1. Data extraction from the show
Manual notes and structured assumptions based on repeated viewing of the relevant episodes.

### 2. Reproduction / calibration notebook
A notebook that tries to reproduce the baseline event and infer hidden variables such as realistic staffing and flow constraints.

### 3. Simulation and scenario analysis
A simulation notebook used to test what-if scenarios and compare outcomes under different assumptions.

You may also find:
- a one-pager summarizing the simulation design
- codebook-style parameter documentation
- comparative analysis notes

Current top-level folders:

- `frontend/`: interactive floor-plan viewer, boundary editor, and patient-flow prototype
- `frontend/assets/`: static front-end assets such as the floor plan image
- `simulation/`: notebooks and simulation work
- `docs/`: PDFs and supporting writeups

---

## Modeling Philosophy

This project is **show-grounded**, not a claim of exact medical truth.

That means:
- the starting point is what is shown and implied in the episode
- missing values are filled in with explicit assumptions
- realism matters, but exact clinical reconstruction is not the goal
- the model is intended as an operational thinking tool, not a validated trauma system model

I am especially interested in the intersection of:
- emergency department operations
- triage and surge flow
- resource bottlenecks
- simulation as a way of thinking through uncertainty

---

## Example Questions This Model Can Explore

- What if blood resupply did not arrive in time?
- What if it arrived 10 minutes later?
- How close was the ED to staffing saturation?
- What is the effective maximum surge capacity under the inferred staffing level?
- Which matters more in this case: blood, OR access, or staffing?
- Which shortages are truly life-critical versus operationally disruptive?

---

## Current Limitations

This project has important limitations:

- It is based on a fictional event.
- Some key variables are inferred rather than observed.
- The show does not expose the full ED at all times.
- Clinical details are simplified into operational categories.
- The simulation is intended for reasoning and exploration, not prediction.

---

## Why I Built This

I made this because I was fascinated by how much operational structure was hidden inside what looked like pure chaos on screen.

The more carefully I watched the episodes, the more it became clear that the event could be studied as:
- a queueing problem
- a triage problem
- a staffing problem
- a resource allocation problem
- a dynamic prioritization problem

This repo is my attempt to make that structure visible.

---

## Future Directions

Potential next steps include:
- refining the patient subtype logic
- improving time-to-collapse modeling for different critical injuries
- adding better dynamic reprioritization
- stress-testing different staffing assumptions
- comparing simulation outputs more systematically against the one-pager and theoretical notes

---

## Notes

If you work in emergency medicine, trauma systems, healthcare operations, or simulation, I would be very interested in hearing what you would model differently.

This is an evolving project, and many assumptions can still be improved.
