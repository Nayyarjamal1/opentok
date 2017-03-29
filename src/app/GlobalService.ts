import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { Route, Router } from "@angular/router";
import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as Rx from 'rxjs/Rx';

declare var jQuery: any;
declare const toastr: any;
declare var FB: any;

@Injectable()
export class GlobalService {
    /*For create Group and Round Details Relation only*/
    demoCheck: Rx.Subject<any> = new Rx.Subject();
    profileCheck: Rx.Subject<any> = new Rx.Subject();
    navCheck: Rx.Subject<any> = new Rx.Subject();
    counter: number = 0;
    /*For create Group and Round Details Relation Only*/
    user_info: any;
    image_url: string;
    public playerId: any;
    public base_path: string;
    public base_path_chat : string;
    public blog_url: string;
    public headers: Headers;
    public requestoptions: RequestOptions;
    public res: Response;
    public loggedIn: boolean = false;
    public globalTournametId: number = 0;
    public base_path_image: string;
    public signUpObj: any = {};
    public shoutType: string = '';

    public bookMarkNotification: Subject<any> = new Subject<any>();
    // for title===========//
    public conditionWebTitle: Subject<any> = new Subject<any>();
    public procedureWebTitle: Subject<any> = new Subject<any>();
    public medicationeWebTitle: Subject<any> = new Subject<any>();
    public doctorWebTitle: Subject<any> = new Subject<any>();
    public hospitalWebTitle: Subject<any> = new Subject<any>();
    // ===========//

    public medicationbookMarkNotification: Subject<any> = new Subject<any>();
    public activeItem: Subject<any> = new Subject<any>();

    public myswaasth2_base_path: string;
    public cityName: Rx.Subject<any> = new Rx.Subject<any>();
    public changeUserInfo: Subject<any> = new Subject<any>();
    public locationNotification: Rx.Subject<any> = new Rx.Subject<any>();
    public clientInfomationChange: Rx.Subject<any> = new Rx.Subject<any>();
    public profileInformationUpdate: Rx.Subject<any> = new Rx.Subject<any>();

    public highLightLink: Rx.Subject<any> = new Rx.Subject<any>();

    public errorMessageSubject:Rx.Subject<any>=new Rx.Subject<any>(); 

    // public message:Rx.Observable<any>=new Rx.Observable<any>();


    constructor(public http: Http, public router: Router) {
        // console.log(JSON.stringify(this.user_info) + " localStorage");
        this.base_path = "https://doccall.sia.co.in/";
        this.base_path_chat = 'wss://doccall.sia.co.in/ws/'
        this.base_path_image =   "https://doccall.sia.co.in"
        // this.base_path_chat = 'ws://139.59.20.116:8080/';    
    }

    public base_path_api() {
        return this.base_path + 'api/';
    }
    public myswaasth2_base_path_api() {
        return this.myswaasth2_base_path + 'api/';
    }

    /*For create Group and Round Details Relation only*/
    public parentChildFun() {
        this.counter = this.counter + 1;
        this.demoCheck.next(this.counter);
    }
    /*For create Group and Round Details Relation Only*/

    public getRequsetOptions(url: string): RequestOptions {


        if (localStorage.getItem('id_token')) {
            this.headers = new Headers();
            this.headers.append("Content-Type", "application/json");
            this.headers.append("Authorization", 'Bearer ' + localStorage.getItem('id_token'));
        }
        // else {
        //     this.router.navigateByUrl('/home');
        // }

        this.requestoptions = new RequestOptions({
            method: RequestMethod.Get,
            url: url,
            headers: this.headers
        });

        return this.requestoptions;
    }

    public getRequsetOptionsUnauthorised(url: string): RequestOptions {

        this.headers = new Headers();
        this.headers.append("Content-Type", "application/json");
        console.log(this.headers);

        this.requestoptions = new RequestOptions({
            method: RequestMethod.Get,
            url: url,
            headers: this.headers
        });

        return this.requestoptions;
    }


