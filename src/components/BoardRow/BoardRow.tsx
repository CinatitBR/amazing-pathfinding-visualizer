import { RowType, CellType } from '../Board/Board';
import { Container } from './BoardRow.style';

export type Props = {
  row: RowType,
  cellSize?: number,
  mouseDownButton: string | null,
  onCellClick: Function
}

const BoardRow = ({ row, cellSize = 25, mouseDownButton, onCellClick }: Props) => {
  return (
    <Container cellSize={cellSize}>
      {row.map(cell => (
        <td 
          key={cell.id} 
          id={cell.id} 
          className={cell.state}
          onClick={e => onCellClick(e, cell)}
          onContextMenu={e => {
            onCellClick(e, cell)
          }}
          onMouseOver={(e) => {
            if (mouseDownButton) {
              onCellClick(e, cell, mouseDownButton)
            }
          }}>
        </td>
      ))}
    </Container>
  )
}

export default BoardRow