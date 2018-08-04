import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as MSGlobal from "./global";
import * as main from "./main";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// Play button and thats it!

// *********************************************************
let titleContainer: Container = null;
let buttonGraphics: Graphics = null;
let playButton: Button = null;

// *********************************************************
export function show() {
    titleContainer = new Container();
    main.g_PixiApp.stage.addChild(titleContainer);

    buttonGraphics = new Graphics();
    titleContainer.addChild(buttonGraphics);

    playButton = new Button("Play Bubble Pop! ", null);
    playButton.setSizeToText(main.GUMPH);
    playButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    playButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    titleContainer.addChild(playButton.m_Text);
}

export function hide() {
    main.g_PixiApp.stage.removeChild(titleContainer);
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
        main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
