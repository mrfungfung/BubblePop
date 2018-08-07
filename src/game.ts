import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as CoinShop from "./coinshop";
import * as GameOver from "./gameover";
import * as MSGlobal from "./global";
import * as main from "./main";
import { g_ScaledRendererWidth } from "./main";
import * as Options from "./options";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// *********************************************************
let topUIContainer: Container = null;
let countdownContainer: Container = null;
let gameContainer: Container = null;
let circleGraphics: Graphics = null;
let SAFE_BOTTOM_Y = 0;
let SAFE_TOP_Y = 0;

let countdownTimerStartMillisecs: number = 0;
let countdownTimerGraphics: Graphics = null;
let countdownTimerButton: Button = null;
let levelButton: Button = null;
let optionsButton: Button = null;
let shopButton: Button = null;

let pauseTimeMillisecs = 0;

const COUNT_DOWN_SECS = 2.5;
const TIME_PER_GAME_SECS = 5;
const MIN_RADIUS = 20;
const MAX_RADIUS = 60;
const COIN_MAX_RADIUS = 35;
const MIN_LEVEL_FOR_MOVING = 1;
const MIN_LEVEL_FOR_TELEPORT = 2;
const PERCENT_TO_CONSIDER_FOR_TELEPORT = 0.2;
const NUM_TELEPORT_INCREASES = 5;
const PROB_TELEPORT = 0.5;
const TIME_TO_COIN_SECS = 2 * 60;
const COIN_PROB = 0.5;
const MIN_LEVEL_FOR_COIN = 2;
const LINE_WIDTH = 10;
let LINE_Y = 0;

let startTimeSecs: number = null;
let currentTimePerGameSecs: number = 0;
let leftOverTimeSecs: number = 0;
let score: number = 0;
export let hiscore: number = 0;
export let totalBubblesPoppedEver: number = 0;
export let coins: number = 0;
let level = -1;
let numBubblesInLevel = 0;
let currentPopIndex = 0;
let lastCoinAppearTimeSecs: number = 0;

let buttonGraphics: Graphics = null;
let timerButton: Button = null;
let scoreButton: Button = null;
let coinsButton: Button = null;

let timerLineGfx: Graphics = null;

class Circle {
    public isCoin: boolean = false;
    public index: number = -1;
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
export function changeCoins(delta: number) {
    coins += delta;
    coins = Math.max(0, coins);
    save();
    CoinsButton.updateCoinsButton();
}
// *********************************************************
export function setCoins(c: number, saveIt: boolean) {
    coins = c;
    coins = Math.max(0, coins);
    if (saveIt) { save(); }
    CoinsButton.updateCoinsButton();
}

// *********************************************************
export function resetsaveload() {
    MSGlobal.PlatformInterface.setStatsAsync({
        coins: 0,
        hiscore: 0,
        lastCoinAppearTimeSecs: 0,
        totalBubblesPoppedEver: 0,
    })
    .then(function() {
        // do something
    });
}

// *********************************************************
export function load() {
    MSGlobal.PlatformInterface.getStatsAsync([
        "coins",
        "hiscore",
        "lastCoinAppearTimeSecs",
        "totalBubblesPoppedEver",
    ])
    .then(function(data: any) {
        // set the level data in mapselect thingy
        MSGlobal.log(data);
        if (data.coins) {
            setCoins(data.coins, false);
        }
        if (data.hiscore) { hiscore = data.hiscore; }
        if (data.totalBubblesPoppedEver) { totalBubblesPoppedEver = data.totalBubblesPoppedEver; }
        if (data.lastCoinAppearTimeSecs) { lastCoinAppearTimeSecs = data.lastCoinAppearTimeSecs; }
    });
}

// *********************************************************
export function save() {
    MSGlobal.PlatformInterface.setStatsAsync({
        coins,
        hiscore,
        lastCoinAppearTimeSecs,
        totalBubblesPoppedEver,
    })
    .then(function() {
        // do something
    });
}

// *********************************************************
export function resetGame() {
    // reset everything
    score = 0;
    level = -1;
    numBubblesInLevel = 0;
    leftOverTimeSecs = 0;
}
export function continueGame() {
    // put the level back one, but everything remains
    --level;
}
export function show() {
    gameContainer = new Container();
    countdownContainer = new Container();
    topUIContainer = new Container();
    main.g_PixiApp.stage.addChild(countdownContainer);
    main.g_PixiApp.stage.addChild(topUIContainer);

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
    topUIContainer.addChild(buttonGraphics);

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
    topUIContainer.addChild(timerButton.m_Text);

    scoreButton = new Button(score + " Hi: " + hiscore, null);
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
    topUIContainer.addChild(scoreButton.m_Text);

    coinsButton = new Button("", {
        default: {
            fill: "0xFFFFFF",
            fontSize: "12px",
            lineJoin: "round",
            stroke: "0x0",
            strokeThickness: "4",
        },
    });
    updateTimeToCoin();
    coinsButton.setSizeToText(main.GUMPH);
    coinsButton.setSize(vec2.fromValues(
        100, coinsButton.m_Size[1],
    ));
    coinsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - main.SMALL_GUMPH - 0.5 * coinsButton.m_Size[0],
        main.SMALL_GUMPH + 0.5 * coinsButton.m_Size[1],
    ));
    coinsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, buttonGraphics);
    topUIContainer.addChild(coinsButton.m_Text);

    // actual in game UI
    const ingameGfx = new Graphics();
    gameContainer.addChild(ingameGfx);
    optionsButton = new Button("O", null);
    optionsButton.setSizeToText(main.GUMPH);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - 0.5 * optionsButton.m_Size[0],
        main.g_ScaledRendererHeight - 0.5 * optionsButton.m_Size[1],
    ));
    optionsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xff0000, 0.95, ingameGfx);
    optionsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xff0000, 0.95, countdownTimerGraphics);
    countdownContainer.addChild(optionsButton.m_Text);

    shopButton = new Button("Shop", null);
    shopButton.setSizeToText(main.GUMPH);
    shopButton.setCenterPos(vec2.fromValues(
        optionsButton.getLeftX() - main.GUMPH - shopButton.getHalfWidth(),
        main.g_ScaledRendererHeight - 0.5 * shopButton.m_Size[1],
    ));
    shopButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, ingameGfx);
    shopButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, countdownTimerGraphics);
    countdownContainer.addChild(shopButton.m_Text);

    SAFE_BOTTOM_Y = timerButton.m_CenterPos[1] + 0.5 * timerButton.m_Size[1] + main.SMALL_GUMPH;
    SAFE_TOP_Y = optionsButton.getTopY();

    timerLineGfx = new Graphics();
    gameContainer.addChild(timerLineGfx);
    LINE_Y = scoreButton.getBottomY() + main.SMALL_GUMPH + 0.5 * LINE_WIDTH;
    timerLineGfx.lineStyle(LINE_WIDTH, 0xffffff);
    timerLineGfx.moveTo(0, LINE_Y);
    timerLineGfx.lineTo(main.g_ScaledRendererWidth, LINE_Y);
    timerLineGfx.endFill();

    startTimerForLevel();
}

