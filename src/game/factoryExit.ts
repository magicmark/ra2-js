import type { Entity, Vec2 } from './types';

export const isWarFactory = (type: string): boolean => type === 'warfactory' || type === 'warfactory_soviet';

/** The 5x3 original factories have their vehicle doorway on the +X face.
 * These ground points align with the UnderDoorAnim / DeployingAnim opening
 * in the original SHPs, using this renderer's foundation-center origin.
 */
export function factoryExitLane(factory: Vec2): { start: Vec2; end: Vec2 } {
  return { start: { x: factory.x + 3, y: factory.y + 1 }, end: { x: factory.x + 5.5, y: factory.y + 1 } };
}

export function factoryForExit(unit: Entity, entities: Entity[]): Entity | undefined {
  return unit.factoryExit && entities.find(e => e.id === unit.factoryExit!.factoryId && e.hp > 0 && !e.selling);
}
