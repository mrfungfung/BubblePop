import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as Game from "./game";
import * as main from "./main";
import * as Options from "./options";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// *********************************************************
let titleContainer: Container = null;
let buttonGraphics: Graphics = null;
let playButton: Button = null;
let optionsButton: Button = null;

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

    optionsButton = new Button("Options", null);
    optionsButton.setSizeToText(main.GUMPH);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_ScaledRendererHeight - main.GUMPH - 0.5 * optionsButton.m_Size[1],
    ));
    optionsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    titleContainer.addChild(optionsButton.m_Text);
}

export function hide() {
    main.g_PixiApp.stage.removeChild(titleContainer);
    titleContainer = null;
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
    if (Options.isOnShow()) {
        Options.processInput(clicked, mouseDown, lastFrameMouseDown, screenX, screenY);
    } else {
        if (clicked) {
            if (playButton.contains(vec2.fromValues(screenX, screenY))) {
                Game.resetGame();
                main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
            } else if (optionsButton.contains(vec2.fromValues(screenX, screenY))) {
                Options.show();
            }
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
