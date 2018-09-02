import {vec2} from "gl-matrix";
import {Container, Graphics, Sprite, Texture} from "pixi.js";
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
let startButton: Button = null;
let shopButton: Button = null;
let optionsButton: Button = null;
let inviteButton: Button = null;

// spritesss
const MAX_DX = 200;
let bgSprite: Sprite = null;
let cup: Sprite = null;
let teaSurface: Sprite = null;
let straw: Sprite = null;

export function setupBG(container: Container) {
    const local_bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./background@2x.png"]);
    const local_cup = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./cup_full@2x.png"]);
    const local_teaSurface = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./tea_surface@2x.png"]);
    const local_straw = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./straw@2x.png"]);

    local_bgSprite.width *= main.g_CurrentScaleW;
    local_bgSprite.height *= main.g_CurrentScaleH;

    local_cup.anchor.set(0.5);
    local_cup.width *= main.g_CurrentScaleW;
    local_cup.height *= main.g_CurrentScaleH;
    local_cup.x = main.g_HalfScaledRendererWidth;
    local_cup.y = main.g_HalfScaledRendererHeight;

    local_teaSurface.anchor.set(0.5);
    local_teaSurface.width *= main.g_CurrentScaleW;
    local_teaSurface.height *= main.g_CurrentScaleH;
    local_teaSurface.x = main.g_HalfScaledRendererWidth;
    local_teaSurface.y = getTeaSurfaceY(local_cup);

    local_straw.anchor.set(0.5, 1.0);
    local_straw.width *= main.g_CurrentScaleW;
    local_straw.height *= main.g_CurrentScaleH;
    local_straw.x = main.g_HalfScaledRendererWidth;
    local_straw.y = getStrawY(local_cup);
    local_straw.rotation = -0.05 * Math.PI;

    container.addChild(local_bgSprite);
    container.addChild(local_straw);
    container.addChild(local_cup);
    container.addChild(local_teaSurface);

    return {
        bgSprite: local_bgSprite,
        cup: local_cup,
        straw: local_straw,
        teaSurface: local_teaSurface,
    };
}

// *********************************************************
export function show() {
    titleContainer = new Container();
    main.g_PixiApp.stage.addChild(titleContainer);

    const sprites = setupBG(titleContainer);
    bgSprite = sprites.bgSprite;
    cup = sprites.cup;
    teaSurface = sprites.teaSurface;
    straw = sprites.straw;

    buttonGraphics = new Graphics();
    titleContainer.addChild(buttonGraphics);

    const bgTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./board_round-score@2x.png"]);
    const bgTextureSprite = Sprite.from(bgTexture.baseTexture);
    bgTextureSprite.anchor.set(0.5);
    bgTextureSprite.x = main.g_HalfScaledRendererWidth;
    bgTextureSprite.y = main.g_HalfScaledRendererHeight;
    titleContainer.addChild(bgTextureSprite);

    playButton = new Button("<medium>Bubble Frenzy!</medium>", main.FONT_STYLES);
    playButton.setSizeToText(0);
    playButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        bgTextureSprite.y - 0.5 * bgTextureSprite.height + main.GUMPH
        + playButton.getHalfHeight(),
    ));
    titleContainer.addChild(playButton.m_Text);

    startButton = new Button("<medium>Start</medium>", main.FONT_STYLES);
    const goTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./onbutton.png"]);
    startButton.setSprite(goTexture.baseTexture);
    startButton.setSizeToSprite(0);
    startButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        playButton.getBottomY() + main.SMALL_GUMPH + startButton.getHalfHeight(),
    ));
    titleContainer.addChild(startButton.m_Sprite);
    titleContainer.addChild(startButton.m_Text);

    inviteButton = new Button("", null);
    const inviteTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./inviteButton.png"]);
    inviteButton.setSprite(inviteTexture.baseTexture);
    inviteButton.setSizeToSprite(0);
    inviteButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        startButton.getBottomY() + main.GUMPH + 0.5 * inviteButton.getHalfHeight(),
    ));
    titleContainer.addChild(inviteButton.m_Sprite);

    optionsButton = new Button("", null);
    const settingsTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_settings@2x.png"]);
    optionsButton.setSprite(settingsTexture.baseTexture);
    optionsButton.scaleSprite(vec2.fromValues(main.g_CurrentScaleW, main.g_CurrentScaleH));
    optionsButton.setSizeToSprite(0);
    optionsButton.setCenterPos(vec2.fromValues(
        main.g_ScaledRendererWidth - main.SMALL_GUMPH - optionsButton.getHalfWidth(),
        main.g_ScaledRendererHeight - main.SMALL_GUMPH - optionsButton.getHalfHeight(),
    ));
    titleContainer.addChild(optionsButton.m_Sprite);

    shopButton = new Button("", null);
    const shopTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_shop@2x.png"]);
    shopButton.setSprite(shopTexture.baseTexture);
    shopButton.scaleSprite(vec2.fromValues(main.g_CurrentScaleW, main.g_CurrentScaleH));
    shopButton.setSizeToSprite(0);
    shopButton.setCenterPos(vec2.fromValues(
        optionsButton.getLeftX() - main.SMALL_GUMPH - shopButton.getHalfWidth(),
        main.g_ScaledRendererHeight - main.SMALL_GUMPH - shopButton.getHalfHeight(),
    ));
    titleContainer.addChild(shopButton.m_Sprite);

    CoinsButton.show();
}

export function hide() {
    main.g_PixiApp.stage.removeChild(titleContainer);
    titleContainer = null;

    CoinsButton.hide();
}

function getStrawY(theCup: Sprite) {
    return theCup.y + 0.5 * theCup.height - 10;
}
function getTeaSurfaceY(theCup: Sprite) {
    return main.g_HalfScaledRendererHeight - 0.37 * theCup.height;
}

// *******************************************************************************************************
export function processBG(theStraw: Sprite, theCup: Sprite, theTeaSurface: Sprite) {
    const dx = main.gamma / 90.0 * MAX_DX;
    theStraw.x = main.g_HalfScaledRendererWidth + dx / 2;
    theCup.x = theTeaSurface.x = main.g_HalfScaledRendererWidth + dx;
}
export function process() {
    processBG(straw, cup, teaSurface);
    if (!Options.isOnShow() && !CoinShop.isOnShow() && !CoinsButton.isOnShow()) {
        CoinsButton.show();
    }
    CoinsButton.updateCoinsButton();
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
            if (playButton.contains(vec2.fromValues(screenX, screenY)) ||
                startButton.contains(vec2.fromValues(screenX, screenY))) {
                Game.resetGame();
                main.setGameState(main.EGameState.EGAMESTATE_IN_GAME);
            } else if (optionsButton.contains(vec2.fromValues(screenX, screenY))) {
                CoinsButton.hide();
                Options.show();
            } else if (shopButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("shopButton", null, { from: "Title" });
                titleContainer.visible = false;
                CoinsButton.hide();
                CoinShop.show();
            } else if (inviteButton.contains(vec2.fromValues(screenX, screenY))) {
                MSGlobal.PlatformInterface.chooseAsync()
                .then(function() {
                    // return true;
                }).catch((error: any) => {
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
