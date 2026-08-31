// GlobalComponents for Volar
declare module 'vue' {
  export interface GlobalComponents {
    GoBoard: typeof import('./src/go-board')['GoBoard']
    GoSave: typeof import('./src/go-save')['GoSave']
    GoSlider: typeof import('./src/go-slider')['GoSlider']
  }
}

export {};
