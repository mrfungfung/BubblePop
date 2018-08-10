import {vec2} from "gl-matrix";
import {Container, Graphics, Sprite} from "pixi.js";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as CoinShop from "./coinshop";
import * as GameOver from "./gameover";
import * as MSGlobal from "./global";
import * as main from "./main";
import * as Options from "./options";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// spritesss
let bgContainer: Container = null;
const MAX_DX = 200;
let bgSprite: Sprite = null;
let mgSprite: Sprite = null;
let fgSprite: Sprite = null;

// *********************************************************
// modal confirm
let confirmModalContainer: Container = null;
let confirmModalGraphics: Graphics = null;
let confirmYesButton: Button = null;
let confirmNoButton: Button = null;
let confirmTextButton: Button = null;

// *********************************************************
let topUIContainer: Container = null;
let countdownContainer: Container = null;
let gameContainer: Container = null;
let circleGraphics: Graphics = null;
let powerUpButton: Button = null;
let powerUpButtonGfx: Graphics = null;
let SAFE_BOTTOM_Y = 0;
let SAFE_TOP_Y = 0;

let countdownTimerStartMillisecs: number = 0;
let countdownTimerGraphics: Graphics = null;
let countdownTimerButton: Button = null;
let levelButton: Button = null;
let optionsButton: Button = null;
let shopButton: Button = null;

let pauseTimeMillisecs = 0;
let freezeTimeStartMS = 0;

const TIME_EXPAND_MILLISECS = 0.25 * 1000;
const TIME_TO_CHILL_MILLISECS = 1.0 * 1000;
const TIME_TO_FREEZE_SECS = 2;

const COUNT_DOWN_SECS = 1;
const TIME_PER_GAME_SECS = 5;
const MIN_RADIUS = 25;
const MAX_RADIUS = 60;
const COIN_MAX_RADIUS = 35;

const MIN_LEVEL_FOR_MOVING = 3;
const MIN_LEVEL_FOR_POP_INDEX = 4;
const MIN_LEVEL_FOR_TELEPORT = 7;
const MIN_LEVEL_FOR_EXTRA_LIFE = 8;
const MIN_LEVEL_FOR_COIN = 5;

const PERCENT_TO_CONSIDER_FOR_TELEPORT = 0.2;
const NUM_TELEPORT_INCREASES = 5;
const PROB_TELEPORT = 0.5;

export const TIME_TO_COIN_SECS = 10 * 60;
const COIN_PROB = 0.25;

const LINE_WIDTH = 10;
let LINE_Y = 0;
const MAX_LIFE = 4;

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
export let lastCoinAppearTimeSecs: number = 0;

let buttonGraphics: Graphics = null;
let timerButton: Button = null;
let scoreButton: Button = null;

let timerLineGfx: Graphics = null;

class Circle {
    public isCoin: boolean = false;
    public index: number = -1;
    public origLife: number = 1;
    public life: number = 1;
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

const MAX_RUMBLE: number = 25.0;
let rumbleTimeStartSecs: number = 0.0;
let rumbleTimePeriodSecs: number  = 0.0;
let rumbleMagnitude: number  = 0;
let rumbleCircle: any = {};

// *********************************************************************************
function rumbleLine(max_amplitude: number, secs: number) {
    rumbleTimeStartSecs = new Date().getTime() / 1000;
    rumbleMagnitude = Math.min(max_amplitude, MAX_RUMBLE);
    rumbleTimePeriodSecs = secs;
}

// *********************************************************************************
function getRumbleOffset() {
    const offset = vec2.fromValues(0, 0);
    const cur_time = new Date().getTime() / 1000;
    const elapsed_time = cur_time - rumbleTimeStartSecs;
    if (elapsed_time < rumbleTimePeriodSecs) {
        vec2.set(offset, MSGlobal.G.symmetricRand() * rumbleMagnitude,
                         MSGlobal.G.symmetricRand() * rumbleMagnitude);
    } else {
        rumbleCircle = {};
    }
    return offset;
}

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
    freezeTimeStartMS = 0;
}
export function continueGame() {
    // put the level back one, but everything remains
    --level;
}
export function show() {
    bgContainer = new Container();
    gameContainer = new Container();
    countdownContainer = new Container();
    topUIContainer = new Container();
    main.g_PixiApp.stage.addChild(bgContainer);
    main.g_PixiApp.stage.addChild(countdownContainer);
    main.g_PixiApp.stage.addChild(topUIContainer);
    CoinsButton.show();

    bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./bg.png"]);
    mgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./mg.png"]);
    fgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./fg.png"]);
    fgSprite.anchor.set(0.5);
    fgSprite.x = main.g_HalfScaledRendererWidth;
    fgSprite.y = main.g_HalfScaledRendererHeight;
    fgSprite.width = bgSprite.width + MAX_DX;

    bgContainer.addChild(bgSprite);
    bgContainer.addChild(mgSprite);
    bgContainer.addChild(fgSprite);

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

    // power ups
    powerUpButton = null;
    powerUpButtonGfx = null;
    updateFreezeButton();

    startTimerForLevel();
}

