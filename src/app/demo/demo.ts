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
    selector: 'app-demo',
    templateUrl: './demo.html',
    styleUrls: ['./demo.css']
})
export class DemoComponent implements OnInit {

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

    constructor(public http: Http, public router: Router) {
    }


    ngOnInit() {
        $('#endBtn').hide();  
        this.getDoctors();
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

    getDoctors() {
        var url = 'https://chat.sia.co.in/doc/';
        this.GetRequest(url)
            .subscribe(res => {
                this.doctorList = res[0].json;
            })
    }

    getSessionDetails(id) {        
        var url = 'https://chat.sia.co.in/session/?id=' + id;
        this.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                // this.apiKey = '45783972';
                // this.sessionId = "1_MX40NTc4Mzk3Mn4xMi4zNC41Ni43OH4xNDg4ODY3MzE5ODAyflhrNVVMcGJRblVTK1FBRGtORGJ1UGNQTX5-";
                // this.token = "T1==cGFydG5lcl9pZD00NTc4Mzk3MiZzaWc9NjkxYWY2Y2I0ODU3OGI5ODVmOGYxZWY3YmQwNDAyYzM3YWM4NDVjOTpub25jZT0xMzA0NjcmY29ubmVjdGlvbl9kYXRhPU5vbmUmY3JlYXRlX3RpbWU9MTQ4ODg3MTg0MiZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNDg4OTU4MjQyJnNlc3Npb25faWQ9MV9NWDQwTlRjNE16azNNbjR4TWk0ek5DNDFOaTQzT0g0eE5EZzRPRFkzTXpFNU9EQXlmbGhyTlZWTWNHSlJibFZUSzFGQlJHdE9SR0oxVUdOUVRYNS0="

                this.session = OT.initSession(this.apiKey, this.sessionId);
                
                this.initializeSession();
            })
    }

    initializeSession() {

        this.session.on('sessionConnected', (event) => {
            console.log("Hi i'm connected")
            this.session.publish('myPublisher') 
            $('#endBtn').show();            
            this.session.on('streamCreated', (event) => {
                console.log(event, "stream")                
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToStream(event.streams[i]);
                    }
                }
            })
        })

        this.session.on('sessionCreated', (event) => {
            this.session.on('streamCreated', (event) => {
                console.log(event, "stream")
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToStream(event.streams[i]);
                    }
                }
            })
        })

        this.session.connect(this.apiKey, this.token, (error) => {
            console.log(error, "connect error")
        })
    }

    subscribeToStream(stream) {
        console.log(stream, 'helloo')
        var div = document.createElement('div');
        div.innerHTML = 'subscriber';
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);

        this.session.subscribe(stream, div.id);
    }

    rejectCall() {
        this.session.disconnect(this.token, (error) => {
            console.log(error, "disconnect error")
        });
        
         $('#endBtn').hide(); 
    }
    
    endCall(){
        this.session.disconnect(this.token, (error) => {
            console.log(error, "disconnect error")
        });
        
        $('#endBtn').hide(); 
    }
}
