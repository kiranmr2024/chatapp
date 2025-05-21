import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect(async () => {
    setUserName(
      await JSON.parse(
        localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
      ).username
    );
  }, []);
  return (
    <Container>
      <img src={Robot} alt="" />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
  flex-direction: column;
  background-color: #f0f8ff;

  img {
    height: 15rem;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2rem;
    text-align: center;
    color: #0077cc;
  }

  span {
    color: #333;
    font-size: 1rem;
    text-align: center;
  }
`;

