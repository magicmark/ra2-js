Create a clone of Red Alert 2 in typescript + vite + webgl

This is a big job, but you can do it!

## Assets

- stored in *.mix files in this .exe that you can download and extract:
https://archive.org/download/red-alert-2-multiplayer/Red-Alert-2-Multiplayer.exe
- paramertize the application such that it downloads this file on the fly during init (and saves to local browser storage - much like how chrono divide does it.

## Units

unit information should be defined in toml files (rather than .ini files as it originally was)

## Milestones

1. Get asset loading and basic UI up and running including unit build sidebar
2. Get build logic and building placement working
3. get unit pathfinding working
4. implement ore miner ai (ore miners should go and find nearest ore mine)
5. implement the concept of "sides" (track how much money each side has, what units, i can't select and move other sides' units etc)
6. create an AI to control an enemy side
7. finish up anything else i forgot about

## use videos

id you need,look at youtube videos or whatever you can find in order to understand how units shoudl look and move.

## workflow

you are the coordinating agent. try an delegate as much as possible to subagents

keep a TASKS.md traccking file

if you feel like you need to restart due to running low on context window, then dump everything to a HANDOFF_STATE (overrwrite this file, don't just append new stuff to old stuff, keep it fresh)