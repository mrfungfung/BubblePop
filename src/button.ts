import {vec2} from "gl-matrix";
import {BaseTexture, Graphics, Sprite} from "pixi.js";
import * as MSGlobal from "./global";

// tslint:disable:no-var-requires
const MultiStyleText = require("pixi-multistyle-text");
// tslint:enable:no-var-requires

const DISABLED_ALPHA = 0.45;

export class Button {
    public m_CenterPos: vec2 = vec2.fromValues(0, 0);
    public m_Size: vec2 = vec2.fromValues(0, 0);
    public m_Text: any = null;
    public m_Sprite: Sprite = null;
    public m_Disabled = false;

    constructor(text: string, styles: any) {
        if (styles === null) {
            styles = {
                default: {
                    fill: "0xFFFFFF",
                    fontSize: "20px",
                    lineJoin: "round",
                    stroke: "0x0",
                    strokeThickness: "4",
                },
            };
        }
        this.m_Text = new MultiStyleText(text, styles);
        this.m_Text.anchor.set(0.5);
        MSGlobal.setFontStyle(this.m_Text);
        this.m_Text.x = this.m_CenterPos[0];
        this.m_Text.y = this.m_CenterPos[1];
    }

    public setSprite(baseTexture: BaseTexture) {
        this.m_Sprite = Sprite.from(baseTexture);
        this.m_Sprite.anchor.set(0.5);
        this.m_Sprite.x = this.m_CenterPos[0];
        this.m_Sprite.y = this.m_CenterPos[1];
    }

    public getHalfHeight() {
        return 0.5 * this.m_Size[1];
    }
    public getBottomY() {
        return this.m_CenterPos[1] + 0.5 * this.m_Size[1];
    }

    public setSizeToText(border: number) {
        if (this.m_Text) {
            this.m_Size = vec2.fromValues(this.m_Text.width + border, this.m_Text.height + border);
        }
    }
    public setSize(size: vec2) {
        this.m_Size = vec2.fromValues(size[0], size[1]);
        if (this.m_Sprite) {
            this.m_Sprite.width = this.m_Size[0];
            this.m_Sprite.height = this.m_Size[1];
        }
    }
    public setCenterPos(centerPos: vec2) {
        this.m_CenterPos = vec2.fromValues(centerPos[0], centerPos[1]);
        if (this.m_Text) {
            this.m_Text.x = this.m_CenterPos[0];
            this.m_Text.y = this.m_CenterPos[1];
        }
        if (this.m_Sprite) {
            this.m_Sprite.x = this.m_CenterPos[0];
            this.m_Sprite.y = this.m_CenterPos[1];
        }
    }
    public setTLPos(TLPos: vec2) {
        this.m_CenterPos = vec2.fromValues(TLPos[0] + 0.5 * this.m_Size[0], TLPos[1] + 0.5 * this.m_Size[1]);
        if (this.m_Text) {
            this.m_Text.x = this.m_CenterPos[0];
            this.m_Text.y = this.m_CenterPos[1];
        }
        if (this.m_Sprite) {
            this.m_Sprite.x = this.m_CenterPos[0];
            this.m_Sprite.y = this.m_CenterPos[1];
        }
    }

    public renderBackingIntoGraphics(color: number, alpha: number, graphics: Graphics, borderRadius: number) {
        if (this.m_Disabled) {
            alpha = DISABLED_ALPHA;
        }
        graphics.beginFill(color, alpha);
        graphics.drawRoundedRect( this.m_CenterPos[0] - 0.5 * this.m_Size[0],
            this.m_CenterPos[1] - 0.5 * this.m_Size[1],
            this.m_Size[0], this.m_Size[1],
            borderRadius);
        graphics.endFill();
    }

    public renderBackingIntoGraphicsWithBorder( borderColor: number, borderAlpha: number, borderSize: number,
                                                color: number, alpha: number, graphics: Graphics) {
        if (this.m_Disabled) {
            borderAlpha = DISABLED_ALPHA;
            alpha = DISABLED_ALPHA;
        }
        graphics.beginFill(borderColor, borderAlpha);
        graphics.drawRoundedRect( this.m_CenterPos[0] - 0.5 * this.m_Size[0],
        this.m_CenterPos[1] - 0.5 * this.m_Size[1],
        this.m_Size[0], this.m_Size[1],
        5);
        graphics.beginFill(color, alpha);
        const BORDER = vec2.fromValues(this.m_Size[0] - borderSize,
                                        this.m_Size[1] - borderSize);
        graphics.drawRoundedRect( this.m_CenterPos[0] - 0.5 * BORDER[0],
                                  this.m_CenterPos[1] - 0.5 * BORDER[1],
                                  BORDER[0], BORDER[1],
                                5);
        graphics.endFill();
    }

    public setDisabled(d: boolean) {
        this.m_Disabled = d;
        this.m_Text.alpha = d ? DISABLED_ALPHA : 1.0;
    }

    public contains(testpos: vec2) {
        if (this.m_Disabled) {
            return false;
        }
        return MSGlobal.G.contains(testpos, this.m_CenterPos, this.m_Size);
    }
}
