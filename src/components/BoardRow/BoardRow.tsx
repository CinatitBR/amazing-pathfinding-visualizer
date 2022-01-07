import { useMemo } from 'react';
import { RowType, CellType } from '../Board/Board';
import { Container } from './BoardRow.style';

export type Props = {
  row: RowType,
  cellSize?: number,
  mouseDownButton: string | null,
  onCellClick: Function,
}

const BoardNode = ({ cell, mouseDownButton, onCellClick }: 
  { 
    cell: CellType, 
    mouseDownButton: string | null, 
    onCellClick: Function 
  }) => (
  <td 
    id={cell.id} 
    className={cell.state}
    onClick={e => onCellClick(e, cell)}
    onContextMenu={e => {
      onCellClick(e, cell)
    }}
    onMouseEnter={e => {
      if (mouseDownButton) {
        onCellClick(e, cell, mouseDownButton)
      }
    }}
    onMouseLeave={e => {
      if (mouseDownButton === 'start' || mouseDownButton === 'target') {
        onCellClick(e, cell, mouseDownButton);
      }
    }}>
  </td>
);

const BoardRow = ({ row, cellSize = 25, mouseDownButton, onCellClick }: Props) => {
  return (
    <Container cellSize={cellSize} mouseDownButton={mouseDownButton}>
      {row.map(cell => (
        <BoardNode
          key={cell.id}
          cell={cell} 
          mouseDownButton={mouseDownButton} 
          onCellClick={onCellClick} 
        />
      ))}
    </Container>
  );
}

export default BoardRow