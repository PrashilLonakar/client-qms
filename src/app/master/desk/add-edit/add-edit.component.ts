import { Component, OnInit, ElementRef } from "@angular/core";
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { MasterService } from "../../../core/service/master.service";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { MessageConstant } from '../../../utils/message-constant';
import { ResponseModel } from '../../../utils/models/response';
import { ErrorModel } from '../../../utils/models/error';


@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.css']
})
export class AddEditComponent implements OnInit {
  deskForm: FormGroup;
  public messageConstant = MessageConstant;
  isSubmitted : boolean = false;
  isEdit = this.route.snapshot.data.type === "edit" ? true : false;
  isActive : boolean = true;
  title : string = '';
  button : string = '';
  constructor(
    private fb: FormBuilder,
    private masterService : MasterService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private loaderService: NgxUiLoaderService,
    private toastrService: ToastrService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.title = this.isEdit ? "Update Desk" : "Create Desk";
    this.button = this.isEdit ? "Update Desk" : "Add Desk";
    this.deskForm = this.fb.group({
      id: [],
      deskName: ["", Validators.required],
      deskCode: ["", Validators.required],
      userId: [1]
    });

    if (this.isEdit) {
      const id = this.route.snapshot.paramMap.get("id");
      this.masterService.getDeskWithId(id).subscribe(res => {
        const data = res;
        console.log('data',data);
        this.deskForm.patchValue({
          id: data.id,
          deskName:  data.deskName,
          deskCode:  data.deskCode,
          userId: 1
        });
      });
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.deskForm.controls[controlName].hasError(errorName);
  };

  submitForm(){
    this.isSubmitted = true;
    if(this.deskForm.invalid){
      return;
    }
    console.log('this.deskForm',this.deskForm.value);
    let obj = {
      ...this.deskForm.value
    };

    if (!this.isEdit) {
      this.loaderService.start();
      delete obj['id'];
      this.masterService.createDesk(obj).subscribe(
        (response: ResponseModel) => {
          if (response) {
            let data = response;
            this.router.navigate(['/master/desk']);
            this.loaderService.stop();
            this.toastrService.success(
              this.messageConstant.deskAddedSuccess
            );
          }
        },
        (err) => {
          this.loaderService.stop();
          if (err.error) {
            const error: ResponseModel = err.error;
            this.toastrService.error(error.message, '');
          } else {
            this.toastrService.error(this.messageConstant.unknownError, '');
          }
        }
      );
    } else {
      this.loaderService.stop();
      this.masterService.modifyDesk(obj).subscribe(
        (response: ResponseModel) => {
          if (response) {
            let data = response;
            this.router.navigate(['/master/desk']);
            this.loaderService.stop();
            this.toastrService.success(
              this.messageConstant.deskUpdatedSuccess
            );
          }
        },
        (err) => {
          this.loaderService.stop();
          if (err.error) {
            const error: ResponseModel = err.error;
            this.toastrService.error(error.message, '');
          } else {  
            this.toastrService.error(this.messageConstant.unknownError, '');
          }
        }
      );
    }
  }
}