// *******************************************************************************************************
export function hide() {
    CoinsButton.hide();

    main.g_PixiApp.stage.removeChild(bgContainer);
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
    numBubblesInLevel = 1 + level;
    startTimeSecs = Date.now() / 1000;

    circles = [];
    currentPopIndex = 0;
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

        if (!c.isCoin) {
            let currentMaxLife = Math.floor(((level - MIN_LEVEL_FOR_EXTRA_LIFE) / 10) * MAX_LIFE);
            currentMaxLife = MSGlobal.G.limit(currentMaxLife, 0, MAX_LIFE);
            c.origLife = MSGlobal.G.randomInt_range(1, currentMaxLife);
            c.life = c.origLife;
        }

        if (!c.isCoin && level >= MIN_LEVEL_FOR_POP_INDEX && Math.random() < 0.5) {
            c.index = popIndex++;
        }
        if (level === 0) {
            c.origRadius = MAX_RADIUS;
            c.radius = c.origRadius;
            c.pos = vec2.fromValues(
                main.g_HalfScaledRendererWidth,
                main.g_HalfScaledRendererHeight,
            );
        } else {
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
        }

        // find a target pos
        if (c.isCoin || level >= MIN_LEVEL_FOR_MOVING) {
            if (c.isCoin) {
                c.speed = 5.0;
            } else {
                c.speed = 1.0 + (level - MIN_LEVEL_FOR_MOVING) * 0.2;
            }
            updateTarget(c, null);
        }

        if (c.index >= 0 || level === 0) {
            c.text = new MultiStyleText(level === 0 ? "TAP ME!" : c.index + 1, {
                default: {
                    fill: "0xFFFFFF",
                    fontSize: "25px",
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
                c.teleportStartTimerMillisecs = Date.now() + Math.random() * 2 * 1000;
        }
    }
}

// *******************************************************************************************************
function updateTimer(): boolean {

    if (freezeTimeStartMS !== 0) {
        const freezetimeElapsedSecs = (Date.now() - freezeTimeStartMS) / 1000;
        if (freezetimeElapsedSecs >= TIME_TO_FREEZE_SECS) {
            freezeTimeStartMS = 0;
        }
        updateFreezeButton();
    }

    // adjust the UI for time left
    const timeElapsedSecs = (Date.now() / 1000 - startTimeSecs);
    const timeLeftSecs = Math.max(currentTimePerGameSecs - timeElapsedSecs, 0);
    timerButton.m_Text.text = "Time: " + Math.ceil(timeLeftSecs);
    const offset = getRumbleOffset();

    timerLineGfx.clear();
    timerLineGfx.lineStyle(LINE_WIDTH, 0xffffff);
    timerLineGfx.moveTo(offset[0], offset[1] + LINE_Y);
    timerLineGfx.lineTo(offset[0] + timeLeftSecs / currentTimePerGameSecs * main.g_ScaledRendererWidth,
                        offset[1] + LINE_Y);
    timerLineGfx.endFill();

    return (timeLeftSecs === 0);
}

// *******************************************************************************************************
function transitionToInGame() {
    main.g_PixiApp.stage.removeChild(countdownContainer);
    main.g_PixiApp.stage.addChild(gameContainer);

    countdownContainer.removeChild(shopButton.m_Text);
    gameContainer.addChild(shopButton.m_Text);

    countdownContainer.removeChild(optionsButton.m_Text);
    gameContainer.addChild(optionsButton.m_Text);

    if (powerUpButton) {
        countdownContainer.removeChild(powerUpButtonGfx);
        gameContainer.addChild(powerUpButtonGfx);

        countdownContainer.removeChild(powerUpButton.m_Text);
        gameContainer.addChild(powerUpButton.m_Text);
    }

    countdownTimerStartMillisecs = 0; // signal
    initNewBubbles();
}

// *******************************************************************************************************
function transitionToCountdown() { // advance a level
    MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("LevelComplete",
        null,
        {
            Level: level,
        });

    main.g_PixiApp.stage.removeChild(gameContainer);
    main.g_PixiApp.stage.addChild(countdownContainer);

    gameContainer.removeChild(shopButton.m_Text);
    countdownContainer.addChild(shopButton.m_Text);

    gameContainer.removeChild(optionsButton.m_Text);
    countdownContainer.addChild(optionsButton.m_Text);

    if (powerUpButton) {
        gameContainer.removeChild(powerUpButtonGfx);
        countdownContainer.addChild(powerUpButtonGfx);

        gameContainer.removeChild(powerUpButton.m_Text);
        countdownContainer.addChild(powerUpButton.m_Text);
    }

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
    }
    const facebookName = MSGlobal.PlatformInterface.getPlayerName();
    MSGlobal.PlatformInterface.updateAsync({
        action: "CUSTOM",
        cta: "Play",
        // tslint:disable-next-line
        image: "data:image/jpeg;base64,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",
        notification: "NO_PUSH",
        strategy: "LAST",
        template: "NEW_SCORE",
        text: {
          default: isHiScore ?
                    "Beat " + facebookName + "'s Bubble FRENZY Hi Score of " + score + "!" :
                    "Beat " + facebookName + "'s Bubble FRENZY score of " + score + "!",
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
    save();
    GameOver.initialise(score, isHiScore, level);
    main.setGameState(main.EGameState.EGAMESTATE_GAME_OVER);
}

// *******************************************************************************************************
export function process() {
    CoinsButton.updateCoinsButton();
    processBG();

    if (Options.isOnShow()) {
        Options.process();
    } else if (CoinShop.isOnShow()) {
        CoinShop.process();
    } else if (confirmModalContainer) {
        // do nothing
    } else {
        processInGame();
    }
}

function processBG() {
    const dx = main.gamma / 90.0 * MAX_DX;
    bgSprite.x = dx / 5;
    mgSprite.x = dx / 2;
    fgSprite.x = main.g_HalfScaledRendererWidth + dx;

    const MAX_DY = 200;
    const dy = main.beta / 180.0 * MAX_DY;
    bgSprite.y = dy / 5;
    mgSprite.y = dy / 2;
    fgSprite.y = main.g_HalfScaledRendererHeight + dy;
}

// *******************************************************************************************************
function showConfirmModal() {
    confirmModalContainer = new Container();
    main.g_PixiApp.stage.addChild(confirmModalContainer);

    confirmModalGraphics = new Graphics();
    confirmModalContainer.addChild(confirmModalGraphics);

    const BACKING_HEIGHT = main.g_HalfScaledRendererHeight;
    confirmModalGraphics.beginFill(0x00D700);
    confirmModalGraphics.drawRoundedRect(
        main.GUMPH,
        main.g_HalfScaledRendererHeight - 0.5 * BACKING_HEIGHT,
        main.g_ScaledRendererWidth - 2 * main.GUMPH,
        BACKING_HEIGHT,
        8);
    confirmModalGraphics.endFill();

    confirmTextButton = new Button("Use Time Extend?\nNumber Left: " + CoinShop.thingsToBuy[0].bought, null);
    confirmTextButton.setSizeToText(main.GUMPH);
    confirmTextButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight - 0.5 * BACKING_HEIGHT
        + main.GUMPH
        + confirmTextButton.getHalfHeight(),
    ));
    confirmTextButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x00cf7a, 0.95, confirmModalGraphics);
    confirmModalGraphics.addChild(confirmTextButton.m_Text);

    confirmYesButton = new Button("YES", null);
    confirmYesButton.setSizeToText(main.GUMPH);
    confirmYesButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        confirmYesButton.getYBelowOtherButtonWithGap(confirmTextButton, main.GUMPH),
    ));
    confirmYesButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7acf7a, 0.95, confirmModalGraphics);
    confirmModalGraphics.addChild(confirmYesButton.m_Text);

    confirmNoButton = new Button("NO", null);
    confirmNoButton.setSizeToText(main.GUMPH);
    confirmNoButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        confirmNoButton.getYBelowOtherButtonWithGap(confirmYesButton, main.GUMPH),
    ));
    confirmNoButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x7a0000, 0.95, confirmModalGraphics);
    confirmModalGraphics.addChild(confirmNoButton.m_Text);
}

