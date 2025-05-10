import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, useDragControls } from 'motion/react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type Piece = '♔' | '♕' | '♖' | '♗' | '♘' | '♙' | '♚' | '♛' | '♜' | '♝' | '♞' | '♟' | ' '
const whitePieces = ['♔' , '♕' , '♖' , '♗' , '♘' , '♙']
const blackPieces = ['♚' , '♛' , '♜' , '♝' , '♞' , '♟']

let draggedPiece: Piece = ' '
let draggedPiecePos = [0, 0] // [row, file]
let hoveredSquare = [0, 0] // [row, file]
let lastMove = { piece: ' ', from: [0, 0], to: [0, 0] } 

export default function App() {
  const boardRef = useRef(null)
  
  const [board , setBoard] = useState<Piece[][]>([
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖']
  ])
  
  const [colorToMove, setColorToMove] = useState<'white' | 'black'>('white')

  const [boardElements, setBoardElements] = useState<ReactNode[]>()

  function buildBoard() {
    let rows: ReactNode[] = []

    board.forEach((row, index) => {
      const rowIndex = index
      const rowClass = `row-${rowIndex.toString()}`

      let squares: ReactNode[] = []
      
      row.forEach((piece, index) => {
        const fileIndex = index

        squares.push(
          <Square fileIndex={fileIndex} rowIndex={rowIndex} piece={piece}/>
        )
      })

      rows.push(<div className={`row ${rowClass}`}>{squares}</div>)
    })

    setBoardElements(rows)
  }

  function updateBoard() {
    if (!checkValidMove()) return

    setBoard((newBoard) => {
      newBoard[hoveredSquare[0]][hoveredSquare[1]] = draggedPiece
      newBoard[draggedPiecePos[0]][draggedPiecePos[1]] = ' '

      lastMove = { piece: draggedPiece, from: [draggedPiecePos[0], draggedPiecePos[1]], to: [hoveredSquare[0], hoveredSquare[1]] }

      console.log(`Updated piece ${draggedPiece} at [${hoveredSquare[0]}, ${hoveredSquare[1]}] from [${draggedPiecePos[0]}, ${draggedPiecePos[1]}]`)
      console.log(`Last move: ${lastMove.piece} to [${lastMove.to[0]}, ${lastMove.to[1]}] from [${lastMove.from[0]}, ${lastMove.from[1]}]`)
      setColorToMove((color) => { return color === 'white' ? 'black' : 'white'})

      return newBoard
    })
  }

  function checkCollision() {
    // Return true if piece doesn't collide along the way

    // File movement
    if (draggedPiecePos[0] === hoveredSquare[0]) {
      if (draggedPiecePos[1] < hoveredSquare[1]) {
        for (let i = draggedPiecePos[1] + 1; i < hoveredSquare[1]; i++) {
          if (board[draggedPiecePos[0]][i] !== ' ') return false
        }
      } else {
        for (let i = hoveredSquare[1] + 1; i < draggedPiecePos[1]; i++) {
          if (board[draggedPiecePos[0]][i] !== ' ') return false
        }
      }
    }

    // Rank movement
    if (draggedPiecePos[1] === hoveredSquare[1]) {
      if (draggedPiecePos[0] < hoveredSquare[0]) {
        for (let i = draggedPiecePos[0] + 1; i < hoveredSquare[0]; i++) {
          if (board[i][draggedPiecePos[1]] !== ' ') return false
        }
      } else {
        for (let i = hoveredSquare[0] + 1; i < draggedPiecePos[0]; i++) {
          if (board[i][draggedPiecePos[1]] !== ' ') return false
        }
      }
    }

    // Diagonal movement
    if (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])) {
      const rowDirection = draggedPiecePos[0] < hoveredSquare[0] ? 1 : -1
      const fileDirection = draggedPiecePos[1] < hoveredSquare[1] ? 1 : -1

      let row = draggedPiecePos[0] + rowDirection
      let file = draggedPiecePos[1] + fileDirection

      while (row !== hoveredSquare[0] && file !== hoveredSquare[1]) {
        if (board[row][file] !== ' ') return false
        row += rowDirection
        file += fileDirection
      }
    }
    
    return true
  }

  function checkValidMove() {
    // Disallow same square moves
    if (hoveredSquare[0] === draggedPiecePos[0] && hoveredSquare[1] === draggedPiecePos[1]) return false

    // Don't capture friendly pieces
    let isntFriendlyFire = false

    // Valid move flag
    let isValidPieceMove = false

    switch (colorToMove) {
      case 'white':
        isntFriendlyFire = !whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])

        switch (draggedPiece) {
          case '♔':
            console.log('Checking white king')
            isValidPieceMove = Math.abs(draggedPiecePos[0] - hoveredSquare[0]) <= 1 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) <= 1
            break

          case '♕':
            console.log('Checking white queen')
            isValidPieceMove = checkCollision() && ((draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1]) || (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])))
            break

          case '♖':
            console.log('Checking white rook')
            isValidPieceMove = checkCollision() && (draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1])
            break

          case '♗':
            console.log('Checking white bishop')
            isValidPieceMove = checkCollision() && Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])
            break
            
          case '♘':
            console.log('Checking white knight')
            isValidPieceMove = (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === 2 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1) || (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === 1 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 2)
            break

          case '♙':
            console.log('Checking white pawn')
            const pawnHasntMoved = draggedPiecePos[0] === 6 // Pawn start rank

            // Normal moves
            if (pawnHasntMoved) {
              if (!blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && (draggedPiecePos[0] - hoveredSquare[0] === 1 || draggedPiecePos[0] - hoveredSquare[0] === 2)) {
                isValidPieceMove = checkCollision()
                break
              }
            } else {
              if (!blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && draggedPiecePos[0] - hoveredSquare[0] === 1) {
                isValidPieceMove = true
                break
              }
            }

            // Captures
            if (blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])) {
              if (Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1 && draggedPiecePos[0] - hoveredSquare[0] === 1) {
                isValidPieceMove = true
                break
              }
            }

            // Can en passant
            if (lastMove.piece === '♟' && lastMove.from[0] === 1 && lastMove.to[0] === 3 && draggedPiecePos[0] === 3 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1) {
              const isValidEnPassant = lastMove.to[1] === hoveredSquare[1] && hoveredSquare[0] === 2

              // Capture en passant
              if (isValidEnPassant) {
                isValidPieceMove = true
                setBoard((newBoard) => {
                  newBoard[3][hoveredSquare[1]] = ' '
                  return newBoard
                })
              }
            }
            break
        }

        if (whitePieces.includes(draggedPiece) && isntFriendlyFire && isValidPieceMove) return true
        break

      case 'black':
        isntFriendlyFire = !blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])

        switch (draggedPiece) {
          case '♚':
            console.log('Checking black king')
            isValidPieceMove = Math.abs(draggedPiecePos[0] - hoveredSquare[0]) <= 1 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) <= 1
            break

          case '♛':
            console.log('Checking black queen')
            isValidPieceMove = checkCollision() && ((draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1]) || (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])))
            break

          case '♜':
            console.log('Checking black rook')
            isValidPieceMove = checkCollision() && (draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1])
            break

          case '♝':
            console.log('Checking black bishop')
            isValidPieceMove = checkCollision() && Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])
            break

          case '♞':
            console.log('Checking black knight')
            isValidPieceMove = (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === 2 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1) || (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === 1 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 2)
            break

          case '♟':
            console.log('Checking black pawn')
            const pawnHasntMoved = draggedPiecePos[0] === 1 // Pawn start rank

            // Normal moves
            if (pawnHasntMoved) {
              if (!whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && (draggedPiecePos[0] - hoveredSquare[0] === -1 || draggedPiecePos[0] - hoveredSquare[0] === -2)) {
                isValidPieceMove = checkCollision()
                break
              }
            } else {
              if (!whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && draggedPiecePos[0] - hoveredSquare[0] === -1) {
                isValidPieceMove = true
                break
              }
            }

            // Captures
            if (whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])) {
              if (Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1 && draggedPiecePos[0] - hoveredSquare[0] === -1) {
                isValidPieceMove = true
                break
              }
            }

            // Can en passant
            if (lastMove.piece === '♙' && lastMove.from[0] === 6 && lastMove.to[0] === 4 && draggedPiecePos[0] === 4 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1) {
              const isValidEnPassant = lastMove.to[1] === hoveredSquare[1] && hoveredSquare[0] === 5

              // Capture en passant
              if (isValidEnPassant) {
                isValidPieceMove = true
                setBoard((newBoard) => {
                  newBoard[4][hoveredSquare[1]] = ' '
                  return newBoard
                })
              }
            }
            break
        }
          
        if (blackPieces.includes(draggedPiece) && isntFriendlyFire && isValidPieceMove) return true
        break
    }
  }

  useEffect(() => {
    buildBoard()
  }, [colorToMove])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Chezz</h1>
      <div className="card">
        <motion.div className='board' ref={boardRef} onPointerUpCapture={updateBoard}>
          {boardElements}
        </motion.div>
      </div>
    </>
  )
}

