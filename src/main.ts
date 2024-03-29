// bottage: cron job - check all dates in context
// bottage: (10 mins coins lol ready bonus) (after 3 days no play - FREE coin) (5 days no play? - FREE COIN reminder)
// sound

// monetization
// - offer time extend on dead
// - check number of plays before ads
// - limit ads to then coins
// - coins can be bought
// - watch rewarded for items

// refactor
// - er make a player profile sigh what an idiot (level + coins, shop items)

// ideas: plane challenger, amiga zombie clicker, fomo3d

import { shim } from "promise.prototype.finally";
shim();

import {Application, Container, interaction, loaders, Rectangle, Sprite, Text, Texture} from "pixi.js";

import * as pixiSound from "pixi-sound"; // comes after pixi for dependence
import * as AdsManager from "./adsmanager";
import * as CoinShop from "./coinshop";
import * as Game from "./game";
import * as GameOver from "./gameover";
import * as MSGlobal from "./global";
import * as Options from "./options";
import {EAdType} from "./platform";
import * as Title from "./title";

declare var process: any;
declare var window: any;

// *********************************************************
// Canvas and screen dimensions info
// *********************************************************
const g_DevicePixelRatio = window.devicePixelRatio || 1;
MSGlobal.log("devicePixelRatio = " + g_DevicePixelRatio);
const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 500;
let g_CanvasWidth: number = DEFAULT_CANVAS_WIDTH;
let g_CanvasHeight: number = DEFAULT_CANVAS_HEIGHT;
export const g_CanvasDiv = window.document.createElement("div");
g_CanvasDiv.id = "canvas_div";
const g_TheCanvas = window.document.createElement("canvas");
g_TheCanvas.id = "canvas";
export let g_PixiApp: Application = null;
export let g_ScaledRendererWidth: number = 0;
export let g_ScaledRendererHeight: number = 0;
export let g_HalfScaledRendererWidth: number = 0;
export let g_HalfScaledRendererHeight: number = 0;
export let g_CurrentScaleW: number = 0;
export let g_CurrentScaleH: number = 0;

export let g_IsMobile = MSGlobal.G.mobilecheck();
const g_FullScreen = true;
let g_Initialised = false;

// *********************************************************
// interaction vars
// *********************************************************
const CLICKED_TIME_MILLISECS = 500;
let g_MouseDownTimeMilliSecs = new Date().getTime();
let g_MouseDown: boolean = false;
let g_Clicked: boolean = false;
let g_LastTouchLocalPos: any = null;
let g_PixiInteractionManager: interaction.InteractionManager = null;

// *********************************************************
// key functions
// *********************************************************
const g_CurrentlyPressedKeys: { [keycode: number]: boolean; } = {};
window.addEventListener("keyup", function(event: any) {
    g_CurrentlyPressedKeys[event.keyCode] = false;
});
window.addEventListener("keydown", function(event: any) {
    g_CurrentlyPressedKeys[event.keyCode] = true;
});

// *********************************************************
// debug
export let g_DebugText: Text = null;
export let g_DebugContainer: Container = null;

// *********************************************************
export enum EGameState {
    EGAMESTATE_TITLE = 0,
    EGAMESTATE_IN_GAME,
    EGAMESTATE_GAME_OVER,
    EGAMESTATE_COIN_SHOP,
    EGAMESTATE_COUNT,
}
let gameState = EGameState.EGAMESTATE_TITLE;
export function setGameState(g: EGameState) {
    switch (gameState) {
        case EGameState.EGAMESTATE_TITLE:
        {
            Title.hide();
        }
        break;
        case EGameState.EGAMESTATE_IN_GAME:
        {
            Game.hide();
        }
        break;
        case EGameState.EGAMESTATE_GAME_OVER:
        {
            GameOver.hide();
        }
        break;
        case EGameState.EGAMESTATE_COIN_SHOP:
        {
            CoinShop.hide();
        }
        break;
        default:
        break;
    }

    // switch over
    gameState = g;
    switch (gameState) {
        case EGameState.EGAMESTATE_TITLE:
        {
            Title.show();
        }
        break;
        case EGameState.EGAMESTATE_IN_GAME:
        {
            Game.show();
        }
        break;
        case EGameState.EGAMESTATE_GAME_OVER:
        {
            GameOver.show();
        }
        break;
        case EGameState.EGAMESTATE_COIN_SHOP:
        {
            CoinShop.show();
        }
        break;
        default:
        break;
    }
}

