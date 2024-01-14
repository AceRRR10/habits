import { Component, Type, ViewChild, computed, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import dayjs from 'dayjs';

interface Transaction {
  date: dayjs.Dayjs;
  type: string;
  description: string;
  amount: string;
  bank: string;
}

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [
    CardModule,
    TableModule,
    FileUploadModule,
    CommonModule,
    ConfirmDialogModule,
    ToastModule,
    FormsModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss'
})
export class FinanceComponent {

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  transactions = signal([] as Transaction[]);
  revenue = computed(() => this.transactions().reduce((acc, curr) => acc + parseFloat(curr.amount), 0));

  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  confirmImportData(bank: Bank, json: any[]) {
    this.confirmationService.confirm({
      message: 'Aggiungere nuovi elementi?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: "none",
      rejectIcon: "none",
      rejectButtonStyleClass: "p-button-text",
      accept: () => {
        if (bank === 'revolut') {
          this.transactions.set([...this.mapRevolutToTransaction(json), ...this.transactions()]);
        }
        this.fileUpload.clear();
      },
      reject: () => {
        this.fileUpload.clear();
      }
    });

  }

  onUpload({ files }: FileUploadHandlerEvent) {
    const fileReader = new FileReader();
    fileReader.readAsText(files[0]);
    // const json = JSON.parse(fileReader.result as string);
    fileReader.onload = () => {
      const json = this.csvToJson(fileReader.result as string);
      const isValid = this.isValidCSV(json);
      if (isValid) {
        this.confirmImportData(isValid, json);
      } else {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Invalid CSV', life: 3000 });
        this.fileUpload.clear();
      }
    };
  }

  csvToJson(csv: string) {
    const lines = csv.split('\n')
    const result = []
    const headers = lines[0].split(',')

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i])
        continue
      const obj: any = {}
      const currentline = lines[i].split(',')

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j]
      }
      result.push(obj)
    }
    return result
  }

  isValidCSV(json: any[]): false | Bank {
    if (json.length === 0) {
      return false;
    }

    if (this.isRevolut(json[0])) {
      return 'revolut';
    }

    return false;
  }


  isRevolut(object: any) {
    return object.hasOwnProperty('Type') && object.hasOwnProperty('Product') && object.hasOwnProperty('Description') && object.hasOwnProperty('Started Date') && object.hasOwnProperty('Amount')
  }

  mapRevolutToTransaction(json: RawRevolutTransaction[]): Transaction[] {
    return json
      // .filter(transaction => transaction.Product !== 'Savings' && transaction.Product !== 'Pocket')
      .map((item) => {
        return {
          date: dayjs(item['Started Date'], 'YYYY-MM-DD HH:mm:ss'),
          type: item['Type'],
          description: item['Description'],
          amount: item['Amount'],
          bank: 'Revolut'
        }
      })
      .sort((a, b) => b.date.diff(a.date))
  }
}

type Bank = 'revolut';

type RawRevolutTransaction = {
  Type: string,
  Product: string,
  'Started Date': string,
  'Completed Date': string,
  Description: string,
  Amount: string,
  Fee: string,
  Currency: string,
  State: string,
  Balance: string,
}