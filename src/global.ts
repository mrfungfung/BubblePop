import {vec2} from "gl-matrix";
import {MSGlobal as G} from "minisquadron-core/lib";
export {G};
import * as main from "./main";

// tslint:disable:no-var-requires
const path = require("path");

export const ASSET_DIR: any = {};
function importAll(r: any) {
    r.keys().forEach((key: any) => ASSET_DIR[key] = r(key));
}
importAll(require.context("./assets/", true));
// tslint:enable:no-var-requires

declare var process: any;

import {IPlatform, PlatformAPI} from "./platform";
export const PlatformInterface: IPlatform = new PlatformAPI();

export const BOT_SERVER = "https://fbbotserver.herokuapp.com";
// export const BOT_SERVER = "http://localhost:5000";

// *********************************************************
export function log(v: any): void {
    G.log(v);
    if (main.g_DebugContainer && main.g_DebugContainer.visible) {
        debugOut(v, null);
    }
}
// *********************************************************
export function error(v: any): void {
    G.error(v);
    if (main.g_DebugContainer && main.g_DebugContainer.visible) {
        debugOut(v, null);
    }
}

// *********************************************************
function getSearchParameters(): {} {
    const prmstr: string = window.location.search.substr(1);
    return prmstr != null && prmstr !== "" ? transformToAssocArray(prmstr) : {};
}

// *********************************************************
function transformToAssocArray( prmstr: string ): {} {
    const params: any = {};
    const prmarr: string[] = prmstr.split("&");
    // tslint:disable-next-line
    for ( let i = 0; i < prmarr.length; i++) {
        const tmparr: string[] = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

export let GlobalURLParams: {}  = getSearchParameters();

// *********************************************************
export let parseXml: (xmlStr: string) => XMLDocument;

if (typeof (window as any).DOMParser !== "undefined") {
    parseXml = (xmlStr: string): XMLDocument => {
        return ( new (window as any).DOMParser() ).parseFromString(xmlStr, "text/xml");
    };
} else if (typeof (window as any).ActiveXObject !== "undefined" &&
    new (window as any).ActiveXObject("Microsoft.XMLDOM")) {
    parseXml = (xmlStr: string): XMLDocument => {
        const xmlDoc = new (window as any).ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlStr);
        return xmlDoc;
    };
} else {
    throw new Error("No XML parser found");
}

// *********************************************************
export function getTimeNowMilliSecs(): number {
    let time_now_ms = 0;
    // Feature detects Navigation Timing API support.
    if (window.performance) {
        // Gets the number of milliseconds since page load
        // (and rounds the result since the value must be an integer).
        time_now_ms = Math.round(performance.now());
    }

    return time_now_ms;
}

/*********************************************************************************/
export function setFontStyle(textobj: PIXI.Text) {
    textobj.style.fontSize = 20;
    textobj.style.fill = 0xFFFFFF;
    textobj.style.stroke = 0x0;
    textobj.style.strokeThickness = 4;
    textobj.style.lineJoin = "round";
}

// *************************************************************************************************\
export function setDebugOutEnabled(enabled: boolean) {
    main.g_DebugContainer.visible = enabled;
}
export function debugOut(m: string, n: number) {
    const lines = main.g_DebugText.text.split(/\r\n|\r|\n/);
    const num = n ? n : 5;
    while (lines.length >= num) {
        lines.pop();
    }
    main.g_DebugText.text = m + "\n";
    for (const line of lines) {
        main.g_DebugText.text += line + "\n";
    }
}

// *************************************************************************************************\
export function secondsToString(seconds: number, shorten: boolean, numElements: number) {
    const decomposed = [];
    const units = [];
    const numyears = Math.floor(seconds / 31536000);
    const numdays = Math.floor((seconds % 31536000) / 86400);
    const numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
    const numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
    const numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
    decomposed.push(numyears, numdays, numhours, numminutes, numseconds);
    if (shorten) {
        units.push("yrs", "days", "hrs", "min", "s");
    } else {
        units.push("years", "days", "hours", "minutes", "seconds");
    }
    let result = "";
    const MAX_ITEMS = (numElements ? numElements : decomposed.length);
    let firstUnitWritten = false;
    for (let i = 0; i < decomposed.length; ++i) {
      if (decomposed[i] === 0) { // uh oh this is a 0
          if (!firstUnitWritten) { // well i havent written anything out
            if (i < decomposed.length - 1) { // ok at least im not the seconds unit
                continue; // skip it
            }
          }
      }

      firstUnitWritten = true;
      for (let j = i; j < i + MAX_ITEMS && j < decomposed.length; ++j) {
        result += decomposed[j] + " " + units[j] + " ";
      }
      break;
    }
    return result;
}
