import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as MSGlobal from "./global";
import * as main from "./main";

// *********************************************************
let container: Container = null;
let buttonGraphics: Graphics = null;
let sfxButton: Button = null;
let bgmButton: Button = null;
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

    buttonGraphics = new Graphics();
    container.addChild(buttonGraphics);

    buttonGraphics.beginFill(0xFFD700);
    buttonGraphics.drawRoundedRect(
        main.GUMPH,
        main.GUMPH,
        main.g_ScaledRendererWidth - 2 * main.GUMPH,
        main.g_ScaledRendererHeight - 2 * main.GUMPH,
        8);
    buttonGraphics.endFill();

    sfxButton = new Button("SFX: " + sfx, null);
    sfxButton.setSizeToText(main.GUMPH);
    sfxButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    sfxButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(sfxButton.m_Text);

    bgmButton = new Button("BGM: " + bgm, null);
    bgmButton.setSizeToText(main.GUMPH);
    bgmButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        sfxButton.getBottomY() + main.GUMPH + bgmButton.getHalfHeight(),
    ));
    bgmButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(bgmButton.m_Text);

    inviteButton = new Button("Invite", null);
    inviteButton.setSizeToText(main.GUMPH);
    inviteButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        bgmButton.getBottomY() + main.GUMPH + inviteButton.getHalfHeight(),
    ));
    inviteButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(inviteButton.m_Text);

    backButton = new Button("Back", null);
    backButton.setSizeToText(main.GUMPH);
    backButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_ScaledRendererHeight - main.GUMPH - 0.5 * backButton.m_Size[1],
    ));
    backButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x007acf, 0.95, buttonGraphics);
    container.addChild(backButton.m_Text);
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
            sfxButton.m_Text.text = "SFX: " + sfx;
            save();
        } else if (bgmButton.contains(vec2.fromValues(screenX, screenY))) {
            bgm = !bgm;
            bgmButton.m_Text.text = "BGM: " + bgm;
            save();
        } else if (inviteButton.contains(vec2.fromValues(screenX, screenY))) {
            MSGlobal.PlatformInterface.chooseAsync()
            .then(function() {
                // do nothing when in new context
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
