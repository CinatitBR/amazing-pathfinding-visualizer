import styled from 'styled-components';

export const Container = styled.tr<{ cellSize?: number, mouseDownButton: string | null }>`
  td {
    border: 1px solid var(--white);
    width: ${props => props.cellSize}px;
    height: ${props => props.cellSize}px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-origin: content-box;
    padding: 1px;
  }

  /* Some position is being dragged, set cursor to "grabbing" */
  cursor: ${props => {
    if (props.mouseDownButton === 'start' || props.mouseDownButton === 'target') {
      return 'grabbing';
    }
  }};
  
  .start {
    background-image: url('/assets/triangle.svg');

    /* If the position is not being dragged, cursor set to "grab" */
    cursor: ${props => !props.mouseDownButton && 'grab'};
  }

  .target {
    background-image: url('/assets/flag.svg');
    cursor: ${props => !props.mouseDownButton && 'grab'};
  }

  .wall {
    background-color: var(--gray);
    border: none;
    animation: wallAnimation 0.3s ease-out alternate 1 forwards running;
  }

  .touched {
    animation: touchedAnimation 1s forwards alternate ease-out;
  }

  .path {
    background-color: var(--yellow);
  }

  .current {
    background-color: var(--red);
  }

  @keyframes wallAnimation {
    0% {
      transform: scale(.3);
      border-radius: 100%;
    }

    50% {
      transform: scale(1.2);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes touchedAnimation {
    0% {
      transform: scale(0.3);
      border-radius: 100%;
      background-color: var(--yellow);
    }

    50% {
      background-color: #8e48ff;
    }

    75% {
      transform: scale(1.2);
      background-color: #4b3cae;
    }

    100% {
      transform: scale(1);
      background-color: var(--blue);
    }
  }
`