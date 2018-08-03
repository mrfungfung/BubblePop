import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as MSGlobal from "./global";
import * as main from "./main";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// *********************************************************
let gameContainer: Container = null;
let circleGraphics: Graphics = null;

// scores and numbers
// timer, score, coins

const TIME_PER_GAME_SECS: number = 10;
let startTimeSecs: number = null;
let score: number = 0;
let coins: number = 0;
let level = -1;
let numBubblesInLevel = 0;

let buttonGraphics: Graphics = null;
let timerButton: Button = null;
let scoreButton: Button = null;
let coinsButton: Button = null;

const GUMPH = 30;
const SMALL_GUMPH = 5;

class Circle {
    public index: number = 0;
    public pos: vec2 = null;
    public radius: number = 0;
    public text: any = null;
}
let circles: Circle[] = [];

// *********************************************************
export function show() {
    gameContainer = new Container();
    main.g_PixiApp.stage.addChild(gameContainer);

    circleGraphics = new Graphics();
    gameContainer.addChild(circleGraphics);

    buttonGraphics = new Graphics();
    gameContainer.addChild(buttonGraphics);

    timerButton = new Button("Time: ", null);
    timerButton.setSizeToText(GUMPH);
    timerButton.setSize(vec2.fromValues(
        150, timerButton.m_Size[1],
    ));
    timerButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        SMALL_GUMPH + 0.5 * timerButton.m_Size[1],
    ));
    timerButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a00cf, 0.95, buttonGraphics);
    gameContainer.addChild(timerButton.m_Text);

    scoreButton = new Button("Score: " + score, null);
    scoreButton.setSizeToText(GUMPH);
    scoreButton.setSize(vec2.fromValues(
        100, scoreButton.m_Size[1],
    ));
    scoreButton.setCenterPos(vec2.fromValues(
        SMALL_GUMPH + 0.5 * scoreButton.m_Size[0],
        SMALL_GUMPH + 0.5 * scoreButton.m_Size[1],
    ));
    scoreButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a00cf, 0.95, buttonGraphics);
    gameContainer.addChild(scoreButton.m_Text);

    coinsButton = new Button("Coins: " + coins, null);
    coinsButton.setSizeToText(GUMPH);
    coinsButton.setSize(vec2.fromValues(
        100, coinsButton.m_Size[1],
    ));
    coinsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - SMALL_GUMPH - 0.5 * coinsButton.m_Size[0],
        SMALL_GUMPH + 0.5 * timerButton.m_Size[1],
    ));
    coinsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a00cf, 0.95, buttonGraphics);
    gameContainer.addChild(coinsButton.m_Text);

    initNewBubbles();
}

export function hide() {
    main.g_PixiApp.stage.removeChild(gameContainer);
    circleGraphics = null;
}

// *******************************************************************************************************
function initNewBubbles() {
    level++;
    numBubblesInLevel = 3 + level;

    startTimeSecs = Date.now() / 1000;
    updateTimer();

    circles = [];

    const MIN_RADIUS = 10;
    const MAX_RADIUS = 50;
    const BOTTOM_Y = timerButton.m_CenterPos[1] + 0.5 * timerButton.m_Size[1] + SMALL_GUMPH;

    for (let i = 0; i < numBubblesInLevel; ++i) {
        const c = new Circle();
        c.index = i;
        c.radius = MSGlobal.G.randomInt_range(MIN_RADIUS, MAX_RADIUS);
        let valid = false;
        while (!valid) {
            c.pos = vec2.fromValues(
                MSGlobal.G.randomInt_range(c.radius, main.g_ScaledRendererWidth - c.radius),
                MSGlobal.G.randomInt_range(BOTTOM_Y + c.radius, main.g_ScaledRendererHeight - c.radius),
            );

            valid = true;
            for (const cc of circles) {
                const totalR = c.radius + cc.radius;
                if (vec2.sqrDist(cc.pos, c.pos) <= totalR * totalR) {
                    valid = false;
                    break;
                }
            }
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

function updateTimer() {
    // adjust the UI for time left
    const timeElapsedSecs = (Date.now() / 1000 - startTimeSecs);
    const timeLeftSecs = Math.max(TIME_PER_GAME_SECS - timeElapsedSecs, 0);
    timerButton.m_Text.text = "Time: " + MSGlobal.secondsToString(timeLeftSecs, true, 2);
}

// *******************************************************************************************************
export function process() {
    updateTimer();
}

// *******************************************************************************************************
function updateRenderCircles() {
    circleGraphics.clear();
    circleGraphics.beginFill(0xFFD0D0);

    for (const c of circles) {
        circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    }

    circleGraphics.endFill();
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
    if (clicked) {
        for (let i = 0; i < circles.length; ++i) {
            const c = circles[i];
            if (vec2.sqrDist(c.pos, vec2.fromValues(screenX, screenY)) <= c.radius * c.radius ) {
                const currentIndex = numBubblesInLevel - circles.length;
                if (c.index !== currentIndex) {
                    startTimeSecs -= 1.0;
                } else {
                    popBubble(c);

                    circles[i] = circles[circles.length - 1];
                    circles.pop();
                    updateRenderCircles();

                    if (circles.length === 0) {
                        initNewBubbles();
                    }
                }
                break;
            }
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
