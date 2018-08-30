import {vec2} from "gl-matrix";
import {Container, Graphics, Sprite, Texture} from "pixi.js";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as CoinShop from "./coinshop";
import * as GameOver from "./gameover";
import * as MSGlobal from "./global";
import * as main from "./main";
import * as Options from "./options";
import * as Title from "./title";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// spritesss
let bgContainer: Container = null;
let bgSprite: Sprite = null;
let cup: Sprite = null;
let teaSurface: Sprite = null;
let straw: Sprite = null;
let timerStraw: Sprite = null;

// *********************************************************
// modal confirm
let confirmModalContainer: Container = null;
let confirmModalGraphics: Graphics = null;
let confirmYesButton: Button = null;
let confirmNoButton: Button = null;

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

export const TIME_TO_COIN_SECS = 1 * 60 * 60;
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
    public sprite: Sprite = null;
    public extraBubblesDelta: vec2[] = [];
    public extraBubbles: Sprite[] = [];
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

    const sprites = Title.setupBG(bgContainer);
    bgSprite = sprites.bgSprite;
    cup = sprites.cup;
    teaSurface = sprites.teaSurface;
    straw = sprites.straw;

    // countdown
    countdownTimerGraphics = new Graphics();
    countdownContainer.addChild(countdownTimerGraphics);

    countdownTimerButton = new Button("<bigger>Round\n1\n</bigger><smaller>Get Ready!</smaller>", main.FONT_STYLES);
    const board = Texture.fromImage(MSGlobal.ASSET_DIR["./board_round-score@2x.png"]);
    countdownTimerButton.setSprite(board.baseTexture);
    countdownTimerButton.setSizeToSprite(0);
    countdownTimerButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    countdownContainer.addChild(countdownTimerButton.m_Sprite);
    countdownContainer.addChild(countdownTimerButton.m_Text);

    // in game stuff
    circleGraphics = new Graphics();
    gameContainer.addChild(circleGraphics);

    buttonGraphics = new Graphics();
    topUIContainer.addChild(buttonGraphics);

    timerButton = new Button("999\n<smaller>Time</smaller>", main.FONT_STYLES);
    timerButton.setSizeToText(0);
    timerButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - main.SMALL_GUMPH - timerButton.getHalfWidth(),
        main.SMALL_GUMPH + timerButton.getHalfHeight(),
    ));
    topUIContainer.addChild(timerButton.m_Text);

    scoreButton = new Button("999\n<smaller>Score</smaller>", main.FONT_STYLES);
    scoreButton.setSizeToText(0);
    scoreButton.setCenterPos(vec2.fromValues(
        main.SMALL_GUMPH + scoreButton.getHalfWidth(),
        main.SMALL_GUMPH + scoreButton.getHalfHeight(),
    ));
    scoreButton.m_Text.text = "0\n<smaller>Score</smaller>";
    topUIContainer.addChild(scoreButton.m_Text);

    // actual in game UI
    const ingameGfx = new Graphics();
    gameContainer.addChild(ingameGfx);

    optionsButton = new Button("", null);
    const settingsTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_settings@2x.png"]);
    optionsButton.setSprite(settingsTexture.baseTexture);
    optionsButton.scaleSprite(vec2.fromValues(main.g_CurrentScaleW, main.g_CurrentScaleH));
    optionsButton.setSizeToSprite(0);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - main.SMALL_GUMPH - optionsButton.getHalfWidth(),
        main.g_ScaledRendererHeight - main.SMALL_GUMPH - optionsButton.getHalfHeight(),
    ));
    countdownContainer.addChild(optionsButton.m_Sprite);

    shopButton = new Button("", null);
    const shopTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_shop@2x.png"]);
    shopButton.setSprite(shopTexture.baseTexture);
    shopButton.scaleSprite(vec2.fromValues(main.g_CurrentScaleW, main.g_CurrentScaleH));
    shopButton.setSizeToSprite(0);
    shopButton.setCenterPos(vec2.fromValues(
        optionsButton.getLeftX() - main.SMALL_GUMPH - shopButton.getHalfWidth(),
        main.g_ScaledRendererHeight - main.SMALL_GUMPH - shopButton.getHalfHeight(),
    ));
    countdownContainer.addChild(shopButton.m_Sprite);

    SAFE_BOTTOM_Y = timerButton.m_CenterPos[1] + 0.5 * timerButton.m_Size[1] + main.SMALL_GUMPH;
    SAFE_TOP_Y = optionsButton.getTopY();

    LINE_Y = scoreButton.getBottomY() + main.SMALL_GUMPH + 0.5 * LINE_WIDTH;
    const strawTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./straw@2x.png"]);
    timerStraw = Sprite.from(strawTexture.baseTexture);
    timerStraw.anchor.set(0.5, 0);
    timerStraw.rotation = -0.5 * Math.PI;
    timerStraw.x = 0;
    timerStraw.y = LINE_Y;
    timerStraw.width = LINE_WIDTH;
    timerStraw.height = main.g_ScaledRendererWidth;
    gameContainer.addChild(timerStraw);

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
    timerButton.m_Text.text = currentTimePerGameSecs + "\n<smaller>Time</smaller>";

    // set the round number and level up
    ++level;
    countdownTimerButton.m_Text.text = "<bigger>Round\n" + (level + 1) + "\n</bigger><smaller>Get Ready!</smaller>";
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

        if (c.life === 1 && !c.isCoin && level >= MIN_LEVEL_FOR_POP_INDEX && Math.random() < 0.5) {
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
                c.speed = 3.0;
            } else {
                c.speed = 1.0 + (level - MIN_LEVEL_FOR_MOVING) * 0.2;
            }
            updateTarget(c, null);
        }

        let bubbleTexture = null;
        if (c.isCoin) {
            bubbleTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./bubble_coin@2x.png"]);
        } else if (c.index === 0) {
            bubbleTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./bubble_active@2x.png"]);
        } else if (c.index > 0) {
            bubbleTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./bubble_inactive@2x.png"]);
        } else {
            bubbleTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./bubble_normal@2x.png"]);
        }

        c.sprite = Sprite.from(bubbleTexture.baseTexture);
        if (c.index > 0) {
            c.sprite.alpha = 0.5;
        }
        c.sprite.anchor.set(0.5);
        c.sprite.rotation = MSGlobal.G.symmetricRand() * 0.1 * Math.PI;
        c.sprite.width = c.sprite.height = 2 * c.radius;
        c.sprite.x = c.pos[0];
        c.sprite.y = c.pos[1];
        gameContainer.addChild(c.sprite);

        if (c.life > 1) {
            const smallBubbleTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./smallbubble.png"]);
            const numExtraBubbles = c.life - 1;
            const degParts = MSGlobal.G.TWO_PI / numExtraBubbles;
            const startDeg = Math.random() * MSGlobal.G.TWO_PI;
            for (let c_bubble = 0; c_bubble < numExtraBubbles; ++c_bubble) {
                const d = startDeg + c_bubble * degParts;
                const extraBubble = Sprite.from(smallBubbleTexture.baseTexture);
                extraBubble.anchor.set(0.5);
                extraBubble.rotation = MSGlobal.G.symmetricRand() * 0.1 * Math.PI;
                extraBubble.width = extraBubble.height = Math.max(20, 0.4 * (2 * c.radius));
                const delta = vec2.fromValues(Math.sin(d), Math.cos(d));
                c.extraBubblesDelta.push(delta);
                extraBubble.x = c.pos[0] + c.radius * delta[0];
                extraBubble.y = c.pos[1] + c.radius * delta[1];
                c.extraBubbles.push(extraBubble);
                gameContainer.addChild(extraBubble);
            }
        }

        if (c.index >= 0 || level === 0) {
            c.text = new MultiStyleText(level === 0 ? "TAP ME!" : "", main.FONT_STYLES);
            c.text.anchor.set(0.5);
            c.text.x = c.pos[0];
            c.text.y = c.pos[1] - c.radius - 0.5 * c.text.height;
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
    timerButton.m_Text.text = Math.ceil(timeLeftSecs) + "\n<smaller>Time</smaller>";
    const offset = getRumbleOffset();

    timerStraw.height = offset[0] + timeLeftSecs / currentTimePerGameSecs * main.g_ScaledRendererWidth;
    gameContainer.addChild(timerStraw);

    return (timeLeftSecs === 0);
}

