import { Observable, filter, fromEvent, map } from "rxjs";

export class Authentication {
    Login()  {
        const emailInput=document.createElement("input");
        document.body.appendChild(emailInput);
        fromEvent(emailInput, "input").pipe(
            map((ev: InputEvent)=>(<HTMLInputElement>ev.target).value),
            filter((inputTxt: string) => inputTxt.length>=3)
        ).subscribe(emailVal => console.log(emailVal));

        const passwordInput=document.createElement("input");
        document.body.appendChild(passwordInput);
        fromEvent(passwordInput, "input").pipe(
            map((ev: InputEvent)=>(<HTMLInputElement>ev.target).value),
            filter((inputTxt: string) => inputTxt.length>=3)
        ).subscribe(passwordValue => console.log(passwordValue));
    }

    Logout() : void {

    }
}