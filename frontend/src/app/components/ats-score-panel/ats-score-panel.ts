import { Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AtsScoreBreakdown } from '../../api.service';

@Component({
  selector: 'app-ats-score-panel',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './ats-score-panel.html',
  styleUrl: './ats-score-panel.css',
})
export class AtsScorePanelComponent {
  // Task 5.2 – inputs
  scoreBefore = input<number | null>(null);
  scoreAfter = input<number | null>(null);
  breakdownBefore = input<AtsScoreBreakdown | null>(null);
  breakdownAfter = input<AtsScoreBreakdown | null>(null);
  jobDescription = input<string>('');
  hasError = input<boolean>(false);

  // Task 5.7 – output event for retry
  retry = output<void>();

  // Task 5.3 – scoreLabel by range
  scoreLabelBefore = computed(() => this.labelForScore(this.scoreBefore()));
  scoreLabelAfter = computed(() => this.labelForScore(this.scoreAfter()));

  // Task 5.4 – scoreColor by range
  scoreColorBefore = computed(() => this.colorForScore(this.scoreBefore()));
  scoreColorAfter = computed(() => this.colorForScore(this.scoreAfter()));

  scoreDiff = computed(() => {
    const before = this.scoreBefore();
    const after = this.scoreAfter();
    if (before === null || after === null) return null;
    return after - before;
  });

  labelForScore(score: number | null): string {
    if (score === null) return '—';
    if (score <= 40) return 'Crítico';
    if (score <= 60) return 'Fraco';
    if (score <= 80) return 'Bom';
    return 'Excelente';
  }

  colorForScore(score: number | null): string {
    if (score === null) return '';
    if (score <= 40) return 'red';
    if (score <= 60) return 'orange';
    if (score <= 80) return 'yellow';
    return 'green';
  }

  onRetry(): void {
    this.retry.emit();
  }
}