export const GUMPH = 30;
export const SMALL_GUMPH = 5;
export const FONT_STYLES = {
    bigger: {
        align: "center",
        fill: "0x634130",
        fontFamily: "Arial",
        fontSize: "40px",
        fontWeight: "bold",
    },
    default: {
        align: "center",
        fill: "0x634130",
        fontFamily: "Arial",
        fontSize: "34px",
        fontWeight: "bold",
    },
    medium: {
        align: "center",
        fill: "0x634130",
        fontFamily: "Arial",
        fontSize: "28px",
        fontWeight: "bold",
    },
    small: {
        align: "center",
        fill: "0x634130",
        fontFamily: "Arial",
        fontSize: "20px",
        fontWeight: "bold",
    },
    smaller: {
        align: "center",
        fill: "0x634130",
        fontFamily: "Arial",
        fontSize: "16px",
        fontWeight: "bold",
    },
};

// *********************************************************

// *********************************************************
function onDeviceReady() {
    MSGlobal.log("onDeviceReady()");

    // if (window.isAndroid) {
    //     document.addEventListener("backbutton", (e) => {
    //         system.keyInput.eventDown(8); // this is the back button
    //         system.keyInput.eventUp(8); // we need to fake this event
    //         e.preventDefault();
    //     }, false);
    // }

    init();
    MSGlobal.log("calling startGame");
    startGame();
}

// *********************************************************
// top level window events to bootstap everything
// *********************************************************
export let absolute = 0;
export let alpha = 0;
export let beta = 0;
export let gamma = 0;

window.addEventListener("deviceorientation", handleOrientation, true);
function handleOrientation(event: any) {
    absolute = event.absolute;
    alpha    = event.alpha;
    beta     = event.beta;
    gamma    = event.gamma;

    MSGlobal.log(absolute + " " + alpha + " " + beta + " " + gamma);
  }

window.addEventListener("resize", onResize);
function onResize() {
    MSGlobal.log("onResize()");
    MSGlobal.log(window.innerWidth);
    MSGlobal.log(window.innerHeight);
    MSGlobal.log(window.devicePixelRatio);
}

