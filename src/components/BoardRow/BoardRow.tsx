import { RowType, CellType } from '../Board/Board';
import { Container } from './BoardRow.style';

export type Props = {
  row: RowType,
  cellSize?: number,
  isMouseDown: boolean,
  onCellClick: (cell: CellType) => void
}

const BoardRow = ({ row, cellSize = 25, isMouseDown, onCellClick }: Props) => {
  return (
    <Container cellSize={cellSize}>
      {row.map(cell => (
        <td 
          key={cell.id} 
          id={cell.id} 
          className={cell.state}
          onClick={() => onCellClick(cell)}
          onMouseOver={() => {
            if (isMouseDown)
              onCellClick(cell)
          }}>
        </td>
      ))}
    </Container>
  )
}

export default BoardRow