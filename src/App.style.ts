import styled, { css } from 'styled-components';
// @ts-ignore
import triangleSvg from './assets/triangle.svg';
// @ts-ignore
import flagSvg from './assets/flag.svg';

export const Container = styled.div`
  margin-top: 30px;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ContentWrapper = styled.main`
  padding: 20px;
  border-radius: 16px;
  background-color: var(--background-dark);
  width: 100%;
  overflow-x: auto;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;

  p {
    font-size: 1.15rem;
    color: var(--white);
    font-weight: bold;
    margin-right: auto;
  }

  p span {
    color: var(--yellow);
    font-weight: normal;
  }
`;

export const Title = styled.h1`
  color: var(--white);
  font-size: 2.8rem;
  text-align: center;
`;

export const Board = styled.table<{ algoStatus: 'initial' | 'running' | 'finished' }>`
  border-collapse: collapse;
  pointer-events: ${({ algoStatus }) => algoStatus === 'running' ? 'none' : 'auto'};

  td {
    border: 1px solid var(--white);
    min-width: 25px;
    height: 25px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-origin: content-box;
    padding: 1px;
  }

  .start {
    background-image: url(${triangleSvg});
    cursor: grab;
  }

  .target {
    background-image: url(${flagSvg});
    cursor: grab;
  }

  .wall {
    background-color: var(--gray);
    border: none;
    animation: popAnimation 0.3s ease-out alternate 1 forwards running;
  }

  .touched {
    animation: touchedAnimation 1s forwards alternate ease-out;
  }

  .path {
    background-color: var(--yellow);
    animation: popAnimation 0.3s ease-out alternate 1 forwards running;
  }

  .current {
    background-color: var(--red);
  }

  @keyframes popAnimation {
    0% {
      transform: scale(.3);
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

  /* @keyframes pathAnimation {
    to {
      background-color: var(--yellow);
    }
  } */
`;

export const Button = styled.button<{ algoStatus: string }>`
  font-size: 1.3rem;
  font-weight: normal;

  background-color: var(--purple);
  color: var(--white);
  border: none;
  min-width: 150px;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: transform 300ms ease;

  :hover {
    transform: translateY(-5px);
  }

  ${({algoStatus}) => algoStatus === 'running' && css`
    background-color: #5b467e;
    pointer-events: none;
  `}
`;