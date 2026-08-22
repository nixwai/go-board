import type { ComponentPublicInstance } from 'vue';
import type { GoLayout } from '../../types';
import type { GoGameOptions, PlayerSign } from '../../utils/go-game';

export interface GoBoardUpdateEvent {
  layout: GoLayout
  player: PlayerSign
}

export interface GoBoardMoveEvent extends GoBoardUpdateEvent {
  position: string
}

export interface GoBoardProps {
  width?: number | string
  init?: GoGameOptions
}

export interface GoBoardExposed {
  play: (position?: string) => boolean
  reset: (options?: GoGameOptions) => boolean
}

export type GoBoardInstance = ComponentPublicInstance<GoBoardProps, GoBoardExposed>;
