// no numbers
// time carries over!
// set and show hiscore
// total bubbles popped ever?
// sometimes coin bubbles...(timer for next one)
// face bubble textures
// balance 2

import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as MSGlobal from "./global";
import * as main from "./main";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// *********************************************************
let countdownContainer: Container = null;
let gameContainer: Container = null;
let circleGraphics: Graphics = null;
let BOTTOM_Y = 0;

let countdownTimerStartMillisecs: number = 0;
let countdownTimerGraphics: Graphics = null;
let countdownTimerButton: Button = null;
let levelButton: Button = null;

const COUNT_DOWN_SECS = 2.5;
const TIME_PER_GAME_SECS = 5;
const MIN_RADIUS = 20;
const MAX_RADIUS = 60;
const MIN_LEVEL_FOR_MOVING = 1;
const MIN_LEVEL_FOR_TELEPORT = 2;
const PERCENT_TO_CONSIDER_FOR_TELEPORT = 0.2;
const NUM_TELEPORT_INCREASES = 5;
const PROB_TELEPORT = 0.5;

let startTimeSecs: number = null;
let score: number = 0;
let coins: number = 0;
let level = -1;
let numBubblesInLevel = 0;

let buttonGraphics: Graphics = null;
let timerButton: Button = null;
let scoreButton: Button = null;
let coinsButton: Button = null;

class Circle {
    public index: number = 0;
    public pos: vec2 = null;
    public target: vec2 = null;
    public origRadius: number = 0;
    public radius: number = 0;
    public text: any = null;
    public speed: number = 1.0;
    public teleport: boolean = false;
    public teleportStartTimerMillisecs: number = 0;
}
let circles: Circle[] = [];

// *********************************************************
export function show() {
    // reset everything
    score = 0;
    level = -1;
    numBubblesInLevel = 0;

    gameContainer = new Container();
    countdownContainer = new Container();
    main.g_PixiApp.stage.addChild(countdownContainer);

    // countdown
    countdownTimerGraphics = new Graphics();
    countdownContainer.addChild(countdownTimerGraphics);

    countdownTimerButton = new Button("Get ready!", null);
    countdownTimerButton.setSizeToText(main.GUMPH);
    countdownTimerButton.setSize(vec2.fromValues(
        0.8 * main.g_ScaledRendererWidth, countdownTimerButton.m_Size[1],
    ));
    countdownTimerButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    countdownTimerButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a7acf, 0.95, countdownTimerGraphics);
    countdownContainer.addChild(countdownTimerButton.m_Text);

    levelButton = new Button("Round 1", null);
    levelButton.setSizeToText(main.GUMPH);
    levelButton.setSize(vec2.fromValues(
        0.8 * main.g_ScaledRendererWidth, countdownTimerButton.m_Size[1],
    ));
    levelButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        countdownTimerButton.m_CenterPos[1] - 0.5 * countdownTimerButton.m_Size[1]
        - main.GUMPH
        - 0.5 * levelButton.m_Size[1],
    ));
    levelButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x00cf7a, 0.95, countdownTimerGraphics);
    countdownContainer.addChild(levelButton.m_Text);

    // in game stuff
    circleGraphics = new Graphics();
    gameContainer.addChild(circleGraphics);

    buttonGraphics = new Graphics();
    gameContainer.addChild(buttonGraphics);

    timerButton = new Button("Time: ", null);
    timerButton.setSizeToText(main.GUMPH);
    timerButton.setSize(vec2.fromValues(
        150, timerButton.m_Size[1],
    ));
    timerButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.SMALL_GUMPH + 0.5 * timerButton.m_Size[1],
    ));
    timerButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a00cf, 0.95, buttonGraphics);
    timerButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
            0x7a00cf, 0.95, countdownTimerGraphics);
    countdownContainer.addChild(timerButton.m_Text);

    scoreButton = new Button("Score: " + score, null);
    scoreButton.setSizeToText(main.GUMPH);
    scoreButton.setSize(vec2.fromValues(
        100, scoreButton.m_Size[1],
    ));
    scoreButton.setCenterPos(vec2.fromValues(
        main.SMALL_GUMPH + 0.5 * scoreButton.m_Size[0],
        main.SMALL_GUMPH + 0.5 * scoreButton.m_Size[1],
    ));
    scoreButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a00cf, 0.95, buttonGraphics);
    gameContainer.addChild(scoreButton.m_Text);

    coinsButton = new Button("Coins: " + coins, null);
    coinsButton.setSizeToText(main.GUMPH);
    coinsButton.setSize(vec2.fromValues(
        100, coinsButton.m_Size[1],
    ));
    coinsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - main.SMALL_GUMPH - 0.5 * coinsButton.m_Size[0],
        main.SMALL_GUMPH + 0.5 * timerButton.m_Size[1],
    ));
    coinsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, buttonGraphics);
    coinsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, countdownTimerGraphics);
    countdownContainer.addChild(coinsButton.m_Text);

    BOTTOM_Y = timerButton.m_CenterPos[1] + 0.5 * timerButton.m_Size[1] + main.SMALL_GUMPH;

    startTimerForLevel();
}

