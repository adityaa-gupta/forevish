import styled, { css } from "styled-components";

const sizes = {
  small: css`
    padding: 0.4rem 0.8rem;
    text-transform: uppercase;
    font-weight: 600;
    text-align: center;
  `,
  medium: css`
    font-size: 1.4rem;
    padding: 1.2rem 1.6rem;
    font-weight: 500;
  `,
  large: css`
    font-size: 1.6rem;
    padding: 1.2rem 2.4rem;
    font-weight: 500;
  `,
};

const variations = {
  primary: css`
    color: #ffffff;
    background-color: #2563eb;

    &:hover {
      background-color: #1d4ed8;
    }
  `,
  secondary: css`
    color: #1e40af;
    background: #eff6ff;
    border: 1px solid #93c5fd;

    &:hover {
      background-color: #dbeafe;
    }
  `,
  danger: css`
    color: #ffffff;
    background-color: #dc2626;

    &:hover {
      background-color: #b91c1c;
    }
  `,
};

const Button = styled.button`
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  cursor: pointer;

  ${(props) => sizes[props.size]}
  ${(props) => variations[props.variation]}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media only screen and (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.7rem 0.9rem;
  }
`;

Button.defaultProps = {
  variation: "primary",
  size: "medium",
};

export default Button;
