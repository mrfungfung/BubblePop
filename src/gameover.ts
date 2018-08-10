import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import * as AdsManager from "./adsmanager";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as CoinShop from "./coinshop";
import * as Game from "./game";
import * as MSGlobal from "./global";
import * as main from "./main";
import * as Options from "./options";
import {EAdType, ILeaderboard, ILeaderboardEntry} from "./platform";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

declare var process: any;

// *********************************************************
let gameOverPopUpContainer: Container = null;
let gameOverShowStartMS: number = 0;
let gameOverT: number = 1.0;

// *********************************************************
let container: Container = null;
let leaderboardContainer: Container = null;
let buttonGraphics: Graphics = null;
let restartButton: Button = null;
let lastScoreButton: Button = null;
let hiScoreButton: Button = null;
let playWithFriendsButton: Button = null;
let optionsButton: Button = null;
let shopButton: Button = null;
let loadingText: any = null;

let continueWithAdsButton: Button = null;
let continueWithInviteButton: Button = null;

let lastScore = 0;
let isHiScore = false;
let levelReached = 0;
let continueCount = 0;

const MAX_ENTRIES = 5;
const PROFILE_PIC_DIM = 48;

export function initialise(lastscore: number, ishighscore: boolean, levelreached: number) {
    lastScore = lastscore;
    isHiScore = ishighscore;
    levelReached = levelreached;
}

const LEADERBOARD_NAME_PREFIX = (process.env.NODE_ENV === MSGlobal.G.DEV_ENV ?
    "DevScoreProd_v0." :
    "HiScoreProd_v0.");

// *********************************************************
export function show() {
    gameOverShowStartMS = Date.now();
    gameOverT = 1.0;
    gameOverPopUpContainer = new Container();
    main.g_PixiApp.stage.addChild(gameOverPopUpContainer);
    const gameOverGfx = new Graphics();
    gameOverPopUpContainer.addChild(gameOverGfx);

    const BACKING_HEIGHT = main.g_ScaledRendererHeight - 2 * main.GUMPH;
    gameOverGfx.beginFill(0xFFD700);
    gameOverGfx.drawRoundedRect(
        main.GUMPH,
        main.g_HalfScaledRendererHeight - 0.5 * BACKING_HEIGHT,
        main.g_ScaledRendererWidth - 2 * main.GUMPH,
        BACKING_HEIGHT,
        8);
    gameOverGfx.endFill();

    const gameOverText = new MultiStyleText("Game Over\nOut Of Time!", {
        default: {
            align: "center",
            fill: "0xFFFFFF",
            fontSize: "20px",
            lineJoin: "round",
            stroke: "0x0",
            strokeThickness: "4",
        },
    });
    gameOverText.anchor.set(0.5);
    gameOverText.x = main.g_HalfScaledRendererWidth;
    gameOverText.y = main.g_HalfScaledRendererHeight;
    gameOverPopUpContainer.addChild(gameOverText);

    createEverything();

    // kick off getting entries
    // save and get leaderboards if im in a context
    const contextID = MSGlobal.PlatformInterface.getContextID();
    if (contextID !== null) {
        MSGlobal.PlatformInterface
        .getLeaderboardAsync(LEADERBOARD_NAME_PREFIX + contextID)
        .then((leaderboard: ILeaderboard) => {
            return leaderboard.setScoreAsync(lastScore, null);
        }).then((entry: ILeaderboardEntry) => {
            MSGlobal.log("Score saved");
            MSGlobal.log(entry);
            getHiScores();
        }).catch((error: any) => {
            MSGlobal.error("Score saved Error");
            MSGlobal.error(error);
            getHiScores();
        });
    }
}

