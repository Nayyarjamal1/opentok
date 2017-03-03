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
  selector: 'app-call',
  templateUrl: './call.html',
  styleUrls: ['./call.css']
})
export class CallComponent implements OnInit, AfterViewInit {

  public headers: Headers;
  public requestoptions: RequestOptions;
  public res: Response;
  apiKey: any;
  sessionId: any;
  token: any;
  status: any;
  archiveID: any;

  constructor(public http: Http, public router: Router) {
  }

  ngOnInit() {
    this.archiveID = null;
    $('#stop').hide();   
    $('#start').hide();
    $('#view').hide();
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

  getSessionID() {
    var url = 'http://139.59.17.63:8000/session';
    this.GetRequest(url)
      .subscribe(res => {
        console.log(res, "ressss")
        this.apiKey = res[0].json.apiKey;
        this.sessionId = res[0].json.sessionId;
        this.token = res[0].json.token;

        this.initializeSession();
      })
  }

  initializeSession() {
    var session = OT.initSession(this.apiKey, this.sessionId);
    $('#start').show();
    // Subscribe to a newly created stream
    session.on('streamCreated', function (event) {
      session.subscribe(event.stream, 'subscriber', {
        insertMode: 'append',
        width: '100%',
        height: '100%'
      });      
    });
    
    session.on('archiveStarted', (event) => {
      this.archiveID = event.id;
      console.log(event.id, "jhqwru")
      console.log('Archive started ' + this.archiveID);
      $('#stop').show();
      $('#start').hide();
    });

    session.on('archiveStopped', (event) => {
      this.archiveID = event.id;
      console.log('Archive stopped ' + this.archiveID);
      $('#start').hide();
      $('#stop').hide();
      $('#view').show();
    });

    session.on('sessionDisconnected', (event) => {
      console.log('You were disconnected from the session.', event.reason);
    });

    // Connect to the session
    session.connect(this.token, (error) => {
      // If the connection is successful, initialize a publisher and publish to the session
      if (!error) {
        var publisher = OT.initPublisher('publisher', {
          insertMode: 'append',
          width: '100%',
          height: '100%'
        });

        session.publish(publisher);
      } else {
        console.log('There was an error connecting to the session: ', error.code, error.message);
      }
    });
  }

  startArchive() {
    var url = 'http://139.59.17.63:8000/start/?session_id=' + this.sessionId
    this.GetRequest(url)
      .subscribe(res => {
        $('#start').hide();
        $('#stop').show();
      })
  }

  // Stop recording
  stopArchive() {
    var url = 'http://139.59.17.63:8000/stop/?archive_id=' + this.archiveID
    this.GetRequest(url)
      .subscribe(res => {
        $('#stop').hide();
        $('#view').prop('disabled', false);
        $('#stop').show();
      })
  }

  // Get the archive status. If it is  "available", download it. Otherwise, keep checking
  // every 5 secs until it is "available"
  viewArchive() {
    $('#view').prop('disabled', true);
    window.location.href = 'http://139.59.17.63:8000/view/' + this.archiveID;
  }

  endCall() {

  }

  ngAfterViewInit() {

  }
}
