import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

declare var $: any;
declare var OT: any;

@Component({
  selector: 'app-call',
  templateUrl: './call.html',
  styleUrls: ['./call.css']
})
export class CallComponent implements OnInit, AfterViewInit {

  apiKey: any;
  sessionId: any;
  token: any;
  status: any;
  archiveID: any;

  constructor(private base_path_service:GlobalService) {
  }

  ngOnInit() {
    this.archiveID = null;
    $('#stop').hide();
    $('#start').hide();
    $('#view').hide();
    // this.getCall();
  }

  getCall() {
    // var session = OT.initSession(this.apiKey, this.sessionId);
    //   session.addEventListener("on", function () {        
    //     alert("Call Started");
    //   }, false);
  }

  getSessionID() {
    var url = this.base_path_service.base_path+'session';
    this.base_path_service.GetRequest(url)
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
    
    session.on('sessionConnected', (event) => {
      console.log('session connected')
    })
    
    session.on('connectionCreated', (event) => {
      console.log('session created')
    })

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
    var url = 'https://chat.sia.co.in/start/?session_id=' + this.sessionId
    this.base_path_service.GetRequest(url)
      .subscribe(res => {
        $('#start').hide();
        $('#stop').show();
      })
  }

  // Stop recording
  stopArchive() {
    var url = 'https://chat.sia.co.in/stop/?archive_id=' + this.archiveID
    this.base_path_service.GetRequest(url)
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
    window.location.href = 'https://chat.sia.co.in/view/' + this.archiveID;
  }

  endCall() {
    $('#start').hide();
    $('#stop').hide();
    $('#view').hide();
    var session = OT.initSession(this.apiKey, this.sessionId);
    session.disconnect()
  }

  ngAfterViewInit() {

  }
}
