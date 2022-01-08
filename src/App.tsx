import { useState, useRef, useCallback } from 'react';
import BoardNode from './components/BoardNode/BoardNode';
import useDijkstra from './useDijkstra';

import { Container, ContentWrapper, Board, Button, Title } from './App.style';

export type TPosition = {
  row: number,
  col: number
}

export type CellType = { 
  row: number,
  col: number,
  state: string, 
  initialWeight: number, 
  totalWeight: number,
  parentPos?: TPosition | null,
  processed: boolean 
}
export type RowType = CellType[];
export type RowListType = RowType[];

const createRowList = ({
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
  const rowList: RowListType = [];

  // Get start node neighbors positions
  const startNeighborsPos = [
    { row: startPos.row+1, col: startPos.col }, // Top
    { row: startPos.row-1, col: startPos.col }, // Bottom
    { row: startPos.row, col: startPos.col+1}, // Right
    { row: startPos.row, col: startPos.col-1 } // Left
  ]
  
  for (let i = 0; i < rowCount; i++) {
    const row: RowType = [];
  
    for (let j = 0; j < colCount; j++) {
      let state = 'initial';
      let processed = false;

      // Check if node is the start node
      if (i === startPos.row && j === startPos.col) {
        state = 'start';
        processed = true;
      }
      // Check if node is the target node
      else if (i === targetPos.row && j === targetPos.col)
        state = 'target'

      // Check if node is a start neighbor
      const isStartNeighbor = startNeighborsPos.find(neighborPos => (
        neighborPos.row === i && neighborPos.col === j
      ));

      const initialWeight = 1;

      // If current node is a start neighbor, assign ...
      // totalWeight the same value as initialWeight
      let totalWeight = isStartNeighbor ? initialWeight : Infinity;

      // Check if current node is start neighbor, assign parent as start node
      let parentPos = isStartNeighbor ? startPos : null

      const cell: CellType = { 
        row: i,
        col: j,
        state, 
        initialWeight, 
        totalWeight,
        parentPos,
        processed
      }

      row.push(cell);
    }
  
    rowList.push(row);
  }

  return rowList;
}

const startPos = { row: 10, col: 30};
const targetPos = {row: 15, col: 10};
const rowCount = 25;
const colCount = 50;

const rowListData = createRowList({ rowCount, colCount, startPos, targetPos });

function App() {
  const [rowList, setRowList] = useState(rowListData);
  const mousePressedType = useRef<string | false>(false);

  // Update board node
  const handleRowListUpdate = useCallback((node: CellType) => {
    setRowList(prevGrid => {
      const newRowList = prevGrid.slice();
      newRowList[node.row][node.col] = node;
      
      return newRowList;
    });
    // setRowList(newRowList); 
  }, []);

  const updateNodeState = useCallback((state: string, row: number, col: number) => {
    setRowList(prevGrid => {
      const newGrid = prevGrid.slice();
      newGrid[row][col].state = state;

      return newGrid;
    });
  }, [])

  const handleMouseDown = useCallback((e: any, row: number, col: number, state: string) => {
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

  // Handle algorithm finish
  const highlightPath = (nodePos: TPosition): any => {
    // Get current node in the path
    const currentNode = rowList[nodePos.row][nodePos.col];

    // Check if node is the start
    if (currentNode.state === 'start')
      return

    // Update node state to 'path'
    currentNode.state = 'path';
    handleRowListUpdate(currentNode);

    // Get next node in the path
    const nextNode = currentNode.parentPos;

    if (!nextNode) return

    // Call method again with delay
    return setTimeout(() => { 
      highlightPath(nextNode)
    }, 50);
  }

  const dijkstra = useDijkstra({ 
    rowList, 
    startPos, 
    onRowListUpdate: handleRowListUpdate,
    onFinish: highlightPath
  });

  return (
    <Container>
      <Title>Pathfinder Visualizer</Title>

      <ContentWrapper>

        <Board>
          <tbody>
            {rowList.map((row, index) => 
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

        <Button onClick={() => dijkstra.run()}>
          Find path
        </Button>
      </ContentWrapper>
    </Container>
  );
}

export default App;
