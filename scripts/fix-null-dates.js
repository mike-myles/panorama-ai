#!/usr/bin/env node
/**
 * Update the 40 "under development" campaigns with null start/end dates.
 * - Start date: creation date to creation date + 30 days (evenly distributed).
 * - End date: start date + 2 to 12 weeks (evenly distributed).
 * Writes back to src/data/api.campaigns.cleaned.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_PATH = path.join(__dirname, '../src/data/api.campaigns.cleaned.json');

const NULL_DATE = { $date: { $numberLong: '-62135596800000' } };

function isNullDate(field) {
  if (!field || !field.$date) return true;
  const d = field.$date;
  if (typeof d === 'object' && d.$numberLong === '-62135596800000') return true;
  if (typeof d === 'string' && (d === '' || d.startsWith('1970-01-01'))) return true;
  return false;
}

function parseCreatedAt(campaign) {
  const ca = campaign.createdat;
  if (!ca || !ca.$date) return null;
  const d = ca.$date;
  if (typeof d === 'object' && d.$numberLong) return new Date(parseInt(d.$numberLong, 10));
  if (typeof d === 'string') return new Date(d);
  return null;
}

function toISODate(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, '.000Z');
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const underDevNullDates = data.filter(
  (c) =>
    c.campaignstatus === 'under development' &&
    isNullDate(c.startdate) &&
    isNullDate(c.enddate)
);

if (underDevNullDates.length !== 40) {
  console.warn(`Expected 40 campaigns, found ${underDevNullDates.length}`);
}

const n = underDevNullDates.length;
const oneDay = 24 * 60 * 60 * 1000;

underDevNullDates.forEach((campaign, i) => {
  let createdAt = parseCreatedAt(campaign);
  if (!createdAt) {
    console.warn(`Campaign ${campaign._id} has no createdat, using now`);
    createdAt = new Date();
  }

  // Start: creation date + 0 to 30 days (evenly distributed)
  const startOffsetDays = n > 1 ? (i / (n - 1)) * 30 : 0;
  const startDate = new Date(createdAt.getTime() + startOffsetDays * oneDay);
  campaign.startdate = { $date: toISODate(startDate) };

  // End: start + 2 to 12 weeks (14 to 84 days, evenly distributed)
  const endOffsetDays = 14 + (n > 1 ? (i / (n - 1)) * 70 : 0);
  const endDate = new Date(startDate.getTime() + endOffsetDays * oneDay);
  campaign.enddate = { $date: toISODate(endDate) };
});

fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${n} campaigns with start and end dates.`);
