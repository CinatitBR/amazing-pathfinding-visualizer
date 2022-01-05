import { useState } from 'react';
import BoardRow from '../BoardRow/BoardRow'

import { Container } from './Board.style';

export type CellType = { id: string, state: string, weight: number };
export type RowType = CellType[];
export type RowListType = RowType[];

type Props = {
  cellSize?: number,
  rowList: RowListType,
  onCellClick: (cell: CellType) => void
}

const Board = ({ cellSize, rowList, onCellClick }: Props) => {
  const [isMouseDown, setIsMouseDown] = useState(false)

  return (
    <Container 
      onMouseDown={(e) => {
        e.preventDefault();

        setIsMouseDown(true);
      }}
      onMouseUp={() => setIsMouseDown(false)}
    >
      <tbody>
        {rowList.map((row, index) => 
          <BoardRow 
            key={index} 
            row={row} 
            cellSize={cellSize} 
            onCellClick={onCellClick}
            isMouseDown={isMouseDown}
          />  
        )}
      </tbody>
    </Container>
  )
}

export default Board
