import {vec2} from "gl-matrix";
import {Container, Graphics} from "pixi.js";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as Game from "./game";
import * as MSGlobal from "./global";
import * as main from "./main";

// *********************************************************
let container: Container = null;
let buttonGraphics: Graphics = null;
let leftButton: Button = null;
let rightButton: Button = null;
let thingButton: Button = null;
let buyButton: Button = null;
let buyButtonGfx: Graphics = null;
let backButton: Button = null;
let currentThingIndex = 0;

class ThingToBuy {
    public name: string = "";
    public costInCoins: number = 0;
    public bought: number = 0;
}
export const thingsToBuy: ThingToBuy[] = [];
for (let i = 0; i < 10; ++i) {
    const t = new ThingToBuy();
    if (i === 0) {
        t.name = "Extend Time";
    } else if (i === 1) {
        t.name = "FREEZE";
    } else {
        t.name = "Thing " + (i + 1);
    }

    t.costInCoins = i + 1;
    thingsToBuy.push(t);
}

// *********************************************************
export function resetsaveload() {
    MSGlobal.PlatformInterface.setDataAsync({
        thingsBought: {},
    })
    .then(function() {
        // do something
    });
}

// *********************************************************
export function load() {
    MSGlobal.PlatformInterface.getDataAsync([
        "thingsBought",
    ])
    .then(function(data: any) {
        // set the level data in mapselect thingy
        MSGlobal.log(data);
        if (data.thingsBought) {
            // reset
            for (const t of thingsToBuy) {
                t.bought = 0;
            }

            // load
            for (const key in data.thingsBought) {
                if (data.thingsBought[key]) {
                    for (const t of thingsToBuy) {
                        if (t.name === key) {
                            t.bought = data.thingsBought[key];
                            break;
                        }
                    }
                }
            }
        }
    });
}

// *********************************************************
export function save() {
    const thingsBought: any = {};
    for (const t of thingsToBuy) {
        if (t.bought > 0) {
            thingsBought[t.name] = t.bought;
        }
    }
    MSGlobal.PlatformInterface.setDataAsync({
        thingsBought,
    })
    .then(function() {
        // do something
    });
}

// *********************************************************
export function isOnShow() {
    return (container !== null);
}
export function show() {
    currentThingIndex = 0;

    container = new Container();
    main.g_PixiApp.stage.addChild(container);

    buttonGraphics = new Graphics();
    container.addChild(buttonGraphics);

    // the thing
    thingButton = new Button("", null);
    thingButton.setSize(vec2.fromValues(
        0.5 * main.g_ScaledRendererWidth,
        0.5 * main.g_ScaledRendererWidth,
    ));
    thingButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_HalfScaledRendererHeight,
    ));
    thingButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x888888, 0.95, buttonGraphics);
    container.addChild(thingButton.m_Text);

    // left/right arrow
    leftButton = new Button("<", null);
    leftButton.setSizeToText(main.GUMPH);
    leftButton.setSize(vec2.fromValues(
        leftButton.m_Size[0],
        thingButton.m_Size[1],
    ));
    leftButton.setCenterPos(vec2.fromValues(
        thingButton.getLeftX() - main.SMALL_GUMPH - leftButton.getHalfWidth(),
        main.g_HalfScaledRendererHeight,
    ));
    leftButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFF00D7, 0.95, buttonGraphics);
    container.addChild(leftButton.m_Text);

    rightButton = new Button(">", null);
    rightButton.setSizeToText(main.GUMPH);
    rightButton.setSize(vec2.fromValues(
        rightButton.m_Size[0],
        thingButton.m_Size[1],
    ));
    rightButton.setCenterPos(vec2.fromValues(
        thingButton.getRightX() + main.SMALL_GUMPH + rightButton.getHalfWidth(),
        main.g_HalfScaledRendererHeight,
    ));
    rightButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x00D7FF, 0.95, buttonGraphics);
    container.addChild(rightButton.m_Text);

    // buy button
    buyButtonGfx = new Graphics();
    container.addChild(buyButtonGfx);

    buyButton = new Button("Buy", null);
    buyButton.setSizeToText(main.GUMPH);
    buyButton.setSize(vec2.fromValues(
        thingButton.m_Size[0],
        buyButton.m_Size[1],
    ));
    buyButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        thingButton.getBottomY() + main.SMALL_GUMPH + buyButton.getHalfHeight(),
    ));
    buyButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0x00FFD7, 0.95, buyButtonGfx);
    container.addChild(buyButton.m_Text);

    backButton = new Button("Back", null);
    backButton.setSizeToText(main.GUMPH);
    backButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        main.g_ScaledRendererHeight - main.GUMPH - backButton.getHalfHeight(),
    ));
    backButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
        0xFF0000, 0.95, buttonGraphics);
    container.addChild(backButton.m_Text);

    // this sets up all the per thing data
    setNewThing(0);

    CoinsButton.show();
}

export function hide() {
    main.g_PixiApp.stage.removeChild(container);
    container = null;

    CoinsButton.hide();
}

// *******************************************************************************************************
export function process() {
    // do something
}

// *******************************************************************************************************
function setNewThing(newIndex: number) {
    currentThingIndex = newIndex;
    currentThingIndex = MSGlobal.G.limit(currentThingIndex, 0, thingsToBuy.length - 1);
    updateText(thingsToBuy[currentThingIndex]);
}

function updateText(t: ThingToBuy) {
    thingButton.m_Text.text = t.name + "\n" +
                              "Cost: " + t.costInCoins + " Coin" +
                             (t.costInCoins > 1 ? "s" : "");

    buyButtonGfx.clear();
    if (t.bought > 0) {
        thingButton.m_Text.text += "\nBOUGHT! x " + t.bought;
    }

    if (t.costInCoins <= Game.coins) {
        buyButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
            0x00FFD7, 0.95, buyButtonGfx);
        buyButton.m_Text.text = "Buy!";
    } else {
        buyButton.renderBackingIntoGraphicsWithBorder(0xFFFFFF, 1.0, 8,
            0x666666, 0.95, buyButtonGfx);
        buyButton.m_Text.text = "Need More Coins!";
    }
}

// *******************************************************************************************************
function tryBuyCurrentItem() {
    const t = thingsToBuy[currentThingIndex];
    if (t.costInCoins <= Game.coins) {
        ++t.bought;

        // cost it and save it
        Game.changeCoins(-t.costInCoins);
        save();

        updateText(t);
    }
}

// *********************************************************
export function useItem(idx: number, use: number) {
    const t = thingsToBuy[idx];
    if (t.bought > 0) {
        t.bought -= use;
        save();
    }
}

// *******************************************************************************************************
export function processInput(clicked: boolean,
                             mouseDown: boolean,
                             lastFrameMouseDown: boolean,
                             screenX: number,
                             screenY: number) {
    if (clicked) {
        if (leftButton.contains(vec2.fromValues(screenX, screenY))) {
            setNewThing(currentThingIndex - 1);
        } else if (rightButton.contains(vec2.fromValues(screenX, screenY))) {
            setNewThing(currentThingIndex + 1);
        } else if (buyButton.contains(vec2.fromValues(screenX, screenY))) {
            tryBuyCurrentItem();
        } else if (backButton.contains(vec2.fromValues(screenX, screenY))) {
            hide();
            return true;
        }
    }

    return false;
}

// *******************************************************************************************************
export function render(delta: number) {
    // do nothing
}
