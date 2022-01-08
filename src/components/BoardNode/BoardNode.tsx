import React, { MouseEventHandler } from 'react'

type Props = {
  row: number,
  col: number,
  state: string,
  onMouseDown: Function,
  onMouseUp: MouseEventHandler,
  onMouseEnter: Function,
  onMouseLeave: Function,
  onContextMenu: MouseEventHandler
}

const BoardNode = React.memo(
  ({ 
    row, 
    col, 
    state, 
    onMouseDown, 
    onMouseUp,
    onMouseEnter, 
    onMouseLeave, 
    onContextMenu
  }: Props) => {
  return (
    <td 
      id={`${row}-${col}`} 
      className={state}
      onMouseDown={e => onMouseDown(e, row, col, state)}
      onMouseUp={onMouseUp}
      onMouseEnter={() => onMouseEnter(row, col, state)}
      onMouseLeave={() => onMouseLeave(row, col)}
      onContextMenu={onContextMenu}
    >
    </td>
  );
})

export default BoardNode
