import * as MSGlobal from "./global";
import {EAdType} from "./platform";

const TOTAL_NUM_ADS_TO_PRELOAD = 3;

const num_ads_currently_in_flight: number[] = [0, 0];
const availableAds: any = [[], []];

export function preloadAds(adType: EAdType) {
    MSGlobal.log("called preloadAds: " + num_ads_currently_in_flight[adType]);
    while (num_ads_currently_in_flight[adType] + availableAds[adType].length < TOTAL_NUM_ADS_TO_PRELOAD) {
        MSGlobal.log("total ads: " + (num_ads_currently_in_flight[adType] + availableAds[adType].length));
        let loaded_ad: any = null;
        ++num_ads_currently_in_flight[adType];
        let adFunc = null;
        let adIdentifier = null;
        if (adType === EAdType.EADTYPE_INTERSTITIAL) {
            adFunc = MSGlobal.PlatformInterface.getInterstitialAdAsync;
            adIdentifier = "1757307654346809_1758752787535629";
        } else {
            adFunc = MSGlobal.PlatformInterface.getRewardedVideoAsync;
            adIdentifier = "";
        }

        adFunc(adIdentifier)
        .then(function(ad: any) {
            // Load the Ad asynchronously
            loaded_ad = ad;
            return loaded_ad.loadAsync();
        }).then(function() {
            availableAds[adType].push(loaded_ad);
            --num_ads_currently_in_flight[adType];
            MSGlobal.log("Ad preloaded: " + num_ads_currently_in_flight[adType]);
        }).catch(function(err: any) {
            --num_ads_currently_in_flight[adType];
            MSGlobal.error("Interstitial failed to preload: " + err.code);
        });
    }
}

export function getAd(adType: EAdType) {
    let preloadedAd: any = null;
    // grab an ad
    if (availableAds[adType].length > 0) {
        // thow away ad instance and refill
        preloadedAd = availableAds[adType].shift();

        preloadAds(adType);
    }
    return preloadedAd;
}

export function showAd(adType: EAdType, success: any, fail: any) {
    const ad: any = getAd(adType);
    if (ad) {
        ad.showAsync()
        .then(function() {
            // Perform post-ad success operation
            MSGlobal.log("Ad finished successfully");
            if (success) { success(); }
        }).catch(function(err: any) {
            MSGlobal.error("Ad errored successfully");
            if (fail) { fail(); }
        });
    } else {
        if (fail) { fail(); }
    }
}
