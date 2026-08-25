"use strict";

(function installReachByJourneyRequestPolicy(root) {
  const LOCATION_PATTERNS = Object.freeze({
    email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    postcode: /\b(?:GIR\s?0AA|[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}|\d{5})\b/i,
    coordinate: /[-+]?\d{1,3}\.\d{3,}\s*[,/]\s*[-+]?\d{1,3}\.\d{3,}/,
    uri: /(?<![\w.-])[A-Z][A-Z0-9+.-]{0,31}:\S+|(?<![\w.-])\/\/[A-Z0-9.-]+(?::\d{1,5})?(?:[/?#]\S*)?|(?<![\w.-])www\.[^\s]+/i,
    exactAddress: /\b\d{1,5}[A-Z]?\s+(?:[A-ZÀ-ÖØ-öø-ÿẞß][A-ZÀ-ÖØ-öø-ÿẞß.'-]*\s+){0,5}(?:STREET|ST|ROAD|RD|AVENUE|AVE|LANE|LN|DRIVE|DR|WAY|CLOSE|COURT|CT|TERRACE|PLACE|PL|SQUARE|SQ|STRASSE|STRAßE|WEG|ALLEE|PLATZ|GASSE|UFER|DAMM|CHAUSSEE)\b|\b\d{1,5}[A-Z]?\s+(?:[A-ZÀ-ÖØ-öø-ÿẞß][A-ZÀ-ÖØ-öø-ÿẞß.'-]*\s+){0,4}[A-ZÀ-ÖØ-öø-ÿẞß][A-ZÀ-ÖØ-öø-ÿẞß.'-]*(?:STRASSE|STRAßE|WEG|ALLEE|PLATZ|GASSE|UFER|DAMM|CHAUSSEE)\b|\b(?:[A-ZÀ-ÖØ-öø-ÿẞß][A-ZÀ-ÖØ-öø-ÿẞß.'-]*\s+){0,5}(?:STREET|ROAD|AVENUE|LANE|DRIVE|CLOSE|COURT|TERRACE|PLACE|SQUARE)\s+\d{1,5}[A-Z]?\b|\b[A-ZÀ-ÖØ-öø-ÿẞß][A-ZÀ-ÖØ-öø-ÿẞß.'-]*(?:STRASSE|STRAßE|WEG|ALLEE|PLATZ|GASSE|UFER|DAMM|CHAUSSEE)\s+\d{1,5}[A-Z]?\b/i,
  });
  const PHONE_CANDIDATE = /(?<![\w-])\+?\d[\d ()./-]{7,}\d(?![\w-])/g;
  const ISO_DATE_OR_TIME = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;
  const SENSITIVE_NOTES = /\b(?:PNR|BOOKING|RESERVATION|TICKET|PAYMENT|CARD|PASSPORT|PASSWORD|SECRET|TOKEN|DIAGNOSIS|MEDICAL|HEALTH|DISABILITY|WHEELCHAIR|ACCESSIBILITY)(?:[-_ ]?(?:NUMBER|NO|REFERENCE|REF|CODE|ID))?\b/i;

  function firstMatch(value, patterns) {
    if (typeof value !== "string") {
      return "invalid value";
    }
    for (const [label, pattern] of Object.entries(patterns)) {
      if (pattern.test(value)) {
        return label;
      }
    }
    return null;
  }

  function locationProblem(value) {
    const direct = firstMatch(value, LOCATION_PATTERNS);
    if (direct) {
      return direct;
    }
    for (const match of String(value || "").matchAll(PHONE_CANDIDATE)) {
      const candidate = match[0];
      const digitCount = (candidate.match(/\d/g) || []).length;
      if (digitCount >= 9 && digitCount <= 15 && !ISO_DATE_OR_TIME.test(candidate)) {
        return "phone";
      }
    }
    return null;
  }

  function notesProblem(value) {
    return locationProblem(value) || (SENSITIVE_NOTES.test(value || "") ? "sensitive personal or travel detail" : null);
  }

  root.ReachByJourneyRequestPolicy = Object.freeze({ locationProblem, notesProblem });
})(globalThis);
