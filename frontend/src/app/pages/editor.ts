import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, Subscription } from 'rxjs';
import {
  ApiService,
  AtsScoreBreakdown,
  AtsScoreResult,
  BaseResumeDto,
} from '../api.service';
import { AtsScorePanelComponent } from '../components/ats-score-panel/ats-score-panel';
import { SkillGapsPanelComponent } from '../components/skill-gaps-panel/skill-gaps-panel';

/** Serialize a structured BaseResumeDto to plain text for ATS scoring. */
function resumeToText(dto: BaseResumeDto): string {
  const lines: string[] = [];

  lines.push(dto.nome ?? '');
  if (dto.email) lines.push(dto.email);
  if (dto.telefone) lines.push(dto.telefone);
  if (dto.cidade) lines.push(dto.cidade);
  if (dto.resumo) lines.push(dto.resumo);

  if (dto.experiencias?.length) {
    lines.push('Experiência');
    for (const exp of dto.experiencias) {
      lines.push(`${exp.cargo} - ${exp.empresa}`);
      for (const b of exp.bullets ?? []) lines.push(`- ${b}`);
    }
  }

  if (dto.habilidades?.length) {
    lines.push('Habilidades');
    lines.push(dto.habilidades.join(', '));
  }

  if (dto.educacao?.length) {
    lines.push('Educação');
    for (const edu of dto.educacao) lines.push(`${edu.curso} - ${edu.instituicao}`);
  }

  if (dto.idiomas?.length) {
    lines.push('Idiomas');
    for (const lang of dto.idiomas) lines.push(`${lang.idioma} - ${lang.nivel}`);
  }

  if (dto.projetos?.length) {
    lines.push('Projetos');
    for (const proj of dto.projetos) {
      lines.push(`${proj.nome}: ${proj.descricao}`);
      if (proj.tecnologias?.length) lines.push(`- ${proj.tecnologias.join(', ')}`);
    }
  }

  return lines.filter(Boolean).join('\n');
}

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [ReactiveFormsModule, AtsScorePanelComponent, SkillGapsPanelComponent],
  templateUrl: './editor.html',
  styleUrl: './editor.css',
})
export class Editor implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ─── Loading state ────────────────────────────────────────────────────────
  readonly loading = signal(true);
  readonly loadError = signal(false);

  // ─── Navigation / export state ────────────────────────────────────────────
  readonly hasExported = signal(false);
  readonly showConfirmDialog = signal(false);
  readonly isExportingPdf = signal(false);
  readonly isExportingDocx = signal(false);
  // ─── Toast state ─────────────────────────────────────────────────────────
  readonly toastMessage = signal('');
  readonly toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  // ─── ATS panel state ──────────────────────────────────────────────────────
  readonly scoreBefore = signal<number | null>(null);
  readonly scoreAfter = signal<number | null>(null);
  readonly breakdownBefore = signal<AtsScoreBreakdown | null>(null);
  readonly breakdownAfter = signal<AtsScoreBreakdown | null>(null);
  readonly jobDescription = signal('');
  readonly hasError = signal(false);
  readonly isSaving = signal(false);
  readonly saveMessage = signal<string | null>(null);

  // ─── Skill Gaps signals ───────────────────────────────────────────────────
  readonly matchedSkills = signal<string[]>([]);
  readonly missingSkills = signal<string[]>([]);
  readonly hasBaseResume = signal<boolean | null>(null);

  // ─── Skills (outside form) ────────────────────────────────────────────────
  habilidades: string[] = [];
  readonly skillInput = signal('');

  // ─── Project tech inputs ──────────────────────────────────────────────────
  projetoTechInputs: string[] = [];

  // ─── Reactive form ────────────────────────────────────────────────────────
  form = this.fb.group({
    nome:         [''],
    email:        [''],
    telefone:     [''],
    cidade:       [''],
    linkedin:     [''],
    github:       [''],
    resumo:       [''],
    experiencias: this.fb.array([]),
    educacao:     this.fb.array([]),
    idiomas:      this.fb.array([]),
    projetos:     this.fb.array([]),
  });

  private formSub: Subscription | null = null;
  private readonly beforeUnloadHandler = () => this.flushSave();

  // ─── FormArray getters ────────────────────────────────────────────────────
  get experiencias(): FormArray { return this.form.get('experiencias') as FormArray; }
  get educacao(): FormArray     { return this.form.get('educacao')     as FormArray; }
  get idiomas(): FormArray      { return this.form.get('idiomas')      as FormArray; }
  get projetos(): FormArray     { return this.form.get('projetos')     as FormArray; }

  ngOnInit(): void {
    const storedJob = sessionStorage.getItem('lastJobDescription') ?? '';
    this.jobDescription.set(storedJob);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
    this.loadScores();
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
  }

  // ─── Load resume and scores ───────────────────────────────────────────────
  private loadScores(): void {
    this.loading.set(true);
    this.api.getGeneratedResume().subscribe({
      next: (generated) => {
        this.loading.set(false);
        if (!generated) {
          this.loadError.set(true);
          return;
        }

        this.populateForm(generated.resume);
        this.matchedSkills.set(generated.matchedSkills ?? []);
        this.missingSkills.set(generated.missingSkills ?? []);

        const jobDesc = this.jobDescription();
        const afterText = resumeToText(generated.resume);

        if (afterText && jobDesc) {
          this.api.calculateAtsScore(afterText, jobDesc).subscribe({
            next: (r) => this.applyAfterScore(r),
            error: () => this.hasError.set(true),
          });
        }

        this.api.getBaseResume().subscribe({
          next: (base) => {
            this.hasBaseResume.set(base !== null);
            if (base && jobDesc) {
              const beforeText = resumeToText(base);
              this.api.calculateAtsScore(beforeText, jobDesc).subscribe({
                next: (r) => this.applyBeforeScore(r),
                error: () => { /* before score stays null */ },
              });
            }
          },
          error: () => this.hasBaseResume.set(false),
        });

        // Start auto-save after form is populated
        this.formSub = this.form.valueChanges
          .pipe(debounceTime(800))
          .subscribe(() => this.autoSave());
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(true);
      },
    });
  }

  // ─── Populate form from DTO ───────────────────────────────────────────────
  private populateForm(dto: BaseResumeDto): void {
    while (this.experiencias.length) this.experiencias.removeAt(0);
    while (this.educacao.length) this.educacao.removeAt(0);
    while (this.idiomas.length) this.idiomas.removeAt(0);
    while (this.projetos.length) this.projetos.removeAt(0);
    this.projetoTechInputs = [];
    this.habilidades = [...(dto.habilidades ?? [])];

    this.form.patchValue({
      nome:     dto.nome ?? '',
      email:    dto.email ?? '',
      telefone: dto.telefone ?? '',
      cidade:   dto.cidade ?? '',
      linkedin: dto.linkedIn ?? '',
      github:   dto.gitHub ?? '',
      resumo:   dto.resumo ?? '',
    }, { emitEvent: false });

    for (const exp of dto.experiencias ?? []) {
      const group = this.newExperienciaGroup();
      group.patchValue({
        empresa:    exp.empresa ?? '',
        cargo:      exp.cargo ?? '',
        dataInicio: exp.dataInicio ?? '',
        dataFim:    exp.dataFim ?? '',
        atualmente: exp.atualmente ?? false,
      }, { emitEvent: false });
      const bullets = group.get('bullets') as FormArray;
      while (bullets.length) bullets.removeAt(0);
      const bulletList = exp.bullets?.length ? exp.bullets : [''];
      for (const b of bulletList) {
        bullets.push(this.fb.control(b), { emitEvent: false });
      }
      if (exp.atualmente) group.get('dataFim')!.disable();
      this.experiencias.push(group, { emitEvent: false });
    }

    for (const edu of dto.educacao ?? []) {
      const group = this.newEducacaoGroup();
      group.patchValue(edu, { emitEvent: false });
      this.educacao.push(group, { emitEvent: false });
    }

    for (const lang of dto.idiomas ?? []) {
      const group = this.newIdiomaGroup();
      group.patchValue(lang, { emitEvent: false });
      this.idiomas.push(group, { emitEvent: false });
    }

    for (const proj of dto.projetos ?? []) {
      const group = this.newProjetoGroup();
      group.patchValue({
        nome:        proj.nome ?? '',
        descricao:   proj.descricao ?? '',
        link:        proj.link ?? '',
        tecnologias: proj.tecnologias ?? [],
      }, { emitEvent: false });
      this.projetos.push(group, { emitEvent: false });
      this.projetoTechInputs.push('');
    }
  }

  // ─── Convert form to DTO ──────────────────────────────────────────────────
  private formToDto(): BaseResumeDto {
    const v = this.form.getRawValue();
    return {
      nome:     v.nome ?? '',
      email:    v.email ?? '',
      telefone: v.telefone ?? '',
      cidade:   v.cidade ?? '',
      linkedIn: v.linkedin ?? '',
      gitHub:   v.github ?? '',
      resumo:   v.resumo ?? '',
      habilidades: [...this.habilidades],
      experiencias: this.experiencias.controls.map((ctrl) => {
        const e = (ctrl as FormGroup).getRawValue();
        return {
          empresa:    e.empresa,
          cargo:      e.cargo,
          dataInicio: e.dataInicio,
          dataFim:    e.atualmente ? null : e.dataFim,
          atualmente: e.atualmente,
          bullets:    (e.bullets as string[]).filter(Boolean),
        };
      }),
      educacao: this.educacao.controls.map((ctrl) => (ctrl as FormGroup).getRawValue()),
      idiomas:  this.idiomas.controls.map((ctrl) => (ctrl as FormGroup).getRawValue()),
      projetos: this.projetos.controls.map((ctrl) => {
        const p = (ctrl as FormGroup).getRawValue();
        return { ...p, tecnologias: p.tecnologias ?? [] };
      }),
    };
  }

  // ─── Auto-save (debounced) ────────────────────────────────────────────────
  private autoSave(): void {
    const dto = this.formToDto();
    this.api.saveGeneratedResume(dto).subscribe({ error: () => { /* silent */ } });
  }

  private flushSave(): void {
    const dto = this.formToDto();
    fetch('http://localhost:5000/api/generated-resume', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
      keepalive: true,
    }).catch(() => { /* ignore */ });
  }

  // ─── Score helpers ────────────────────────────────────────────────────────
  private applyAfterScore(result: AtsScoreResult): void {
    this.scoreAfter.set(result.totalScore);
    this.breakdownAfter.set(result.breakdown);
    this.hasError.set(false);
  }

  private applyBeforeScore(result: AtsScoreResult): void {
    this.scoreBefore.set(result.totalScore);
    this.breakdownBefore.set(result.breakdown);
  }

  // ─── "Atualizar Score" ────────────────────────────────────────────────────
  save(): void {
    this.isSaving.set(true);
    this.saveMessage.set(null);

    const text = resumeToText(this.formToDto());
    const jobDesc = this.jobDescription();

    if (text && jobDesc) {
      this.api.calculateAtsScore(text, jobDesc).subscribe({
        next: (result) => {
          this.applyAfterScore(result);
          this.isSaving.set(false);
          this.saveMessage.set('Score recalculado.');
        },
        error: () => {
          this.hasError.set(true);
          this.isSaving.set(false);
        },
      });
    } else {
      this.isSaving.set(false);
    }
  }

  onRetry(): void {
    this.hasError.set(false);
    this.loadScores();
  }

  // ─── "Gerar Novo Currículo" ───────────────────────────────────────────────
  onGerarNovoCurriculo(): void {
    if (this.hasExported()) {
      this.router.navigate(['/gerar']);
    } else {
      this.showConfirmDialog.set(true);
    }
  }

  confirmLeave(): void {
    this.showConfirmDialog.set(false);
    sessionStorage.setItem('editorRedirectMessage', 'Gerando novo currículo a partir do currículo base.');
    this.router.navigate(['/gerar']);
  }

  cancelLeave(): void {
    this.showConfirmDialog.set(false);
  }

  // ─── Export handlers ──────────────────────────────────────────────────────
  onExportPdf(): void {
    const dto = this.formToDto();
    const cargoDesejado = dto.experiencias?.[0]?.cargo?.trim() || 'Curriculo';
    this.isExportingPdf.set(true);
    this.api.exportPdf(dto, cargoDesejado).subscribe({
      next: (blob) => {
        const today = new Date().toISOString().split('T')[0];
        const slug = cargoDesejado.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        this.triggerDownload(blob, `curriculo-${slug}-${today}.pdf`);
        this.hasExported.set(true);
        this.isExportingPdf.set(false);
        this.showToast('Arquivo baixado com sucesso!', 'success');
      },
      error: () => {
        this.isExportingPdf.set(false);
        this.showToast('Erro ao gerar o arquivo. Tente novamente.', 'error');
      },
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastTimer = setTimeout(() => this.toastMessage.set(''), 3000);
  }

  onExportDocx(): void {
    const dto = this.formToDto();
    const cargoDesejado = dto.experiencias?.[0]?.cargo?.trim() || 'Curriculo';
    this.isExportingDocx.set(true);
    this.api.exportDocx(dto, cargoDesejado).subscribe({
      next: (blob) => {
        const today = new Date().toISOString().split('T')[0];
        const slug = cargoDesejado.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        this.triggerDownload(blob, `curriculo-${slug}-${today}.docx`);
        this.hasExported.set(true);
        this.isExportingDocx.set(false);
        this.showToast('Arquivo baixado com sucesso!', 'success');
      },
      error: () => {
        this.isExportingDocx.set(false);
        this.showToast('Erro ao gerar o arquivo. Tente novamente.', 'error');
      },
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ─── FormArray helpers ────────────────────────────────────────────────────
  private newExperienciaGroup(): FormGroup {
    return this.fb.group({
      empresa:    [''],
      cargo:      [''],
      dataInicio: [''],
      dataFim:    [''],
      atualmente: [false],
      bullets:    this.fb.array([this.fb.control('')]),
    });
  }

  addExperiencia(): void { this.experiencias.push(this.newExperienciaGroup()); }
  removeExperiencia(i: number): void { this.experiencias.removeAt(i); }

  getBullets(expIdx: number): FormArray {
    return this.experiencias.at(expIdx).get('bullets') as FormArray;
  }

  addBullet(expIdx: number): void { this.getBullets(expIdx).push(this.fb.control('')); }
  removeBullet(expIdx: number, bulletIdx: number): void {
    this.getBullets(expIdx).removeAt(bulletIdx);
  }

  toggleAtualmente(expIdx: number): void {
    const exp = this.experiencias.at(expIdx) as FormGroup;
    const atualmente = exp.get('atualmente')!;
    const dataFim = exp.get('dataFim')!;
    if (atualmente.value) {
      dataFim.disable();
      dataFim.setValue('');
    } else {
      dataFim.enable();
    }
  }

  private newEducacaoGroup(): FormGroup {
    return this.fb.group({
      instituicao: [''],
      curso:       [''],
      grau:        [''],
      dataInicio:  [''],
      dataFim:     [''],
    });
  }

  addEducacao(): void { this.educacao.push(this.newEducacaoGroup()); }
  removeEducacao(i: number): void { this.educacao.removeAt(i); }

  private newIdiomaGroup(): FormGroup {
    return this.fb.group({ idioma: [''], nivel: [''] });
  }

  addIdioma(): void { this.idiomas.push(this.newIdiomaGroup()); }
  removeIdioma(i: number): void { this.idiomas.removeAt(i); }

  private newProjetoGroup(): FormGroup {
    return this.fb.group({
      nome:        [''],
      descricao:   [''],
      tecnologias: [[] as string[]],
      link:        [''],
    });
  }

  addProjeto(): void {
    this.projetos.push(this.newProjetoGroup());
    this.projetoTechInputs.push('');
  }

  removeProjeto(i: number): void {
    this.projetos.removeAt(i);
    this.projetoTechInputs.splice(i, 1);
  }

  addTecnologia(idx: number): void {
    const input = this.projetoTechInputs[idx]?.trim();
    if (!input) return;
    const ctrl = this.projetos.at(idx).get('tecnologias')!;
    ctrl.setValue([...(ctrl.value as string[]), input]);
    this.projetoTechInputs[idx] = '';
  }

  removeTecnologia(projetoIdx: number, techIdx: number): void {
    const ctrl = this.projetos.at(projetoIdx).get('tecnologias')!;
    const arr = [...(ctrl.value as string[])];
    arr.splice(techIdx, 1);
    ctrl.setValue(arr);
  }

  addSkill(): void {
    const skill = this.skillInput().trim();
    if (!skill) return;
    this.habilidades = [...this.habilidades, skill];
    this.skillInput.set('');
  }

  addSkillOnEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSkill();
    }
  }

  removeSkill(i: number): void {
    this.habilidades = this.habilidades.filter((_, idx) => idx !== i);
  }
}

