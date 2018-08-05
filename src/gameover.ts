import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as Game from "./game";
import * as MSGlobal from "./global";
import * as main from "./main";

// only context leaderboards (all time - show eeveryone / scrolly)
// ad network
// game over: not enough goals = no ads just continue
// game over: some goals = restart (watch interstitial / invite friends (chooseAsync to switch into a new group))
// game over: beat your goals = continue (watch rewarded / invite friends (chooseAsync to switch into a new group))

// *********************************************************
let container: Container = null;
let buttonGraphics: Graphics = null;
let restartButton: Button = null;
let continueButton: Button = null;
let lastScoreButton: Button = null;
let hiScoreButton: Button = null;

let lastScore = 0;
let isHiScore = false;

export function setLastScore(s: number, hs: boolean) {
    lastScore = s;
    isHiScore = hs;
}

// *********************************************************
export function show() {
    container = new Container();
    main.g_PixiApp.stage.addChild(container);

    buttonGraphics = new Graphics();
    container.addChild(buttonGraphics);

    lastScoreButton = new Button(
        (isHiScore ? "New Hi Score! " : "Score: " ) + lastScore, null);
    lastScoreButton.setSizeToText(main.GUMPH);
    lastScoreButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    lastScoreButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        (isHiScore ? 0xcd007a : 0x888888), 0.95, buttonGraphics);
    container.addChild(lastScoreButton.m_Text);

    hiScoreButton = new Button("Hi Score: " + Game.hiscore, null);
    hiScoreButton.setSizeToText(main.GUMPH);
    hiScoreButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        lastScoreButton.m_CenterPos[1] - 0.5 * lastScoreButton.m_Size[1]
        - main.GUMPH
        - 0.5 * hiScoreButton.m_Size[1],
    ));
    hiScoreButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xcd007a, 0.95, buttonGraphics);
    container.addChild(hiScoreButton.m_Text);

    restartButton = new Button("Restart", null);
    restartButton.setSizeToText(main.GUMPH);
    restartButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        lastScoreButton.m_CenterPos[1] + 0.5 * lastScoreButton.m_Size[1]
        + main.GUMPH
        + 0.5 * restartButton.m_Size[1],
    ));
    restartButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(restartButton.m_Text);

    continueButton = new Button("Continue", null);
    continueButton.setSizeToText(main.GUMPH);
    continueButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        restartButton.m_CenterPos[1] + 0.5 * restartButton.m_Size[1]
        + main.GUMPH
        + 0.5 * continueButton.m_Size[1],
    ));
    continueButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x00cf7a, 0.95, buttonGraphics);
    container.addChild(continueButton.m_Text);
}

export function hide() {
    main.g_PixiApp.stage.removeChild(container);
    container = null;
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
            Game.resetGame();
            main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
        } else if (continueButton.contains(vec2.fromValues(screenX, screenY))) {
            Game.continueGame();
            main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
