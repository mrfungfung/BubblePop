// tslint:disable:max-classes-per-file

import Axios from "axios";
import * as MSGlobal from "../global";
import { EAdType,
    IAnalyticsManager,
    IConnectedPlayer,
    ILeaderboard,
    ILeaderboardEntry,
    ILeaderboardPlayer,
    IPlatform,
    IShareManager} from "../platform";

declare var FBInstant: any;

export class FBAnalyticsManager implements IAnalyticsManager {
    public init(): void {
        return;
    }

    public logEvent(eventName: any, valueToSum: any, parameters: any): void {
        FBInstant.logEvent(eventName, valueToSum, parameters);
    }

    public logTimedEvent(eventName: any): void {
        // FBInstant.logEvent(eventName);
    }
}

// *****************************************************************************
export class FBLeaderboardPlayer implements ILeaderboardPlayer {
    public player: any;
    constructor(player: any) {
        this.player = player;
    }

    public getID(): string {
        return this.player.getID();
    }
    public getName(): string {
        return this.player.getName();
    }
    public getPhoto(): string {
        return this.player.getPhoto();
    }
}

// *****************************************************************************
export class FBConnectedPlayer implements IConnectedPlayer {
    public player: any;
    constructor(player: any) {
        this.player = player;
    }

    public getID(): string {
        return this.player.getID();
    }
    public getName(): string {
        return this.player.getName();
    }
}

// *****************************************************************************
export class FBLeaderboardEntry implements ILeaderboardEntry {
    public entry: any;
    constructor(entry: any) {
        this.entry = entry;
    }

    public getScore(): number {
        return this.entry.getScore();
    }
    public getRank(): number {
        return this.entry.getRank();
    }
    public getPlayer(): ILeaderboardPlayer {
        return new FBLeaderboardPlayer(this.entry.getPlayer());
    }
    public getFormattedScore(): string {
        return this.entry.getFormattedScore();
    }
    public getName(): string {
        return this.entry.getName();
    }
}

// *****************************************************************************
export class FBLeaderboard implements ILeaderboard {
    public leaderboard: any;
    constructor(leaderboard: any) {
        this.leaderboard = leaderboard;
    }

