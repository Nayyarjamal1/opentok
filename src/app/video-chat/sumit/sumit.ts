import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-sumit',
    templateUrl: './sumit.html',
    styleUrls: ['./sumit.css']
})
export class SumitComponent implements OnInit {

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
    stream_type: boolean;
    subscriber: any;
    publisher: any;

    constructor(private base_path_service: GlobalService) {
    }

    ngOnInit() {
        $('#endBtn').hide();
        $('#startBtn').hide();
        this.getSessionDetails();
    }

    getSessionDetails() {

        if (localStorage.getItem('session_details')) {
            var data = JSON.parse(localStorage.getItem('session_details'))
            this.apiKey = data.apiKey;
            this.sessionId = data.sessionId;
            this.token = data.token;
            // console.log(this.apiKey, this.sessionId, this.token, "localStorage")
            this.initializeSession();
        } else {
            var url = 'https://chat.sia.co.in/session/?id=1';
            this.base_path_service.GetRequest(url)
                .subscribe(res => {
                    this.apiKey = res[0].json.apiKey;
                    this.sessionId = res[0].json.sessionId;
                    this.token = res[0].json.token;
                    this.session = OT.initSession(this.apiKey, this.sessionId);

                    var data = {
                        "apiKey": res[0].json.apiKey,
                        "sessionId": res[0].json.sessionId,
                        "token": res[0].json.token
                    }

                    localStorage.setItem('session_details', JSON.stringify(data))
                    this.initializeSession();
                })
        }
    }

    initializeSession() {
        
        this.session = OT.initSession(this.apiKey, this.sessionId);
        
        this.session.on('sessionConnected', (event) => {
            console.log("Hi i'm connected")
            if (!this.publisher) {
                var publisherDiv = document.createElement('div');
                publisherDiv.setAttribute('id', 'myPublisher');
                document.body.appendChild(publisherDiv);
                var publisherProps = {
                    width: 264,
                    height: 186,
                };
                this.publisher = OT.initPublisher(this.apiKey, publisherDiv.id, publisherProps); // Pass the replacement div id and properties
                this.session.publish(this.publisher);
            }

            this.noCallFound = false;
            this.session.on('streamCreated', (event) => {
                console.log(event, "stream")
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToStream(event.streams[i]);
                    }
                }
            })
        })

        this.session.on("sessionDestroyed", function () {
            console.log("for publisher")
        })

        this.session.connect(this.apiKey, this.token)
    }

    subscribeToStream(stream) {
        this.stream = stream;
        this.dialog = true;
    }

    acceptCall() {
        $('#endBtn').show();
        this.session.signal({
            to: this.stream.connection,
            data: "hello"
        }, function (error) {
            if (error) {
                console.log("signal error ("
                    + error.name
                    + "): " + error.message);
            } else {
                console.log("signal sent.");
            }
        });

        this.dialog = false;
        console.log(this.stream, 'helloo')
        var div = document.createElement('div');
        div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
        div.setAttribute('id', 'stream-' + this.stream.streamId);
        document.body.appendChild(div);

        this.session.subscribe(this.stream, div.id);
        this.subscriber = this.session.subscribe(this.stream, div.id);
    }

    endCall() {
        $('#endBtn').show();
        this.session.signal({
            to: this.stream.connection,
            data: "acceptCall"
        }, function (error) {
            if (error) {
                console.log("signal error ("
                    + error.name
                    + "): " + error.message);
            } else {
                console.log("signal sent.");
            }
        });
    }

    rejectCall() {
        if (this.publisher) {
            this.session.unpublish(this.publisher);
        }
        this.publisher = null;
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
    }
}
