import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface Tab {
  key: string;
  label: string;
  count?: number;
}

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  template: `
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex">
        @for (tab of tabs; track tab.key) {
          <button
            (click)="tabChange.emit(tab.key)"
            type="button"
            class="flex-1 whitespace-nowrap py-3 border-b-2 font-medium text-sm text-center transition-colors"
            [class]="activeTab === tab.key
              ? 'border-cyan-500 text-cyan-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'">
            {{ tab.label }}
            @if (tab.count !== undefined) {
              <span class="ml-1.5 py-0.5 px-2 rounded-full text-xs font-medium"
                    [class]="activeTab === tab.key ? 'bg-cyan-100 text-cyan-600' : 'bg-gray-100 text-gray-600'">
                {{ tab.count }}
              </span>
            }
          </button>
        }
      </nav>
    </div>
  `
})
export class TabNavigationComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();
}
