#!/usr/bin/env node
/**
 * Cap campaigns with end date after 2028:
 * - Set end date and start date years to 2028 (same month/day).
 * - If start would be after end, set start = end (or end - 1 day).
 * - Ensure createdat is on or before start date.
 * Writes back to src/data/api.campaigns.cleaned.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '../src/data/api.campaigns.cleaned.json');

const CAP_YEAR = 2028;
const NULL_LONG = '-62135596800000';

function parseDate(field) {
  if (!field || !field.$date) return null;
  const d = field.$date;
  if (typeof d === 'string') return new Date(d);
  if (typeof d === 'object' && d.$numberLong) {
    const n = parseInt(d.$numberLong, 10);
    if (d.$numberLong === NULL_LONG) return null;
    return new Date(n);
  }
  return null;
}

function toISODate(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, '.000Z');
}

function setYearTo2028(d) {
  const out = new Date(d);
  out.setFullYear(CAP_YEAR);
  return out;
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
let updated = 0;

data.forEach((c) => {
  const endDate = parseDate(c.enddate);
  if (!endDate || endDate.getFullYear() <= CAP_YEAR) return;

  const startDate = parseDate(c.startdate);
  const createdDate = parseDate(c.createdat);

  let newEnd = setYearTo2028(endDate);
  let newStart = startDate ? setYearTo2028(startDate) : new Date(newEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

  if (newStart > newEnd) {
    newStart = new Date(newEnd.getTime() - 24 * 60 * 60 * 1000);
    if (newStart.getFullYear() < CAP_YEAR) newStart = new Date(CAP_YEAR, 0, 1);
  }

  let newCreated = createdDate ? new Date(createdDate) : newStart;
  if (newCreated > newStart) {
    newCreated = new Date(newStart);
  }

  c.enddate = { $date: toISODate(newEnd) };
  c.startdate = { $date: toISODate(newStart) };
  if (c.createdat && Object.keys(c.createdat).length) {
    c.createdat = { $date: toISODate(newCreated) };
  }
  updated++;
});

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log(`Capped ${updated} campaigns with end date after ${CAP_YEAR}.`);
