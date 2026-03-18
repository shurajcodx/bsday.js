export type Paksha = "Shukla" | "Krishna";

export interface DayPanchang {
    jd: number;
    dateAD: string;
    dateBS: string;
    sunriseJD: number;
    month: number;
    tithi: string;
    paksha: Paksha;
    nakshatra: string;
    yoga: string;
    karana: string;
    nextTithi?: string;
    nextTithiStart?: number;
}

export type FestivalRuleType = "sunrise" | "sunset" | "night" | "relative";

export interface BaseRule {
    name: string;
    type: FestivalRuleType;
}

export interface SunriseRule extends BaseRule {
    type: "sunrise";
    month: number;
    tithi: string;
    paksha?: Paksha;
}

export interface SunsetRule extends BaseRule {
    type: "sunset";
    month: number;
    tithi: string;
    paksha?: Paksha;
}

export interface NightRule extends BaseRule {
    type: "night";
    month: number;
    tithi: string;
    paksha?: Paksha;
}

export interface RelativeRule extends BaseRule {
    type: "relative";
    base: string;
    offsetDays: number;
}

export type FestivalRule = SunriseRule | SunsetRule | NightRule | RelativeRule;

export type FestivalResult = Record<string, string[]>;
