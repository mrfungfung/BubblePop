import {vec2} from "gl-matrix";
import {Container, Graphics, Texture} from "pixi.js";
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

        const coinsTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./ico_coin@2x.png"]);
        coinsButton = new Button("" + Game.coins, main.FONT_STYLES);
        coinsButton.setSprite(coinsTexture.baseTexture);
        coinsButton.setSizeToSprite(0);
        coinsButton.m_Size = vec2.fromValues(
            coinsButton.m_Sprite.width + main.GUMPH + coinsButton.m_Text.width,
            coinsButton.m_Sprite.height,
        );
        coinsButton.setCenterPos(vec2.fromValues(
            main.SMALL_GUMPH + 0.5 * coinsButton.m_Sprite.width,
            main.g_ScaledRendererHeight - main.SMALL_GUMPH - coinsButton.getHalfHeight(),
        ));
        coinsButton.m_Text.x +=
            0.5 * coinsButton.m_Sprite.width + main.SMALL_GUMPH +
            0.5 * coinsButton.m_Text.width;

        container.addChild(coinsButton.m_Sprite);
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
        let timeToCoinLeftSecsString = "" ;
        if (timeToCoinLeftSecs === 0) {
            timeToCoinLeftSecsString = " Coin ready!";
        } else {
            timeToCoinLeftSecsString = " ⏱" + MSGlobal.secondsToString(timeToCoinLeftSecs, true, 2);
        }

        coinsButton.m_Text.text = "" + Game.coins + "<smaller>" + timeToCoinLeftSecsString + "</smaller>";
        coinsButton.m_Text.x = main.SMALL_GUMPH + 0.5 * coinsButton.m_Sprite.width +
            0.5 * coinsButton.m_Sprite.width + main.SMALL_GUMPH +
            0.5 * coinsButton.m_Text.width;
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
