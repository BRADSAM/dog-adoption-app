import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Dog } from '../../core/models/dog.model';
import { AgePipe, DaysWaitingPipe } from '../../shared/dog-format.pipes';
import { IconComponent } from '../../shared/icon.component';
import { onImageError } from '../../shared/placeholder';

@Component({
  selector: 'app-dog-card',
  standalone: true,
  imports: [IconComponent, AgePipe, DaysWaitingPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dog-card.component.html',
  host: { class: 'block' },
})
export class DogCardComponent {
  readonly dog = input.required<Dog>();
  readonly adopt = output<Dog>();

  protected readonly onImageError = onImageError;
}