    public PostRequest(url: string, data: any): any {

        this.headers = new Headers();
        this.headers.append("Content-Type", "application/json");
        this.headers.append("Authorization", 'Bearer ' + localStorage.getItem('id_token'));


        this.requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url: url,
            headers: this.headers,
            body: JSON.stringify(data)
        })

        return this.http.request(new Request(this.requestoptions))
            .map((res: Response) => {
                // console.log(res, "Mapping");
                if (res.status === 201) {
                    return [{ status: res.status, json: res.json() }]
                }
                else if (res.status === 205) {
                    return [{ status: res.status, json: res.json() }]
                }
                else if (res.status === 200) {
                    return [{ status: res.status, json: res.json() }]
                }
            })
            .catch((error: any) => {
                if (error.status == 401) {
                    localStorage.clear();
                    this.router.navigateByUrl('/home/login');
                }
                // console.log(error, "Error");
                if (error.status === 500) {
                    return Observable.throw(error);
                }
                else if (error.status === 400) {
                    return Observable.throw(error);
                }
                else if (error.status === 409) {
                    return Observable.throw(error);
                }
                else if (error.status === 406) {
                    return Observable.throw(error);
                }
                else if (error.status === 404) {
                    return Observable.throw(error);
                }
            });

    }

    public PostRequestUnauthorised(url: string, data: any): any {

        this.headers = new Headers();
        this.headers.append("Content-Type", "application/json");

        this.requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url: url,
            headers: this.headers,
            body: JSON.stringify(data)
        })

        return this.http.request(new Request(this.requestoptions))
            .map((res: Response) => {
                // console.log(res.status);
                if (res.status === 201) {
                    return [{ status: res.status, json: res.json() }]
                }
                else if (res.status === 205) {
                    return [{ status: res.status, json: res.json() }]
                }
                else if (res.status === 200) {
                    return [{ status: res.status, json: res.json() }]
                }
            })
            .catch((error: any) => {
                // console.log(error.status);
                if (error.status === 500) {
                    return Observable.throw(error);
                }
                else if (error.status === 400) {
                    return Observable.throw(error);
                }
                else if (error.status === 409) {
                    return Observable.throw(error);
                }
                else if (error.status === 406) {
                    ;
                    return Observable.throw(error);
                }
                else if (error.status === 404) {
                    return Observable.throw(error);
                }
            });
    }

    public GetRequest(url: string): any {

        return this.http.request(new Request(this.getRequsetOptions(url)))
            .map((res: Response) => {
                let jsonObj: any;
                //this.router.navigateByUrl('/home/login');              
                if (res.status === 204) {
                    jsonObj = null;
                }
                else if (res.status === 500) {
                    jsonObj = null;
                }
                else if (res.status !== 204) {
                    jsonObj = res.json()
                }
                return [{ status: res.status, json: jsonObj }]
            })
            .catch(error => {
                if (error.status == 401) {
                    this.router.navigateByUrl('/home/login');
                    localStorage.clear();
                }
                if (error.status === 403 || error.status === 500 || error.status === 401 || error.status === 400 || error.status === 409 || error.status === 404) {
                   this.errorMessageSubject.next('error');
                    return Observable.throw(error);
                }else {
                    return Observable.throw(error);
                }
            });
    }

    public GetRequestUnauthorised(url: string): any {

        return this.http.request(new Request(this.getRequsetOptionsUnauthorised(url)))
            .map((res: Response) => {
                let jsonObj: any;
                if (res.status === 204) {
                    jsonObj = null;
                }
                else if (res.status === 500) {
                    jsonObj = null;
                }
                else if (res.status !== 204) {
                    jsonObj = res.json()
                }
                return [{ status: res.status, json: jsonObj }]
            })
            .catch(error => {
                if (error.status === 403) {
                    return Observable.throw(error);
                }
                else if (error.status === 400) {
                    return Observable.throw(error);
                }
                else {
                    return Observable.throw(error);
                }
            });
    }

    public DeleteRequest(url: string): any {
        this.headers = new Headers();
        this.headers.append("Content-Type", 'application/json');
        this.headers.append("Authorization", 'Bearer ' + localStorage.getItem('id_token'));

        this.requestoptions = new RequestOptions({
            method: RequestMethod.Delete,
            url: url,
            headers: this.headers
        })

        return this.http.request(new Request(this.requestoptions))
            .map((res: Response) => {
                if (res) {
                    return [{ status: res.status, json: res }]
                }
            }).catch((error: any) => {
                if (error.status == 401) {
                    localStorage.clear();
                    this.router.navigateByUrl('/home/login');
                }
                if (error.status === 500) {
                    return Observable.throw(error);
                }
                else if (error.status === 400) {
                    return Observable.throw(error);
                }
                else if (error.status === 405) {
                    return Observable.throw(error);
                }
                else if (error.status === 409) {
                    return Observable.throw(error);
                }
            });
    }

    public PutRequest(url: string, data: any): any {

        this.headers = new Headers();
        this.headers.append("Content-Type", 'application/json');
        this.headers.append("Authorization", 'Bearer ' + localStorage.getItem('id_token'));

        this.requestoptions = new RequestOptions({
            method: RequestMethod.Put,
            url: url,
            headers: this.headers,
            body: JSON.stringify(data)
        })

        return this.http.request(new Request(this.requestoptions))
            .map((res: Response) => {
                if (res) {
                    return [{ status: res.status, json: res }]
                }
            }).catch((error: any) => {
                if (error.status == 401) {
                    localStorage.clear();
                    this.router.navigateByUrl('/home/login');
                }
                if (error.status === 500) {
                    return Observable.throw(error);
                }
                else if (error.status === 400) {
                    return Observable.throw(error);
                }
                else if (error.status === 405) {
                    return Observable.throw(error);
                }
                else if (error.status === 409) {
                    return Observable.throw(error);
                }
                else if (error.status === 401) {
                    return Observable.throw(error);
                }
                else if (error.status === 404) {
                    return Observable.throw(error);
                }
            });
    }


    getVarification(url: string) {

        return this.http.request(new Request(this.getRequsetOptions(url)))
            .map(res => {
                if (res) {
                    if (res.status === 200) {
                        return [{ status: res.status, json: null }]
                    }
                }
            }).catch((error: any) => {
                if (error.status === 409) {
                    return Observable.throw(error.status);
                }
            });
    }

    print(msg?: any, b?, c?, d?, e?) {
        console.log(msg, b, c, d, e);
    }

    redirect(str: string) {
        this.router.navigate([str]);
    }

    loginRequest(data: any, x) {
        let requestoptions: RequestOptions;
        this.headers = new Headers();
        let nameAndPass = data.name + ":" + data.password;
        // console.log(this.nameAndPass);
        let encode = btoa(nameAndPass);
        this.headers.append('Authorization', 'Basic ' + encode);
        // console.log("inside method1");
        requestoptions = new RequestOptions({
            method: RequestMethod.Get,
            url: this.base_path + x,
            headers: this.headers
        })
        return this.http.request(new Request(requestoptions))
            .map((res: Response) => {
                return [{ status: res.status, json: res.json() }]
            })
            .catch(error => {
                if (error.status === 401) {
                    // console.log("inside error");
                    return Observable.throw(error);
                }
            });

    }

    getLocationDefault() {

        let headers = new Headers();
        headers.append("Accept", "application/json");

        let requestoptions: RequestOptions = new RequestOptions({
            method: RequestMethod.Get,
            url: "https://freegeoip.net/json/?format=json",
            headers: headers,
        })
        // console.log("requestoptions",requestoptions)
        return this.http.request(new Request(requestoptions))
            .map((res: Response) => {
                let jsonObj: any;
                if (res.status === 204) {
                    jsonObj = null;
                }
                else if (res.status === 500) {
                    jsonObj = null;
                }
                else if (res.status !== 204) {
                    jsonObj = res.json()
                }
                return [{ status: res.status, json: jsonObj }]
            })
            .catch(error => {
                if (error.status === 403 || error.status === 500 || error.status === 401 || error.status === 400 || error.status === 409 || error.status === 404) {
                    return Observable.throw(error);
                }

            });
    }

    isLoggedIn() {
        if (localStorage.getItem("userInfo"))
            return true;
        else
            return false;
    }

    fbInit() {
        try {
            FB.init({
                //                 appId: '438105992979968',  // localhost 
                appId: '460139977443299',  //server
                cookie: false,  // enable cookies to allow the server to access
                // the session
                xfbml: true,  // parse social plugins on this page
                version: 'v2.5' // use graph api version 2.5
            });
        }
        catch (exception) {
            console.log(exception, 'Login Error Exception');
        }
    }

    getRequestWp(url: string) {

        let headers = new Headers();
        headers.append("Accept", "text/html");

        let requestoptions: RequestOptions = new RequestOptions({
            method: RequestMethod.Get,
            url: url,
            headers: headers,
        })

        return this.http.request(new Request(requestoptions))
            .map((res: Response) => {
                let jsonObj: any;
                if (res.status === 204) {
                    jsonObj = null;
                }
                else if (res.status === 500) {
                    jsonObj = null;
                }
                else if (res.status !== 204) {
                    jsonObj = res.json()
                }
                return [{ status: res.status, json: jsonObj }]
            })
            .catch(error => {
                if (error.status === 403 || error.status === 500 || error.status === 401 || error.status === 400 || error.status === 409 || error.status === 404) {
                    return Observable.throw(error);
                }

            });
    }

    modifyTitle(title) { 
        let prevTitle = document.getElementsByTagName('title'); 
        prevTitle[0].innerHTML = title; 
    } 
    
    modifyDescription(desc) { 
        let pres = document.getElementsByTagName('meta'); 
        pres[2].content = desc; 
    }

}
