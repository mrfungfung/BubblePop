// game
// - points vs sequence vs number of times? (upgrade your finger power!)
// - balance 2
// - make it not look like shit
// - do custommessage with base64 picture...

// sound

// bottage: 1 / 3 / 5 day reminder (+ coins ready bonus)

// ideas: amiga zombie clicker, plane challenger, fomo3d

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

            MSGlobal.log("calling startGameAsync");
            MSGlobal.PlatformInterface.startGameAsync()
            .then(function() {

                // load ads
                if (MSGlobal.PlatformInterface.canShowAds(EAdType.EADTYPE_INTERSTITIAL)) {
                    AdsManager.preloadAds(EAdType.EADTYPE_INTERSTITIAL);
                }

                // grab save data
                // Game.resetsaveload();
                Options.load();
                Game.load();
                CoinShop.load();

                // been removed and the user can see the game viewport
                MSGlobal.log("calling startGame");
                startGame();
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
    g_ScaledRendererWidth = (g_PixiApp.renderer.width / g_DevicePixelRatio) / canvas_scale;
    g_ScaledRendererHeight = (g_PixiApp.renderer.height / g_DevicePixelRatio) / canvas_scale;
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
    Title.show();
    g_Initialised = true;

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
