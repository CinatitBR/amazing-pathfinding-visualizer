import styled from 'styled-components';

export const Container = styled.div`
  margin-top: 30px;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ContentWrapper = styled.main`
  padding: 20px;
  border-radius: 35px;
  background-color: var(--background-dark);
  margin: 0 auto;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const Title = styled.h1`
  color: var(--white);
  font-size: 2.8rem;
`;

export const Button = styled.button`
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
`;