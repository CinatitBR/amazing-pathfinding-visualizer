import styled from 'styled-components';

export const Container = styled.tr<{ cellSize?: number }>`
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
  
  .start {
    background-image: url('/assets/triangle.svg');
  }

  .target {
    background-image: url('/assets/flag.svg');
  }

  .wall {
    background-color: var(--gray);
    border: none;
    animation: wallAnimation 0.3s;
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

  .touched {
    animation: touchedAnimation 1s forwards alternate ease-out;
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

  .path {
    background-color: var(--yellow);
  }
`