import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-subscriber-demo',
    templateUrl: './subscriber-demo.html',
    styleUrls: ['./subscriber-demo.css']
})
export class SubscriberDemoComponent implements OnInit {

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
    publisher: any;
    subscriber: any;

    constructor(private base_path_service: GlobalService) {
    }


    ngOnInit() {
        $('#endBtn').hide();
        this.getSessionDetails();
    }

    getSessionDetails() {
        var url = 'https://chat.sia.co.in/session/?id=3';
        this.base_path_service.GetRequest(url)
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
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
    }

    rejectCall() {        
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
    }
}
