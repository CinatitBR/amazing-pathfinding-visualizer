import { useState, useRef, useCallback } from 'react';
import BoardNode from './components/BoardNode/BoardNode';
import dijkstra from './dijkstra';

import { Container, ContentWrapper, Board, Button, Title } from './App.style';
import { visitIterationBody } from 'typescript';

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

  // Get start node neighbors positions
  // const startNeighborsPos = [
  //   { row: startPos.row+1, col: startPos.col }, // Top
  //   { row: startPos.row-1, col: startPos.col }, // Bottom
  //   { row: startPos.row, col: startPos.col+1}, // Right
  //   { row: startPos.row, col: startPos.col-1 } // Left
  // ]
  
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

      // Check if node is a start neighbor
      // const isStartNeighbor = startNeighborsPos.find(neighborPos => (
      //   neighborPos.row === i && neighborPos.col === j
      // ));

      // const initialWeight = 1;

      // If current node is a start neighbor, assign ...
      // totalWeight the same value as initialWeight
      // let totalWeight = isStartNeighbor ? initialWeight : Infinity;

      // Check if current node is start neighbor, assign parent as start node
      // let parentPos = isStartNeighbor ? startPos : null

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

const startPos = { row: 10, col: 30};
const targetPos = {row: 15, col: 10};
const rowCount = 25;
const colCount = 50;

const initialGrid = createGrid({ rowCount, colCount, startPos, targetPos });

function App() {
  const [grid, setGrid] = useState(initialGrid);
  const mousePressedType = useRef<string | false>(false);

  // Update board node
  // const handlegridUpdate = useCallback((node: TNode) => {
  //   setGrid(prevGrid => {
  //     const newgrid = prevGrid.slice();
  //     newgrid[node.row][node.col] = node;
      
  //     return newgrid;
  //   });
  // }, []);

  const updateNodeState = useCallback((state: string, row: number, col: number) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.slice();
      newGrid[row][col].state = state;

      return newGrid;
    });
  }, [])

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
    }

    // Remove wall
    else if (mousePressedType.current === 'right') {
      updateNodeState('initial', row, col);
    }

    // Start or target nodes are being dragged
    else if (mousePressedType.current === 'start' || mousePressedType.current === 'target') {
      updateNodeState(mousePressedType.current, row, col);
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

  const animateDijkstra = (visitedNodesInOrder: TNode[], nodesInPathOrder: TNode[]) => {
    const {length} = visitedNodesInOrder;

    for (let i = 0; i <= length; i++) {
      const node = visitedNodesInOrder[i];
      
      if (i === length) {
        setTimeout(() => {
          animatePath(nodesInPathOrder);
        }, 30 * i);

        return;
      }
      else if (node.state === 'start') {
        continue
      }

      setTimeout(() => {
        updateNodeState('touched', node.row, node.col);
      }, 30 * i);
    }
  }

  const animatePath = (nodesInPathOrder: TNode[]) => {
    const { length } = nodesInPathOrder;

    for (let i = 0; i < length; i++) {
      const node = nodesInPathOrder[i];

      if (node.state === 'target')
        continue

      setTimeout(() => {
        updateNodeState('path', node.row, node.col);
      }, 50 * i)
    }
  }

  const runDijkstra = () => {
    const { visitedNodesInOrder, nodesInPathOrder } = dijkstra({grid, startPos});
    animateDijkstra(visitedNodesInOrder, nodesInPathOrder);
  }

  return (
    <Container>
      <Title>Pathfinding Visualizer</Title>

      <ContentWrapper>
        <Board>
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

        <Button onClick={runDijkstra}>
          Find path
        </Button>
      </ContentWrapper>
    </Container>
  );
}

export default App;