window.onload = function() {
    MSGlobal.PlatformInterface.getAnalyticsManager().init();

    if (window.cordova) {
        MSGlobal.log(window.cordova);
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        MSGlobal.log("calling initializeAsync");
        MSGlobal.PlatformInterface.initializeAsync()
        .then(function() {
            init();

            // preload some resources
            const initial_resource_paths: any = {};
            initial_resource_paths.BG = (MSGlobal.ASSET_DIR["./background@2x.png"]);
            initial_resource_paths.cup = (MSGlobal.ASSET_DIR["./cup_full@2x.png"]);
            initial_resource_paths.straw = (MSGlobal.ASSET_DIR["./straw@2x.png"]);
            initial_resource_paths.tea_surface = (MSGlobal.ASSET_DIR["./tea_surface@2x.png"]);
            initial_resource_paths.settings = (MSGlobal.ASSET_DIR["./btn_settings@2x.png"]);
            initial_resource_paths.shop = (MSGlobal.ASSET_DIR["./btn_shop@2x.png"]);
            initial_resource_paths.coin = (MSGlobal.ASSET_DIR["./ico_coin@2x.png"]);
            initial_resource_paths.board_round = (MSGlobal.ASSET_DIR["./board_round-score@2x.png"]);

            initial_resource_paths.bubble4 = (MSGlobal.ASSET_DIR["./smallbubble.png"]);
            initial_resource_paths.bubble_active = (MSGlobal.ASSET_DIR["./bubble_active@2x.png"]);
            initial_resource_paths.bubble_coin = (MSGlobal.ASSET_DIR["./bubble_coin@2x.png"]);
            initial_resource_paths.bubble_inactive = (MSGlobal.ASSET_DIR["./bubble_inactive@2x.png"]);
            initial_resource_paths.bubble_normal = (MSGlobal.ASSET_DIR["./bubble_normal@2x.png"]);

            initial_resource_paths.shop_bg = (MSGlobal.ASSET_DIR["./board_shop@2x.png"]);
            initial_resource_paths.close = (MSGlobal.ASSET_DIR["./btn_close@2x.png"]);
            initial_resource_paths.time_extend = (MSGlobal.ASSET_DIR["./item_timer@2x.png"]);
            initial_resource_paths.buybutton = (MSGlobal.ASSET_DIR["./btn_buy@2x.png"]);
            initial_resource_paths.leftbutton = (MSGlobal.ASSET_DIR["./btn_left@2x.png"]);
            initial_resource_paths.rightbutton = (MSGlobal.ASSET_DIR["./btn_right@2x.png"]);

            initial_resource_paths.settingsbg = (MSGlobal.ASSET_DIR["./settingsbgbutton.png"]);
            initial_resource_paths.invitebutton = (MSGlobal.ASSET_DIR["./inviteButton.png"]);
            initial_resource_paths.offbutton = (MSGlobal.ASSET_DIR["./offbutton.png"]);
            initial_resource_paths.onbutton = (MSGlobal.ASSET_DIR["./onbutton.png"]);
            initial_resource_paths.continue = (MSGlobal.ASSET_DIR["./btn_continue@2x.png"]);
            initial_resource_paths.restart = (MSGlobal.ASSET_DIR["./btn_restart@2x.png"]);

            const loader = new loaders.Loader();
            for (const key in initial_resource_paths) {
                if (initial_resource_paths.hasOwnProperty(key)) {
                    const resource_path = initial_resource_paths[key];
                    loader.add(key, resource_path); // key is path
                }
            }
            loader.onProgress.add((l: any) => {
                // g_LoadingText.text = "Loading ... " + Math.floor(l.progress) + "%";
                MSGlobal.PlatformInterface.setLoadingProgress(l.progress);
            }); // called once per loaded/errored file

            loader.load((ldr: any, resources: any) => {
                g_CurrentScaleW = g_ScaledRendererWidth / resources.BG.texture.width;
                g_CurrentScaleH = g_ScaledRendererHeight / resources.BG.texture.height;
                MSGlobal.log("g_CurrentScaleW:" + g_CurrentScaleW);

                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("AssetsLoaded", null, null);

                MSGlobal.log("calling startGameAsync");
                MSGlobal.PlatformInterface.startGameAsync()
                .then(function() {

                    // load ads
                    if (MSGlobal.PlatformInterface.canShowAds(EAdType.EADTYPE_INTERSTITIAL)) {
                        AdsManager.preloadAds(EAdType.EADTYPE_INTERSTITIAL);
                    }

                    // set my info for backend to be picked up
                    MSGlobal.PlatformInterface.setSessionData(
                        {facebookname: MSGlobal.PlatformInterface.getPlayerName()});

                    // grab save data
                    // CoinShop.resetsaveload();
                    Options.load();
                    Game.load();
                    CoinShop.load();

                    // set up the stupid on pause
                    MSGlobal.PlatformInterface.setOnPauseCallback(function() {
                        if (gameState === EGameState.EGAMESTATE_IN_GAME) {
                            Game.pauseInOptions();
                        }
                    });

                    // been removed and the user can see the game viewport
                    MSGlobal.log("calling startGame");
                    startGame();
                });
            });
        });
    }
};

