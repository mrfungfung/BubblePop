import {vec2} from "gl-matrix";
import {Container, Graphics, Sprite, Texture} from "pixi.js";
import { Button } from "./button";
import * as CoinsButton from "./coinsbutton";
import * as Game from "./game";
import * as MSGlobal from "./global";
import * as main from "./main";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

// *********************************************************
let container: Container = null;
let buttonGraphics: Graphics = null;
let leftButton: Button = null;
let rightButton: Button = null;
let thingSprite: Sprite = null;
let thingName: any = null;
let thingCost: Button = null;
let buyButton: Button = null;
let backButton: Button = null;
let currentThingIndex = 0;

class ThingToBuy {
    public texturefilepath: string = MSGlobal.ASSET_DIR["./item_timer@2x.png"];
    public name: string = "";
    public costInCoins: number = 0;
    public bought: number = 0;
}
export const thingsToBuy: ThingToBuy[] = [];
for (let i = 0; i < 1; ++i) {
    const t = new ThingToBuy();
    if (i === 0) {
        t.name = "Extend Time";
    } else {
        t.name = "Thing " + (i + 1);
    }

    t.costInCoins = 1;
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

    const bgSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./background@2x.png"]);
    bgSprite.width *= main.g_CurrentScaleW;
    bgSprite.height *= main.g_CurrentScaleH;
    container.addChild(bgSprite);

    // backing
    const shopbgGFX = new Graphics();
    container.addChild(shopbgGFX);

    const BACKING_WIDTH = main.g_ScaledRendererWidth - 2 * main.GUMPH;
    const BACKING_HEIGHT = main.g_ScaledRendererHeight - 4 * main.GUMPH;
    const BACKING_X = main.g_HalfScaledRendererWidth;
    const BACKING_Y = main.g_HalfScaledRendererHeight;
    shopbgGFX.beginFill(0xcaf2a3);
    shopbgGFX.lineStyle(5.0, 0x634130);
    shopbgGFX.drawRoundedRect(
        BACKING_X - 0.5 * BACKING_WIDTH,
        BACKING_Y - 0.5 * BACKING_HEIGHT,
        BACKING_WIDTH, BACKING_HEIGHT,
        8);
    shopbgGFX.endFill();

    const titleText = new MultiStyleText("Shop", main.FONT_STYLES);
    titleText.anchor.set(0.5);
    titleText.x = main.g_HalfScaledRendererWidth;
    titleText.y = BACKING_Y - 0.5 * BACKING_HEIGHT + main.GUMPH + 0.5 * titleText.height;
    container.addChild(titleText);

    // another backing
    const shopboard = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./board_shop@2x.png"]);
    shopboard.anchor.set(0.5);
    shopboard.x = main.g_HalfScaledRendererWidth;
    shopboard.y = titleText.y + 0.5 * titleText.height + main.GUMPH + 0.5 * shopboard.height;
    container.addChild(shopboard);

    // the thing
    thingSprite = PIXI.Sprite.fromImage(MSGlobal.ASSET_DIR["./item_timer@2x.png"]); // first one is on me
    thingSprite.anchor.set(0.5);
    thingSprite.x = main.g_HalfScaledRendererWidth;
    thingSprite.y = shopboard.y - 0.5 * shopboard.height + main.GUMPH + 0.5 * thingSprite.height;
    container.addChild(thingSprite);

    // the name of the thing
    thingName = new MultiStyleText("<medium>EMPTY</medium><smaller>\nBOUGHT x 0</smaller>", main.FONT_STYLES);
    thingName.anchor.set(0.5);
    thingName.x = main.g_HalfScaledRendererWidth;
    thingName.y = thingSprite.y + 0.5 * thingSprite.height + main.GUMPH + 0.5 * thingName.height;
    container.addChild(thingName);

    // the coin and then the cost
    thingCost = new Button("", main.FONT_STYLES);
    const coinTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./ico_coin@2x.png"]);
    thingCost.setSprite(coinTexture.baseTexture);
    thingCost.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        thingName.y + 0.5 * thingName.height + main.SMALL_GUMPH + 0.5 * coinTexture.height,
    ));
    thingCost.m_Text.x = thingCost.m_Sprite.x + 0.5 * thingCost.m_Sprite.width + main.SMALL_GUMPH +
                         0.5 * thingCost.m_Text.width;
    container.addChild(thingCost.m_Text);
    container.addChild(thingCost.m_Sprite);

    // left/right arrow
    buttonGraphics = new Graphics();
    container.addChild(buttonGraphics);

    buyButton = new Button("Buy!", main.FONT_STYLES);
    const buyTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_buy@2x.png"]);
    buyButton.setSprite(buyTexture.baseTexture);
    buyButton.setSizeToSprite(0);
    buyButton.setCenterPos(vec2.fromValues(
        main.g_HalfScaledRendererWidth,
        shopboard.y + 0.5 * shopboard.height + main.GUMPH + buyButton.getHalfHeight(),
    ));
    container.addChild(buyButton.m_Sprite);
    container.addChild(buyButton.m_Text);

    leftButton = new Button("", null);
    const leftTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_left@2x.png"]);
    leftButton.setSprite(leftTexture.baseTexture);
    leftButton.setSizeToSprite(0);
    leftButton.setCenterPos(vec2.fromValues(
        buyButton.getLeftX() - main.SMALL_GUMPH - leftButton.getHalfWidth(),
        buyButton.m_CenterPos[1],
    ));
    leftButton.m_Sprite.visible = false;
    container.addChild(leftButton.m_Sprite);

    rightButton = new Button("", null);
    const rightTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_right@2x.png"]);
    rightButton.setSprite(rightTexture.baseTexture);
    rightButton.setSizeToSprite(0);
    rightButton.setCenterPos(vec2.fromValues(
        buyButton.getRightX() + main.SMALL_GUMPH + rightButton.getHalfWidth(),
        buyButton.m_CenterPos[1],
    ));
    rightButton.m_Sprite.visible = thingsToBuy.length > 1;
    container.addChild(rightButton.m_Sprite);

    backButton = new Button("", null);
    const backTexture = Texture.fromImage(MSGlobal.ASSET_DIR["./btn_close@2x.png"]);
    backButton.setSprite(backTexture.baseTexture);
    backButton.setSizeToSprite(0);
    backButton.setCenterPos(vec2.fromValues(
        BACKING_X + 0.5 * BACKING_WIDTH,
        BACKING_Y - 0.5 * BACKING_HEIGHT,
    ));
    container.addChild(backButton.m_Sprite);

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
    CoinsButton.updateCoinsButton();
}