// *******************************************************************************************************
function transitionToInGame() {
    main.g_PixiApp.stage.removeChild(countdownContainer);
    main.g_PixiApp.stage.addChild(gameContainer);

    countdownContainer.removeChild(shopButton.m_Sprite);
    gameContainer.addChild(shopButton.m_Sprite);

    countdownContainer.removeChild(optionsButton.m_Sprite);
    gameContainer.addChild(optionsButton.m_Sprite);

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

    gameContainer.removeChild(shopButton.m_Sprite);
    countdownContainer.addChild(shopButton.m_Sprite);

    gameContainer.removeChild(optionsButton.m_Sprite);
    countdownContainer.addChild(optionsButton.m_Sprite);

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
function generateUpdateAsyncMessage(bubbleText: string) {
    const now = new Date();
    const numhours = now.getHours();
    const numminutes = now.getMinutes();
    const numseconds = now.getSeconds();

    const seconds = (numhours * 60 * 60) + (numminutes * 60) + numseconds;
    const secondsInDay = 24 * 60 * 60;
    const remainingSeconds = secondsInDay - seconds;
    bubbleText += "\n";
    bubbleText += "FRENZY Time Left: " +
                    MSGlobal.secondsToString(remainingSeconds, false, 2);

    MSGlobal.log(bubbleText);

    MSGlobal.PlatformInterface.updateAsync({
        action: "CUSTOM",
        cta: "Play",
        // data: {},
        // tslint:disable-next-line
        image: "data:image/png;base64,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",
        notification: "NO_PUSH",
        strategy: "LAST",
        template: "NEW_SCORE",
        text: {
          default: bubbleText,
        //   localizations: {
        //     en_US: 'Edgar just played BASH for 9 points!',
        //     pt_BR: 'Edgar jogou BASH por 9 pontos!',
        //   }
        },
      }).then(function() {
        MSGlobal.log("Message was sent successfully");
      }).catch(function(err: any) {
        MSGlobal.error(err);
      });
}
function gameOver() {
    let isHiScore = false;
    if (score > hiscore) {
        hiscore = score;
        isHiScore = true;
    }

    // on game over, if i BEAT the hi score, record it (ME beat OLD with XYZ)
    // on game over, if i DIDNT BEAT the hi score, record it (ME FAIL beat OLD with XYZ)
    // if same - record it
    // record "Time left to be BUBLE KING OF THE DAY"

    // on server, cron job - check LAST time from PREVIOUS day - inform context HEY HEY BUBBLE KING
    // try and save off data to backed

    // save this hi score if possible
    // try and grab the hiscore and name of this context
    const facebookName = MSGlobal.PlatformInterface.getPlayerName();
    const contextID = MSGlobal.PlatformInterface.getContextID();
    const playerID = MSGlobal.PlatformInterface.getPlayerID();
    if (contextID) {
        MSGlobal.PlatformInterface.postCurrentContextHiScore(
            contextID,
            score,
            playerID)
        .then(function(response) {
            let bubbleText = "";
            if (response.data.hiscore_playerid === playerID.toString()) {
                bubbleText = "Still the best! Beat " + facebookName + "'s Bubble FRENZY score of "
                            + response.data.hiscore + "!";
            } else if (response.data.facebookname) {
                if (score > parseInt(response.data.hiscore, 10)) {
                    bubbleText = facebookName + " beat " + response.data.facebookname +
                                " with a NEW SCORE of " + score + "!";
                } else {
                    bubbleText = facebookName + " FAIL to beat " + response.data.facebookname +
                                "! Best score still " + response.data.hiscore + "!";
                }
            } else {
                bubbleText = "Beat " + facebookName + "'s Bubble FRENZY score of " + score + "!";
            }
            generateUpdateAsyncMessage(bubbleText);
        }).catch(function(error) {
            MSGlobal.log(error);

            const bubbleText = "Beat " + facebookName + "'s Bubble FRENZY score of " + score + "!";
            generateUpdateAsyncMessage(bubbleText);
        });
    } else {
        const bubbleText = "Beat " + facebookName + "'s Bubble FRENZY score of " + score + "!";
        generateUpdateAsyncMessage(bubbleText);
    }

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
    Title.processBG(straw, cup, teaSurface);
}

// *******************************************************************************************************
function showConfirmModal() {
    confirmModalContainer = new Container();
    main.g_PixiApp.stage.addChild(confirmModalContainer);

    confirmModalGraphics = new Graphics();
    confirmModalContainer.addChild(confirmModalGraphics);

    const fade = new Graphics();
    fade.beginFill(0x0, 0.65);
    fade.drawRect(0, 0, main.g_ScaledRendererWidth, main.g_ScaledRendererHeight);
    fade.endFill();
    confirmModalContainer.addChild(fade);

    const bgsprite = Sprite.from(MSGlobal.ASSET_DIR["./board_shop@2x.png"]);
    bgsprite.anchor.set(0.5);
    bgsprite.x = main.g_HalfScaledRendererWidth;
    bgsprite.y = main.g_HalfScaledRendererHeight;
    confirmModalContainer.addChild(bgsprite);

    const titleText = new MultiStyleText(
        "<medium>Use Time Extend?\nNumber Left: " + CoinShop.thingsToBuy[0].bought + "</medium>",
        main.FONT_STYLES);
    titleText.anchor.set(0.5);
    titleText.x = main.g_HalfScaledRendererWidth;
    titleText.y = bgsprite.y - 0.5 * bgsprite.height + 2 * main.GUMPH + 0.5 * titleText.height;
    confirmModalContainer.addChild(titleText);

    confirmNoButton = new Button("NO", main.FONT_STYLES);
    const no = Texture.fromImage(MSGlobal.ASSET_DIR["./offbutton.png"]);
    confirmNoButton.setSprite(no.baseTexture);
    confirmNoButton.setSizeToSprite(0);
    confirmNoButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        bgsprite.y + 0.5 * bgsprite.height - main.GUMPH - confirmNoButton.getHalfHeight(),
    ));
    confirmModalContainer.addChild(confirmNoButton.m_Sprite);
    confirmModalContainer.addChild(confirmNoButton.m_Text);

    confirmYesButton = new Button("YES", main.FONT_STYLES);
    const yes = Texture.fromImage(MSGlobal.ASSET_DIR["./onbutton.png"]);
    confirmYesButton.setSprite(yes.baseTexture);
    confirmYesButton.setSizeToSprite(0);
    confirmYesButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        confirmNoButton.getTopY() - main.GUMPH - confirmYesButton.getHalfHeight(),
    ));
    confirmModalContainer.addChild(confirmYesButton.m_Sprite);
    confirmModalContainer.addChild(confirmYesButton.m_Text);
}

