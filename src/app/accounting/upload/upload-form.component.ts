import { Component, Inject, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { AccountingService } from "../accounting.service";

@Component({
    selector: 'upload-account-form',
    templateUrl: './upload-form.component.html',
    encapsulation: ViewEncapsulation.None
})
export class UploadFormComponent implements OnInit {

    private catalogId: string;
    loading = false;

    fileName = '';
    
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<UploadFormComponent>,
        private accountingService: AccountingService
    ) {
    }

    ngOnInit(): void {
        
        if (!this.data || !this.data.catalogId) { 
            this.matDialogRef.close();
            return; 
        }
        this.catalogId = this.data.catalogId;

    }

    onFileSelected(event) {
        const file:File = event.target.files[0];
      
        if (file) {
            this.fileName = file.name;
            const formData = new FormData();
            formData.append("file", file);
            this.loading = true;
            this.accountingService.upload(this.catalogId, formData)
            .subscribe({
                next: () => {
                    this.matDialogRef.close();
                },
                error: error => {
                    this.loading = false;
                }
            });
        }
    }

}