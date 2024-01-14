import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '',
    loadComponent: () => import('./pages/habits/habits.component').then(m => m.HabitsComponent)
}, {
    path: 'finance',
    loadComponent: () => import('./pages/finance/finance.component').then(m => m.FinanceComponent)
}];
