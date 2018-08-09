import {vec2} from "gl-matrix";
import {Container, Graphics, Sprite} from "pixi.js";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as CoinShop from "./coinshop";
import * as Game from "./game";
import * as MSGlobal from "./global";
import * as main from "./main";
import * as Options from "./options";

// *********************************************************
let titleContainer: Container = null;
let buttonGraphics: Graphics = null;
let playButton: Button = null;
let shopButton: Button = null;
let optionsButton: Button = null;

// spritesss
let bgSprite: Sprite = null;
let mgSprite: Sprite = null;
let fgSprite: Sprite = null;

// *********************************************************
export function show() {
    titleContainer = new Container();
    main.g_PixiApp.stage.addChild(titleContainer);

    bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./bg.png"]);
    mgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./mg.png"]);
    fgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./fg.png"]);

    titleContainer.addChild(bgSprite);
    titleContainer.addChild(mgSprite);
    titleContainer.addChild(fgSprite);

    buttonGraphics = new Graphics();
    titleContainer.addChild(buttonGraphics);

    playButton = new Button("Play Bubble Frenzy! ", null);
    playButton.setSizeToText(main.GUMPH);
    playButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    playButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    titleContainer.addChild(playButton.m_Text);

    shopButton = new Button("Shop", null);
    shopButton.setSizeToText(main.GUMPH);
    shopButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        shopButton.getYBelowOtherButtonWithGap(playButton, main.GUMPH),
    ));
    shopButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFFD700, 0.95, buttonGraphics);
    titleContainer.addChild(shopButton.m_Text);

    optionsButton = new Button("Options", null);
    optionsButton.setSizeToText(main.GUMPH);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_ScaledRendererHeight - main.GUMPH - 0.5 * optionsButton.m_Size[1],
    ));
    optionsButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    titleContainer.addChild(optionsButton.m_Text);

    CoinsButton.show();
}

export function hide() {
    main.g_PixiApp.stage.removeChild(titleContainer);
    titleContainer = null;

    CoinsButton.hide();
}

// *******************************************************************************************************
export function process() {
    const MAX_DX = 200;
    const dx = main.gamma / 90.0 * MAX_DX;
    bgSprite.x = dx / 5;
    mgSprite.x = dx / 2;
    fgSprite.x = dx;

    const MAX_DY = 200;
    const dy = main.beta / 180.0 * MAX_DY;
    bgSprite.y = dy / 5;
    mgSprite.y = dy / 2;
    fgSprite.y = dy;
}

// *******************************************************************************************************
export function processInput(clicked: boolean,
                             mouseDown: boolean,
                             lastFrameMouseDown: boolean,
                             screenX: number,
                             screenY: number) {
    if (Options.isOnShow()) {
        const finished = Options.processInput(clicked, mouseDown, lastFrameMouseDown, screenX, screenY);
        if (finished) {
            CoinsButton.show();
        }
    } else if (CoinShop.isOnShow()) {
        const finished = CoinShop.processInput(clicked, mouseDown, lastFrameMouseDown, screenX, screenY);
        if (finished) {
            titleContainer.visible = true;
            CoinsButton.show();
        }
    } else {
        if (clicked) {
            if (playButton.contains(vec2.fromValues(screenX, screenY))) {
                Game.resetGame();
                main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
            } else if (optionsButton.contains(vec2.fromValues(screenX, screenY))) {
                CoinsButton.hide();
                Options.show();
            } else if (shopButton.contains(vec2.fromValues(screenX, screenY))) {
                titleContainer.visible = false;
                CoinsButton.hide();
                CoinShop.show();
            }
        }
    }
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
