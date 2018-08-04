import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as MSGlobal from "./global";
import * as main from "./main";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// score, hiscore
// leaderboard (friends / global)
// game over (restart / watch ad / play friends () )

// *********************************************************
let container: Container = null;
let buttonGraphics: Graphics = null;
let restartButton: Button = null;

// *********************************************************
export function show() {
    container = new Container();
    main.g_PixiApp.stage.addChild(container);

    buttonGraphics = new Graphics();
    container.addChild(buttonGraphics);

    restartButton = new Button("Restart", null);
    restartButton.setSizeToText(main.GUMPH);
    restartButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    restartButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(restartButton.m_Text);
}

export function hide() {
    main.g_PixiApp.stage.removeChild(container);
    buttonGraphics = null;
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
                             screenY: number) {
    if (clicked) {
        if (restartButton.contains(vec2.fromValues(screenX, screenY))) {
            main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
