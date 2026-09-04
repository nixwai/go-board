// GlobalComponents for Volar
declare module 'vue' {
  export interface GlobalComponents {
    ChessGrid: typeof import('./src/chess-grid')['ChessGrid']
    ChessPiece: typeof import('./src/chess-piece')['ChessPiece']
    ChessInfluence: typeof import('./src/chess-influence')['ChessInfluence']
    Chessboard: typeof import('./src/chessboard')['Chessboard']
  }
}

export {};
