import { useState, useRef } from 'react';
import useDijkstra from './useDijkstra';

import { Container, ContentWrapper, Board, Button, Title } from './App.style';

export type TPosition = {
  row: number,
  col: number
}

export type CellType = { 
  id: string, 
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
        id: `${i}-${j}`, 
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
  // const [mouseDownButton, setMouseDownButton] = useState<string | null>(null)
  const mousePressedType = useRef<string | false>(false);

  // Update board node
  const handleRowListUpdate = (node: CellType) => {
    const newRowList = rowList.slice();
    newRowList[node.row][node.col] = node;
    
    setRowList(newRowList);
  }

  const updateNodeState = (state: string, row: number, col: number) => {
    const newRowList = rowList.slice();
    newRowList[row][col].state = state;

    setRowList(newRowList);
  }

  const handleMouseDown = (e: any, cell: CellType) => {
    // Left click
    if (e.buttons === 1) {

      // Drag start or target nodes
      if (cell.state === 'start' || cell.state === 'target') {
        mousePressedType.current = cell.state;
      }

      // Place wall
      else {
        mousePressedType.current = 'left';
        updateNodeState('wall', cell.row, cell.col);
      }

    }

    // Right click: remove wall
    else if (e.buttons === 2) {
      mousePressedType.current = 'right';
      updateNodeState('initial', cell.row, cell.col);
    }
  }

  const handleMouseUp = () => {
    mousePressedType.current = false;
  }

  const handleMouseEnter = (cell: CellType) => {
    // If the node is the target or the start, ignore
    if (cell.state === 'start' || cell.state === 'target') {
      return;
    }

    // Place wall
    else if (mousePressedType.current === 'left') {
      updateNodeState('wall', cell.row, cell.col);
    }

    // Remove wall
    else if (mousePressedType.current === 'right') {
      updateNodeState('initial', cell.row, cell.col);
    }

    // Start or target nodes are being dragged
    else if (mousePressedType.current === 'start' || mousePressedType.current === 'target') {
      updateNodeState(mousePressedType.current, cell.row, cell.col);
    }
  }

  const handleMouseLeave = (cell: CellType) => {
    // Start or target are beind dragged out of this node
    if (mousePressedType.current === 'start' || mousePressedType.current === 'target') {
      updateNodeState('initial', cell.row, cell.col)
    }
  }
 
  const handleContextMenu = (e: any) => {
    // Prevent context menu from opening
    e.preventDefault();
  }

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
        {/* <Board rowList={rowList} onCellClick={handleCellClick} /> */}

        <Board>
          <tbody>
            {rowList.map((row, index) => 
              <tr key={index}>
                {row.map(cell => (
                  <td 
                    id={cell.id} 
                    key={cell.id}
                    className={cell.state}
                    onMouseDown={e => handleMouseDown(e, cell)}
                    onMouseUp={handleMouseUp}
                    onMouseEnter={() => handleMouseEnter(cell)}
                    onMouseLeave={() => handleMouseLeave(cell)}
                    onContextMenu={handleContextMenu}
                  >
                  </td>
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
