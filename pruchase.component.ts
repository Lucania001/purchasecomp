import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '../globalservices/user.service';
import { PointsService } from '../points/points.service';
import { OnInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { CryptoService } from '../globalservices/crypto.service';
import { Router } from '@angular/router';


import { popupModal, NgbdModalComponent } from "../modal/modal-popup";

declare var brainblocks: any;


@Component({
  selector: 'purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.css'],
  providers: [ 
      UserService, 
      CryptoService,
      popupModal, 
      NgbdModalComponent

     
],

    
  
})

export class Purchase implements OnInit{
  @Input() name;
  @Input() message;
  

  
  public showContent: boolean = false;

  constructor(
      private user: UserService,
      private pointsService: PointsService, 
      private crypto: CryptoService,
      private router: Router,
      private modal: NgbdModalComponent,
    ) {

      

    }

    chosenAmount:any;

    useremail: any;
    userId: any;


   

    ngOnInit(){

        
       this.chosenAmount = 25;

        
    
       
       // console.log("hello")
        this.user.getId()
            .subscribe(
                result=>{
                    //console.log(result._id)
                    this.userId = result._id
                    this.useremail = result.email
                    //console.log(this.userId)
                    console.log(this.useremail)
                }
            )

     
   

    
    }

    render(){
        //this.chosenAmount = this.chosenAmount*100
      

        brainblocks.Button.render({

            // Pass in payment options
            payment: {
                destination: 'xrb_18zq58wx313cf3frmrs35d8benjsewppj546uqhrwx7xfr54yythw91akp3r',
                currency:    'gbp',
                amount:      this.chosenAmount
            },
    
            // Handle successful payments
            onPayment: function(data) {
                
                console.log('Payment successful!', data.token);
                this.storeToken(data.token)
                
            }
    
        }, '#nano-button');
    }

    storeToken(token: string){
        this.crypto.nano(token)
                    .subscribe(
                        result => {
                            console.log(result)
                        }
                    )
    }


    updateChosen(amount: any){

        var m = document.getElementById("nancard"), c = m.style;
            c.color = "#c00";
            c.backgroundColor = "#eee";
            c.visibility = "visible";

        this.f1(amount).then(res => this.f2());

        
        
        
    }

    f1(amount: string) {
        return new Promise((resolve, reject) => {
            console.log('f1');
            this.chosenAmount = amount
            this.showContent = true

            //////////styling///////
            
            

            resolve();
        });
    }
    
    f2() {
       console.log('f2');
       this.render()
    }
    
    

    

    openCrypto(){
        //getDetials
        this.user.getId()
        .subscribe(
            result=>{
                //console.log(result._id)
                this.userId = result._id
                this.useremail = result.email
                //console.log(this.userId)
                console.log()
                this.crypto.getCheckout(this.userId, this.useremail, this.chosenAmount)
                    .subscribe(
                        result => {
                            console.log(result.data.hosted_url )
                            var redirect = result.data.hosted_url
                            /////on user account write invoice id///
                            this.crypto.writeCode(result.data.code)
                                .subscribe(
                                    result => {
                                        console.log(result)
                                        window.location.href=redirect
                                    }
                                )


                            //this.router.navigateByUrl(result.data.hosted_url);
                            //window.location.href=result.data.hosted_url
                        }
                    )
                
            }
        )



       
    }

  openCheckout() {

    // this.pointsService.buyTest()

    this.chosenAmount = this.chosenAmount*100
     
    this.user.getEmail()
     .subscribe(
         result => {
             console.log(result)
             this.useremail = result
             var handler = (<any>window).StripeCheckout.configure({
                 //test key
                // key: '',
                 key: '',
                 //key: environment.stripeKey,
                 locale: 'auto',
                 token: token => {
                   console.log(token.id)
                   this.pointsService.buyPoints(token.id, this.chosenAmount)
                       .subscribe(
                           result => {
                              // this.activeModal.close()
                               console.log(result);
                               this.pointsService.change(result.obj.points)
                               //add something here to flash success message //
                               console.log(result.obj.points)
                              
                               this.modal.open(
                                   "Success, tokens purchased",
                                   "Your new balance is " + result.obj.points + " tokens"
                               )
           
                               //
                           },
                           error => {
                            console.error(error)
                            this.modal.open(
                                "Error",
                                error.error.message
                            )
        
                        }
                       )
                 }
                 
                 
                   
                 
               });
           
               handler.open({
                 name: 'PrizeTime',
                 description: 'Buy tokens',
                 amount: this.chosenAmount,
                 currency: 'GBP',
                 email: this.useremail
               });
         }
     )
    
 
   
 
   }
 
}


