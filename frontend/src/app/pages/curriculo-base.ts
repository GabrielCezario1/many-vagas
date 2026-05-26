import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService, BaseResumeDto } from '../api.service';

const URL_PATTERN = /^https?:\/\/.+/;

@Component({
  selector: 'app-curriculo-base',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './curriculo-base.html',
  styleUrl: './curriculo-base.css',
})
export class CurriculoBase implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // ─── Task 3.1 – Root FormGroup with personal data + summary ──────────────
  form = this.fb.group({
    nome: ['', Validators.required],                                        // 4.1
    email: ['', [Validators.required, Validators.email]],                  // 4.1
    telefone: [''],
    cidade: [''],
    linkedin: ['', Validators.pattern(URL_PATTERN)],                       // 4.1
    github: ['', Validators.pattern(URL_PATTERN)],                         // 4.1
    resumo: [''],
    // FormArrays
    experiencias: this.fb.array([]),
    educacao: this.fb.array([]),
    idiomas: this.fb.array([]),
    projetos: this.fb.array([]),
  });

  // ─── Skills (task 3.6) — simple string array outside the form ─────────────
  habilidades: string[] = [];
  skillInput = signal('');

  // ─── Project tech inputs — one per project row ────────────────────────────
  projetoTechInputs: string[] = [];

  // ─── UI state signals ─────────────────────────────────────────────────────
  loading = signal(false);
  loadError = signal(false);
  saving = signal(false);
  // Task 4.3 – at-least-one-experience validation error
  noExperienciaError = signal(false);
  // Task 6.4 – inline toast
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // ─── FormArray getters ────────────────────────────────────────────────────
  get experiencias(): FormArray { return this.form.get('experiencias') as FormArray; }
  get educacao(): FormArray     { return this.form.get('educacao')     as FormArray; }
  get idiomas(): FormArray      { return this.form.get('idiomas')      as FormArray; }
  get projetos(): FormArray     { return this.form.get('projetos')     as FormArray; }

  // ─── Task 3.2 – Experiência helpers ──────────────────────────────────────
  private newExperienciaGroup(): FormGroup {
    return this.fb.group({
      empresa:    ['', Validators.required],
      cargo:      ['', Validators.required],
      dataInicio: [''],
      dataFim:    [''],
      atualmente: [false],
      bullets:    this.fb.array([this.fb.control('')]),
    });
  }

  addExperiencia(): void {
    this.experiencias.push(this.newExperienciaGroup());
    this.noExperienciaError.set(false);
  }

  removeExperiencia(index: number): void {
    this.experiencias.removeAt(index);
  }

  getBullets(expIndex: number): FormArray {
    return this.experiencias.at(expIndex).get('bullets') as FormArray;
  }

  addBullet(expIndex: number): void {
    this.getBullets(expIndex).push(this.fb.control(''));
  }

  removeBullet(expIndex: number, bulletIndex: number): void {
    this.getBullets(expIndex).removeAt(bulletIndex);
  }

  // ─── Task 4.2 – Toggle "Atualmente" ──────────────────────────────────────
  toggleAtualmente(expIndex: number): void {
    const exp = this.experiencias.at(expIndex) as FormGroup;
    const atualmente = exp.get('atualmente')!;
    const dataFim = exp.get('dataFim')!;
    if (atualmente.value) {
      dataFim.disable();
      dataFim.setValue('');
    } else {
      dataFim.enable();
    }
  }

  // ─── Task 3.3 – Educação helpers ─────────────────────────────────────────
  private newEducacaoGroup(): FormGroup {
    return this.fb.group({
      instituicao: [''],
      curso:       [''],
      grau:        [''],
      dataInicio:  [''],
      dataFim:     [''],
    });
  }

  addEducacao(): void  { this.educacao.push(this.newEducacaoGroup()); }
  removeEducacao(i: number): void { this.educacao.removeAt(i); }

  // ─── Task 3.4 – Idioma helpers ────────────────────────────────────────────
  private newIdiomaGroup(): FormGroup {
    return this.fb.group({ idioma: [''], nivel: [''] });
  }

  addIdioma(): void  { this.idiomas.push(this.newIdiomaGroup()); }
  removeIdioma(i: number): void { this.idiomas.removeAt(i); }

  // ─── Task 3.5 – Projeto helpers ───────────────────────────────────────────
  private newProjetoGroup(): FormGroup {
    return this.fb.group({
      nome:        [''],
      descricao:   [''],
      tecnologias: [[] as string[]],
      link:        ['', Validators.pattern(URL_PATTERN)],
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

  addTecnologia(projetoIndex: number): void {
    const input = this.projetoTechInputs[projetoIndex]?.trim();
    if (!input) return;
    const ctrl = this.projetos.at(projetoIndex).get('tecnologias')!;
    ctrl.setValue([...(ctrl.value as string[]), input]);
    this.projetoTechInputs[projetoIndex] = '';
  }

  removeTecnologia(projetoIndex: number, techIndex: number): void {
    const ctrl = this.projetos.at(projetoIndex).get('tecnologias')!;
    const updated = (ctrl.value as string[]).filter((_, i) => i !== techIndex);
    ctrl.setValue(updated);
  }

  // ─── Task 3.6 – Skills helpers ────────────────────────────────────────────
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

  removeSkill(index: number): void {
    this.habilidades = this.habilidades.filter((_, i) => i !== index);
  }

  // ─── Task 4.4 – isInvalid helper ─────────────────────────────────────────
  isInvalid(path: string): boolean {
    const ctrl = this.form.get(path);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  isArrayItemInvalid(arrayName: string, index: number, field: string): boolean {
    const ctrl = (this.form.get(arrayName) as FormArray).at(index).get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ─── Task 6.1 – ngOnInit: load existing resume ───────────────────────────
  ngOnInit(): void {
    this.loading.set(true);
    this.api.getBaseResume().subscribe({
      next: (data) => {
        if (data) this.patchForm(data);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(true);                                          // 6.2
        this.loading.set(false);
      },
    });
  }

  private patchForm(data: BaseResumeDto): void {
    this.form.patchValue({
      nome:     data.nome ?? '',
      email:    data.email ?? '',
      telefone: data.telefone ?? '',
      cidade:   data.cidade ?? '',
      linkedin: data.linkedIn ?? '',
      github:   data.gitHub ?? '',
      resumo:   data.resumo ?? '',
    });

    this.habilidades = data.habilidades ?? [];

    // Experiências
    (data.experiencias ?? []).forEach(exp => {
      const grp = this.newExperienciaGroup();
      grp.patchValue({
        empresa:    exp.empresa,
        cargo:      exp.cargo,
        dataInicio: exp.dataInicio,
        dataFim:    exp.dataFim ?? '',
        atualmente: exp.atualmente,
      });
      if (exp.atualmente) grp.get('dataFim')!.disable();

      const bulletsArray = grp.get('bullets') as FormArray;
      bulletsArray.clear();
      (exp.bullets ?? []).forEach(b => bulletsArray.push(this.fb.control(b)));
      if (bulletsArray.length === 0) bulletsArray.push(this.fb.control(''));

      this.experiencias.push(grp);
    });

    // Educação
    (data.educacao ?? []).forEach(edu => {
      const grp = this.newEducacaoGroup();
      grp.patchValue(edu);
      this.educacao.push(grp);
    });

    // Idiomas
    (data.idiomas ?? []).forEach(id => {
      const grp = this.newIdiomaGroup();
      grp.patchValue(id);
      this.idiomas.push(grp);
    });

    // Projetos
    (data.projetos ?? []).forEach(proj => {
      const grp = this.newProjetoGroup();
      grp.patchValue({
        nome:        proj.nome,
        descricao:   proj.descricao,
        tecnologias: proj.tecnologias ?? [],
        link:        proj.link,
      });
      this.projetos.push(grp);
      this.projetoTechInputs.push('');
    });
  }

  // ─── Task 6.3 – onSubmit ─────────────────────────────────────────────────
  onSubmit(): void {
    // Task 4.3 – require at least one experience
    if (this.experiencias.length === 0) {
      this.noExperienciaError.set(true);
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const dto = this.buildDto();

    this.api.saveBaseResume(dto).subscribe({
      next: () => {
        this.saving.set(false);
        this.showToast('Currículo salvo com sucesso!', 'success');
        setTimeout(() => this.router.navigate(['/gerar']), 3000);         // 8.3
      },
      error: () => {
        this.saving.set(false);
        this.showToast('Erro ao salvar. Verifique sua conexão e tente novamente.', 'error');
      },
    });
  }

  private buildDto(): BaseResumeDto {
    const raw = this.form.getRawValue();

    return {
      nome:     raw.nome     ?? '',
      email:    raw.email    ?? '',
      telefone: raw.telefone ?? '',
      cidade:   raw.cidade   ?? '',
      linkedIn: raw.linkedin ?? '',
      gitHub:   raw.github   ?? '',
      resumo:   raw.resumo   ?? '',
      habilidades: this.habilidades,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      experiencias: (raw.experiencias as any[]).map(e => ({
        empresa:    e.empresa,
        cargo:      e.cargo,
        dataInicio: e.dataInicio,
        dataFim:    e.atualmente ? null : e.dataFim,
        atualmente: e.atualmente,
        bullets:    (e.bullets as string[]).filter(b => b.trim() !== ''),
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      educacao: (raw.educacao as any[]).map(edu => ({ ...edu })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      idiomas:  (raw.idiomas  as any[]).map(id  => ({ ...id })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projetos: (raw.projetos as any[]).map(p  => ({ ...p })),
    };
  }

  // ─── Task 6.4 – showToast ────────────────────────────────────────────────
  private showToast(message: string, type: 'success' | 'error'): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set('');
    }, 3000);
  }
}