// *******************************************************************************************************
export function hide() {
    main.g_PixiApp.stage.removeChild(gameContainer);
    circleGraphics = null;
}

// *******************************************************************************************************
function startTimerForLevel() {
    // set the timer for countdown
    countdownTimerStartMillisecs = Date.now();
    timerButton.m_Text.text = "Time: " + TIME_PER_GAME_SECS;

    // set the round number and level up
    ++level;
    levelButton.m_Text.text = "Round " + (level + 1);
}

// *******************************************************************************************************
function initNewBubbles() {
    numBubblesInLevel = 3 + level;
    startTimeSecs = Date.now() / 1000;

    circles = [];

    for (let i = 0; i < numBubblesInLevel; ++i) {
        const c = new Circle();
        c.index = i;
        c.origRadius = MSGlobal.G.randomInt_range(MIN_RADIUS, MAX_RADIUS);
        c.radius = c.origRadius;
        let valid = false;
        while (!valid) {
            c.pos = vec2.fromValues(
                MSGlobal.G.randomInt_range(c.origRadius, main.g_ScaledRendererWidth - c.origRadius),
                MSGlobal.G.randomInt_range(BOTTOM_Y + c.origRadius, main.g_ScaledRendererHeight - c.origRadius),
            );

            valid = true;
            for (const cc of circles) {
                const totalR = c.origRadius + cc.origRadius;
                if (vec2.sqrDist(cc.pos, c.pos) <= totalR * totalR) {
                    valid = false;
                    break;
                }
            }
        }

        // find a target pos
        if (level >= MIN_LEVEL_FOR_MOVING) {
            c.speed = 1.0 + (level - MIN_LEVEL_FOR_MOVING) * 0.5;
            updateTarget(c, null);
        }

        c.text = new MultiStyleText(i + 1, {
            default: {
                fill: "0xFFFFFF",
                fontSize: "20px",
                lineJoin: "round",
                stroke: "0x0",
                strokeThickness: "4",
            },
        });
        c.text.anchor.set(0.5);
        c.text.x = c.pos[0];
        c.text.y = c.pos[1];
        gameContainer.addChild(c.text);
        circles.push(c);
    }

    updateRenderCircles();
}

function updateTarget(c: Circle, forceTeleport: boolean) {
    const MIN_DIST = MSGlobal.G.randomInt_range(0.5 * main.g_ScaledRendererWidth,
                                                0.75 * main.g_ScaledRendererWidth);
    while (true) {
        c.target = vec2.fromValues(
            MSGlobal.G.randomInt_range(c.origRadius, main.g_ScaledRendererWidth - c.origRadius),
            MSGlobal.G.randomInt_range(BOTTOM_Y + c.origRadius, main.g_ScaledRendererHeight - c.origRadius),
        );

        const distance2 = vec2.sqrDist(c.pos, c.target);
        if (distance2 <= MIN_DIST * MIN_DIST) {
            break;
        }
    }

    if (forceTeleport !== null) {
        if (forceTeleport === true) {
            c.teleport = true;
            c.teleportStartTimerMillisecs = Date.now();
        }
    } else if (level >= MIN_LEVEL_FOR_TELEPORT) {
        let considerP = PERCENT_TO_CONSIDER_FOR_TELEPORT;
        considerP += Math.min(1.0, (level - MIN_LEVEL_FOR_TELEPORT) / NUM_TELEPORT_INCREASES)
                * (1.0 - PERCENT_TO_CONSIDER_FOR_TELEPORT);
        if (Math.random() <= considerP &&
            Math.random() <= PROB_TELEPORT) {
                c.teleport = true;
                c.teleportStartTimerMillisecs = Date.now();
        }
    }
}

// *******************************************************************************************************
function updateTimer(): boolean {
    // adjust the UI for time left
    const timeElapsedSecs = (Date.now() / 1000 - startTimeSecs);
    const timeLeftSecs = Math.max(TIME_PER_GAME_SECS - timeElapsedSecs, 0);
    timerButton.m_Text.text = "Time: " + (Math.floor(timeLeftSecs) + 1);
    return (timeLeftSecs === 0);
}

// *******************************************************************************************************
function transitionToInGame() {
    main.g_PixiApp.stage.removeChild(countdownContainer);
    main.g_PixiApp.stage.addChild(gameContainer);

    countdownContainer.removeChild(timerButton.m_Text);
    gameContainer.addChild(timerButton.m_Text);

    countdownContainer.removeChild(coinsButton.m_Text);
    gameContainer.addChild(coinsButton.m_Text);

    countdownTimerStartMillisecs = 0; // signal
    initNewBubbles();
}

