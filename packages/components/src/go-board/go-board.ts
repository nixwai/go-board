import type { Sign, SignMap } from '@sabaki/go-board';
import type { ComponentPublicInstance } from 'vue';
import type { GoGameOptions, PlayerSign } from '../utils/go-game';

export type GoSign = Sign;
export type GoLayout = SignMap;

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
