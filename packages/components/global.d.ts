// GlobalComponents for Volar
declare module 'vue' {
  export interface GlobalComponents {
    GoBoard: typeof import('./src/go-board')['GoBoard']
  }
}

export {};