function Square(props: { fileIndex: number, rowIndex: number, piece: Piece }) {
  const ref = useRef(null)
  const pieceClassesWhite = ['k', 'q', 'r', 'b', 'n', 'p']
  const pieceClassesBlack = ['K', 'Q', 'R', 'B', 'N', 'P']

  const fileClass = `file-${props.fileIndex.toString()}`
  const rowClass = `row-${props.rowIndex.toString()}`
  const pieceClass = whitePieces.includes(props.piece) ? pieceClassesWhite[whitePieces.indexOf(props.piece)] : blackPieces.includes(props.piece) ? pieceClassesBlack[blackPieces.indexOf(props.piece)] : ' '

  const dragControls = useDragControls()

  return (
    <div
      className={`square ${fileClass} ${rowClass}`}
      ref={ref}
      onPointerEnter={() => hoveredSquare = [props.rowIndex, props.fileIndex]}
      onPointerDown={
        (event) => {
          dragControls.start(event)
          draggedPiece=props.piece
          draggedPiecePos=[props.rowIndex, props.fileIndex]
        }
      }
    >
      <motion.div
        drag 
        dragConstraints={ref} 
        dragControls={dragControls}
        dragElastic={1} 
        dragTransition={{bounceStiffness: 200, bounceDamping: 15}}
        whileDrag={{ scale: 1.3, filter: "drop-shadow(0px 0px 24px rgba(0, 0, 0, 0.6))"}}
        className={pieceClass !== ' ' ? `piece piece-${pieceClass}` : 'piece empty'}
      />
    </div>
  )
}
