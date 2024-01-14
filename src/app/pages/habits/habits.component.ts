import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import dayjs from 'dayjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { TableModule } from 'primeng/table';
import { generateTableHours } from '../../utils/utils';

interface Column {
  field: string;
  header: string;
}

interface Time {
  id: number;
  start: string;
  end: string;
}

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [
    TableModule, 
    DialogModule, 
    InputTextModule,
    ReactiveFormsModule, 
    InputNumberModule, 
    ButtonModule, 
    CheckboxModule, 
    SidebarModule,
    CardModule
  ],
  templateUrl: './habits.component.html',
  styleUrl: './habits.component.scss'
})
export class HabitsComponent {

  setupHours: boolean = false;
  sidebarVisible = false;

  cols!: Column[];
  products: any[] = [];
  times: Time[] = this.loadTime();



  formGroup = new FormGroup({
    startHour: new FormControl('09:30', [Validators.required, Validators.pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)]),
    endHour: new FormControl('18:00', [Validators.required, Validators.pattern(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)]),
    interval: new FormControl(30, [Validators.required, Validators.min(1)])
  }, { validators: [this.timeValidator] });

  ngOnInit() {
    if (this.times.length === 0) {
      this.setupHours = true;
    } else {
      this.createTable();
    }
  }

  loadTime() {
    return JSON.parse(localStorage.getItem('times') || '[]');
  }

  timeValidator(form: AbstractControl) {
    const startHour = form.get('startHour')?.value;
    const endHour = form.get('endHour')?.value;
    const interval = form.get('interval')?.value;

    if (startHour && endHour && interval) {
      const start = dayjs().hour(+startHour.split(':')[0]).minute(+startHour.split(':')[1])
      const end = dayjs().hour(+endHour.split(':')[0]).minute(+endHour.split(':')[1])
      const diff = end.diff(start, 'minute')
      const numberOfIntervals = diff / interval

      if (numberOfIntervals % 1 !== 0) {
        return { invalidInterval: true };
      }
    }

    return null;
  }

  saveHours() {
    const startHour = this.formGroup.get('startHour')?.value;
    const endHour = this.formGroup.get('endHour')?.value;
    const interval = this.formGroup.get('interval')?.value;

    this.times = generateTableHours(startHour!, endHour!, +interval!);
    localStorage.setItem('times', JSON.stringify(this.times));
    this.setupHours = false;

    this.createTable();
  }

  createTable() {
    this.loadTime();
    this.products = [];
    for (const time of this.times) {
      this.products.push({ orario: time, lunedi: 'Lunedì', martedi: 'martedi', mercoledi: 'mercoledi', giovedi: 'giovedi', venerdi: 'venerdi', sabato: 'sabato', domenica: 'domenica' });
    }

    console.log(this.products)
  }
}
