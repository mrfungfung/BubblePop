import {vec2} from "gl-matrix";
import {Container, Graphics, Texture} from "pixi.js";
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
let gameOverButton: Button = null;
const TIME_FOR_GAME_OVER_SECS = 1.5;
let BACKING_WIDTH = 0;
let BACKING_HEIGHT = 0;
let BACKING_X = 0;
let BACKING_Y = 0;

// *********************************************************
let container: Container = null;
let leaderboardContainer: Container = null;
let buttonGraphics: Graphics = null;
let restartButton: Button = null;
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

const MAX_ENTRIES = 3;
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

    const bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./background@2x.png"]);
    bgSprite.width *= main.g_CurrentScaleW;
    bgSprite.height *= main.g_CurrentScaleH;
    gameOverPopUpContainer.addChild(bgSprite);

    gameOverButton = new Button("Game Over\nOut Of Time!", main.FONT_STYLES);
    const bgTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./board_round-score@2x.png"]);
    gameOverButton.setSprite(bgTexture.baseTexture);
    gameOverButton.setSizeToSprite(0);
    gameOverButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    gameOverPopUpContainer.addChild(gameOverButton.m_Sprite);
    gameOverPopUpContainer.addChild(gameOverButton.m_Text);

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

    const bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./background@2x.png"]);
    bgSprite.width *= main.g_CurrentScaleW;
    bgSprite.height *= main.g_CurrentScaleH;
    container.addChild(bgSprite);

    // backing
    const optionsGFX = new Graphics();
    container.addChild(optionsGFX);

    BACKING_WIDTH = main.g_ScaledRendererWidth - 2 * main.GUMPH;
    BACKING_HEIGHT = main.g_ScaledRendererHeight - 4 * main.GUMPH;
    BACKING_X = main.g_HalfScaledRendererWidth;
    BACKING_Y = main.GUMPH + 0.5 * BACKING_HEIGHT;
    optionsGFX.beginFill(0xcaf2a3);
    optionsGFX.lineStyle(5.0, 0x634130);
    optionsGFX.drawRoundedRect(
        BACKING_X - 0.5 * BACKING_WIDTH,
        BACKING_Y - 0.5 * BACKING_HEIGHT,
        BACKING_WIDTH, BACKING_HEIGHT,
        8);
    optionsGFX.endFill();

    // another backing
    const hiboard = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./board_round-score@2x.png"]);
    hiboard.anchor.set(0.5);
    hiboard.x = main.g_HalfScaledRendererWidth;
    hiboard.y = BACKING_Y - 0.5 * BACKING_HEIGHT + main.SMALL_GUMPH + 0.5 * hiboard.height;
    container.addChild(hiboard);

    // title text
    const titleText = new MultiStyleText("Final Score", main.FONT_STYLES);
    titleText.anchor.set(0.5);
    titleText.x = main.g_HalfScaledRendererWidth;
    titleText.y = hiboard.y - 0.5 * hiboard.height + main.SMALL_GUMPH + 0.5 * titleText.height;
    container.addChild(titleText);

    // last score
    const lastScoreText = new MultiStyleText("<bigger>" + lastScore + "</bigger>", main.FONT_STYLES);
    lastScoreText.anchor.set(0.5);
    lastScoreText.x = main.g_HalfScaledRendererWidth;
    lastScoreText.y = titleText.y + 0.5 * titleText.height + main.SMALL_GUMPH + 0.5 * lastScoreText.height;
    container.addChild(lastScoreText);

    // hi score
    const hiScoreText = new MultiStyleText(
        "<small>" + (isHiScore ? "New " : "") + "Hi Score: " + Game.hiscore + "</small>",
        main.FONT_STYLES);
    hiScoreText.anchor.set(0.5);
    hiScoreText.x = main.g_HalfScaledRendererWidth;
    hiScoreText.y = lastScoreText.y + 0.5 * lastScoreText.height + main.SMALL_GUMPH + 0.5 * hiScoreText.height;
    container.addChild(hiScoreText);

    let lastBottomY = hiboard.y + 0.5 * hiboard.height;
    continueWithAdsButton = null;
    continueWithInviteButton = null;
    playWithFriendsButton = null;

    const continueTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_continue@2x.png"]);
    if (continueCount === 0) {

        if (MSGlobal.PlatformInterface.canShowAds(EAdType.EADTYPE_INTERSTITIAL)) {
            continueWithAdsButton = new Button("<small>Continue\nWatch Video</small>", main.FONT_STYLES);
            continueWithAdsButton.setSprite(continueTexture.baseTexture);
            continueWithAdsButton.setSizeToSprite(0);
            continueWithAdsButton.setCenterPos(vec2.fromValues(
                main.g_HalfScaledRendererWidth,
                lastBottomY + main.SMALL_GUMPH + continueWithAdsButton.getHalfHeight(),
            ));
            container.addChild(continueWithAdsButton.m_Sprite);
            container.addChild(continueWithAdsButton.m_Text);

            lastBottomY = continueWithAdsButton.getBottomY();
        }

        continueWithInviteButton = new Button("<small>Continue\nInvite Friends</small>", main.FONT_STYLES);
        continueWithInviteButton.setSprite(continueTexture.baseTexture);
        continueWithInviteButton.setSizeToSprite(0);
        continueWithInviteButton.setCenterPos(vec2.fromValues(
            main.g_HalfScaledRendererWidth,
            lastBottomY + main.SMALL_GUMPH + continueWithInviteButton.getHalfHeight(),
        ));
        container.addChild(continueWithInviteButton.m_Sprite);
        container.addChild(continueWithInviteButton.m_Text);

        lastBottomY = continueWithInviteButton.getBottomY();
    } else {
        playWithFriendsButton = new Button("<small>Play With Friends</small>", main.FONT_STYLES);
        playWithFriendsButton.setSprite(continueTexture.baseTexture);
        playWithFriendsButton.setSizeToSprite(0);
        playWithFriendsButton.setCenterPos(vec2.fromValues(
            main.g_HalfScaledRendererWidth,
            lastBottomY + main.SMALL_GUMPH + playWithFriendsButton.getHalfHeight(),
        ));
        container.addChild(playWithFriendsButton.m_Sprite);
        container.addChild(playWithFriendsButton.m_Text);

        lastBottomY = playWithFriendsButton.getBottomY();
    }

    restartButton = new Button("<small>Restart</small>", main.FONT_STYLES);
    const restartTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_restart@2x.png"]);
    restartButton.setSprite(restartTexture.baseTexture);
    restartButton.setSizeToSprite(0);
    restartButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        lastBottomY + main.SMALL_GUMPH + restartButton.getHalfHeight(),
    ));
    container.addChild(restartButton.m_Sprite);
    container.addChild(restartButton.m_Text);

    optionsButton = new Button("", null);
    const settingsTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_settings@2x.png"]);
    optionsButton.setSprite(settingsTexture.baseTexture);
    optionsButton.scaleSprite(vec2.fromValues(main.g_CurrentScaleW, main.g_CurrentScaleH));
    optionsButton.setSizeToSprite(0);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - main.SMALL_GUMPH - optionsButton.getHalfWidth(),
        main.g_ScaledRendererHeight - main.SMALL_GUMPH - optionsButton.getHalfHeight(),
    ));
    container.addChild(optionsButton.m_Sprite);

    shopButton = new Button("", null);
    const shopTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_shop@2x.png"]);
    shopButton.setSprite(shopTexture.baseTexture);
    shopButton.scaleSprite(vec2.fromValues(main.g_CurrentScaleW, main.g_CurrentScaleH));
    shopButton.setSizeToSprite(0);
    shopButton.setCenterPos(vec2.fromValues(
        optionsButton.getLeftX() - main.SMALL_GUMPH - shopButton.getHalfWidth(),
        main.g_ScaledRendererHeight - main.SMALL_GUMPH - shopButton.getHalfHeight(),
    ));
    container.addChild(shopButton.m_Sprite);

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
                    return createEntries(leaderboard, MAX_ENTRIES, offset);
                } else {
                    return createEntries(leaderboard, MAX_ENTRIES, 0);
                }
            }).catch(function(error: any) {
                return createEntries(leaderboard, MAX_ENTRIES, 0);
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
        entryPicBackingGfx.beginFill(0x634130);
        entryOutline.beginFill(0xfbf9df);
        playerEntryOutline.beginFill(0xffbdbb);

        const TOP_Y = restartButton.getBottomY() + main.GUMPH;
        const LEFT = BACKING_X - 0.5 * BACKING_WIDTH;
        const LEFT_WITH_MARGIN = LEFT + main.SMALL_GUMPH;
        const ENTRY_ROW_HEIGHT = PROFILE_PIC_DIM + main.SMALL_GUMPH;

        for (let i = 0; i < entries.length && i < MAX_ENTRIES; ++i) {
            const entry = entries[i];
            const rank = offset + i + 1;

            // create a picture and then the text
            const entrySprite = PIXI.Sprite.fromImage(entry.getPlayer().getPhoto());
            entrySprite.width = PROFILE_PIC_DIM;
            entrySprite.height = PROFILE_PIC_DIM;
            entrySprite.anchor.set(0.5);
            entrySprite.x = LEFT_WITH_MARGIN + 0.5 * entrySprite.width;
            entrySprite.y = TOP_Y + (ENTRY_ROW_HEIGHT * i) + 0.5 * entrySprite.height;
            leaderboardContainer.addChild(entrySprite);

            const entryText = new MultiStyleText("", main.FONT_STYLES);
            entryText.text = "<smaller>" + rank + ". " + entry.getPlayer().getName() + "</smaller>\n";
            entryText.text += "<medium>" + entry.getFormattedScore() + "</medium>";
            entryText.x = LEFT_WITH_MARGIN + PROFILE_PIC_DIM + 2 * main.SMALL_GUMPH;
            entryText.y = TOP_Y + ENTRY_ROW_HEIGHT * i;
            leaderboardContainer.addChild(entryText);

            entryPicBackingGfx.drawRect(entrySprite.x - 0.5 * entrySprite.width,
                entrySprite.y - 0.5 * entrySprite.height,
                PROFILE_PIC_DIM, PROFILE_PIC_DIM);

            const isPlayer = entry.getPlayer().getID() === MSGlobal.PlatformInterface.getPlayerID();
            const outlineObject = isPlayer ? playerEntryOutline : entryOutline;
            const BACKING_LEFT_X = entryText.x - main.SMALL_GUMPH;
            const W = BACKING_WIDTH - (BACKING_LEFT_X - LEFT) - main.SMALL_GUMPH;
            outlineObject.drawRoundedRect(BACKING_LEFT_X,
                    TOP_Y + (ENTRY_ROW_HEIGHT * i),
                                        W, PROFILE_PIC_DIM,
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
        if ((Date.now() - gameOverShowStartMS) / 1000 >= TIME_FOR_GAME_OVER_SECS) {
            gameOverT *= 0.9;
            if (gameOverT <= 0.01) {
                gameOverT = 0;
                main.g_PixiApp.stage.removeChild(gameOverPopUpContainer);
                gameOverPopUpContainer = null;
                showEverything();
            } else {
                gameOverButton.setCenterPos(vec2.fromValues(
                    main.g_HalfScaledRendererWidth,
                    gameOverT * main.g_HalfScaledRendererHeight +
                    (1.0 - gameOverT) * (main.g_ScaledRendererHeight + 1.1 * gameOverButton.getHalfHeight()),
                ));
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
            if (leaderboardContainer) { leaderboardContainer.visible = true; }
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
                if (leaderboardContainer) { leaderboardContainer.visible = false; }
                CoinsButton.hide();
                CoinShop.show();
            } else if (restartButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("restart", null, null);
                MSGlobal.PlatformInterface.chooseAsync()
                .then(function() {
                    resetGame();
                }).catch((error: any) => {
                    resetGame();
                    MSGlobal.error(error);
                });
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