// *******************************************************************************************************
function hideConfirmModal() {
    main.g_PixiApp.stage.removeChild(confirmModalContainer);
    confirmModalContainer = null;
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
function renderOutline(c: Circle) {
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
function updateRenderCircles() {
    circleGraphics.clear();

    // we render things in order
    // for (const c of circles) {
    //     if (!c.isCoin && c.index !== -1 && c.index !== currentPopIndex) { // not a coin, indexed, not chosen
    //         circleGraphics.beginFill(0x21b166);
    //         circleGraphics.lineStyle(0, 0);
    //         circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    //         circleGraphics.endFill();

    //         circleGraphics.lineStyle(5.0, 0x888800);
    //         const cos45 = Math.cos(0.25 * Math.PI);
    //         const sin45 = Math.sin(0.25 * Math.PI);
    //         circleGraphics.moveTo(c.radius * cos45 + c.pos[0],
    //                               c.radius * sin45 + c.pos[1]);
    //         circleGraphics.lineTo(-c.radius * cos45 + c.pos[0],
    //                               -c.radius * sin45 + c.pos[1]);
    //         circleGraphics.moveTo(-c.radius * cos45 + c.pos[0],
    //                               c.radius * sin45 + c.pos[1]);
    //         circleGraphics.lineTo(c.radius * cos45 + c.pos[0],
    //                               -c.radius * sin45 + c.pos[1]);

    //         renderOutline(c);
    //         c.text.visible = false;
    //     }
    // }
    // for (const c of circles) {
    //     if (!c.isCoin && c.index !== -1 && c.index === currentPopIndex) { // not a coin, indexed, chosen
    //         circleGraphics.beginFill(0x88ff88);
    //         circleGraphics.lineStyle(0, 0);
    //         circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    //         circleGraphics.endFill();

    //         // circleGraphics.lineStyle(5.0, 0xffff00);
    //         // const cos45 = Math.cos(0.25 * Math.PI);
    //         // const sin45 = Math.sin(0.25 * Math.PI);
    //         // circleGraphics.moveTo(0.5 * c.radius * cos45 + c.pos[0],
    //         //                       -c.radius * cos45 + c.pos[1]);
    //         // circleGraphics.lineTo(0.5 * c.radius * cos45 + c.pos[0],
    //         //                       -c.radius * cos45 + c.pos[1] + 0.5 * c.radius);
    //         // circleGraphics.moveTo(-0.5 * c.radius * cos45 + c.pos[0],
    //         //                         -c.radius * cos45 + c.pos[1]);
    //         // circleGraphics.lineTo(-0.5 * c.radius * cos45 + c.pos[0],
    //         //                         -c.radius * cos45 + c.pos[1] + 0.5 * c.radius);

    //         renderOutline(c);
    //         c.text.visible = false;
    //     }
    // }
    // for (const c of circles) {
    //     if (!c.isCoin && c.index === -1) { // not a coin, unindexed
    //         circleGraphics.beginFill(0xbb0071);
    //         circleGraphics.lineStyle(0, 0);
    //         circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    //         circleGraphics.endFill();

    //         renderOutline(c);
    //     }
    // }
    // for (const c of circles) {
    //     if (c.isCoin) { // coin
    //         circleGraphics.beginFill(0xFFD700);
    //         circleGraphics.lineStyle(0, 0);
    //         circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    //         circleGraphics.endFill();

    //         renderOutline(c);
    //     }
    // }

    for (const c of circles) {
        let offset = vec2.fromValues(0, 0);
        if (c.index in rumbleCircle) {
            offset = getRumbleOffset();
        }
        c.sprite.x = c.pos[0] + offset[0];
        c.sprite.y = c.pos[1] + offset[1];
        c.sprite.width = c.sprite.height = 2 * c.radius;

        for (let e = 0; e < c.extraBubbles.length; ++e) {
            const eb = c.extraBubbles[e];
            eb.x = c.pos[0] + c.radius * c.extraBubblesDelta[e][0];
            eb.y = c.pos[1] + c.radius * c.extraBubblesDelta[e][1];
        }
    }

    // for (const c of circles) {
    //     if (c.index === currentPopIndex || level === 0) {
    //         c.text.tint = 0xffffff;
    //     } else if (c.text) {
    //         c.text.tint = 0x777777;
    //     }

    //     circleGraphics.beginFill(c.isCoin ?  : 0xbb0071);
    //     circleGraphics.lineStyle(0, 0);
    //     circleGraphics.drawCircle(c.pos[0], c.pos[1], c.radius);
    //     circleGraphics.endFill();

    //     circleGraphics.lineStyle(5.0, 0x00ffff);
    //     if (!c.isCoin) {
    //         let offset = vec2.fromValues(0, 0);
    //         if (c.index in rumbleCircle) {
    //             offset = getRumbleOffset();
    //         }
    //         const cp = vec2.fromValues(offset[0] + c.pos[0],
    //                                    offset[1] + c.pos[1]);

    //         const parts = c.origLife;
    //         if (parts === 1) {
    //             circleGraphics.drawCircle(cp[0], cp[1], c.radius);
    //         } else {
    //             const gapRadians = 10.0 / 180.0 * Math.PI;
    //             const perPartRadians = MSGlobal.G.TWO_PI / parts;
    //             for (let c_part = 0; c_part < parts; ++c_part) {
    //                 if (c_part < c.life) {
    //                     const startTheta = c_part * perPartRadians;
    //                     const endTheta = (c_part + 1) * perPartRadians - gapRadians;
    //                     const startPos = vec2.fromValues(
    //                         cp[0] + c.radius * Math.cos(startTheta),
    //                         cp[1] + c.radius * Math.sin(startTheta),
    //                     );
    //                     circleGraphics.moveTo(startPos[0], startPos[1]);
    //                     circleGraphics.arc(cp[0], cp[1], c.radius, startTheta, endTheta);
    //                 }
    //             }
    //         }
    //     }
    // }

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
    if (c.index >= 0) {
        currentPopIndex++;
        for (const cc of circles) {
            if (cc.index === currentPopIndex) {
                cc.sprite.texture = Texture.fromImage(MSGlobal.ASSET_DIR["./bubble_active@2x.png"]);
                cc.sprite.alpha = 1;
                gameContainer.removeChild(cc.sprite);
                gameContainer.addChild(cc.sprite);
            }
        }
    }
    if (c.isCoin) {
        changeCoins(1);
        CoinsButton.updateCoinsButton();
    } else {
        score++;
        scoreButton.m_Text.text = score + "\n<smaller>Score</smaller>";
    }

    if (c.text) { gameContainer.removeChild(c.text); }
    c.text = null;

    gameContainer.removeChild(c.sprite);
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

export function pauseInOptions() {
    if (!Options.isOnShow()) {
        pauseTimeMillisecs = Date.now();
        Options.show();
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
            pauseInOptions();
        } else if (clicked && shopButton.contains(vec2.fromValues(screenX, screenY))) {
            pauseTimeMillisecs = Date.now();
            MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("shopButton", null, { from: "CountDown" });
            CoinShop.show();

            topUIContainer.visible = false;
            countdownContainer.visible = false;
            gameContainer.visible = false;
        }
    } else if (clicked && optionsButton.contains(vec2.fromValues(screenX, screenY))) {
        pauseInOptions();
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
                        } else {
                            if (tc.circle.extraBubbles.length > 0) {
                                gameContainer.removeChild(tc.circle.extraBubbles[tc.circle.extraBubbles.length - 1]);
                                tc.circle.extraBubbles.pop();
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
    if (thing && (thing.bought > 0 || isFrozen)) {
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
