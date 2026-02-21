import type { AlertCategory } from '../types';

export const AI_SOLUTIONS: Record<AlertCategory, Array<{
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'Low' | 'Medium' | 'High';
  timeframe: string;
  confidence: number;
}>> = {
  audience_overlap: [
    { id: 'ao-1', title: 'Implement Negative Audience Exclusions', description: 'Create audience exclusion lists between competing campaigns to eliminate self-competition. Use platform-native exclusion features to ensure ads from different campaigns don\'t target the same users.', expectedImpact: 'Reduce CPM by 15-25% and improve overall portfolio efficiency by eliminating bid competition between your own campaigns.', effort: 'Low', timeframe: '1-2 days', confidence: 92 },
    { id: 'ao-2', title: 'Consolidate Overlapping Campaigns', description: 'Merge campaigns targeting similar audiences into a single, larger campaign with multiple ad sets. This improves learning efficiency and allows the algorithm to optimize across a larger budget pool.', expectedImpact: 'Improve ROAS by 0.3-0.5x through better algorithm learning and reduced audience fragmentation.', effort: 'Medium', timeframe: '3-5 days', confidence: 87 },
    { id: 'ao-3', title: 'Implement Sequential Messaging', description: 'Instead of competing for the same audience, restructure campaigns into a sequential funnel where each campaign targets users at different stages of their journey.', expectedImpact: 'Increase conversion rates by 20-35% through coordinated messaging that guides users through the purchase journey.', effort: 'High', timeframe: '1-2 weeks', confidence: 78 }
  ],
  lifecycle_stall: [
    { id: 'ls-1', title: 'Priority Resource Reallocation', description: 'Identify and reassign team members from lower-priority projects to unblock stalled campaigns. Focus on removing specific blockers like creative approval, technical setup, or stakeholder sign-off.', expectedImpact: 'Accelerate campaign launch by 40-60%, capturing time-sensitive revenue opportunities.', effort: 'Medium', timeframe: '2-3 days', confidence: 89 },
    { id: 'ls-2', title: 'Streamline Approval Workflow', description: 'Implement parallel approval processes and set up automated reminders for pending approvals. Create fast-track procedures for campaigns with imminent deadlines.', expectedImpact: 'Reduce average approval time by 50%, preventing future launch delays.', effort: 'Medium', timeframe: '1 week', confidence: 84 },
    { id: 'ls-3', title: 'Deploy Campaign Templates', description: 'Use pre-approved campaign templates for common campaign types to skip redundant approval cycles. Templates can include pre-approved creative frameworks and targeting parameters.', expectedImpact: 'Cut setup time by 60% for future campaigns while maintaining quality standards.', effort: 'High', timeframe: '2-3 weeks', confidence: 76 }
  ],
  budget_pacing: [
    { id: 'bp-1', title: 'Implement Dynamic Budget Caps', description: 'Set up automated daily budget caps that adjust based on performance metrics. Campaigns exceeding efficiency thresholds get more budget, while underperformers are automatically throttled.', expectedImpact: 'Prevent budget overruns while maximizing spend on high-performing campaigns, improving overall ROAS by 0.2-0.4x.', effort: 'Low', timeframe: '1 day', confidence: 94 },
    { id: 'bp-2', title: 'Activate Budget Reallocation Protocol', description: 'Pause or reduce budgets for campaigns approaching exhaustion and redistribute to campaigns with headroom and strong performance. Prioritize based on ROAS and strategic importance.', expectedImpact: 'Extend campaign runtime by 2-3 weeks while maintaining or improving overall portfolio performance.', effort: 'Low', timeframe: 'Immediate', confidence: 91 },
    { id: 'bp-3', title: 'Request Strategic Budget Increase', description: 'For high-performing campaigns nearing budget limits, prepare a data-backed case for budget increase. Include projected revenue and ROAS to justify additional investment.', expectedImpact: 'Capture additional $25-50K revenue opportunity from proven high-performers.', effort: 'Medium', timeframe: '3-5 days', confidence: 82 }
  ],
  roas_misalignment: [
    { id: 'rm-1', title: 'Audience Targeting Refinement', description: 'Analyze audience performance data and exclude underperforming segments. Focus budget on audiences demonstrating strong engagement and conversion signals.', expectedImpact: 'Improve ROAS by 0.5-1.0x by concentrating spend on proven audience segments.', effort: 'Low', timeframe: '2-3 days', confidence: 88 },
    { id: 'rm-2', title: 'Creative Performance Optimization', description: 'Rotate in fresh creative assets and pause underperforming ad variations. A/B test new messaging angles that better resonate with the funnel stage objectives.', expectedImpact: 'Lift CTR by 25-40% and improve conversion rates through better creative-audience fit.', effort: 'Medium', timeframe: '1 week', confidence: 85 },
    { id: 'rm-3', title: 'Bidding Strategy Adjustment', description: 'Switch from aggressive bidding to value-based or ROAS-target bidding. Let the algorithm optimize for profitability rather than just conversions.', expectedImpact: 'Align campaign performance with business objectives, potentially improving ROAS by 0.3-0.6x.', effort: 'Low', timeframe: '1-2 days', confidence: 83 }
  ],
  attribution_leak: [
    { id: 'al-1', title: 'Implement Incrementality Testing', description: 'Set up holdout tests to measure the true incremental value of each channel. This reveals which channels are actually driving new conversions vs. claiming credit for organic traffic.', expectedImpact: 'Identify 15-30% of budget that may be misallocated based on flawed attribution.', effort: 'High', timeframe: '2-4 weeks', confidence: 79 },
    { id: 'al-2', title: 'Review Attribution Model', description: 'Evaluate current attribution model (last-click, linear, data-driven) and consider switching to a model that better reflects the customer journey for your business.', expectedImpact: 'More accurate budget allocation decisions, potentially improving overall efficiency by 10-20%.', effort: 'Medium', timeframe: '1-2 weeks', confidence: 81 },
    { id: 'al-3', title: 'Cross-Channel Budget Rebalancing', description: 'Based on attribution analysis, shift budget from over-credited channels to under-credited ones. Start with small percentage shifts and monitor impact.', expectedImpact: 'Optimize channel mix for true performance, capturing missed opportunities in underinvested channels.', effort: 'Medium', timeframe: '1-2 weeks', confidence: 75 }
  ]
};