// *******************************************************************************************************
function transitionToCountdown() {
    main.g_PixiApp.stage.removeChild(gameContainer);
    main.g_PixiApp.stage.addChild(countdownContainer);

    gameContainer.removeChild(timerButton.m_Text);
    countdownContainer.addChild(timerButton.m_Text);

    gameContainer.removeChild(coinsButton.m_Text);
    countdownContainer.addChild(coinsButton.m_Text);

    startTimerForLevel();
}

// *******************************************************************************************************
export function process() {
    if (countdownTimerStartMillisecs > 0) { // do timer countdown
        const timeElapsedMillisecs = Date.now() - countdownTimerStartMillisecs;
        const timeLeftSecs = Math.max(0, COUNT_DOWN_SECS - timeElapsedMillisecs / 1000);
        if (timeLeftSecs === 0) {
            transitionToInGame();
        } else {
            let displayText = "Get Ready!";
            const displaySecs = Math.floor(timeLeftSecs) + 1;
            if (displaySecs < COUNT_DOWN_SECS) {
                displayText += " " + displaySecs;
            }
            countdownTimerButton.m_Text.text = displayText;
        }
    } else {
        const gameOver = updateTimer();
        if (gameOver) {
            main.setGameState(main.EGameState.EGAMESTATE_GAME_OVER);
        } else {
            for (const c of circles) {
                if (c.target) {
                    if (c.teleport) {
                        const TIME_EXPAND_MILLISECS = 0.25 * 1000;
                        const TIME_TO_CHILL_MILLISECS = 1.0 * 1000;
                        const timeElapsedMillesecs = Date.now() - c.teleportStartTimerMillisecs;
                        if (timeElapsedMillesecs < TIME_TO_CHILL_MILLISECS) {
                            // do nothing
                        } else if (timeElapsedMillesecs <
                                    TIME_EXPAND_MILLISECS + TIME_TO_CHILL_MILLISECS) { // shrinking
                            const r = (timeElapsedMillesecs - TIME_TO_CHILL_MILLISECS) / TIME_EXPAND_MILLISECS;
                            c.radius = (1.0 - r) * c.origRadius;
                        } else if (timeElapsedMillesecs <
                            2 * TIME_EXPAND_MILLISECS + TIME_TO_CHILL_MILLISECS) { // expanding
                            const r = (timeElapsedMillesecs - TIME_EXPAND_MILLISECS - TIME_TO_CHILL_MILLISECS)
                                        / TIME_EXPAND_MILLISECS;
                            c.radius = r * c.origRadius;
                            c.pos = c.target;
                        } else {
                            updateTarget(c, true);
                        }
                    } else {
                        const D = 2.0;
                        if (vec2.sqrDist(c.pos, c.target) <= D * D) {
                            updateTarget(c, false);
                        }
                        const dir: vec2 = vec2.fromValues(0, 0);
                        vec2.sub(dir, c.target, c.pos);
                        if (vec2.squaredLength(dir) > 0.001) {
                            vec2.normalize(dir, dir);
                        }

                        vec2.scaleAndAdd(c.pos, c.pos, dir, c.speed);
                    }

                    // update the text
                    c.text.x = c.pos[0];
                    c.text.y = c.pos[1];
                }
            }
            updateRenderCircles();
        }
    }
}

// *******************************************************************************************************
function updateRenderCircles() {
    circleGraphics.clear();

    circleGraphics.beginFill(0xFFD0D0);
    for (const c of circles) {
        circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    }
    circleGraphics.endFill();

    // debug render target
    // circleGraphics.beginFill(0xFF0000);
    // for (const c of circles) {
    //     circleGraphics.drawCircle(c.target[0], c.target[1], c.origRadius);
    // }
    // circleGraphics.endFill();
}

// *******************************************************************************************************
function popBubble(c: Circle) {
    score += 1;
    scoreButton.m_Text.text = "Score: " + score;
    gameContainer.removeChild(c.text);
    c.text = null;
}

// *******************************************************************************************************
export function processInput(clicked: boolean,
                             mouseDown: boolean,
                             lastFrameMouseDown: boolean,
                             screenX: number,
                             screenY: number) {
    if (countdownTimerStartMillisecs > 0) { // do timer countdown
    } else {
        if (!lastFrameMouseDown && mouseDown) {
            const touchedCircles = [];
            for (let i = 0; i < circles.length; ++i) {
                const c = circles[i];
                if (vec2.sqrDist(c.pos, vec2.fromValues(screenX, screenY)) <= c.radius * c.radius ) {
                    touchedCircles.push({
                        circle: c,
                        idx: i,
                    });
                }
            }
            if (touchedCircles.length > 0) {
                let popped = false;
                const currentIndex = numBubblesInLevel - circles.length;
                for (const tc of touchedCircles) {
                    if (tc.circle.index === currentIndex) {
                        popped = true;
                        popBubble(tc.circle);
                        circles[tc.idx] = circles[circles.length - 1];
                        circles.pop();
                        if (circles.length === 0) {
                            transitionToCountdown();
                        }
                        break;
                    }
                }
                if (!popped) {
                    startTimeSecs -= 1.0;
                }
            }
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