// *******************************************************************************************************
export function hide() {
    main.g_PixiApp.stage.removeChild(gameContainer);
    main.g_PixiApp.stage.removeChild(countdownContainer);
    main.g_PixiApp.stage.removeChild(topUIContainer);
    gameContainer = null;
    countdownContainer = null;
    topUIContainer = null;
}

// *******************************************************************************************************
function startTimerForLevel() {
    const extraTimeSecs = Math.floor(0.5 * leftOverTimeSecs);
    currentTimePerGameSecs = TIME_PER_GAME_SECS + extraTimeSecs;

    // set the timer for countdown
    countdownTimerStartMillisecs = Date.now();
    timerButton.m_Text.text = "Time: " + currentTimePerGameSecs;

    // set the round number and level up
    ++level;
    levelButton.m_Text.text = "Round " + (level + 1);
}

// *******************************************************************************************************
function initNewBubbles() {
    numBubblesInLevel = 3 + level;
    startTimeSecs = Date.now() / 1000;

    circles = [];
    currentPopIndex = 0;
    const MIN_LEVEL_FOR_POP_INDEX = 1;
    let popIndex = 0;

    for (let i = 0; i < numBubblesInLevel; ++i) {
        const c = new Circle();
        const timeElapsedSinceLastCoinSecs = (Date.now() - lastCoinAppearTimeSecs) / 1000;
        if (timeElapsedSinceLastCoinSecs > TIME_TO_COIN_SECS &&
            level >= MIN_LEVEL_FOR_COIN &&
            Math.random() < COIN_PROB) {
            lastCoinAppearTimeSecs = Date.now();
            c.isCoin = true;
        }
        if (!c.isCoin && level >= MIN_LEVEL_FOR_POP_INDEX && Math.random() < 0.5) {
            c.index = popIndex++;
        }
        c.origRadius = MSGlobal.G.randomInt_range(MIN_RADIUS, c.isCoin ? COIN_MAX_RADIUS : MAX_RADIUS);
        c.radius = c.origRadius;
        for (let c_tries = 0; c_tries < 50; ++c_tries) {
            c.pos = vec2.fromValues(
                MSGlobal.G.randomInt_range(c.origRadius, main.g_ScaledRendererWidth - c.origRadius),
                MSGlobal.G.randomInt_range(SAFE_BOTTOM_Y + c.origRadius, SAFE_TOP_Y - c.origRadius),
            );

            let valid = true;
            for (const cc of circles) {
                const totalR = c.origRadius + cc.origRadius;
                if (vec2.sqrDist(cc.pos, c.pos) <= totalR * totalR) {
                    valid = false;
                    break;
                }
            }
            if (valid) {
                break;
            }
        }

        // find a target pos
        if (c.isCoin || level >= MIN_LEVEL_FOR_MOVING) {
            if (c.isCoin) {
                c.speed = 5.0;
            } else {
                c.speed = 1.0 + (level - MIN_LEVEL_FOR_MOVING) * 0.5;
            }
            updateTarget(c, null);
        }

        if (c.index >= 0) {
            c.text = new MultiStyleText(c.index + 1, {
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
        }

        circles.push(c);
    }

    updateRenderCircles();
}

function updateTarget(c: Circle, forceTeleport: boolean) {
    const MAX_DIST = MSGlobal.G.randomInt_range(0.2 * main.g_ScaledRendererWidth,
                                                0.5 * main.g_ScaledRendererWidth);
    while (true) {
        c.target = vec2.fromValues(
            MSGlobal.G.randomInt_range(c.origRadius, main.g_ScaledRendererWidth - c.origRadius),
            MSGlobal.G.randomInt_range(SAFE_BOTTOM_Y + c.origRadius, SAFE_TOP_Y - c.origRadius),
        );

        const distance2 = vec2.sqrDist(c.pos, c.target);
        if (distance2 <= MAX_DIST * MAX_DIST) {
            break;
        }
    }

    if (forceTeleport !== null) {
        if (forceTeleport === true) {
            c.teleport = true;
            c.teleportStartTimerMillisecs = Date.now();
        }
    } else if (!c.isCoin && level >= MIN_LEVEL_FOR_TELEPORT) {
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
    const timeLeftSecs = Math.max(currentTimePerGameSecs - timeElapsedSecs, 0);
    timerButton.m_Text.text = "Time: " + (Math.floor(timeLeftSecs) + 1);

    timerLineGfx.clear();
    timerLineGfx.lineStyle(LINE_WIDTH, 0xffffff);
    timerLineGfx.moveTo(0, LINE_Y);
    timerLineGfx.lineTo(timeLeftSecs / currentTimePerGameSecs * main.g_ScaledRendererWidth, LINE_Y);
    timerLineGfx.endFill();

    return (timeLeftSecs === 0);
}

// *******************************************************************************************************
function updateTimeToCoin() {
    const timeElapsedSinceLastCoinSecs = (Date.now() - lastCoinAppearTimeSecs) / 1000;
    const timeToCoinLeftSecs = Math.max(0, TIME_TO_COIN_SECS - timeElapsedSinceLastCoinSecs);
    let timeToCoinLeftSecsString = "";
    if (timeToCoinLeftSecs === 0) {
        timeToCoinLeftSecsString = "Coin will come";
    } else {
        timeToCoinLeftSecsString = MSGlobal.secondsToString(timeToCoinLeftSecs, true, 2);
    }

    coinsButton.m_Text.text = "Coins: " + coins + "\n" + timeToCoinLeftSecsString;
}

// *******************************************************************************************************
function transitionToInGame() {
    main.g_PixiApp.stage.removeChild(countdownContainer);
    main.g_PixiApp.stage.addChild(gameContainer);

    countdownContainer.removeChild(shopButton.m_Text);
    gameContainer.addChild(shopButton.m_Text);

    countdownContainer.removeChild(optionsButton.m_Text);
    gameContainer.addChild(optionsButton.m_Text);

    countdownTimerStartMillisecs = 0; // signal
    initNewBubbles();
}

// *******************************************************************************************************
function transitionToCountdown() {
    main.g_PixiApp.stage.removeChild(gameContainer);
    main.g_PixiApp.stage.addChild(countdownContainer);

    gameContainer.removeChild(shopButton.m_Text);
    countdownContainer.addChild(shopButton.m_Text);

    gameContainer.removeChild(optionsButton.m_Text);
    countdownContainer.addChild(optionsButton.m_Text);

    // work out time left
    const timeElapsedSecs = (Date.now() / 1000 - startTimeSecs);
    leftOverTimeSecs = Math.max(currentTimePerGameSecs - timeElapsedSecs, 0);

    startTimerForLevel();
}

// *******************************************************************************************************
function gameOver() {
    let isHiScore = false;
    if (score > hiscore) {
        hiscore = score;
        isHiScore = true;

        MSGlobal.PlatformInterface.updateAsync({
            action: "CUSTOM",
            cta: "Play",
            // image: base64Picture,
            notification: "NO_PUSH",
            strategy: "LAST",
            template: "WORD_PLAYED",
            text: {
              default: "Edgar just played BASH for 9 points!",
            //   localizations: {
            //     en_US: 'Edgar just played BASH for 9 points!',
            //     pt_BR: 'Edgar jogou BASH por 9 pontos!',
            //   }
            },
            // data: { myReplayData: '...' },
          }).then(function() {
            MSGlobal.log("Message was sent successfully");
          }).catch(function(err: any) {
            MSGlobal.error(err);
          });
    }
    save();
    GameOver.initialise(score, isHiScore, level);
    main.setGameState(main.EGameState.EGAMESTATE_GAME_OVER);
}

// *******************************************************************************************************
export function process() {
    if (Options.isOnShow()) {
        Options.process();
    } else if (CoinShop.isOnShow()) {
        CoinShop.process();
    } else {
        processInGame();
    }
}

// *******************************************************************************************************
export function processInGame() {
    // always update coin
    updateTimeToCoin();

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
        const isGameOver = updateTimer();
        if (isGameOver) {
            gameOver();
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
                        if (vec2.sqrDist(c.pos, c.target) <= c.speed * c.speed) {
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
                    if (c.text) {
                        c.text.x = c.pos[0];
                        c.text.y = c.pos[1];
                    }
                }
            }
            updateRenderCircles();
        }
    }
}

// *******************************************************************************************************
function updateRenderCircles() {
    circleGraphics.clear();

    circleGraphics.beginFill(0xFFD700);
    for (const c of circles) {
        if (!c.isCoin) { continue; }
        circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    }
    circleGraphics.endFill();

    circleGraphics.beginFill(0xFFD0D0);
    for (const c of circles) {
        if (c.isCoin) { continue; }
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
    ++totalBubblesPoppedEver;
    if (c.index >= 0) { currentPopIndex++; }
    if (c.isCoin) {
        changeCoins(1);
        coinsButton.m_Text.text = "Coins: " + coins;
    } else {
        score++;
        scoreButton.m_Text.text = score + " Hi: " + hiscore;
    }

    if (c.text) { gameContainer.removeChild(c.text); }
    c.text = null;
}

// *******************************************************************************************************
export function processInput(clicked: boolean,
                             mouseDown: boolean,
                             lastFrameMouseDown: boolean,
                             screenX: number,
                             screenY: number) {
    if (Options.isOnShow()) {
        const finish = Options.processInput(
                                            clicked,
                                            mouseDown,
                                            lastFrameMouseDown,
                                            screenX,
                                            screenY);
        if (finish) {
            const deltaTimeMS = Date.now() - pauseTimeMillisecs;

            // adjust all timers
            if (countdownTimerStartMillisecs > 0) {
                countdownTimerStartMillisecs += deltaTimeMS;
            } else {
                startTimeSecs += deltaTimeMS / 1000;
            }
        }
    } else if (CoinShop.isOnShow()) {
        const finish = CoinShop.processInput(
                                            clicked,
                                            mouseDown,
                                            lastFrameMouseDown,
                                            screenX,
                                            screenY);
        if (finish) {
            const deltaTimeMS = Date.now() - pauseTimeMillisecs;

            // adjust all timers
            if (countdownTimerStartMillisecs > 0) {
                countdownTimerStartMillisecs += deltaTimeMS;
            } else {
                startTimeSecs += deltaTimeMS / 1000;
            }

            topUIContainer.visible = true;
            countdownContainer.visible = true;
            gameContainer.visible = true;
        }
    } else {
        processInputInGame(
            clicked,
            mouseDown,
            lastFrameMouseDown,
            screenX,
            screenY);
    }
}

// *******************************************************************************************************
export function processInputInGame(clicked: boolean,
                                   mouseDown: boolean,
                                   lastFrameMouseDown: boolean,
                                   screenX: number,
                                   screenY: number) {
    if (countdownTimerStartMillisecs > 0) { // do timer countdown
        if (clicked && optionsButton.contains(vec2.fromValues(screenX, screenY))) {
            pauseTimeMillisecs = Date.now();
            Options.show();
        } else if (clicked && shopButton.contains(vec2.fromValues(screenX, screenY))) {
            pauseTimeMillisecs = Date.now();
            CoinShop.show();

            topUIContainer.visible = false;
            countdownContainer.visible = false;
            gameContainer.visible = false;
        }
    } else if (clicked && optionsButton.contains(vec2.fromValues(screenX, screenY))) {
        pauseTimeMillisecs = Date.now();
        Options.show();
    } else if (clicked && shopButton.contains(vec2.fromValues(screenX, screenY))) {
        pauseTimeMillisecs = Date.now();
        CoinShop.show();

        topUIContainer.visible = false;
        countdownContainer.visible = false;
        gameContainer.visible = false;
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
                for (const tc of touchedCircles) {
                    if (tc.circle.index === -1 ||
                        tc.circle.index === currentPopIndex) {
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