function init() {
    MSGlobal.log(MSGlobal.PlatformInterface.getContextType());
    MSGlobal.log(process.env.NODE_ENV);
    MSGlobal.log(window);
    MSGlobal.log(window.innerWidth);
    MSGlobal.log(window.innerHeight);
    MSGlobal.log(window.devicePixelRatio);

    // fullscreen
    if (g_IsMobile || g_FullScreen) {
        g_CanvasWidth = window.innerWidth;
        g_CanvasHeight = window.innerHeight;
    }

    g_TheCanvas.style.width = g_CanvasWidth.toString() + "px";
    g_TheCanvas.style.height = g_CanvasHeight.toString() + "px";
    g_TheCanvas.style.margin = "0";
    g_TheCanvas.style.padding = "0";
    g_TheCanvas.style.display = "block";
    g_PixiApp = new Application(g_CanvasWidth, g_CanvasHeight,
                { backgroundColor: 0x000000, view: g_TheCanvas, resolution: g_DevicePixelRatio }, true);

    // really fucked up scaling to make sure that the play area fits the CANVAS area.
    const ratio = 1.0;
    g_PixiApp.stage.pivot.set(0.5);
    g_PixiApp.stage.scale.x = ratio;
    g_PixiApp.stage.scale.y = ratio;

    const canvas_scale = Math.max(ratio, 1.0);
    g_ScaledRendererWidth = ((g_PixiApp.renderer.width / g_DevicePixelRatio) / canvas_scale) + 1;
    g_ScaledRendererHeight = ((g_PixiApp.renderer.height / g_DevicePixelRatio) / canvas_scale) + 1;
    g_HalfScaledRendererWidth = 0.5 * g_ScaledRendererWidth;
    g_HalfScaledRendererHeight = 0.5 * g_ScaledRendererHeight;

    // set FPS
    MSGlobal.G.setFPS(g_PixiApp.ticker.FPS);

    // make interaction managers
    g_PixiInteractionManager = new interaction.InteractionManager(g_PixiApp.renderer);
    g_PixiInteractionManager.on("mousedown", function(mouseData: any) {
        g_MouseDown = true;
        g_Clicked = false;
        g_MouseDownTimeMilliSecs = new Date().getTime(); });
    g_PixiInteractionManager.on("mouseup", function(mouseData: any) {
        g_MouseDown = false;
        const cur_time = new Date().getTime();
        g_Clicked = (cur_time - g_MouseDownTimeMilliSecs) < CLICKED_TIME_MILLISECS; });
    g_PixiInteractionManager.on("touchstart", function(touchEvent: any) {
        g_MouseDown = true;
        g_Clicked = false;
        g_MouseDownTimeMilliSecs = new Date().getTime();
        g_LastTouchLocalPos = touchEvent.data.getLocalPosition(g_PixiApp.stage); });
    g_PixiInteractionManager.on("touchmove", function(touchEvent: any) {
        g_MouseDown = true;
        g_LastTouchLocalPos = touchEvent.data.getLocalPosition(g_PixiApp.stage); });
    g_PixiInteractionManager.on("touchend", function(touchEvent: any) {
        g_MouseDown = false;
        const cur_time = new Date().getTime();
        g_Clicked = (cur_time - g_MouseDownTimeMilliSecs) < CLICKED_TIME_MILLISECS;
        g_LastTouchLocalPos = touchEvent.data.getLocalPosition(g_PixiApp.stage); });

    // debug
    g_DebugContainer = new Container();
    g_PixiApp.stage.addChild(g_DebugContainer);
    g_DebugContainer.visible = false;
    g_DebugText = new Text("debug out");
    MSGlobal.setFontStyle(g_DebugText);
    g_DebugText.style.fontSize = 14;
    g_DebugText.y = 30;
    g_DebugText.visible = true;
    g_DebugContainer.addChild(g_DebugText);
    // MSGlobal.setDebugOutEnabled(process.env.NODE_ENV === MSGlobal.G.DEV_ENV);

    document.body.insertBefore(g_CanvasDiv, document.body.firstChild);
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    g_CanvasDiv.appendChild(g_TheCanvas);
    g_PixiApp.renderer.preserveDrawingBuffer = true;
    MSGlobal.log("g_PixiApp.renderer.w x h = " + g_PixiApp.renderer.width + " " + g_PixiApp.renderer.height);
}

