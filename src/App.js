import React, { useState, useEffect } from "react";
import "rc-slider/assets/index.css";
import "./styles.css";
import _ from "lodash";
import randomColor from "randomcolor";
import bg from "./bg.png";
import Slider from "rc-slider";
import { Swipeable } from 'react-swipeable'

console.log(bg);

export default function App() {
  const [size, setSize] = useState(6);

  const [gameState, setGameState] = useState([]);

  const init = () => {
    const colors = [
      "0.9372549, 0.4509804, 0.654902",
      "0.5921569, 0.44313726, 0.84705883",
      "0.972549, 0.78431374, 0.3529412",
      "0.78039217, 0.827451, 0.3254902",
      "0.41568628, 0.7607843, 0.8392157",
      "0.37254903, 0.87058824, 0.7019608",
      "0.827451, 0.4392157, 0.3254902",
      "0.3372549, 0.3254902, 0.827451",
      "0.3529412, 0.827451, 0.3254902",
      "0.79607844, 0.3254902, 0.827451",
      "0.827451, 0.7529412, 0.3254902",
      "0.827451, 0.3254902, 0.45882353",
      "0.827451, 0.3254902, 0.3647059",
      "1, 0.62352943, 0.77254903",
    ].map(color => {
      const [r, g, b] = color.split(', ');
      return 'rgb(' + [
        r * 255 >> 0,
        g * 255 >> 0,
        b * 255 >> 0,
      ].join(', ') + ')'
    });


    const positions = _.shuffle(
      _.flatten(_.range(size).map(col => _.range(size).map(row => ({row, col}))))
    ).slice(0, size * size - 1);

    const state = _.chain(positions)
      .map((position, index) => {
        return {
          ...position,
          color: colors[index / size >> 0],
          key: index
        };
      })
      .keyBy(({row, col}) => `${row},${col}`)
      .value();
    
      console.log(state)

    setGameState(state);
  };

  useEffect(init, [size]);

  const changeCord = (position, direction) => {
    const newPosition = position + direction;
    if (newPosition > size - 1) return position;
    else if (newPosition < 0) return position;
    else return newPosition;
  }

  const action = (direction) => () => {
    const state = _.chain(gameState)
    .map(node => {
      const row = changeCord(node.row, direction.row);
      const col = changeCord(node.col, direction.col);

      console.log(row, col)

      if (gameState[`${row},${col}`]) return node;
      else return {
        ...node, row, col
      }
    })
    .keyBy(({row, col}) => `${row},${col}`)
    .value();

    setGameState(state);
  };

  // const upHandler = action({ row: -1, col: 0 });
  // const downHandler = action({ row: 1, col: 0 });
  // const leftHandler = action({ row: 0, col: -1 });
  // const rightHandler = action({ row: 0, col: 1 });

  return (<Swipeable trackMouse delta={2}
    onSwipedLeft  = {action({ row: 0, col: -1 })}
    onSwipedRight = {action({ row: 0, col: 1 })}
    onSwipedDown  = {action({ row: 1, col: 0 })}
    onSwipedUp    = {action({ row: -1, col: 0 })}
  >
    <div
      className="App"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        margin: 0,
        background: `url(${bg})`,
        backgroundSize: "cover",
        pointerEvent: "none",
        userSelect: "none",
        boxSizing: "border-box"
      }}
      tabIndex="0"
    >
      <p
        style={{
          marginBottom: "20px",
          width: 300,
          margin: "30px auto 40px"
        }}
      >
        <Slider
          dots
          step={1}
          value={size}
          min={2}
          max={12}
          onChange={setSize}
        />
      </p>
      <p>
        <span
          onClick={init}
          style={{
            padding: 5,
            color: "black",
            fontSize: "20px",
            textTransform: "uppercase",
            fontWeight: "bold",
            background: "white",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          Reset
        </span>
      </p>
      <div
        style={{
          width: size * 60 - 30,
          height: size * 60 - 30,
          position: "relative",
          margin: "auto",
          marginTop: 50
        }}
      >
        {_.map(gameState, ({ row, col, color, key }) => (
            <div
              key={key}
              style={{
                borderRadius: 30,
                background: color,
                width: 30,
                height: 30,
                position: "absolute",
                left: col * 60,
                top: row * 60,
                transition: "all ease 0.1s",
                border: '2px white solid'
              }}
            />
          )
        )}
      </div>
    </div>
  </Swipeable>);
}
