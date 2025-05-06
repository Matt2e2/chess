import { useState, type ReactNode } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

type Piece = '♔' | '♕' | '♖' | '♗' | '♘' | '♙' | '♚' | '♛' | '♜' | '♝' | '♞' | '♟' | ' '

function App() {
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

  const [hoveredSquare, setHoveredSquare] = useState([0, 0])
  const [draggedPiece, setDraggedPiece] = useState({enable: false, x: 0, y: 0, pieceText: '♙'})

  function buildBoard(): ReactNode {
    let rows: ReactNode[] = []

    board.forEach((row, index) => {
      const rowIndex = index
      const rowClass = `row-${rowIndex.toString()}`

      let squares: ReactNode[] = []
      
      row.forEach((piece, index) => {
        const fileIndex = index
        const fileClass = `file-${fileIndex.toString()}`

        squares.push(
          <div
            className={`square ${fileClass} ${rowClass}`}
            onMouseEnter={() => setHoveredSquare([fileIndex, rowIndex])}
            onClick={() => {

            }}
          >
            <span className='pieceText'>{piece}</span>
          </div>
        )
      })

      rows.push(<div className={`row ${rowClass}`}>{squares}</div>)
    })

    function handleClick() {
      
    }

    return (
      <div className='board'>
        {rows}
        {draggedPiece.enable && (
          <div className='dragging-piece'><span className='pieceText'>{draggedPiece.pieceText}</span></div>
        )}
      </div>
    )
  }

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
        {buildBoard()}
      </div>
      <p>{hoveredSquare}</p>
    </>
  )
}

export default App
