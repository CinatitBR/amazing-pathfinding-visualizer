import { useState, useEffect } from 'react';
import Board, { RowType, CellType, RowListType } from './components/Board/Board';
import useDijkstra from './useDijkstra';

import { Container, ContentWrapper, Button, Title } from './App.style';

export type TPosition = {
  row: number,
  col: number
}

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

const startPos = { row: 0, col: 0};
const targetPos = {row: 15, col: 10};
const rowCount = 25;
const colCount = 50;

const rowListData = createRowList({ rowCount, colCount, startPos, targetPos });

function App() {
  const [rowList, setRowList] = useState(rowListData);

  // Update board node
  const handleRowListUpdate = (node: CellType) => {
    const newRowList = [...rowList];
    newRowList[node.row][node.col] = node;
    
    setRowList(newRowList);
  }
  
  const handleCellClick = (e: React.MouseEvent, cell: CellType, mouseDownButton?: string) => {
    const {row, col} = cell;
    const newNode = rowList[row][col];

    // Get node state
    const currentState = newNode.state;

    // Check node state
    if (currentState === 'start' || currentState === 'target')
      return

    // Left click, add wall
    if (e.type === 'click' || mouseDownButton === 'left') { 
      newNode.state = 'wall';
    }
    // Right click, remove wall
    else if (e.type === 'contextmenu' || mouseDownButton === 'right') { 
      newNode.state = 'initial';
    }

    handleRowListUpdate(newNode);
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

  useEffect(() => {
    // document.addEventListener('contextmenu', e => {
    //   console.log(e.button);
    //   e.preventDefault()
    // });
  }, []);

  return (
    <Container>
      <Title>Pathfinder Visualizer</Title>

      <ContentWrapper>
        <Board rowList={rowList} onCellClick={handleCellClick} />

        <Button onClick={() => dijkstra.run()}>
          Find path
        </Button>
      </ContentWrapper>
    </Container>
  );
}

export default App;
