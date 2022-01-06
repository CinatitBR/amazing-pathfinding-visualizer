import { useState } from 'react';
import { TPosition } from '../../App';
import BoardRow from '../BoardRow/BoardRow'

import { Container } from './Board.style';

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

type Props = {
  cellSize?: number,
  rowList: RowListType,
  onCellClick: Function
}

const Board = ({ cellSize, rowList, onCellClick }: Props) => {
  const [mouseDownButton, setMouseDownButton] = useState<string | null>(null)

  return (
    <Container 
      onMouseDown={(e) => {
        e.preventDefault();
        const node = e.target as HTMLTableCellElement;
        const nodeState = node.className

        // Left click (mouse down)
        if (e.buttons === 1) {
          // Drag start or target nodes
          if (nodeState === 'start' || nodeState === 'target') {
            setMouseDownButton(nodeState);
            return;
          }

          setMouseDownButton('left');
        }
        
        // Right click (mouse down)
        else if (e.buttons === 2) {
          setMouseDownButton('right');
        }
      }}
      onMouseUp={() => setMouseDownButton(null)}
    >
      <tbody>
        {rowList.map((row, index) => 
          <BoardRow 
            key={index} 
            row={row} 
            cellSize={cellSize} 
            onCellClick={onCellClick}
            mouseDownButton={mouseDownButton}
          />  
        )}
      </tbody>
    </Container>
  )
}

export default Board