// *******************************************************************************************************
function hideConfirmModal() {
    main.g_PixiApp.stage.removeChild(confirmModalContainer);
    confirmModalContainer = null;
    confirmTextButton = null;
    confirmYesButton = null;
    confirmNoButton = null;
}

// *******************************************************************************************************
export function processInGame() {
    if (countdownTimerStartMillisecs > 0) { // do timer countdown
        const timeElapsedMillisecs = Date.now() - countdownTimerStartMillisecs;
        const timeLeftSecs = Math.max(0, COUNT_DOWN_SECS - timeElapsedMillisecs / 1000);
        if (timeLeftSecs === 0) {
            transitionToInGame();
        }
    } else {
        const isGameOver = updateTimer();
        if (isGameOver) {
            // wait can we go again?!
            if (CoinShop.thingsToBuy[0].bought > 0) {
                // should pop up modal really
                showConfirmModal();
            } else {
                gameOver();
            }
        } else {
            const isFrozen = (freezeTimeStartMS !== 0);
            for (const c of circles) {
                if (c.target) {
                    if (c.teleport) {
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
                        if (!isFrozen) {
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

    for (const c of circles) {
        if (c.index === currentPopIndex || level === 0) {
            c.text.tint = 0xffffff;
        } else if (c.text) {
            c.text.tint = 0x777777;
        }

        circleGraphics.beginFill(c.isCoin ? 0xFFD700 : 0xbb0071);
        circleGraphics.lineStyle(0, 0);
        circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
        circleGraphics.endFill();

        circleGraphics.lineStyle(5.0, 0x00ffff);
        if (!c.isCoin) {
            let offset = vec2.fromValues(0, 0);
            if (c.index in rumbleCircle) {
                offset = getRumbleOffset();
            }
            const cp = vec2.fromValues(offset[0] + c.pos[0],
                                       offset[1] + c.pos[1]);

            const parts = c.origLife;
            if (parts === 1) {
                circleGraphics.drawCircle(cp[0], cp[1], c.radius);
            } else {
                const gapRadians = 10.0 / 180.0 * Math.PI;
                const perPartRadians = MSGlobal.G.TWO_PI / parts;
                for (let c_part = 0; c_part < parts; ++c_part) {
                    if (c_part < c.life) {
                        const startTheta = c_part * perPartRadians;
                        const endTheta = (c_part + 1) * perPartRadians - gapRadians;
                        const startPos = vec2.fromValues(
                            cp[0] + c.radius * Math.cos(startTheta),
                            cp[1] + c.radius * Math.sin(startTheta),
                        );
                        circleGraphics.moveTo(startPos[0], startPos[1]);
                        circleGraphics.arc(cp[0], cp[1], c.radius, startTheta, endTheta);
                    }
                }
            }
        }
    }

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
        CoinsButton.updateCoinsButton();
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
            MSGlobal.log("i paused for " + (deltaTimeMS / 1000) + " seconds");

            // adjust all timers
            if (countdownTimerStartMillisecs > 0) {
                countdownTimerStartMillisecs += deltaTimeMS;
            } else {
                MSGlobal.log("previous startTimeSecs = " + startTimeSecs);
                startTimeSecs += deltaTimeMS / 1000;
                MSGlobal.log("current startTimeSecs = " + startTimeSecs);
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

            // i might have bought some freeze!
            updateFreezeButton();

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

            CoinsButton.show();
        }
    }  else if (confirmModalContainer) {
        if (clicked) {
            if (confirmYesButton.contains(vec2.fromValues(screenX, screenY))) {
                hideConfirmModal();
                CoinShop.useItem(0, 1);
                startTimeSecs = Date.now() / 1000;
            } else if (confirmNoButton.contains(vec2.fromValues(screenX, screenY))) {
                hideConfirmModal();
                gameOver();
            }
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
            MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("shopButton", null, { from: "CountDown" });
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
        MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("shopButton", null, { from: "InGame" });
        CoinShop.show();

        topUIContainer.visible = false;
        countdownContainer.visible = false;
        gameContainer.visible = false;
    } else if (powerUpButton && clicked && powerUpButton.contains(vec2.fromValues(screenX, screenY))) {
        freeze();
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
                let correctPop = false;
                for (const tc of touchedCircles) {
                    if (tc.circle.index === -1 || tc.circle.index === currentPopIndex) {
                        correctPop = true;
                        --tc.circle.life;
                        if (tc.circle.life === 0) {
                            popBubble(tc.circle);
                            circles[tc.idx] = circles[circles.length - 1];
                            circles.pop();
                            if (circles.length === 0) {
                                transitionToCountdown();
                            }
                        }
                        break;
                    }
                }
                if (!correctPop) {
                    for (const tc of touchedCircles) {
                        rumbleCircle[tc.circle.index] = true;
                    }
                    rumbleLine(10, 0.5);
                    startTimeSecs -= 1.0;
                }
            }
        }
    }
}

// *******************************************************************************************************
function freeze() {
    if (freezeTimeStartMS === 0) {
        freezeTimeStartMS = Date.now();
        CoinShop.useItem(1, 1);
        updateFreezeButton();
    }
}

// *******************************************************************************************************
function updateFreezeButton() {
    const isFrozen = (freezeTimeStartMS !== 0);
    const thing = CoinShop.thingsToBuy[1];
    if (thing.bought > 0 || isFrozen) {
        if (!powerUpButton) {
            powerUpButtonGfx = new Graphics();

            powerUpButton = new Button("FREEZE: " + thing.bought, null);
            powerUpButton.setSizeToText(main.GUMPH);
            powerUpButton.setCenterPos(vec2.fromValues(
                main.GUMPH + powerUpButton.getHalfWidth(),
                main.g_ScaledRendererHeight - powerUpButton.getHalfHeight(),
            ));
            powerUpButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
                0x0000D7, 0.95, powerUpButtonGfx);

            if (countdownTimerStartMillisecs > 0) {
                countdownContainer.addChild(powerUpButtonGfx);
                countdownContainer.addChild(powerUpButton.m_Text);
            } else {
                gameContainer.addChild(powerUpButtonGfx);
                gameContainer.addChild(powerUpButton.m_Text);
            }
        }

        if (isFrozen) {
            powerUpButton.m_Text.text = "FREEZE!";
            powerUpButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
                0xD7D7D7, 0.95, powerUpButtonGfx);
        } else {
            powerUpButton.m_Text.text = "FREEZE: " + thing.bought;
            powerUpButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
                0x0000D7, 0.95, powerUpButtonGfx);
        }
    } else {
        if (powerUpButton) {
            countdownContainer.removeChild(powerUpButtonGfx);
            gameContainer.removeChild(powerUpButtonGfx);

            countdownContainer.removeChild(powerUpButton.m_Text);
            gameContainer.removeChild(powerUpButton.m_Text);

            powerUpButton = null;
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