// *********************************************************
function createEverything() {
    container = new Container();

    buttonGraphics = new Graphics();
    container.addChild(buttonGraphics);

    hiScoreButton = new Button("Hi Score: " + Game.hiscore, null);
    hiScoreButton.setSizeToText(main.GUMPH);
    hiScoreButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.GUMPH + hiScoreButton.getHalfHeight(),
    ));
    hiScoreButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xcd007a, 0.95, buttonGraphics);
    container.addChild(hiScoreButton.m_Text);

    lastScoreButton = new Button(
        (isHiScore ? "New Hi Score! " : "Score: " ) + lastScore, null);
    lastScoreButton.setSizeToText(main.GUMPH);
    lastScoreButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        hiScoreButton.getBottomY()
        + main.SMALL_GUMPH + lastScoreButton.getHalfHeight(),
    ));
    lastScoreButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        (isHiScore ? 0xcd007a : 0x888888), 0.95, buttonGraphics);
    container.addChild(lastScoreButton.m_Text);

    let lastbutton = lastScoreButton;
    continueWithAdsButton = null;
    continueWithInviteButton = null;
    playWithFriendsButton = null;

    if (continueCount === 0 && isHiScore) {
        if (MSGlobal.PlatformInterface.canShowAds(EAdType.EADTYPE_INTERSTITIAL)) {
            continueWithAdsButton = new Button("Continue! Watch Ad", null);
            continueWithAdsButton.setSizeToText(main.GUMPH);
            continueWithAdsButton.setCenterPos(vec2.fromValues(
                main.g_HalfScaledRendererWidth,
                lastbutton.getBottomY()
                + main.SMALL_GUMPH + continueWithAdsButton.getHalfHeight(),
            ));
            continueWithAdsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
                0xFF7acf, 0.95, buttonGraphics);
            container.addChild(continueWithAdsButton.m_Text);

            lastbutton = continueWithAdsButton;
        }

        continueWithInviteButton = new Button("Continue! Play With Friends", null);
        continueWithInviteButton.setSizeToText(main.GUMPH);
        continueWithInviteButton.setCenterPos(vec2.fromValues(
            main.g_HalfScaledRendererWidth,
            lastbutton.getBottomY()
            + main.SMALL_GUMPH + continueWithInviteButton.getHalfHeight(),
        ));
        continueWithInviteButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
            0xFF7acf, 0.95, buttonGraphics);
        container.addChild(continueWithInviteButton.m_Text);

        lastbutton = continueWithInviteButton;
    } else {
        playWithFriendsButton = new Button("Play With Friends", null);
        playWithFriendsButton.setSizeToText(main.GUMPH);
        playWithFriendsButton.setCenterPos(vec2.fromValues(
            main.g_HalfScaledRendererWidth,
            lastScoreButton.getBottomY()
            + main.SMALL_GUMPH + playWithFriendsButton.getHalfHeight(),
        ));
        playWithFriendsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
            0xFF7acf, 0.95, buttonGraphics);
        container.addChild(playWithFriendsButton.m_Text);

        lastbutton = playWithFriendsButton;
    }

    restartButton = new Button("Restart", null);
    restartButton.setSizeToText(main.GUMPH);
    restartButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        lastbutton.getBottomY()
        + main.SMALL_GUMPH + restartButton.getHalfHeight(),
    ));
    restartButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(restartButton.m_Text);

    optionsButton = new Button("O", null);
    optionsButton.setSizeToText(main.GUMPH);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - 0.5 * optionsButton.m_Size[0],
        main.g_ScaledRendererHeight - 0.5 * optionsButton.m_Size[1],
    ));
    optionsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xff0000, 0.95, buttonGraphics);
    container.addChild(optionsButton.m_Text);

    shopButton = new Button("Shop", null);
    shopButton.setSizeToText(main.GUMPH);
    shopButton.setCenterPos(vec2.fromValues(
        optionsButton.getLeftX() - main.GUMPH - shopButton.getHalfWidth(),
        main.g_ScaledRendererHeight - 0.5 * shopButton.m_Size[1],
    ));
    shopButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, buttonGraphics);
    container.addChild(shopButton.m_Text);

    // create the leaderboard
    createLeaderBoardUI();
}

function createLeaderBoardUI() {
    // only do this if im in a context
    const contextID = MSGlobal.PlatformInterface.getContextID();
    if (contextID !== null) {
        loadingText = new MultiStyleText("Loading hiscores...", {
            default: {
                fill: "0xFFFFFF",
                fontSize: "20px",
                lineJoin: "round",
                stroke: "0x0",
                strokeThickness: "4",
            },
        });
        loadingText.anchor.set(0.5);
        const TOP_Y = restartButton.getBottomY() + main.GUMPH;
        const ENTRY_ROW_HEIGHT = PROFILE_PIC_DIM + main.SMALL_GUMPH;
        loadingText.x = main.g_HalfScaledRendererWidth;
        loadingText.y = TOP_Y + 0.5 * MAX_ENTRIES * ENTRY_ROW_HEIGHT;
        container.addChild(loadingText);
    }
}

function showEverything() {
    CoinsButton.show();
    main.g_PixiApp.stage.addChild(container);
}

