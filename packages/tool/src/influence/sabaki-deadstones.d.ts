declare module '@sabaki/deadstones' {
  export function getProbabilityMap(data: number[][], iterations: number): Promise<number[][]>;
  export function useFetch(path: string): unknown;
}

declare module '@sabaki/deadstones/wasm/deadstones_bg.wasm?url' {
  const wasmUrl: string;
  export default wasmUrl;
}
