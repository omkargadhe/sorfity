import { Component, signal } from '@angular/core';
import { BubbleSortVisualizer } from './bubble-sort-visualizer/bubble-sort-visualizer';
@Component({
  selector: 'app-root',
  imports: [BubbleSortVisualizer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sort-visualizer');
}
