import {vec2} from "gl-matrix";
import {Container, Graphics, Texture} from "pixi.js";
import { Button } from "./button";
import * as MSGlobal from "./global";
import * as main from "./main";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// *********************************************************
let container: Container = null;
let sfxButton: Button = null;
let sfxOnOffButton: Button = null;
let bgmButton: Button = null;
let bgmOnOffButton: Button = null;
let inviteButton: Button = null;
let backButton: Button = null;

let sfx = true;
let bgm = true;

// *********************************************************
export function resetsaveload() {
    MSGlobal.PlatformInterface.setStatsAsync({
        bgm: true,
        sfx: true,
    })
    .then(function() {
        // do something
    });
}

// *********************************************************
export function load() {
    MSGlobal.PlatformInterface.getStatsAsync([
        "sfx",
        "bgm",
    ])
    .then(function(data: any) {
        // set the level data in mapselect thingy
        MSGlobal.log(data);
        if (data.sfx) { sfx = data.sfx; }
        if (data.bgm) { bgm = data.bgm; }
    });
}

// *********************************************************
export function save() {
    MSGlobal.PlatformInterface.setStatsAsync({
        bgm,
        sfx,
    })
    .then(function() {
        // do something
    });
}

// *********************************************************
export function isOnShow() {
    return container !== null;
}
export function show() {
    container = new Container();
    main.g_PixiApp.stage.addChild(container);

    const bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./background@2x.png"]);
    bgSprite.width *= main.g_CurrentScaleW;
    bgSprite.height *= main.g_CurrentScaleH;
    container.addChild(bgSprite);

    // backing
    const optionsGFX = new Graphics();
    container.addChild(optionsGFX);

    const BACKING_WIDTH = main.g_ScaledRendererWidth - 2 * main.GUMPH;
    const BACKING_HEIGHT = main.g_ScaledRendererHeight - 4 * main.GUMPH;
    const BACKING_X = main.g_HalfScaledRendererWidth;
    const BACKING_Y = main.g_HalfScaledRendererHeight;
    optionsGFX.beginFill(0xe3f9ff);
    optionsGFX.lineStyle(5.0, 0x634130);
    optionsGFX.drawRoundedRect(
        BACKING_X - 0.5 * BACKING_WIDTH,
        BACKING_Y - 0.5 * BACKING_HEIGHT,
        BACKING_WIDTH, BACKING_HEIGHT,
        8);
    optionsGFX.endFill();

    // sfx
    const sfxText = new MultiStyleText("Sound Effects", main.FONT_STYLES);
    sfxText.anchor.set(0.5);
    sfxText.x = main.g_HalfScaledRendererWidth;
    sfxText.y = BACKING_Y - 0.5 * BACKING_HEIGHT + 2 * main.GUMPH + 0.5 * sfxText.height;
    container.addChild(sfxText);

    sfxButton = new Button("", null);
    const buttonbgTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./settingsbgbutton.png"]);
    sfxButton.setSprite(buttonbgTexture.baseTexture);
    sfxButton.setSizeToSprite(0);
    sfxButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        sfxText.y + 0.5 * sfxText.height + main.GUMPH + 0.5 * sfxButton.getHalfHeight(),
    ));
    container.addChild(sfxButton.m_Sprite);

    sfxOnOffButton = new Button(sfx ? "ON" : "OFF", main.FONT_STYLES);
    const onbuttonbgTexture = Texture.fromImage(
        MSGlobal.ASSET_DIR[sfx ? "./onbutton.png" : "./offbutton.png"]);
    sfxOnOffButton.setSprite(onbuttonbgTexture.baseTexture);
    sfxOnOffButton.setSizeToSprite(0);
    sfxOnOffButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth +
            (sfx ? -sfxOnOffButton.getHalfWidth() : sfxOnOffButton.getHalfWidth()),
        sfxButton.m_CenterPos[1],
    ));
    container.addChild(sfxOnOffButton.m_Sprite);
    container.addChild(sfxOnOffButton.m_Text);

    // bgm
    const bgmText = new MultiStyleText("Music", main.FONT_STYLES);
    bgmText.anchor.set(0.5);
    bgmText.x = main.g_HalfScaledRendererWidth;
    bgmText.y = sfxButton.getBottomY() + main.GUMPH + 0.5 * bgmText.height;
    container.addChild(bgmText);

    bgmButton = new Button("", null);
    bgmButton.setSprite(buttonbgTexture.baseTexture);
    bgmButton.setSizeToSprite(0);
    bgmButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        bgmText.y + 0.5 * bgmText.height + main.GUMPH + 0.5 * bgmButton.getHalfHeight(),
    ));
    container.addChild(bgmButton.m_Sprite);

    bgmOnOffButton = new Button(bgm ? "ON" : "OFF", main.FONT_STYLES);
    const bgmonbuttonbgTexture = Texture.fromImage(
        MSGlobal.ASSET_DIR[bgm ? "./onbutton.png" : "./offbutton.png"]);
    bgmOnOffButton.setSprite(bgmonbuttonbgTexture.baseTexture);
    bgmOnOffButton.setSizeToSprite(0);
    bgmOnOffButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth +
            (bgm ? -bgmOnOffButton.getHalfWidth() : bgmOnOffButton.getHalfWidth()),
        bgmButton.m_CenterPos[1],
    ));
    container.addChild(bgmOnOffButton.m_Sprite);
    container.addChild(bgmOnOffButton.m_Text);

    // invite
    const inviteText = new MultiStyleText("Invite", main.FONT_STYLES);
    inviteText.anchor.set(0.5);
    inviteText.x = main.g_HalfScaledRendererWidth;
    inviteText.y = bgmButton.getBottomY() + main.GUMPH + 0.5 * inviteText.height;
    container.addChild(inviteText);

    inviteButton = new Button("", null);
    const inviteTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./inviteButton.png"]);
    inviteButton.setSprite(inviteTexture.baseTexture);
    inviteButton.setSizeToSprite(0);
    inviteButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        inviteText.y + 0.5 * inviteText.height + main.GUMPH + 0.5 * inviteButton.getHalfHeight(),
    ));
    container.addChild(inviteButton.m_Sprite);

    backButton = new Button("", null);
    const backTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_close@2x.png"]);
    backButton.setSprite(backTexture.baseTexture);
    backButton.setSizeToSprite(0);
    backButton.setCenterPos(vec2.fromValues(
        BACKING_X + 0.5 * BACKING_WIDTH,
        BACKING_Y - 0.5 * BACKING_HEIGHT,
    ));
    container.addChild(backButton.m_Sprite);
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
                             screenY: number): boolean {
    if (clicked) {
        if (backButton.contains(vec2.fromValues(screenX, screenY))) {
            hide();
            return true;
        } else if (sfxButton.contains(vec2.fromValues(screenX, screenY))) {
            sfx = !sfx;
            sfxOnOffButton.m_Text.text = (sfx ? "ON" : "OFF");
            const onbuttonbgTexture = Texture.fromImage(
                MSGlobal.ASSET_DIR[sfx ? "./onbutton.png" : "./offbutton.png"]);
            sfxOnOffButton.m_Sprite.texture = onbuttonbgTexture;
            sfxOnOffButton.setCenterPos(vec2.fromValues(
                main.g_HalfScaledRendererWidth +
                    (sfx ? -sfxOnOffButton.getHalfWidth() : sfxOnOffButton.getHalfWidth()),
                sfxOnOffButton.m_CenterPos[1]));
            save();
        } else if (bgmButton.contains(vec2.fromValues(screenX, screenY))) {
            bgm = !bgm;
            bgmOnOffButton.m_Text.text = (bgm ? "ON" : "OFF");
            const onbuttonbgTexture = Texture.fromImage(
                MSGlobal.ASSET_DIR[bgm ? "./onbutton.png" : "./offbutton.png"]);
            bgmOnOffButton.m_Sprite.texture = onbuttonbgTexture;
            bgmOnOffButton.setCenterPos(vec2.fromValues(
                main.g_HalfScaledRendererWidth +
                    (bgm ? -bgmOnOffButton.getHalfWidth() : bgmOnOffButton.getHalfWidth()),
                bgmOnOffButton.m_CenterPos[1]));
            save();
        } else if (inviteButton.contains(vec2.fromValues(screenX, screenY))) {
            MSGlobal.PlatformInterface.chooseAsync()
            .then(function() {
                hide();
                return true;
            }).catch((error: any) => {
                MSGlobal.error(error);
            });
        }
    }
    return false;
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
