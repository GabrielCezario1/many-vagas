import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';

// ─── Task 2.1 – BaseResumeDto type ───────────────────────────────────────────
export interface ExperienciaDto {
  empresa: string;
  cargo: string;
  dataInicio: string;
  dataFim: string | null;
  atualmente: boolean;
  bullets: string[];
}

export interface EducacaoDto {
  instituicao: string;
  curso: string;
  grau: string;
  dataInicio: string;
  dataFim: string;
}

export interface IdiomaDto {
  idioma: string;
  nivel: string;
}

export interface ProjetoDto {
  nome: string;
  descricao: string;
  tecnologias: string[];
  link: string;
}

export interface GenerateResumeResponse {
  matchedSkills: string[];
  missingSkills: string[];
  atsScore: number;
}

// ─── Task 4.1 – ATS Score interfaces ───────────────────────────────────────
export interface AtsScoreBreakdown {
  keywordMatch: number;
  actionVerbs: number;
  quantification: number;
  completeness: number;
}

export interface AtsScoreResult {
  totalScore: number;
  breakdown: AtsScoreBreakdown;
}

export interface GeneratedResumeDto {
  resume: BaseResumeDto;
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  language: string;
  generatedAt: string;
}

export interface BaseResumeDto {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  linkedIn: string;
  gitHub: string;
  resumo: string;
  experiencias: ExperienciaDto[];
  educacao: EducacaoDto[];
  habilidades: string[];
  idiomas: IdiomaDto[];
  projetos: ProjetoDto[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:5000';
  private readonly http = inject(HttpClient);

  /** Returns `true` if a BaseResume record exists in the backend database. */
  baseResumeExists(): Observable<{ exists: boolean }> {
    return this.http
      .get<{ exists: boolean }>(`${this.baseUrl}/api/base-resume/exists`)
      .pipe(catchError(this.handleError));
  }

  /** Returns `true` if a GeneratedResume record exists in the backend database. */
  generatedResumeExists(): Observable<{ exists: boolean }> {
    return this.http
      .get<{ exists: boolean }>(`${this.baseUrl}/api/generated-resume/exists`)
      .pipe(catchError(this.handleError));
  }

  // ─── Task 2.2 – getBaseResume ──────────────────────────────────────────────
  /** Returns the stored resume data, or `null` if none exists yet (HTTP 404). */
  getBaseResume(): Observable<BaseResumeDto | null> {
    return this.http
      .get<BaseResumeDto>(`${this.baseUrl}/api/base-resume`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) return of(null);
          return this.handleError(error);
        })
      );
  }

  // ─── Task 2.3 – saveBaseResume ─────────────────────────────────────────────
  /** Persists (upsert) the resume data. */
  saveBaseResume(data: BaseResumeDto): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/api/base-resume`, data)
      .pipe(catchError(this.handleError));
  }

  // ─── Task 5.1 – generateResume ─────────────────────────────────────────────
  /** Calls the AI generation endpoint and returns skill analysis result. */
  generateResume(jobDescription: string, language: string): Observable<GenerateResumeResponse> {
    return this.http
      .post<GenerateResumeResponse>(`${this.baseUrl}/api/resume/generate`, { jobDescription, language })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 0) {
            return throwError(() => new Error('Erro de conexão. Verifique se o servidor está rodando e tente novamente.'));
          }
          if (error.status === 504) {
            return throwError(() => new Error('A geração demorou mais que o esperado. Tente novamente.'));
          }
          if (error.status === 502) {
            return throwError(() => new Error('Não foi possível gerar o currículo. Verifique a configuração da IA e tente novamente.'));
          }
          return throwError(() => new Error(`Erro do servidor: ${error.status} ${error.statusText}`));
        })
      );
  }

  // ─── Task 5.3 – getGeneratedResume ─────────────────────────────────────────
  /** Returns the stored generated resume, or `null` if none exists yet (HTTP 404). */
  getGeneratedResume(): Observable<GeneratedResumeDto | null> {
    return this.http
      .get<GeneratedResumeDto>(`${this.baseUrl}/api/generated-resume`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) return of(null);
          return this.handleError(error);
        })
      );
  }

  // ─── Task 4.2 – calculateAtsScore ──────────────────────────────────────────
  /** Calls POST /api/ats-score and returns the score result. */
  calculateAtsScore(resumeText: string, jobDescription: string): Observable<AtsScoreResult> {
    return this.http
      .post<AtsScoreResult>(`${this.baseUrl}/api/ats-score`, { resumeText, jobDescription })
      .pipe(catchError(this.handleError));
  }

  // ─── editor-curriculo – saveGeneratedResume ─────────────────────────────────
  /** Persists editor edits to the generated resume. */
  saveGeneratedResume(data: BaseResumeDto): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/api/generated-resume`, data)
      .pipe(catchError(this.handleError));
  }

  // ─── F-07 – exportPdf ────────────────────────────────────────────────────────
  /** Generates and downloads a PDF for the given resume content. */
  exportPdf(data: BaseResumeDto, cargoDesejado: string): Observable<Blob> {
    return this.http
      .post(`${this.baseUrl}/api/resume/export/pdf`, { ...data, cargoDesejado }, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  // ─── F-08 – exportDocx ──────────────────────────────────────────────────────
  /** Generates and downloads a DOCX for the given resume content. */
  exportDocx(data: BaseResumeDto, cargoDesejado: string): Observable<Blob> {
    return this.http
      .post(`${this.baseUrl}/api/resume/export/docx`, { ...data, cargoDesejado }, { responseType: 'blob' })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      console.error(
        '[ManyVagas] Não foi possível conectar ao backend. ' +
        'Verifique se o servidor está rodando em http://localhost:5000.',
        error.error
      );
      return throwError(() => new Error(
        'Não foi possível conectar ao servidor. Tente novamente mais tarde.'
      ));
    }
    return throwError(() => new Error(`Erro do servidor: ${error.status} ${error.statusText}`));
  }
}