export function hide() {
    main.g_PixiApp.stage.removeChild(container);
    main.g_PixiApp.stage.removeChild(leaderboardContainer);
    container = null;
    leaderboardContainer = null;
    CoinsButton.hide();
}

// ************************************************************************
function getHiScores() {
    // lets populate hi score tables
    const contextID = MSGlobal.PlatformInterface.getContextID();
    if (contextID !== null) {
        MSGlobal.PlatformInterface
        .getLeaderboardAsync(LEADERBOARD_NAME_PREFIX + contextID)
        .then((leaderboard: ILeaderboard) => {
            leaderboard.getPlayerEntryAsync().then(function(playerEntry: ILeaderboardEntry) {
                if (playerEntry) {
                    const offset = Math.max(0, playerEntry.getRank() - Math.floor(MAX_ENTRIES / 2));
                    return createEntries(leaderboard, 10, offset);
                } else {
                    return createEntries(leaderboard, 10, 0);
                }
            }).catch(function(error: any) {
                return createEntries(leaderboard, 10, 0);
            });
        });
    }
}

// ************************************************************************
function createEntries(leaderboard: ILeaderboard, count: number, offset: number) {
    return leaderboard.getEntriesAsync(count, offset).then( function(entries: ILeaderboardEntry[]) {
        leaderboardContainer = new Container();

        const entryPicBackingGfx = new Graphics();
        const entryOutline = new Graphics();
        const playerEntryOutline = new Graphics();

        leaderboardContainer.addChild(entryPicBackingGfx);
        leaderboardContainer.addChild(entryOutline);
        leaderboardContainer.addChild(playerEntryOutline);
        entryPicBackingGfx.beginFill(0x0, 0.75);
        entryOutline.beginFill(0xaaaaff, 0.75);
        playerEntryOutline.beginFill(0xFF0000, 0.75);

        const TOP_Y = restartButton.getBottomY() + main.GUMPH;
        const LEFT_WITH_MARGIN = main.GUMPH;
        const ENTRY_ROW_HEIGHT = PROFILE_PIC_DIM + main.SMALL_GUMPH;

        for (let i = 0; i < entries.length && i < MAX_ENTRIES; ++i) {
            const entry = entries[i];
            const rank = offset + i + 1;

            // create a picture and then the text
            const entryText = new MultiStyleText("", {
                default: {
                    fill: "0xFFFFFF",
                    fontSize: "18px",
                    lineJoin: "round",
                    stroke: "0x0",
                    strokeThickness: "4",
                },
                points: {
                    fill: "0xFF8888",
                    fontSize: "25px",
                    lineJoin: "round",
                    stroke: "0x0",
                    strokeThickness: "4",
                },
            });

            entryText.text = rank + ". " + entry.getPlayer().getName() + "\n";
            entryText.text += "<points>" + entry.getFormattedScore() + "</points>";
            entryText.x = LEFT_WITH_MARGIN + PROFILE_PIC_DIM + main.SMALL_GUMPH;
            entryText.y = TOP_Y + ENTRY_ROW_HEIGHT * i;
            leaderboardContainer.addChild(entryText);

            const entrySprite = PIXI.Sprite.fromImage(entry.getPlayer().getPhoto());
            entrySprite.width = PROFILE_PIC_DIM;
            entrySprite.height = PROFILE_PIC_DIM;
            entrySprite.anchor.set(0.5);
            entrySprite.x = LEFT_WITH_MARGIN + 0.5 * entrySprite.width;
            entrySprite.y = TOP_Y + (ENTRY_ROW_HEIGHT * i) + 0.5 *  entrySprite.height;
            leaderboardContainer.addChild(entrySprite);

            entryPicBackingGfx.drawRect(entrySprite.x - 0.5 * entrySprite.width,
                entrySprite.y - 0.5 * entrySprite.height,
                PROFILE_PIC_DIM, PROFILE_PIC_DIM);

            const isPlayer = entry.getPlayer().getID() === MSGlobal.PlatformInterface.getPlayerID();
            const outlineObject = isPlayer ? playerEntryOutline : entryOutline;
            const BACKING_LEFT_X = entrySprite.x + 0.5 * entrySprite.width + main.SMALL_GUMPH;
            const BACKING_WIDTH = main.g_ScaledRendererWidth;
            outlineObject.drawRoundedRect(BACKING_LEFT_X,
                    TOP_Y + (ENTRY_ROW_HEIGHT * i),
                                        BACKING_WIDTH, PROFILE_PIC_DIM,
                                        8);
        }
        entryOutline.endFill();
        entryPicBackingGfx.endFill();

    }).catch((error: any) => {
        MSGlobal.error("Best high scores error: " + error);
    });
}

