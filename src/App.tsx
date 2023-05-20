import { useState, useRef, useCallback, useEffect } from 'react';
import BoardNode from './components/BoardNode/BoardNode';
import dijkstra from './dijkstra';
// @ts-ignore
import popSoundPath from './assets/pop-sound.mp3'
// @ts-ignore
import instructionsGif from './assets/instructions-gif.gif'; // with import

import { Container, BoardWrapper, Board, Button, Title, MyLink, InstructionsBox } from './App.style';

export type TPosition = {
  row: number,
  col: number
}

export type TNode = { 
  row: number,
  col: number,
  state: string, 
  initialWeight: number, 
  totalWeight: number,
  parentNode: TNode | null,
  processed: boolean 
}
export type TRow = TNode[];
export type TGrid = TRow[];

const createNode = (row: number, col: number): TNode => {
  return {
    row,
    col,
    state: 'initial',
    initialWeight: 1, 
    totalWeight: Infinity,
    parentNode: null,
    processed: false
  }
}

const createGrid = ({
  rowCount,
  colCount, 
  startPos, 
  targetPos
}: { 
  rowCount: number, 
  colCount: number, 
  startPos: TPosition, 
  targetPos: TPosition 
}) => {
  const grid: TGrid = [];
  
  for (let i = 0; i < rowCount; i++) {
    const row: TRow = [];
    
    for (let j = 0; j < colCount; j++) {
      let state = 'initial';
      let processed = false;
      
      // Check if node is the start node
      if (i === startPos.row && j === startPos.col) {
        state = 'start';
        // processed = true;
      }
      // Check if node is the target node
      else if (i === targetPos.row && j === targetPos.col)
      state = 'target'
      
      const node: TNode = { 
        row: i,
        col: j,
        state, 
        initialWeight: 1, 
        totalWeight: Infinity,
        parentNode: null,
        processed
      }
      
      row.push(node);
    }
    
    grid.push(row);
  }
  
  return grid;
}

const ROW_COUNT = 25;
const NODE_WIDTH = 25;
const MAX_GRID_WIDTH = 1000;

const popSound = new Audio(popSoundPath);

