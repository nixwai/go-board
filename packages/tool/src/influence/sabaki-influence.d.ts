declare module '@sabaki/influence' {
  interface InfluenceOptions {
    discrete?: boolean
    maxDistance?: number
    minRadiance?: number
  }

  interface InfluenceModule {
    areaMap: (data: number[][]) => number[][]
    map: (data: number[][], options?: InfluenceOptions) => number[][]
  }

  const influence: InfluenceModule;
  export default influence;
}