// *******************************************************************************************************
export function doProcess() {
    CoinsButton.updateCoinsButton();

    if (Options.isOnShow()) {
        Options.process();
    } else if (gameOverPopUpContainer) {
        const TIME_FOR_GAME_OVER_SECS = 1.5;
        if ((Date.now() - gameOverShowStartMS) / 1000 >= TIME_FOR_GAME_OVER_SECS) {
            gameOverT *= 0.9;
            if (gameOverT <= 0.01) {
                gameOverT = 0;
                main.g_PixiApp.stage.removeChild(gameOverPopUpContainer);
                gameOverPopUpContainer = null;
                showEverything();
            } else {
                gameOverPopUpContainer.position.y = (1.0 - gameOverT) * main.g_ScaledRendererHeight;
            }
        }
    } else {
        if (leaderboardContainer) {
            if (loadingText) { container.removeChild(loadingText); }
            main.g_PixiApp.stage.addChild(leaderboardContainer);
        }
    }
}

// *******************************************************************************************************
function tryShowInterstitial(fromLogKey: string, success: any, fail: any) {
    if (MSGlobal.PlatformInterface.canShowAds(EAdType.EADTYPE_INTERSTITIAL)) {
        AdsManager.showAd(EAdType.EADTYPE_INTERSTITIAL,
            function() {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("showingAd", null,
                                                            { adShown: "Interstitial",
                                                                from: fromLogKey});
                success();
            }, function() {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("showingAd", null,
                                                            { adShown: "FAILED_Interstitial",
                                                                from: fromLogKey});
                fail();
            });
    } else {
        fail();
    }
}

// *******************************************************************************************************
function transitionToResetGame() {
    Game.resetGame();
    main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
}
function transitionToContinueGame() {
    ++continueCount;
    Game.continueGame();
    main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
}

// *******************************************************************************************************
function resetGame() {
    continueCount = 0;

    if (levelReached === 0) {
        transitionToResetGame();
    } else {
        tryShowInterstitial("reset", transitionToResetGame, transitionToResetGame);
    }
}

export function processInput(clicked: boolean,
                             mouseDown: boolean,
                             lastFrameMouseDown: boolean,
                             screenX: number,
                             screenY: number) {
    if (Options.isOnShow()) {
        Options.processInput(
                            clicked,
                            mouseDown,
                            lastFrameMouseDown,
                            screenX,
                            screenY);
    } else if (CoinShop.isOnShow()) {
        const finished = CoinShop.processInput(
                            clicked,
                            mouseDown,
                            lastFrameMouseDown,
                            screenX,
                            screenY);
        if (finished) {
            container.visible = true;
            leaderboardContainer.visible = true;
            CoinsButton.show();
        }
    } else if (!gameOverPopUpContainer) {
        if (clicked) {
            if (continueWithAdsButton && continueWithAdsButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("continueWithAdsButton", null, null);
                tryShowInterstitial("continue", transitionToContinueGame, transitionToContinueGame);
            } else if (continueWithInviteButton &&
                        continueWithInviteButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("continueWithInviteButton", null,
                                                                        { state: "Clicked" });
                MSGlobal.PlatformInterface.chooseAsync()
                .then(function() {
                    MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("continueWithInviteButton", null,
                                                                        { state: "Success" });
                    transitionToContinueGame();
                }).catch((error: any) => {
                    MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("continueWithInviteButton", null,
                                                                        { state: "Failed" });
                    MSGlobal.error(error);
                });
            } else if (optionsButton.contains(vec2.fromValues(screenX, screenY))) {
                Options.show();
            } else if (shopButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("shopButton", null, { from: "GameOver" });
                container.visible = false;
                leaderboardContainer.visible = false;
                CoinsButton.hide();
                CoinShop.show();
            } else if (restartButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("restart", null, null);
                resetGame();
            } else if (playWithFriendsButton &&
                        playWithFriendsButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("playWithFriendsButton", null,
                                                                        { state: "Clicked" });
                MSGlobal.PlatformInterface.chooseAsync()
                .then(function() {
                    MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("playWithFriendsButton", null,
                                                                        { state: "Success" });
                    resetGame();
                }).catch((error: any) => {
                    MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("playWithFriendsButton", null,
                                                                        { state: "Failed" });
                    MSGlobal.error(error);
                });
            }
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
