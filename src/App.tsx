import { useState, useRef, useEffect, type ReactNode } from 'react'
import { motion, useDragControls } from 'motion/react'
import './App.css'

type Piece = '♔' | '♕' | '♖' | '♗' | '♘' | '♙' | '♚' | '♛' | '♜' | '♝' | '♞' | '♟' | ' '
const whitePieces: Piece[] = ['♔' , '♕' , '♖' , '♗' , '♘' , '♙']
const blackPieces: Piece[] = ['♚' , '♛' , '♜' , '♝' , '♞' , '♟']

let draggedPiece: Piece = ' '
let draggedPiecePos = [0, 0] // [row, file]
let hoveredSquare = [0, 0] // [row, file]
let lastMove = { piece: ' ', from: [0, 0], to: [0, 0] }

const whiteCastlingRights = {queenRook: true, king: true, kingRook: true}
const blackCastlingRights = {queenRook: true, king: true, kingRook: true}



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

  const [boardElements, setBoardElements] = useState<ReactNode[]>()
  
  const [colorToMove, setColorToMove] = useState<'white' | 'black'>('white')

  const [promoting, setPromoting] = useState({state: false, intendedSquare: [0, 0], originSquare: [0, 0]})

  // Build board
  // Sets the board elements from board state of 8 rows of 8 squares
  function buildBoard() {
    let rows: ReactNode[] = []

    board.forEach((row, index) => {
      const rowIndex = index
      const rowClass = `row-${rowIndex.toString()}`

      let squares: ReactNode[] = []
      
      row.forEach((piece, index) => {
        const fileIndex = index

        squares.push(
          <Square key={`${rowIndex},${fileIndex}`} fileIndex={fileIndex} rowIndex={rowIndex} piece={piece}/>
        )
      })

      rows.push(<div key={rowIndex} className={`row ${rowClass}`}>{squares}</div>)
    })

    setBoardElements(rows)
  }


  // Update board
  // Update board state on valid move
  function updateBoard() {
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

  // Check collision
  // Check for piece collide on files, ranks and diagonals
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

  // Check castle collision
  // Special friendly piece collision checking for castling
  function checkCastleCollision(mode: 'short' | 'long' = 'short', color: 'white' | 'black' = 'white') {
    const backrank = color === 'white' ? 7 : 0

    if (mode === 'short') {
      if (board[backrank][5] === ' ' && board[backrank][6] === ' ') return true
    }

    if (mode === 'long') {
      if (board[backrank][1] === ' ' && board[backrank][2] === ' ' && board[backrank][3] === ' ') return true
    }
    
    return false
  }

  // Handle promote click
  // Clicking on the overlay or pieces in the promotion selector
  function handlePromoteClick(piece: number | null) {
    if (!promoting.state) return

    const promotionPieces = colorToMove === 'white' ? whitePieces.slice(1, -1) : blackPieces.slice(1, -1)

    if (piece === null) {
      setPromoting({state: false, intendedSquare: [0, 0], originSquare: [0, 0]})
      console.log('Cancelled promotion for ' + colorToMove)
      return
    }

    if ([0, 1, 2, 3].includes(piece)) {
      setBoard((newBoard) => {
        newBoard[promoting.intendedSquare[0]][promoting.intendedSquare[1]] = promotionPieces[piece]
        newBoard[promoting.originSquare[0]][promoting.originSquare[1]] = ' '

        lastMove = { piece: draggedPiece, from: [draggedPiecePos[0], draggedPiecePos[1]], to: [hoveredSquare[0], hoveredSquare[1]] }
        console.log(`Promoted ${promotionPieces[piece]} from ${colorToMove} pawn`)

        setColorToMove((color) => { return color === 'white' ? 'black' : 'white'})
        setPromoting({state: false, intendedSquare: [0, 0], originSquare: [0, 0]})

        return newBoard
      })
    }
  }

  // Check valid move
  // Check for legal move based on piece disallowing friendly fire or out of turn moves
  function checkValidMove() {
    // Disallow same square moves
    if (hoveredSquare[0] === draggedPiecePos[0] && hoveredSquare[1] === draggedPiecePos[1]) return

    // Color to Move rule
    if (colorToMove === 'white' ? !whitePieces.includes(draggedPiece) : !blackPieces.includes(draggedPiece)) return

    // Don't capture friendly pieces
    let isntFriendlyFire = false

    // Valid move flag
    let isValidPieceMove = false

    // Promoting
    let isPromoting = false

    switch (colorToMove) {
      case 'white':
        isntFriendlyFire = !whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])

        switch (draggedPiece) {
          case '♔':
            console.log('Checking white king')
            console.log(whiteCastlingRights)
          
            // Castling
            if (draggedPiecePos[0] === hoveredSquare[0] && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 2) {

              // Long castle, queenside
              if (draggedPiecePos[1] - hoveredSquare[1] === 2 && whiteCastlingRights.queenRook && whiteCastlingRights.king) {
                if (checkCastleCollision('long', 'white')) {
                  isValidPieceMove = true

                  setBoard((newBoard) => {
                    newBoard[7][0] = ' '
                    newBoard[7][3] = '♖'

                    return newBoard
                  })

                  whiteCastlingRights.king = whiteCastlingRights.kingRook = whiteCastlingRights.queenRook = false

                  break
                }
              }
              
              // Short castle, kingside
              if (draggedPiecePos[1] - hoveredSquare[1] === -2 && whiteCastlingRights.kingRook && whiteCastlingRights.king) {
                if (checkCastleCollision('short', 'white')) {
                  isValidPieceMove = true

                  setBoard((newBoard) => {
                    newBoard[7][7] = ' '
                    newBoard[7][5] = '♖'

                    return newBoard
                  })

                  whiteCastlingRights.king = whiteCastlingRights.kingRook = whiteCastlingRights.queenRook = false

                  break
                }
              }
            }

            // Normal king move
            if (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) <= 1 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) <= 1 && isntFriendlyFire) {
              isValidPieceMove = true
              whiteCastlingRights.king = false
            }

            break

          case '♕':
            console.log('Checking white queen')
            isValidPieceMove = checkCollision() && ((draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1]) || (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])))
            break

          case '♖':
            console.log('Checking white rook')
            isValidPieceMove = checkCollision() && (draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1])

            // Disable castling rights for this rook
            if (isValidPieceMove && isntFriendlyFire) {
              if (draggedPiecePos[0] === 7 && draggedPiecePos[1] === 0) {whiteCastlingRights.queenRook = false; break}
              if (draggedPiecePos[0] === 7 && draggedPiecePos[1] === 7) {whiteCastlingRights.kingRook = false; break}
            }
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
            const canPromote = hoveredSquare[0] === 0
            const pawnHasntMoved = draggedPiecePos[0] === 6 // Pawn start rank

            // Normal moves
            if (pawnHasntMoved) {
              if (!blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && (draggedPiecePos[0] - hoveredSquare[0] === 1 || draggedPiecePos[0] - hoveredSquare[0] === 2)) {
                isValidPieceMove = checkCollision()
                break
              }
            } else {
              if (!blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && draggedPiecePos[0] - hoveredSquare[0] === 1) {
                if (canPromote) {
                  isPromoting = true
                  break
                }

                isValidPieceMove = true
                break
              }
            }

            // Captures
            if (blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])) {
              if (Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1 && draggedPiecePos[0] - hoveredSquare[0] === 1) {
                if (canPromote) {
                  isPromoting = true
                  break
                }

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
        break

      case 'black':
        isntFriendlyFire = !blackPieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])

        switch (draggedPiece) {
          case '♚':
            console.log('Checking black king')
            console.log(blackCastlingRights)
          
            // Castling
            if (draggedPiecePos[0] === hoveredSquare[0] && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 2) {

              // Long castle, queenside
              if (draggedPiecePos[1] - hoveredSquare[1] === 2 && blackCastlingRights.queenRook && blackCastlingRights.king) {
                if (checkCastleCollision('long', 'black')) {
                  isValidPieceMove = true

                  setBoard((newBoard) => {
                    newBoard[0][0] = ' '
                    newBoard[0][3] = '♜'

                    return newBoard
                  })

                  blackCastlingRights.king = blackCastlingRights.kingRook = blackCastlingRights.queenRook = false

                  break
                }
              }
              
              // Short castle, kingside
              if (draggedPiecePos[1] - hoveredSquare[1] === -2 && blackCastlingRights.kingRook && blackCastlingRights.king) {
                if (checkCastleCollision('short', 'black')) {
                  isValidPieceMove = true

                  setBoard((newBoard) => {
                    newBoard[0][7] = ' '
                    newBoard[0][5] = '♜'

                    return newBoard
                  })

                  blackCastlingRights.king = blackCastlingRights.kingRook = blackCastlingRights.queenRook = false

                  break
                }
              }
            }

            // Normal king move
            if (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) <= 1 && Math.abs(draggedPiecePos[1] - hoveredSquare[1]) <= 1 && isntFriendlyFire) {
              isValidPieceMove = true
              blackCastlingRights.king = false
            }
            break

          case '♛':
            console.log('Checking black queen')
            isValidPieceMove = checkCollision() && ((draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1]) || (Math.abs(draggedPiecePos[0] - hoveredSquare[0]) === Math.abs(draggedPiecePos[1] - hoveredSquare[1])))
            break

          case '♜':
            console.log('Checking black rook')
            isValidPieceMove = checkCollision() && (draggedPiecePos[0] === hoveredSquare[0] || draggedPiecePos[1] === hoveredSquare[1])

            // Disable castling rights for this rook
            if (isValidPieceMove && isntFriendlyFire) {
              if (draggedPiecePos[0] === 0 && draggedPiecePos[1] === 0) {blackCastlingRights.queenRook = false; break}
              if (draggedPiecePos[0] === 0 && draggedPiecePos[1] === 7) {blackCastlingRights.kingRook = false; break}
            }
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
            const canPromote = hoveredSquare[0] === 7
            const pawnHasntMoved = draggedPiecePos[0] === 1 // Pawn start rank

            // Normal moves
            if (pawnHasntMoved) {
              if (!whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && (draggedPiecePos[0] - hoveredSquare[0] === -1 || draggedPiecePos[0] - hoveredSquare[0] === -2)) {
                isValidPieceMove = checkCollision()
                break
              }
            } else {
              if (!whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]]) && draggedPiecePos[1] === hoveredSquare[1] && draggedPiecePos[0] - hoveredSquare[0] === -1) {
                if (canPromote) {
                  isPromoting = true
                  break
                }

                isValidPieceMove = true
                break
              }
            }

            // Captures
            if (whitePieces.includes(board[hoveredSquare[0]][hoveredSquare[1]])) {
              if (Math.abs(draggedPiecePos[1] - hoveredSquare[1]) === 1 && draggedPiecePos[0] - hoveredSquare[0] === -1) {
                if (canPromote) {
                  isPromoting = true
                  break
                }

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
        break
      }

      if (isPromoting) {
        setPromoting({state: true, intendedSquare: hoveredSquare, originSquare: draggedPiecePos})
        return
      }
      
      if (isntFriendlyFire && isValidPieceMove) updateBoard()
  }

  useEffect(() => {
    buildBoard()
  }, [colorToMove])

  const promotingPieceClasses = colorToMove === 'white' ? ['q', 'r', 'b', 'n'] : ['Q', 'R', 'B', 'N']

  return (
    <div className='page-container'>
      <div className="info-container">
        <a href="https://x.com/mattsquare_" target='_blank' className="twitter-link">
          <svg className='icon' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.6667 4L13.1404 10.3158M4.66672 20L10.5615 13.2632M13.1404 10.3158L9.30438 4.90023C9.0709 4.5706 8.95416 4.40579 8.80327 4.28671C8.66967 4.18126 8.5171 4.10237 8.35383 4.05429C8.16944 4 7.96747 4 7.56353 4H6.06276C5.39581 4 5.06234 4 4.88254 4.13843C4.726 4.25895 4.63097 4.44271 4.62311 4.64012C4.61407 4.86685 4.80682 5.13897 5.19233 5.68322L10.5615 13.2632M13.1404 10.3158L18.8078 18.3168C19.1933 18.861 19.386 19.1332 19.377 19.3599C19.3691 19.5573 19.2741 19.741 19.1176 19.8616C18.9378 20 18.6043 20 17.9373 20H16.4366C16.0326 20 15.8307 20 15.6463 19.9457C15.483 19.8976 15.3304 19.8187 15.1968 19.7133C15.046 19.5942 14.9292 19.4294 14.6957 19.0998L10.5615 13.2632" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className='regular-text'>@mattsquare_</span>
        </a>
        <div className="title-container">
          <div className="piece-to-move">
            <div className={'circle ' + colorToMove}></div>
            <span className="subtext">{colorToMove} to move</span>
          </div>
          <h1>Chess.</h1>
          <div className="reset-button" onClick={() => {location.reload()}}>
            <div className="reset-button-bg"/>
            <svg className='icon' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.7834 2.66992C18.2926 3.86202 18.6449 5.11461 18.832 6.39629C18.8808 6.73098 18.617 6.88085 18.3534 6.9818C18.3221 6.9938 18.2907 7.00568 18.2593 7.01746M18.2593 7.01746C16.7936 5.17853 14.5344 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C15.7277 20 18.8599 17.4505 19.748 14M18.2593 7.01746C17.1394 7.43772 15.9725 7.72281 14.7834 7.86607" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="regular-text">reset board</span>
          </div>
        </div>
      </div>
      <motion.div className='board' ref={boardRef} onPointerUpCapture={checkValidMove}>
        {boardElements}
        {promoting.state && (
          <div className='promotion-overlay'>
            <div className='promotion-cancel' onClick={() => {handlePromoteClick(null)}}/>
            <div className="promotion-select">
              <motion.div className={`piece piece-${promotingPieceClasses[0]}`} onClick={() => {handlePromoteClick(0)}} whileHover={{scale: 1.2}}/>
              <motion.div className={`piece piece-${promotingPieceClasses[1]}`} onClick={() => {handlePromoteClick(1)}} whileHover={{scale: 1.2}}/>
              <motion.div className={`piece piece-${promotingPieceClasses[2]}`} onClick={() => {handlePromoteClick(2)}} whileHover={{scale: 1.2}}/>
              <motion.div className={`piece piece-${promotingPieceClasses[3]}`} onClick={() => {handlePromoteClick(3)}} whileHover={{scale: 1.2}}/>
            </div>
          </div>
        )}
      </motion.div>
    </div>
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
        whileDrag={{ scale: 1.3, filter: "drop-shadow(0px 0px 24px rgba(0, 0, 0, 0.6))", zIndex: 1}}
        className={pieceClass !== ' ' ? `piece piece-${pieceClass}` : 'piece empty'}
      />
    </div>
  )
}
