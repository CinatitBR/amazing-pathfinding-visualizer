import styled from 'styled-components';

export const Container = styled.tr<{ cellSize?: number }>`
  td {
    border: 1px solid #b4a8ff;
    width: ${props => props.cellSize}px;
    height: ${props => props.cellSize}px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-origin: content-box;
    padding: 1px;
  }
  
  .start {
    background-image: url('/assets/map-marker.svg');
  }

  .target {
    background-image: url('/assets/target.svg');
  }

  .wall {
    background-color: #565b65;
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
    animation: touchedAnimation 1.5s forwards alternate ease-out;
  }

  @keyframes touchedAnimation {
    0% {
      transform: scale(0.3);
      background-color: #452fd6;
      border-radius: 100%;
    }

    50% {
      background-color: #ce37cc;
    }

    75% {
      transform: scale(1.2);
      background-color: #4b3cae;
    }

    100% {
      transform: scale(1);
      background-color: #4e4396;
    }
  }
`