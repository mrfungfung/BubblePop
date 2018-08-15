// tslint:disable:max-classes-per-file

import * as MSGlobal from "../global";
import {EAdType,
    IAnalyticsManager,
        IConnectedPlayer,
        ILeaderboard,
        ILeaderboardEntry,
        ILeaderboardPlayer,
        IPlatform,
        IShareManager} from "../platform";

// declare var mixpanel: any;

export class WebAnalyticsManager implements IAnalyticsManager {
    public init(): void {
        // mixpanel.init("95bc4979d669b7ee0c2e27335f7d58ee");
    // if (process.env.NODE_ENV === MSGlobal.G.DEV_ENV) {
    //     mixpanel.init("95bc4979d669b7ee0c2e27335f7d58ee");
    // } else if (process.env.NODE_ENV === MSGlobal.G.PROD_ENV) {
    //     mixpanel.init("5b634e0f65fd84c09b3c126569a759f7");
    // }
    }

    public logEvent(eventName: any, valueToSum: any, parameters: any): void {
        // mixpanel.track(eventName, parameters);
    }

    public logTimedEvent(eventName: any): void {
        // mixpanel.time_event(eventName);
    }
}

// *****************************************************************************
export class WebLeaderboardPlayer implements ILeaderboardPlayer {
    public getID(): string {
        return "ID";
    }
    public getName(): string {
        return "Name";
    }
    public getPhoto(): string {
        return "photo";
    }
}

// *****************************************************************************
export class WebLeaderboardEntry implements ILeaderboardEntry {
    public getScore(): number {
        return 0;
    }
    public getRank(): number {
        return 0;
    }
    public getPlayer(): ILeaderboardPlayer {
        return new WebLeaderboardPlayer();
    }
    public getFormattedScore(): string {
        return "";
    }
    public getName(): string {
        return "";
    }
}

// *****************************************************************************
export class WebLeaderboard implements ILeaderboard {
    public setScoreAsync(score: any, extradata: any): Promise<ILeaderboardEntry> {
        return new Promise(function(resolve: any, reject: any) {
            resolve(new WebLeaderboardEntry());
        });
    }

    public getEntriesAsync(count: any, offset: any): Promise<ILeaderboardEntry[]> {
        return new Promise(function(resolve: any, reject: any) {
            resolve([new WebLeaderboardEntry()]);
        });
    }

    public getPlayerEntryAsync(): Promise<ILeaderboardEntry> {
        return new Promise(function(resolve: any, reject: any) {
            resolve(new WebLeaderboardEntry());
        });
    }
}

// *****************************************************************************
export class WebPlatform implements IPlatform {
    private static makeRandID() {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    public webShareManager = new WebShareManager();
    public webAnalyticsManager = new WebAnalyticsManager();
    public playerName: string = "Guest";
    public playerID: string = WebPlatform.makeRandID();

    constructor() {
        const allcookies = document.cookie;

        // Get all the cookies pairs in an array
        const cookiearray = allcookies.split(";");

        // Now take key value pair out of this array
        for (const cookie of cookiearray) {
            const name = cookie.split("=")[0];
            const value = cookie.split("=")[1];
            if (name === " playerName") {
                this.setPlayerName(value);
                break;
            }
        }
    }

    public getCurrentContextHiScore(contextID: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public postCurrentContextHiScore(contextID: any, hiscore: number, hiscore_playerid: string): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public setLoadingProgress(percentage: number): void {
        // FBInstant.setLoadingProgress(percentage);
    }
    public initializeAsync(): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
           resolve();
        });
    }
    public startGameAsync(): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }
    public canShowAds(adType: EAdType): boolean { return false; }
    public getPlayerID(): string {
        return this.playerID;
    }
    public getPlayerName(): string {
        return this.playerName;
    }
    public setPlayerName(name: string) {
        this.playerName = name;
        document.cookie = "playerName=" + this.playerName;
    }
    public getContextType(): any {
        return "ContextType";
    }
    public getContextID(): any {
        return "0";
    }
    public getRewardedVideoAsync(adIdentifier: any): Promise<any> {
        return this.getInterstitialAdAsync(adIdentifier);
    }
    public getInterstitialAdAsync(adIdentifier: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public getLeaderboardAsync(name: any): Promise<ILeaderboard> {
        return new Promise(function(resolve: any, reject: any) {
            resolve(new WebLeaderboard());
        });
    }

    public getPlayersAsync(): Promise<IConnectedPlayer[]> {
        return new Promise(function(resolve: any, reject: any) {
            resolve([]);
        });
    }

    public getConnectedPlayersAsync(): Promise<IConnectedPlayer[]> {
        return new Promise(function(resolve: any, reject: any) {
            resolve([]);
        });
    }

    public setSessionData(data: any): void {
        // do nothing
    }

    public updateAsync(payload: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public shareAsync(payload: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public chooseAsync(): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public canCreateShortcutAsync(): Promise<boolean> {
        return new Promise(function(resolve: any, reject: any) {
            resolve(false);
        });
    }

    public createShortcutAsync(): Promise<void> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public setOnPauseCallback(onPauseFunc: any): void {
        // do nothing
    }

    public getDataAsync(keys: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public setDataAsync(values: any): Promise<void> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public getStatsAsync(keys: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public setStatsAsync(values: any): Promise<void> {
        return new Promise(function(resolve: any, reject: any) {
            resolve();
        });
    }

    public getShareManager(): IShareManager {
        return this.webShareManager;
    }

    public getEntryPointData(): any {
        return null;
    }

    public getAnalyticsManager(): IAnalyticsManager {
        return this.webAnalyticsManager;
    }
}

// *****************************************************************************
declare var a2a_config: any;
export class WebShareManager implements IShareManager {
    public getShareButtons(): HTMLElement {
        const addToAnyDiv: HTMLElement = document.getElementById("share_buttons");
        return addToAnyDiv;
    }
    public setUpAddToAny(pixiApp: PIXI.Application, canvasWidth: number, canvasHeight: number): HTMLElement {
        function my_addtoany_onshare(data: any) {
            MSGlobal.PlatformInterface.getAnalyticsManager().logEvent("my_addtoany_onshare", null, data);
            MSGlobal.log("my_addtoany_onshare");
            MSGlobal.log(data);
            // setShareButtonState(true);
        }

        // AddToAny BEGIN
        const addToAnyDiv: HTMLElement = document.getElementById("share_buttons");
        if (addToAnyDiv) {
            // position it
            const ratio_x = pixiApp.stage.scale.x;
            const ratio_y = pixiApp.stage.scale.y;
            addToAnyDiv.style.position = "absolute";
            addToAnyDiv.style.zIndex = "2";
            addToAnyDiv.style.left = Math.max(0, 0.5 * window.innerWidth - 0.5 * canvasWidth) +
                                    0.5 * canvasWidth - 0.5 * addToAnyDiv.offsetWidth + "px";
            addToAnyDiv.style.top = 0.5 * canvasHeight + "px";

            // A custom "onShare" handler for AddToAny
            a2a_config = a2a_config || {};
            a2a_config.linkname = "This game is amazing - MiniSquadron.io";
            a2a_config.linkurl = "https://minisquadron.io";
            a2a_config.onclick = 1;
            a2a_config.callbacks = a2a_config.callbacks || [];
            a2a_config.callbacks.push({
                share: my_addtoany_onshare,
            });
        }
        // document.body.appendChild(addToAnyDiv);
        // AddToAny END

        return addToAnyDiv;
    }
}