    public setScoreAsync(score: any, extradata: any): Promise<ILeaderboardEntry> {
        const local_this = this;
        return new Promise(function(resolve: any, reject: any) {
            local_this.leaderboard.setScoreAsync(score, extradata)
            .then(function(entry: any) {
                const fble = new FBLeaderboardEntry(entry);
                resolve(fble);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public getEntriesAsync(count: any, offset: any): Promise<ILeaderboardEntry[]> {
        const local_this = this;
        return new Promise(function(resolve: any, reject: any) {
            local_this.leaderboard.getEntriesAsync(count, offset)
            .then(function(entries: any) {
                const fbles = [];
                for (const e of entries) {
                    const fble = new FBLeaderboardEntry(e);
                    fbles.push(fble);
                }
                resolve(fbles);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public getPlayerEntryAsync(): Promise<ILeaderboardEntry> {
        const local_this = this;
        return new Promise(function(resolve: any, reject: any) {
            local_this.leaderboard.getPlayerEntryAsync()
            .then(function(entry: any) {
                const fble = new FBLeaderboardEntry(entry);
                resolve(fble);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }
}

// *****************************************************************************
export class FBPlatform implements IPlatform {
    public fbShareManager = new FBShareManager();
    public fbAnalyticsManager = new FBAnalyticsManager();

    public setLoadingProgress(percentage: number): void {
        FBInstant.setLoadingProgress(percentage);
    }
    public initializeAsync(): Promise<any> {
        return FBInstant.initializeAsync();
    }
    public startGameAsync(): Promise<any> {
        return FBInstant.startGameAsync();
    }
    public getPlayerID(): string {
        return FBInstant.player.getID();
    }
    public getPlayerName(): string {
        return FBInstant.player.getName();
    }
    public setPlayerName(name: string): void {
        // nothing
    }
    public getContextType(): any {
        return FBInstant.context.getType();
    }
    public getContextID(): any {
        return FBInstant.context.getID();
    }
    public canShowAds(adType: EAdType): boolean {
        const api = FBInstant.getSupportedAPIs();
        if (adType === EAdType.EADTYPE_INTERSTITIAL) {
            return api.includes("getInterstitialAdAsync");
        } else if (adType === EAdType.EADTYPE_REWARDED) {
            return api.includes("getRewardedVideoAsync");
        }
        return false;
    }
    public getRewardedVideoAsync(adIdentifier: any): Promise<any> {
        return FBInstant.getRewardedVideoAsync(adIdentifier);
    }
    public getInterstitialAdAsync(adIdentifier: any): Promise<any> {
        return FBInstant.getInterstitialAdAsync(adIdentifier);
    }

    public getLeaderboardAsync(name: any): Promise<ILeaderboard> {
        return new Promise(function(resolve: any, reject: any) {
            FBInstant.getLeaderboardAsync(name)
            .then(function(leaderboard: any) {
                const fbl = new FBLeaderboard(leaderboard);
                resolve(fbl);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public getConnectedPlayersAsync(): Promise<IConnectedPlayer[]> {
        return new Promise(function(resolve: any, reject: any) {
            FBInstant.player.getConnectedPlayersAsync()
            .then(function(players: any) {
                const fbps = [];
                for (const p of players) {
                    const fbp = new FBConnectedPlayer(p);
                    fbps.push(fbp);
                }
                resolve(fbps);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public setSessionData(data: any): void {
        FBInstant.setSessionData(data);
    }

    public shareAsync(payload: any): Promise<any> {
        return FBInstant.shareAsync(payload);
    }

    public chooseAsync(): Promise<any> {
        return FBInstant.context.chooseAsync();
    }

    public getShareManager(): IShareManager {
        return this.fbShareManager;
    }

    public getEntryPointData(): any {
        return FBInstant.getEntryPointData();
    }

    public getAnalyticsManager(): IAnalyticsManager {
        return this.fbAnalyticsManager;
    }

    public canCreateShortcutAsync(): Promise<boolean> {
        return new Promise(function(resolve: any, reject: any) {
            if (FBInstant.canCreateShortcutAsync) {
                FBInstant.canCreateShortcutAsync()
                .then(function(canCreateShortcut: boolean) {
                    resolve(canCreateShortcut);
                }).catch(function(error: any) {
                    reject(error);
                });
            } else {
                resolve(false);
            }
        });
    }

    public createShortcutAsync(): Promise<void> {
        return new Promise(function(resolve: any, reject: any) {
            if (FBInstant.createShortcutAsync) {
                FBInstant.createShortcutAsync()
                .then(function() {
                    resolve();
                }).catch(function(error: any) {
                    reject(error);
                });
            } else {
                resolve();
            }
        });
    }

    public setOnPauseCallback(onPauseFunc: any): void {
        FBInstant.onPause(onPauseFunc);
    }

    public getDataAsync(keys: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            FBInstant.player.getDataAsync(keys)
            .then(function(data: any) {
                resolve(data);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public setDataAsync(values: any): Promise<void> {
        return new Promise(function(resolve: any, reject: any) {
            FBInstant.player.setDataAsync(values)
            .then(function() {
                resolve();
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public getStatsAsync(keys: any): Promise<any> {
        return new Promise(function(resolve: any, reject: any) {
            FBInstant.player.getStatsAsync(keys)
            .then(function(stats: any) {
                resolve(stats);
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }

    public setStatsAsync(values: any): Promise<void> {
        return new Promise(function(resolve: any, reject: any) {
            FBInstant.player.setStatsAsync(values)
            .then(function() {
                resolve();
            }).catch(function(error: any) {
                reject(error);
            });
        });
    }
}

export class FBShareManager implements IShareManager {
    public getShareButtons(): HTMLElement {
        return null;
    }
    public setUpAddToAny(pixiApp: PIXI.Application, canvasWidth: number, canvasHeight: number): HTMLElement {
        return null;
    }
}