function App() {
  const [grid, setGrid] = useState<TGrid>([]);
  const [algoStatus, setAlgoStatus] = useState<'initial' | 'finished' | 'running'>('initial');
  
  const startPos = useRef<TPosition>({ row: 0, col: 0 });
  const targetPos = useRef<TPosition>({ row: 0, col: 0 });
  const colCount = useRef(0)
  const gridWidth = useRef<number | null>(null);

  const mousePressedType = useRef<string | false>(false);
  const boardWrapperRef = useRef<HTMLDivElement>(null);

  const updateNodeState = useCallback((state: string, row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.slice();
      newGrid[row][col].state = state;

      return newGrid;
    });
  }, [])

  const restartGrid = () => {
    const newGrid = createGrid({ 
      rowCount: ROW_COUNT, 
      colCount: colCount.current, 
      startPos: startPos.current, 
      targetPos: targetPos.current 
    });
    setGrid(newGrid);
  }

  const handleMouseDown = useCallback((e: any, row: number, col: number, state: string) => {
    // Prevent element drag
    e.preventDefault();
    
    // Left click
    if (e.buttons === 1) {

      // Drag start or target nodes
      if (state === 'start' || state === 'target') {
        mousePressedType.current = state;
      }

      // Place wall
      else {
        mousePressedType.current = 'left';
        popSound.play(); // Play pop sound
        updateNodeState('wall', row, col);
      }

    }

    // Right click: remove wall
    else if (e.buttons === 2) {
      mousePressedType.current = 'right';
      updateNodeState('initial', row, col);
    }
  }, [updateNodeState]);

  const handleMouseUp = useCallback(() => {
    mousePressedType.current = false;
  }, [])

  const handleMouseEnter = useCallback((row: number, col: number, state: string) => {
    // If the node is the target or the start, ignore
    if (state === 'start' || state === 'target') {
      return;
    }

    // Place wall
    else if (mousePressedType.current === 'left') {
      updateNodeState('wall', row, col);
      popSound.play(); // Play pop sound
    }

    // Remove wall
    else if (mousePressedType.current === 'right') {
      updateNodeState('initial', row, col);
    }

    // Start or target nodes are being dragged
    else if (mousePressedType.current === 'start' || mousePressedType.current === 'target') {
      updateNodeState(mousePressedType.current, row, col);

      // Set the new positions of "start" or "target" nodes
      mousePressedType.current === 'start' 
        ? startPos.current = { row, col }
        : targetPos.current = { row, col };
    }
  }, [updateNodeState])

  const handleMouseLeave = useCallback((row: number, col: number) => {
    // Start or target are beind dragged out of this node
    if (mousePressedType.current === 'start' || mousePressedType.current === 'target') {
      updateNodeState('initial', row, col)
    }
  }, [updateNodeState])
 
  const handleContextMenu = useCallback((e: any) => {
    // Prevent context menu from opening
    e.preventDefault();
  }, [])

  const animateDijkstra = (visitedNodesInOrder: TNode[], nodesInPathOrder: TNode[] | null) => {
    const { length } = visitedNodesInOrder;

    for (let i = 0; i <= length; i++) {
      const node = visitedNodesInOrder[i];

      // Check if all nodes were touched.
      if (i === length) {

        // Check if path exists. 
        // nodesInPathOrder may not exist (when it wasn't possible to reach the target).
        if (nodesInPathOrder) {
          // Call path animation
          setTimeout(() => {
            animatePath(nodesInPathOrder);
          }, 30 * i);
        }
        
        // If path doesn't exist, finish animation.
        else {
          setTimeout(() => {
            setAlgoStatus('finished');
          }, 30 * i);
        }

        return;
      }

      // Doesn't touch the start node
      else if (node.state === 'start') {
        continue
      }

      // Touch block
      setTimeout(() => {
        updateNodeState('touched', node.row, node.col);
      }, 30 * i);
    }
  }

  const animatePath = (nodesInPathOrder: TNode[]) => {
    const { length } = nodesInPathOrder;

    for (let i = 0; i < length; i++) {
      const node = nodesInPathOrder[i];

      // Finish path animation.
      if (node.state === 'target') {
        setAlgoStatus('finished');
        return;
      }

      // Mark node as path.
      setTimeout(() => {
        updateNodeState('path', node.row, node.col);
      }, 50 * i)
    }
  }

  const runDijkstra = () => {
    const { 
      visitedNodesInOrder, 
      nodesInPathOrder 
    } = dijkstra({ grid, startPos: startPos.current });

    animateDijkstra(visitedNodesInOrder, nodesInPathOrder);
  }

  const handleButtonClick = () => {
    if (algoStatus === 'initial') {
      setAlgoStatus('running');
      // Start algorithm execution
      runDijkstra(); 
    }
    else if (algoStatus === 'finished') {
      setAlgoStatus('initial');
      // Restart grid
      restartGrid();
    }
  }

  useEffect(() => {

    const getInitialGrid = () => {
      // Calculate initial grid sizes
      const initialGridWidth = Math.min(boardWrapperRef.current!.scrollWidth, MAX_GRID_WIDTH);
      const initialColCount = Math.floor(initialGridWidth / NODE_WIDTH);

      const initialStartPos = {
        row: Math.floor(ROW_COUNT / 2),
        col: Math.floor(initialColCount / 2)
      }
      const initialTargetPos = {
        row: Math.floor(ROW_COUNT / 2),
        col: 0
      }

      // Update refs
      startPos.current = initialStartPos;
      targetPos.current = initialTargetPos;
      colCount.current = initialColCount;
      
      // Create initial grid
      const initialGrid = createGrid({ 
        rowCount: ROW_COUNT, 
        colCount: initialColCount, 
        startPos: initialStartPos, 
        targetPos: initialTargetPos 
      });

      return { initialGrid, initialGridWidth };
    }

    const resizeGrid = (newColCount: number) => {
      // Update grid
      setGrid(prevGrid => {
        const newGrid: TGrid = [];

        // Create resized grid
        for (let row = 0; row < ROW_COUNT; row++) {
          const currentRow = [];

          for (let col = 0; col < newColCount; col++) {
            const currentNode = prevGrid[row][col];

            // Check if current node exist
            if (currentNode) {
              // Add current node to new grid
              currentRow.push(currentNode);
            }

            // Current node doesn't exist, grid was increased.
            else {
              // Create new node
              const newNode = createNode(row, col);
              currentRow.push(newNode);
            }

          }

          newGrid.push(currentRow);
        }

        // Check if start node is beyond the col limit
        if (startPos.current.col > newColCount - 1) {
          // Update start position
          startPos.current.col = newColCount - 1;

          // Set the new start node
          newGrid
            [startPos.current.row]
            [startPos.current.col]
            .state = 'start';
        }

        // Check if target node is beyond the col limit
        if (targetPos.current.col > newColCount - 1) {
          // Update start position
          targetPos.current.col = newColCount - 1;

          // Set the new start node
          newGrid
            [targetPos.current.row]
            [targetPos.current.col]
            .state = 'target';
        }

        return newGrid;
      });
    }

    const handleResize = () => {
      // Check if refs are null
      if (
        !boardWrapperRef.current ||
        !gridWidth.current
      ) {
        return;
      }
      
      // Get the new grid width based on the resize. 
      // Grid has a maximum size defined by a variable.
      const newGridWidth = Math.min(boardWrapperRef.current.scrollWidth, MAX_GRID_WIDTH);
      const newColCount = Math.floor(newGridWidth / NODE_WIDTH);

      // Check if new grid width is different than current grid width
      if (
        newGridWidth > gridWidth.current + 1 ||
        newGridWidth < gridWidth.current - 1
      ) {
        // Resize grid to new col count
        resizeGrid(newColCount);

        // Update refs
        gridWidth.current = newGridWidth;
        colCount.current = newColCount;
      }
    }

    // Update grid to initialGrid
    const { initialGrid, initialGridWidth } = getInitialGrid();
    setGrid(initialGrid);
    gridWidth.current = initialGridWidth;

    // Add resize event listener
    window.addEventListener('resize', handleResize);
  }, []);

  return (
    <Container>
      <Title>Encontrando o menor caminho</Title>

      <BoardWrapper ref={boardWrapperRef} algoStatus={algoStatus}>
        {/* <p><span>Algorithm:</span> Dijkstra</p> */}

        <Board algoStatus={algoStatus} maxWidth={MAX_GRID_WIDTH}>
          <tbody>
            {grid.map((row, index) => 
              <tr key={index}>
                {row.map(({ row, col, state }) => (
                  <BoardNode 
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    state={state}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onContextMenu={handleContextMenu}
                  />
                ))}
              </tr>
            )}
          </tbody>
        </Board>

        <Button 
          onClick={handleButtonClick} 
          disabled={algoStatus === 'running'}
          algoStatus={algoStatus}
        >
          {algoStatus === 'initial' && 'Encontrar'}
          {algoStatus === 'running' && 'Calculando menor rota...'}
          {algoStatus === 'finished' && 'Recomeçar'}
        </Button>
      </BoardWrapper>

      <InstructionsBox>
        <h3>Como jogar?</h3>
        <img src={instructionsGif} alt="instructions gif" />

        <p><span>Botão esquerdo:</span> Colocar parede</p>
        <p><span>Botão direito:</span> Remover parede</p>
      </InstructionsBox>

      <MyLink>
        Made with ❤️ by <a href="https://github.com/CinatitBR">Igor Rocha</a>
      </MyLink>
    </Container>
  );
}

export default App;
