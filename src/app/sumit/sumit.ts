import { Component, OnInit, AfterViewInit} from '@angular/core';
import { Http, Response, RequestOptions, Headers, Request, RequestMethod } from '@angular/http';
import { Route, Router } from "@angular/router";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import * as Rx from 'rxjs/Rx';
import { Observable, Subject } from 'rxjs/Rx';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-sumit',
    templateUrl: './sumit.html',
    styleUrls: ['./sumit.css']
})
export class SumitComponent implements OnInit {

    public headers: Headers;
    public requestoptions: RequestOptions;
    public res: Response;
    apiKey: any;
    sessionId: any;
    token: any;
    status: any;
    archiveID: any;
    session: any;
    dialog: boolean = false;
    stream: any;
    doctorList: Array<any> = [];
    noCallFound: boolean = true;

    constructor(public http: Http, public router: Router) {
    }


    ngOnInit() {
        $('#endBtn').hide();
        $('#startBtn').hide();
        this.getSessionDetails();
    }

    public getRequsetOptions(url: string): RequestOptions {

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
                    this.router.navigateByUrl('/home/login');
                    localStorage.clear();
                }
                if (error.status === 403 || error.status === 500 || error.status === 401 || error.status === 400 || error.status === 409 || error.status === 404) {
                    return Observable.throw(error);
                } else {
                    return Observable.throw(error);
                }
            });
    }
    
    getSessionDetails() {
        var url = 'https://chat.sia.co.in/session/?id=1';
        this.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;
                this.session = OT.initSession(this.apiKey, this.sessionId);

                this.initializeSession();
            })
    }

    initializeSession() {

        this.session.on('sessionConnected', (event) => {
            console.log("Hi i'm connected")
            this.session.publish('myPublisher')
            $('#endBtn').show();
            $('#startBtn').hide();
            this.noCallFound=false;
            this.session.on('streamCreated', (event) => {
                // console.log(event, "stream")                
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToStream(event.streams[i]);
                    }
                }
            })
        })

        this.session.connect(this.apiKey, this.token)
    }

    subscribeToStream(stream) {
        this.dialog = true;
        this.stream = stream;
    }

    acceptCall() {
        this.dialog = false;
        console.log(this.stream, 'helloo')
        var div = document.createElement('div');
        div.setAttribute('style', 'width: 264px; height: 186px; margin: 30px;');
        div.setAttribute('id', 'stream-' + this.stream.streamId);
        document.body.appendChild(div);

        this.session.subscribe(this.stream, div.id);
    }

    endCall() {
        // this.session.unpublish(this.stream)
        this.session.disconnect();
        $('#endBtn').hide();
        $('#startBtn').show();
    }

    rejectCall() {
        this.dialog = false;
        this.session.disconnect();
    }
}
