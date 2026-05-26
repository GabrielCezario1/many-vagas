import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-gerar',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gerar.html',
  styleUrl: './gerar.css',
})
export class Gerar implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private loadingInterval: ReturnType<typeof setInterval> | null = null;

  // ─── Task 6.2 – Form fields ────────────────────────────────────────────────
  readonly jobDescription = signal('');
  readonly language = signal<'pt-br' | 'en' | ''>('');
  readonly languageError = signal(false);

  // ─── Task 6.3 – Loading state ──────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly loadingMessages = [
    'Analisando a vaga...',
    'Aplicando fórmula XYZ...',
    'Otimizando keywords...',
  ];
  readonly loadingMessageIndex = signal(0);

  // ─── Task 6.5 – Error signal ──────────────────────────────────────────────
  readonly errorMessage = signal<string | null>(null);

  // ─── Task 6.7/6.8 – Warning signals ───────────────────────────────────────
  readonly noBaseResume = signal(false);
  readonly hasPreviousResume = signal(false);

  // ─── Task 6.1 – Redirect message from sessionStorage ──────────────────────
  readonly redirectMessage = signal<string | null>(null);

  ngOnInit(): void {
    // Redirect message from editor guard
    const message = sessionStorage.getItem('editorRedirectMessage');
    if (message) {
      this.redirectMessage.set(message);
      sessionStorage.removeItem('editorRedirectMessage');
    }

    // Task 6.7 – Non-blocking warning if base resume is absent
    this.api.baseResumeExists().subscribe({
      next: ({ exists }) => this.noBaseResume.set(!exists),
      error: () => { /* silently ignore */ },
    });

    // Task 6.8 – Non-blocking warning if a generated resume already exists
    this.api.generatedResumeExists().subscribe({
      next: ({ exists }) => this.hasPreviousResume.set(exists),
      error: () => { /* silently ignore */ },
    });
  }

  ngOnDestroy(): void {
    this.clearLoadingInterval();
  }

  // ─── Task 6.1/6.4 – Generate action ───────────────────────────────────────
  generate(): void {
    // Task 6.2 – Language validation
    if (!this.language()) {
      this.languageError.set(true);
      return;
    }
    this.languageError.set(false);
    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.loadingMessageIndex.set(0);

    // Task 6.3 – Cycle loading messages every 3 s
    this.loadingInterval = setInterval(() => {
      this.loadingMessageIndex.update(i => (i + 1) % this.loadingMessages.length);
    }, 3000);

    this.api.generateResume(this.jobDescription(), this.language() as string).subscribe({
      next: () => {
        // Task 6.4 – Redirect to /editor on success
        // Persist job description so the editor can calculate ATS scores
        sessionStorage.setItem('lastJobDescription', this.jobDescription());
        this.clearLoadingInterval();
        this.isLoading.set(false);
        this.router.navigate(['/editor']);
      },
      // Task 6.5 – Error handling (6.6: form values preserved via signals)
      error: (err: Error) => {
        this.clearLoadingInterval();
        this.isLoading.set(false);
        this.errorMessage.set(err.message);
      },
    });
  }

  private clearLoadingInterval(): void {
    if (this.loadingInterval !== null) {
      clearInterval(this.loadingInterval);
      this.loadingInterval = null;
    }
  }
}