// *******************************************************************************************************
function setNewThing(newIndex: number) {
    currentThingIndex = newIndex;
    currentThingIndex = MSGlobal.G.limit(currentThingIndex, 0, thingsToBuy.length - 1);
    updateText(thingsToBuy[currentThingIndex]);
}

function updateText(t: ThingToBuy) {
    leftButton.m_Sprite.visible = currentThingIndex > 0;
    rightButton.m_Sprite.visible = thingsToBuy.length - 1 > currentThingIndex;

    // the thing
    thingSprite.texture = Texture.fromImage(t.texturefilepath);
    thingCost.m_Text.text = t.costInCoins;
    thingCost.m_Text.x = thingCost.m_Sprite.x + 0.5 * thingCost.m_Sprite.width + main.SMALL_GUMPH +
                         0.5 * thingCost.m_Text.width;

    thingName.text = "<medium>" + t.name + "</medium>";
    if (t.bought > 0) {
        thingName.text += "<smaller>\nBOUGHT x " + t.bought + "</smaller>";
    }

    if (t.costInCoins <= Game.coins) {
        buyButton.m_Text.text = "Buy!";
    } else {
        buyButton.m_Text.text = "<smaller>Need More\nCoins!</smaller>";
    }
}

// *******************************************************************************************************
function tryBuyCurrentItem() {
    const t = thingsToBuy[currentThingIndex];
    if (t.costInCoins <= Game.coins) {
        ++t.bought;

        // cost it and save it
        MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("BoughtSomething",
            null,
            {
                CoinsSpent: t.costInCoins,
                ThingIndex: currentThingIndex,
            });
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
