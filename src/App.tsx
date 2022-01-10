import { useState, useRef, useCallback, useEffect } from 'react';
import BoardNode from './components/BoardNode/BoardNode';
import dijkstra from './dijkstra';
// @ts-ignore
import popSoundPath from './assets/pop-sound.mp3'

import { Container, BoardWrapper, Board, Button, Title, MyLink } from './App.style';

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

const initialStartPos = { row: 10, col: 30 };
const initialTargetPos = { row: 15, col: 10 };
const rowCount = 25;
const colCount = 50;
const nodeWidth = 25;

const popSound = new Audio(popSoundPath);

function App() {
  const [grid, setGrid] = useState<TGrid>([]);
  const [startPos, setStartPos] = useState(initialStartPos);
  const [targetPos, setTargetPos] = useState(initialTargetPos);
  const [algoStatus, setAlgoStatus] = useState<'initial' | 'finished' | 'running'>('initial');

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
    const newGrid = createGrid({ rowCount, colCount, startPos, targetPos });
    setGrid(newGrid)
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
        ? setStartPos({ row, col })
        : setTargetPos({ row, col });
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
    const { visitedNodesInOrder, nodesInPathOrder } = dijkstra({grid, startPos});
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
    if (!boardWrapperRef.current) {
      return;
    }

    // Calculate initial grid sizes
    const gridWidth = boardWrapperRef.current.scrollWidth;
    const colCount = Math.floor(gridWidth / nodeWidth);
    
    // Create initial grid
    const initialGrid = createGrid({ 
      rowCount: rowCount, 
      colCount: colCount, 
      startPos: initialStartPos, 
      targetPos: initialTargetPos 
    });

    setGrid(initialGrid);

    const resizeGrid = () => {
      // Check if ref is null
      if (!boardWrapperRef.current) {
        return;
      }
  
      // Calculate new grid sizes
      const gridWidth = boardWrapperRef.current.scrollWidth;
      const colCount = Math.floor(gridWidth / nodeWidth);

      // Update grid
      setGrid(prevGrid => {
        const newGrid: TGrid = [];

        // Create resized grid
        for (let row = 0; row < rowCount; row++) {
          const currentRow = [];

          for (let col = 0; col < colCount; col++) {
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

        return newGrid;
      });
    }

    window.addEventListener('resize', resizeGrid);
  }, []);

  return (
    <Container>
      <Title>Pathfinding Visualizer</Title>

      <BoardWrapper ref={boardWrapperRef}>
        <p><span>Algorithm:</span> Dijkstra</p>

        <Board algoStatus={algoStatus}>
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
          {algoStatus === 'initial' && 'Find path'}
          {algoStatus === 'running' && 'Running...'}
          {algoStatus === 'finished' && 'Restart'}
        </Button>
      </BoardWrapper>

      <MyLink>
        Made with ❤️ by <a href="https://github.com/CinatitBR">Igor Rocha</a>
      </MyLink>
    </Container>
  );
}

export default App;
