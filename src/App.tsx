import { useState } from 'react';
import Board, { RowType, CellType, RowListType } from './components/Board/Board';

import './App.css';

const createRowList = (rowCount: number, colCount: number, startPos: string, targetPos: string) => {
  const rowList: RowListType = [];
  
  for (let i = 0; i < rowCount; i++) {
    const row: RowType = [];
  
    for (let j = 0; j < colCount; j++) {
      const [startRow, startCol] = startPos.split('-')
      const [targetRow, targetCol] = targetPos.split('-')
      let state = 'initial';

      if (i === parseInt(startRow) && j === parseInt(startCol))
        state = 'start'
      else if (i === parseInt(targetRow) && j === parseInt(targetCol))
        state = 'target'

      const cell: CellType = { id: `${i}-${j}`, state, weight: 1};

      row.push(cell);
    }
  
    rowList.push(row);
  }

  return rowList;
}

const rowListData = createRowList(25, 50, '5-20', '9-33');

function App() {
  const [rowList, setRowList] = useState(rowListData)

  const handleCellClick = (cell: CellType) => {
    const [rowIndex, colIndex] = cell.id.split('-');
    const newRowList = [...rowList];

    // Get cell state
    const currentState = newRowList
      [parseInt(rowIndex)]
      [parseInt(colIndex)].state;

    if (currentState === 'start' || currentState === 'target')
      return

    // Update cell state
    newRowList
      [parseInt(rowIndex)]
      [parseInt(colIndex)]
      .state = currentState === 'initial' ? 'wall' : 'initial';

    setRowList(newRowList);
  }

  return (
    <div className="app">
      <Board rowList={rowList} onCellClick={handleCellClick} />
    </div>
  );
}

export default App;
