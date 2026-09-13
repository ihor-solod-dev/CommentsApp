export function formatScore(score: number): string {
    const abs = Math.abs(score);
    const sign = score < 0 ? '-' : '';

    if (abs >= 1_000_000) {
        const val = Math.floor(abs / 100_000) / 10;
        return `${sign}${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}М`;
    }
    if (abs >= 1_000) {
        return `${sign}${Math.floor(abs / 1_000)}К`;
    }
    return score.toString();
}