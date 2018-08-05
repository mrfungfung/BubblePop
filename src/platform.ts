declare var process: any;

export enum EAdType {
    EADTYPE_INTERSTITIAL = 0,
    EADTYPE_REWARDED,
    EADTYPE_COUNT,
}

export interface IPlatform {
    initializeAsync(): Promise<any>;
    startGameAsync(): Promise<any>;
    canShowAds(adType: EAdType): boolean;
    getRewardedVideoAsync(adIdentifier: any): Promise<any>;
    getInterstitialAdAsync(adIdentifier: any): Promise<any>;
    getLeaderboardAsync(name: any): Promise<ILeaderboard>;

    setLoadingProgress(percentage: number): void;
    getPlayerID(): string;
    getPlayerName(): string;
    setPlayerName(name: string): void;
    getContextType(): any;
    getContextID(): any;
    getConnectedPlayersAsync(): Promise<IConnectedPlayer[]>;

    setSessionData(data: any): void;

    shareAsync(payload: any): Promise<any>;
    chooseAsync(): Promise<any>;
    canCreateShortcutAsync(): Promise<boolean>;
    createShortcutAsync(): Promise<void>;

    getShareManager(): IShareManager;
    getEntryPointData(): any;
    getAnalyticsManager(): IAnalyticsManager;

    setOnPauseCallback(onPauseFunc: any): void;

    getDataAsync(keys: any): Promise<any>;
    setDataAsync(values: any): Promise<void>;

    getStatsAsync(keys: any): Promise<any>;
    setStatsAsync(values: any): Promise<void>;
}

export interface IAnalyticsManager {
    init(): void;
    logEvent(eventName: any, valueToSum: any, parameters: any): void;
    logTimedEvent(eventName: any): void;
}

export interface ILeaderboard {
    setScoreAsync(score: any, extradata: any): Promise<ILeaderboardEntry>;
    getEntriesAsync(count: any, offset: any): Promise<ILeaderboardEntry[]>;
    getPlayerEntryAsync(): Promise<ILeaderboardEntry>;
}

export interface ILeaderboardEntry {
    getScore(): number;
    getRank(): number;
    getPlayer(): ILeaderboardPlayer;
    getName(): string;
    getFormattedScore(): string;
}

export interface ILeaderboardPlayer {
    getID(): string;
    getName(): string;
    getPhoto(): string;
}

export interface IConnectedPlayer {
    getID(): string;
    getName(): string;
}

export interface IShareManager {
    getShareButtons(): HTMLElement;
    setUpAddToAny(pixiApp: PIXI.Application, canvasWidth: number, canvasHeight: number): HTMLElement;
}

import {FBPlatform} from "./3rdparty/facebook";
import {WebPlatform} from "./3rdparty/web";
export const PlatformAPI = (process.env.WEB === "true" ? WebPlatform : FBPlatform);
