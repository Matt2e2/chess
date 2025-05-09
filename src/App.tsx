import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, useDragControls } from 'motion/react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type Piece = '♔' | '♕' | '♖' | '♗' | '♘' | '♙' | '♚' | '♛' | '♜' | '♝' | '♞' | '♟' | ' '
const whitePieces = ['♔' , '♕' , '♖' , '♗' , '♘' , '♙']
const blackPieces = ['♚' , '♛' , '♜' , '♝' , '♞' , '♟']

let draggedPiece: Piece = ' '
let draggedPiecePos = [0, 0]
let hoveredSquare = [0, 0]

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

      console.log(`Updated piece ${draggedPiece} at [${hoveredSquare[0]}, ${hoveredSquare[1]}] from [${draggedPiecePos[0]}, ${draggedPiecePos[1]}]`)
      setColorToMove((color) => { return color === 'white' ? 'black' : 'white'})

      return newBoard
    })
  }

  function checkValidMove() {
    if (hoveredSquare[0] === draggedPiecePos[0] && hoveredSquare[1] === draggedPiecePos[1]) return false

    switch (colorToMove) {
      case 'white':
        if (whitePieces.includes(draggedPiece) && !whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])) return true
        break

      case 'black':
        if (blackPieces.includes(draggedPiece) && !blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])) return true
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
      <h1>Vite + React</h1>
      <div className="card">
        <motion.div className='board' ref={boardRef} onPointerUpCapture={updateBoard}>
          {boardElements}
        </motion.div>
      </div>
    </>
  )
}

function Square(props: any) {
  const ref = useRef(null)

  const fileClass = `file-${props.fileIndex.toString()}`
  const rowClass = `row-${props.rowIndex.toString()}`

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
      <motion.span
        drag 
        dragConstraints={ref} 
        dragControls={dragControls}
        dragElastic={1} 
        dragTransition={{bounceStiffness: 200, bounceDamping: 15}}
        whileDrag={{ scale: 1.3, textShadow: "rgba(0, 0, 0, 0.6) 0px 0px 24px"}}
        className='pieceText'
      >
        {props.piece}
      </motion.span>
    </div>
  )
}
