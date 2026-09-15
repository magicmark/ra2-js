export { GAME_SPEED_STEPS } from '../game/timing';
export const SCROLL_RATE_STEPS = [.25, .5, .75, 1, 1.5, 2, 3] as const;

export const BINDING_DEFAULTS = [
  { id: 'stop', label: 'Stop', category: 'Orders', description: 'Stop selected units and hold their position.', defaultKey: 'S' },
  { id: 'guard', label: 'Guard', category: 'Orders', description: 'Guard the current area with selected units.', defaultKey: 'G' },
  { id: 'scatter', label: 'Scatter', category: 'Orders', description: 'Spread selected units away from their formation center.', defaultKey: 'X' },
  { id: 'deploy', label: 'Deploy', category: 'Orders', description: 'Deploy or undeploy selected GIs.', defaultKey: 'D' },
  { id: 'repair', label: 'Repair mode', category: 'Orders', description: 'Choose friendly buildings to repair.', defaultKey: 'K' },
  { id: 'sell', label: 'Sell mode', category: 'Orders', description: 'Choose friendly buildings to sell.', defaultKey: 'L' },
  { id: 'planning', label: 'Planning mode', category: 'Orders', description: 'Hold this key while choosing waypoints; release it to send the route.', defaultKey: 'Z' },
  { id: 'selectAll', label: 'Select all units', category: 'Selection', description: 'Select all living friendly mobile units.', defaultKey: 'P' },
  { id: 'selectType', label: 'Select same type', category: 'Selection', description: 'Select matching units on screen; press twice to include the map.', defaultKey: 'T' },
  { id: 'next', label: 'Next unit', category: 'Selection', description: 'Select the next friendly unit in creation order.', defaultKey: 'M' },
  { id: 'previous', label: 'Previous selection', category: 'Selection', description: 'Restore the previous selection.', defaultKey: 'N' },
  { id: 'health', label: 'Select by health', category: 'Selection', description: 'Cycle friendly units through healthy, damaged, and critical groups.', defaultKey: 'U' },
  { id: 'follow', label: 'Follow selected unit', category: 'View', description: 'Toggle camera following for the first selected unit.', defaultKey: 'F' },
  { id: 'home', label: 'Home base', category: 'View', description: 'Center the camera on your Construction Yard.', defaultKey: 'H' },
  { id: 'briefing', label: 'Briefing', category: 'View', description: 'Open the mission briefing and controls.', defaultKey: '?' },
  { id: 'structures', label: 'Structures tab', category: 'Production', description: 'Open structure production and pick up its ready building for placement.', defaultKey: 'Q' },
  { id: 'defenses', label: 'Defenses tab', category: 'Production', description: 'Open defense production and pick up its ready building for placement.', defaultKey: 'W' },
  { id: 'infantry', label: 'Infantry tab', category: 'Production', description: 'Open infantry production.', defaultKey: 'E' },
  { id: 'vehicles', label: 'Vehicles tab', category: 'Production', description: 'Open vehicle production.', defaultKey: 'R' },
] as const;

export type BindingId = typeof BINDING_DEFAULTS[number]['id'];
export interface BindingInfo {
  id: BindingId; label: string; category: string; description: string; defaultKey: string; key: string | null;
}
export interface BindingResult {
  ok: boolean; reason?: string; conflict?: Pick<BindingInfo, 'id' | 'label'>; replaced?: BindingId;
}
