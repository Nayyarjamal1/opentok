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

    public base_path: any;
    public headers: Headers;
    public requestoptions: RequestOptions;
    public res: Response;

    constructor(public http: Http, public router: Router) {
        this.base_path = "https://chat.sia.co.in/";
    }

    public getRequsetOptions(url: string): RequestOptions {

        this.headers = new Headers();
        this.headers.append("Content-Type", "application/json");

        this.requestoptions = new RequestOptions({
            method: RequestMethod.Get,
            url: url,
            headers: this.headers
        });

        return this.requestoptions;
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
                    return Observable.throw(error);
                }
                if (error.status === 403 || error.status === 500 || error.status === 401 || error.status === 400 || error.status === 409 || error.status === 404) {
                    return Observable.throw(error);
                } else {
                    return Observable.throw(error);
                }
            });
    }
}
