/**
 * Accumulates validation issues during a fetch run and renders
 * data/fetch-report.md — the owner's first stop when something looks off.
 */

export interface ReportIssue {
  gameId: number;
  gameName: string;
  level: 'warning' | 'error';
  message: string;
}

export interface ReportSummary {
  geeklistId: number;
  itemsInList: number;
  gamesWritten: number;
  expansions: number;
  coversDownloaded: number;
  coversSkipped: number;
  coversPruned: number;
  coverFailures: number;
}

const bggLink = (id: number) => `https://boardgamegeek.com/boardgame/${id}`;

export class Report {
  private issues: ReportIssue[] = [];

  add(issue: ReportIssue): void {
    this.issues.push(issue);
  }

  addMany(
    gameId: number,
    gameName: string,
    entries: { level: 'warning' | 'error'; message: string }[]
  ): void {
    for (const e of entries) this.issues.push({ gameId, gameName, ...e });
  }

  get errorCount(): number {
    return this.issues.filter((i) => i.level === 'error').length;
  }

  get warningCount(): number {
    return this.issues.filter((i) => i.level === 'warning').length;
  }

  render(summary: ReportSummary, generatedAt: string): string {
    const lines: string[] = [];
    lines.push(`# Fetch report`);
    lines.push('');
    lines.push(`_Generated ${generatedAt}_`);
    lines.push('');
    lines.push(`## Summary`);
    lines.push('');
    lines.push(`| Metric | Count |`);
    lines.push(`| --- | ---: |`);
    lines.push(`| GeekList ID | ${summary.geeklistId} |`);
    lines.push(`| Items in list | ${summary.itemsInList} |`);
    lines.push(`| Games written | ${summary.gamesWritten} |`);
    lines.push(`| — of which expansions | ${summary.expansions} |`);
    lines.push(`| Covers downloaded | ${summary.coversDownloaded} |`);
    lines.push(`| Covers reused | ${summary.coversSkipped} |`);
    lines.push(`| Covers pruned | ${summary.coversPruned} |`);
    lines.push(`| Cover failures | ${summary.coverFailures} |`);
    lines.push(`| Warnings | ${this.warningCount} |`);
    lines.push(`| Errors | ${this.errorCount} |`);
    lines.push('');

    const errors = this.issues.filter((i) => i.level === 'error');
    const warnings = this.issues.filter((i) => i.level === 'warning');

    lines.push(`## Errors (${errors.length})`);
    lines.push('');
    if (errors.length === 0) lines.push('None. 🎉');
    else for (const i of errors) lines.push(this.renderIssue(i));
    lines.push('');

    lines.push(`## Warnings (${warnings.length})`);
    lines.push('');
    if (warnings.length === 0) lines.push('None. 🎉');
    else for (const i of warnings) lines.push(this.renderIssue(i));
    lines.push('');

    return lines.join('\n');
  }

  private renderIssue(i: ReportIssue): string {
    return `- **${i.gameName}** ([${i.gameId}](${bggLink(i.gameId)})) — ${i.message}`;
  }
}
