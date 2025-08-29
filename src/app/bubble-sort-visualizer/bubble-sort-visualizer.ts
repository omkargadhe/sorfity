
import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bubble-sort-visualizer',
  standalone: true,
  imports: [NgFor, FormsModule],
  templateUrl: './bubble-sort-visualizer.html',
  styleUrl: './bubble-sort-visualizer.css'
})
export class BubbleSortVisualizer {
  stepDescription: string = '';
  array: number[] = [];
  currentI: number | null = null;
  currentJ: number | null = null;
  sorting = false;
  cancelled = false;
  paused = false;
  delay = 700; // slower by default
  private pauseResolver: (() => void) | null = null;
  comparing: boolean = false;
  swapping: boolean = false;
  algorithm: 'bubble' | 'selection' | 'insertion' = 'bubble';

  constructor() {
    this.randomizeArray();
  }

  randomizeArray() {
    if (this.sorting) return;
    this.array = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 1);
    this.currentI = null;
    this.currentJ = null;
    this.comparing = false;
    this.swapping = false;
    this.stepDescription = '';
    this.cancelled = false;
  }

  async runSort() {
    if (this.sorting) return;
    this.cancelled = false;
    if (this.algorithm === 'bubble') {
      await this.bubbleSort();
    } else if (this.algorithm === 'selection') {
      await this.selectionSort();
    } else if (this.algorithm === 'insertion') {
      await this.insertionSort();
    }
  }

  async bubbleSort() {
    this.sorting = true;
    this.paused = false;
    let arr = this.array;
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (this.cancelled) {
          this.resetSortState();
          return;
        }
        this.currentI = j;
        this.currentJ = j + 1;
        this.comparing = true;
        this.swapping = false;
        this.stepDescription = `Comparing index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`;
        await this.waitOrPause(); // show comparison
        if (arr[j] > arr[j + 1]) {
          this.comparing = false;
          this.swapping = true;
          this.stepDescription = `Swapping index ${j} (${arr[j]}) and index ${j + 1} (${arr[j + 1]})`;
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          await this.waitOrPause(); // show swap
        }
        this.comparing = false;
        this.swapping = false;
        this.stepDescription = '';
      }
    }
    this.resetSortState('Sorting complete!');
  }

  async selectionSort() {
    this.sorting = true;
    this.paused = false;
    let arr = this.array;
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (this.cancelled) {
          this.resetSortState();
          return;
        }
        this.currentI = minIdx;
        this.currentJ = j;
        this.comparing = true;
        this.swapping = false;
        this.stepDescription = `Comparing index ${minIdx} (${arr[minIdx]}) and index ${j} (${arr[j]})`;
        await this.waitOrPause();
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          this.stepDescription = `New minimum found at index ${minIdx} (${arr[minIdx]})`;
          await this.waitOrPause();
        }
        this.comparing = false;
        this.stepDescription = '';
      }
      if (minIdx !== i) {
        if (this.cancelled) {
          this.resetSortState();
          return;
        }
        this.currentI = i;
        this.currentJ = minIdx;
        this.comparing = false;
        this.swapping = true;
        this.stepDescription = `Swapping index ${i} (${arr[i]}) and index ${minIdx} (${arr[minIdx]})`;
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        await this.waitOrPause();
        this.swapping = false;
        this.stepDescription = '';
      }
    }
    this.resetSortState('Sorting complete!');
  }

  async insertionSort() {
    this.sorting = true;
    this.paused = false;
    let arr = this.array;
    let n = arr.length;
    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;
      this.currentI = i;
      this.currentJ = j;
      this.comparing = true;
      this.swapping = false;
      this.stepDescription = `Inserting value ${key} at index ${i}`;
      await this.waitOrPause();
      while (j >= 0 && arr[j] > key) {
        if (this.cancelled) {
          this.resetSortState();
          return;
        }
        this.currentI = j + 1;
        this.currentJ = j;
        this.comparing = true;
        this.swapping = true;
        this.stepDescription = `Comparing and shifting index ${j} (${arr[j]}) to index ${j + 1}`;
        arr[j + 1] = arr[j];
        await this.waitOrPause();
        this.comparing = false;
        this.swapping = false;
        j--;
      }
      arr[j + 1] = key;
      this.stepDescription = `Inserted value ${key} at index ${j + 1}`;
      await this.waitOrPause();
      this.comparing = false;
      this.swapping = false;
      this.stepDescription = '';
    }
    this.resetSortState('Sorting complete!');
  }
  cancel() {
    if (this.sorting) {
      this.cancelled = true;
      this.paused = false;
      if (this.pauseResolver) {
        this.pauseResolver();
        this.pauseResolver = null;
      }
    }
  }

  private resetSortState(msg: string = '') {
    this.currentI = null;
    this.currentJ = null;
    this.sorting = false;
    this.paused = false;
    this.comparing = false;
    this.swapping = false;
    this.stepDescription = msg;
  }

  async waitOrPause() {
    await this.sleep(this.delay);
    while (this.paused) {
      await new Promise<void>(resolve => {
        this.pauseResolver = resolve;
      });
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      if (this.pauseResolver) {
        this.pauseResolver();
        this.pauseResolver = null;
      }
    }
  }

  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
