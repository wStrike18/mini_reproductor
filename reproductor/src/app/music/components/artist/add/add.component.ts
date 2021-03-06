import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RxwebValidators } from '@rxweb/reactive-form-validators';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ArtistService } from 'src/app/services/artist.service';
import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user.service';
import { Artist } from '../../../../models/artist'
import { ArtistComponent } from '../artist.component';
@Component({
  selector: 'wr-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent implements OnInit {

  public addArtistForm!: FormGroup
  public artist! : Artist
  public filesToUpload!: Array<File>
  public extensions?: string[] | undefined;
  public token!: string | null
  public messageError! : string
  public mensajeSucces! : string
  public url!: string;
  public option! : string;


  constructor(
    public dialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Artist,

    private userService : UserService, 
    private artistService : ArtistService,
    private artistComponent : ArtistComponent
    ) {
     
      this.artist = new Artist('','','','')
      this.extensions = ["png", "jpg", "jpge"]
      this.token = this.userService.getToken();
      this.url = GLOBAL.url;

     }

  ngOnInit(): void {
    

    if (this.data != undefined) {
      this.artist = this.data
      this.option = 'Actulizar'
    }else{
      this.option = 'Agregar'
    }
    this.formValidate()
    

  }

  formValidate() {
    
    this.addArtistForm = new FormGroup({
      name: new FormControl(this.artist.name,[
        RxwebValidators.required()
      ]),
      description: new FormControl(this.artist.description,[
      ]),
      image: new FormControl('', [
        //Validators.required,
        RxwebValidators.extension({ extensions: ["png", "jpg", "jpge"] })
      ])



    })

  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
  
  onSubmit(){
    if(this.option === 'Agregar'){

    this.artist = this.addArtistForm.value;
    this.saveArtist(this.artist);

    }else{
      this.artist = this.addArtistForm.value;
      this.updateArtist(this.artist);
    }
  }

  updateArtist(artist : Artist){
    console.log(artist)
  }
  saveArtist(artist : Artist){

    this.artistService.saveArtist(artist)
    .pipe(
      catchError(error=>{
        this.messageError = error.message
        return EMPTY;
      })
    )
    .subscribe(
      (response)=> {
        this.mensajeSucces = 'Se registro correctamente'

        if (response) {
          if (this.filesToUpload) {
            console.log(this.url + 'upload-image-artist/' + response.artist._id);
            this.makeFileRequest(this.url + 'upload-image-artist/' + response.artist._id, [], this.filesToUpload)
              .then(
                (result: any) => {
                  console.log(result)
                  if (response.artist) {
                    response.artist.image = result.image
                    this.dialogRef.close(response);
                  }
                })
          }

          this.dialogRef.close(response);

        }

        //this.data = response
        //this.artistComponent.ngOnInit()
        //console.log(response)
      },

    )

  }

  filesChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
    let token: string = this.token || ''
    return new Promise((resolve, reject) => {
      let formData: any = new FormData();
      let xhr = new XMLHttpRequest();

      for (let i = 0; i < files.length; i++) {
        formData.append('image', files[i], files[i].name)
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response))
          } else {
            reject(xhr.response);
          }
        }
      }
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', token);
      xhr.send(formData)
    })
  }


  /* Editar un artista */
  

}
