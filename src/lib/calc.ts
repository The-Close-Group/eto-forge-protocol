// Basic financial calculations for staking/rewards

export function simpleInterestReward(principal: number, apyPercent: number, days: number) {
  const apy = apyPercent / 100;
  return principal * apy * (days / 365);
}

export function compoundDailyReward(principal: number, apyPercent: number, days: number) {
  const apy = apyPercent / 100;
  const factor = Math.pow(1 + apy, days / 365);
  return principal * (factor - 1);
}

export function dailyFromTotal(totalReward: number, days: number) {
  return days > 0 ? totalReward / days : 0;
}
