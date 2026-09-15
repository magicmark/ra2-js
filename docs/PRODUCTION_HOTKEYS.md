# Production hotkeys

The default production keys are **Q / W / E / R**: structures, defenses,
infantry, vehicles. **Q** picks up the front ready structure for placement;
**W** does the same for a ready defense. Otherwise the key opens its production
tab. It does not start, resume, or spend money on a new build.

**D** retains Deploy. These defaults follow the existing UI and the
[original RA2 manual](https://oldgamesdownload.com/manual/command-conquer-red-alert-2-windows-manual-english/),
printed pages 30–31. The manual's page 20 describes placement of ready buildings.
The engine-extension
[Phobos building-placement hotkey fix](https://github.com/Phobos-developers/Phobos/blob/develop/src/Misc/Hooks.BugFixes.cpp)
also corroborates a dedicated placement-hotkey path.

Ready-card clicks and hotkeys share the placement action. Selecting a different
ready category replaces the preview. Escape or right click cancels placement
without losing the paid building. Mouse tab clicks and empty/unit-category keys
retain their existing tab-selection behavior, including any current preview.
Ready buildings remain accessible after prerequisite loss or build-limit checks.

Production keys follow Options → Keyboard remappings. Text entry, open dialogs,
loading, browser modifier shortcuts, and key-repeat events do not trigger them.
The mobile Build drawer closes when a keyboard shortcut picks up a ready building.
