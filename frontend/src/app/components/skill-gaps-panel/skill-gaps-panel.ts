import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-skill-gaps-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './skill-gaps-panel.html',
  styleUrl: './skill-gaps-panel.css',
})
export class SkillGapsPanelComponent {
  // Task 1.1 – inputs
  matchedSkills = input<string[]>([]);
  missingSkills = input<string[]>([]);
  hasBaseResume = input<boolean | null>(null);

  // Task 1.4 – computed signals
  totalSkills = computed(() => this.matchedSkills().length + this.missingSkills().length);

  summaryText = computed(
    () => `Você tem ${this.matchedSkills().length} de ${this.totalSkills()} skills pedidas`,
  );

  noSkillsIdentified = computed(
    () => this.matchedSkills().length === 0 && this.missingSkills().length === 0,
  );
}
