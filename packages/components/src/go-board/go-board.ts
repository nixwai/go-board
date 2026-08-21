import type { ComponentPublicInstance } from 'vue';

export type GoSign = -1 | 0 | 1;
export type GoLayout = GoSign[][];

export interface GoBoardInit {
  layout: GoLayout
  next?: GoSign
}

export interface GoBoardUpdateEvent {
  layout: GoLayout
  next: Exclude<GoSign, 0>
}

export interface GoBoardMoveEvent extends GoBoardUpdateEvent {
  position: string
}

export interface GoBoardProps {
  size?: number | string
  width?: number | string
  init?: GoBoardInit
}

export interface GoBoardExposed {
  play: (position?: string) => boolean
  reset: (init?: GoBoardInit) => boolean
}

export type GoBoardInstance = ComponentPublicInstance<GoBoardProps, GoBoardExposed>;