// *********************************************************
function startGame() {
    g_Initialised = true;

    MSGlobal.log("context = " + MSGlobal.PlatformInterface.getContextType());

    if (MSGlobal.PlatformInterface.getContextType() !== "SOLO") {
    // if (1 === 1) {
        const entryPointData = MSGlobal.PlatformInterface.getEntryPointData();
        setGameState(EGameState.EGAMESTATE_IN_GAME);
    } else {
        Title.show();
    }

    g_PixiApp.ticker.add((delta: number) => {
        mainProcess(delta);
    });
}

// *********************************************************
function mainProcess(delta: number) {
    if (g_Initialised) {
        processinput();

        // this is postProcessInput() - clear the click
        g_Clicked = false;

        processGame();
        render(delta);
    }
}

// *********************************************************
// Process inputs
// *********************************************************
let lastFrameMouseDown = g_MouseDown;
function processinput() {
    const screenpos = (g_LastTouchLocalPos == null ?
        g_PixiInteractionManager.mouse.getLocalPosition(g_PixiApp.stage) :
        g_LastTouchLocalPos);

    switch (gameState) {
        case EGameState.EGAMESTATE_TITLE:
        {
            Title.processInput(g_Clicked, g_MouseDown, lastFrameMouseDown, screenpos.x, screenpos.y);
        }
        break;
        case EGameState.EGAMESTATE_IN_GAME:
        {
            Game.processInput(g_Clicked, g_MouseDown, lastFrameMouseDown, screenpos.x, screenpos.y);
        }
        break;
        case EGameState.EGAMESTATE_GAME_OVER:
        {
            GameOver.processInput(g_Clicked, g_MouseDown, lastFrameMouseDown, screenpos.x, screenpos.y);
        }
        break;
        case EGameState.EGAMESTATE_COIN_SHOP:
        {
            CoinShop.processInput(g_Clicked, g_MouseDown, lastFrameMouseDown, screenpos.x, screenpos.y);
        }
        break;
        default:
        break;
    }

    lastFrameMouseDown = g_MouseDown;
}

// *******************************************************************************************************
// Process function
function processGame() {
    switch (gameState) {
        case EGameState.EGAMESTATE_TITLE:
        {
            Title.process();
        }
        break;
        case EGameState.EGAMESTATE_IN_GAME:
        {
            Game.process();
        }
        break;
        case EGameState.EGAMESTATE_GAME_OVER:
        {
            GameOver.doProcess();
        }
        break;
        case EGameState.EGAMESTATE_COIN_SHOP:
        {
            CoinShop.process();
        }
        break;
        default:
        break;
    }
}

// *******************************************************************************************************
// Render function
function render(delta: number) {
    switch (gameState) {
        case EGameState.EGAMESTATE_TITLE:
        {
            Title.render(delta);
        }
        break;
        case EGameState.EGAMESTATE_IN_GAME:
        {
            Game.render(delta);
        }
        break;
        case EGameState.EGAMESTATE_GAME_OVER:
        {
            GameOver.render(delta);
        }
        break;
        case EGameState.EGAMESTATE_COIN_SHOP:
        {
            CoinShop.render(delta);
        }
        break;
        default:
        break;
    }
}
