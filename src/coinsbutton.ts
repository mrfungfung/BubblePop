import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as Game from "./game";
import * as MSGlobal from "./global";
import * as main from "./main";

// *********************************************************
let container: Container = null;
let buttonGraphics: Graphics = null;
let coinsButton: Button = null;

// *********************************************************
export function isOnShow() {
    return container !== null;
}
export function show() {
    if (!container) {
        container = new Container();
        main.g_PixiApp.stage.addChild(container);

        buttonGraphics = new Graphics();
        container.addChild(buttonGraphics);

        coinsButton = new Button("Coins: " + Game.coins, {
            default: {
                fill: "0xFFFFFF",
                fontSize: "12px",
                lineJoin: "round",
                stroke: "0x0",
                strokeThickness: "4",
            },
        });
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
        container.addChild(coinsButton.m_Text);
    }
}

export function hide() {
    main.g_PixiApp.stage.removeChild(container);
    container = null;
}

export function updateCoinsButton() {
    if (coinsButton) {
        const timeElapsedSinceLastCoinSecs = (Date.now() - Game.lastCoinAppearTimeSecs) / 1000;
        const timeToCoinLeftSecs = Math.max(0, Game.TIME_TO_COIN_SECS - timeElapsedSinceLastCoinSecs);
        let timeToCoinLeftSecsString = "";
        if (timeToCoinLeftSecs === 0) {
            timeToCoinLeftSecsString = "Coin will come";
        } else {
            timeToCoinLeftSecsString = MSGlobal.secondsToString(timeToCoinLeftSecs, true, 2);
        }

        coinsButton.m_Text.text = "Coins: " + Game.coins + "\n" + timeToCoinLeftSecsString;
    }
}

// *******************************************************************************************************
export function process() {
    // do something
}

// *******************************************************************************************************
export function processInput(clicked: boolean,
                             mouseDown: boolean,
                             lastFrameMouseDown: boolean,
                             screenX: number,
                             screenY: number): boolean {
    return false;
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
