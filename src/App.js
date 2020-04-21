import React, { useState, useEffect } from "react";
import "rc-slider/assets/index.css";
import "./styles.css";
import _ from "lodash";
import randomColor from "randomcolor";
import bg from "./bg.png";
import bgDay from "./bgday.png";
import Slider from "rc-slider";
import { Swipeable } from "react-swipeable";

console.log(bg);

const LEFT = { row: 0, col: -1 };
const RIGHT = { row: 0, col: 1 };
const DOWN = { row: 1, col: 0 };
const UP = { row: -1, col: 0 };

export default function App() {
  const [size, setSize] = useState(5);
  const [numBlock, setNumBlock] = useState(3);
  const [space, setSpace] = useState(1);
  const [showConfig, setShowConfig] = useState(true);
  const [difficulty, setDifficulty] = useState(0);

  const [showUI, setShowUI] = useState(true);
  const [themeDay, setThemeDay] = useState(false);

  const [gameState, setGameState] = useState([]);
  const [replay, setReplay] = useState([]);
  const [locked, setLocked] = useState(false);

  const hashState = state => {
    return _.chain(state)
      .map(({ key, row, col }) => `${key}.${row}.${col}`)
      .sort()
      .join(",")
      .value();
  };

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
      "1, 0.62352943, 0.77254903"
    ].map(color => {
      const [r, g, b] = color.split(", ");
      return (
        "rgb(" +
        [(r * 255) >> 0, (g * 255) >> 0, (b * 255) >> 0].join(", ") +
        ")"
      );
    });

    const positions = _.flatten(
      _.range(size).map(col => _.range(size).map(row => ({ row, col })))
    );

    const blocks = _.shuffle(positions).slice(0, numBlock);

    let state = _.chain(positions)
      .slice(0, -space)
      .map((position, index) => {
        const colorIndex = (index / size) >> 0;
        if (blocks.indexOf(position) >= 0)
          return {
            ...position,
            color: themeDay ? "gray" : "black",
            key: index,
            locked: true
          };
        else
          return {
            ...position,
            color: colors[colorIndex],
            key: index
          };
      })
      .keyBy(({ row, col }) => `${row},${col}`)
      .value();

    const originalState = state;
    let hashes = [hashState(state)];
    let directions = [];

    for (let i = 0; i < 500; i++) {
      const direction = _.sample([UP, DOWN, LEFT, RIGHT]);
      state = actionCalc(direction, state);
      const hash = hashState(state);
      const hashIndex = hashes.indexOf(hash);
      if (hashIndex < 0) {
        hashes.push(hash);
        directions.push(direction);
      } else {
        hashes = hashes.slice(0, hashIndex + 1);
        directions = directions.slice(0, hashIndex);
      }
    }
    console.log(directions.length);
    setReplay(_.reverse(directions));

    const difficulty = _.reduce(
      state,
      (difficulty, { col, color }) => {
        const colorIndex = colors.indexOf(color);
        if (colorIndex < 0) return difficulty;
        else return difficulty + Math.pow(col - colorIndex, 2);
      },
      0
    );

    setDifficulty(difficulty);

    setGameState(state);
  };

  useEffect(init, [size, numBlock, space]);

  const changeCord = (position, direction) => {
    const newPosition = position + direction;
    if (newPosition > size - 1) return position;
    else if (newPosition < 0) return position;
    else return newPosition;
  };

  const actionCalc = (direction, prevState) => {
    return _.chain(prevState)
      .map(node => {
        if (node.locked) return node;
        const row = changeCord(node.row, direction.row);
        const col = changeCord(node.col, direction.col);

        if (prevState[`${row},${col}`]) return node;
        else
          return {
            ...node,
            row,
            col
          };
      })
      .keyBy(({ row, col }) => `${row},${col}`)
      .value();
  };

  const action = direction => () => {
    const state = actionCalc(direction, gameState);

    setGameState(state);
  };

  const actionReplayNext = replay => {
    const [direction, ...remainReplay] = replay;
    console.log(direction);
    switch (direction) {
      case UP:
        action(DOWN)();
        break;
      case DOWN:
        action(UP)();
        break;
      case LEFT:
        action(RIGHT)();
        break;
      case RIGHT:
        action(LEFT)();
        break;
      default:
        setLocked(false);
        setReplay([]);
        return;
    }
    setReplay(remainReplay);
  };

  useEffect(() => {
    const handleKeyPressed = event => {
      if (locked) return;
      switch (event.key) {
        case "q":
          setShowUI(!showUI);
          break;
        case "w":
          setThemeDay(!themeDay);
          break;
        case "e":
          setShowConfig(!showConfig);
          break;
        case " ":
          // setLocked(true);
          actionReplayNext(replay);
          break;
        default:
          return;
      }
    };
    window.addEventListener("keyup", handleKeyPressed);
    return () => {
      window.removeEventListener("keyup", handleKeyPressed);
    };
  }, [locked, showUI, replay, themeDay, showConfig]);

  return (
    <Swipeable
      trackMouse
      delta={2}
      onSwipedLeft={action(LEFT)}
      onSwipedRight={action(RIGHT)}
      onSwipedDown={action(DOWN)}
      onSwipedUp={action(UP)}
    >
      <div
        className="App"
        style={{
          paddingTop: "50px",
          paddingBottom: "50px",
          margin: 0,
          background: `url(${themeDay ? bgDay : bg})`,
          backgroundSize: "cover",
          pointerEvent: "none",
          userSelect: "none",
          boxSizing: "border-box"
        }}
        tabIndex="0"
      >
        <div
          style={{
            height: "auto",
            opacity: showUI ? 1 : 0
          }}
        >
          <p
            style={{
              margin: 0
            }}
          >
            <span
              onClick={init}
              style={{
                color: "white",
                fontSize: "41px",
                textTransform: "uppercase",
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              Slidding
            </span>
          </p>
          <p
            style={{
              marginTop: 0
            }}
          >
            <span
              onClick={init}
              style={{
                color: "white",
                fontSize: "25px",
                textTransform: "uppercase",
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              Color Puzzle
            </span>
          </p>
          <div
            style={{
              height: showConfig ? 200 : 0,
              overflow: "hidden",
              transition: "ease all 0.2s"
            }}
          >
            <p
              style={{
                width: 300,
                margin: "0px auto 40px"
              }}
            >
              <label style={{ color: "white" }}>Size {size}</label>
              <Slider
                dots
                step={1}
                value={size}
                min={3}
                max={6}
                onChange={setSize}
              />
            </p>
            <p
              style={{
                width: 300,
                margin: "30px auto 40px"
              }}
            >
              <label style={{ color: "white" }}>{numBlock} Obstacles</label>
              <Slider
                dots
                step={1}
                value={numBlock}
                min={0}
                max={6}
                onChange={setNumBlock}
              />
            </p>
            <p
              style={{
                marginBottom: "20px",
                width: 300,
                margin: "30px auto 40px"
              }}
            >
              <label style={{ color: "white" }}>{space} Blanks</label>
              <Slider
                dots
                step={1}
                value={space}
                min={1}
                max={4}
                onChange={setSpace}
              />
            </p>
          </div>

          <p>
            <span
              onClick={() => setShowConfig(!showConfig)}
              style={{
                padding: 10,
                color: "black",
                fontSize: "20px",
                textTransform: "uppercase",
                fontWeight: "bold",
                background: "#FFD200",
                cursor: "pointer",
                userSelect: "none",
                borderRadius: 10,
                boxShadow: "0 5px 0px 1px #CD5900"
              }}
            >
              {showConfig ? "Hide" : "Show"} Config
            </span>{" "}
            &emsp;
            <span
              onClick={init}
              style={{
                padding: 10,
                color: "black",
                fontSize: "20px",
                textTransform: "uppercase",
                fontWeight: "bold",
                background: "#FFD200",
                cursor: "pointer",
                userSelect: "none",
                borderRadius: 10,
                boxShadow: "0 5px 0px 1px #CD5900"
              }}
            >
              Reset
            </span>
          </p>
          {/* <p>
            <span
              style={{
                padding: 5,
                color: "white",
                fontSize: "20px",
                textTransform: "uppercase",
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none"
              }}
            >
              Difficulty {difficulty}
            </span>
          </p> */}
        </div>
        <div
          style={{
            width: size * 60 + 20,
            height: size * 60 + 20,
            position: "relative",
            margin: "auto",
            marginTop: 50,
            border: "2px solid #BBBABB",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 30
          }}
        >
          {_.map(gameState, ({ row, col, color, key, locked }) => (
            <div
              key={key}
              style={{
                borderRadius: locked ? 15 : 45,
                background: color,
                width: 45,
                height: 45,
                position: "absolute",
                left: col * 60 + 15,
                top: row * 60 + 15,
                transition: "all ease 0.2s",
                border: `2px white solid`,
                boxShadow: themeDay
                  ? "0 0 10px 1px rgba(0, 0, 0, 0.1)"
                  : "0 0 10px 10px rgba(0, 0, 0, 0.5)"
              }}
            />
          ))}
        </div>
      </div>
    </Swipeable>
  );
}
