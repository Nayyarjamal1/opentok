import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-demo',
    templateUrl: './demo.html',
    styleUrls: ['./demo.css']
})
export class DemoComponent implements OnInit {

    apiKey: any;
    sessionId: any;
    token: any;
    status: any;
    archiveID: any;
    session: any;
    dialog: boolean = false;
    stream: any;
    doctorList: Array<any> = [];
    id: any;
    subscriber: any;
    publisher: any;

    constructor(private base_path_service: GlobalService) {
    }


    ngOnInit() {
        $('#endBtn').hide();
        this.getDoctors();
    }

    getDoctors() {
        var url = this.base_path_service.base_path + 'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.doctorList = res[0].json;
            })
    }

    getSessionDetails(id) {
        $('#endBtn').show();
        this.id = id;
        if (localStorage.getItem('session_details')) {
            var data = JSON.parse(localStorage.getItem('session_details'))
            this.apiKey = data.apiKey;
            this.sessionId = data.sessionId;
            this.token = data.token;
            // console.log(this.apiKey, this.sessionId, this.token, "localStorage")
            this.initializeSession();
        } else {
            var url = this.base_path_service.base_path + 'session/?id=' + id;
            this.base_path_service.GetRequest(url)
                .subscribe(res => {
                    this.apiKey = res[0].json.apiKey;
                    this.sessionId = res[0].json.sessionId;
                    this.token = res[0].json.token;

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
        });

        this.session.on('streamCreated', (event) => {
            console.log(event, "stream")
            for (let i = 0; i < event.streams.length; i++) {
                if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                    this.stream = event.streams[i]
                }
            }
        });

        this.session.on('signal', (event) => {
            // console.log("Signal sent from connection " + event.from.id);
            console.log("signal event fired")
            if (event.data == 'endCall') {
                this.endCall();
            } else {
                this.subscribeToStream(this.stream);
            }
        });

        this.session.connect(this.token, (error) => {
            console.log(error, "connection error")
        })
    }

    subscribeToStream(stream) {
        console.log(stream, 'helloo')
        this.stream = stream;
        var div = document.createElement('div');
        // div.innerHTML = 'subscriber';
        div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);
        this.session.subscribe(stream, div.id);
        this.subscriber = this.session.subscribe(stream, div.id);
    }

    endCall() {
        this.session.disconnect();
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
