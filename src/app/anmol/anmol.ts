import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-anmol',
    templateUrl: './anmol.html',
    styleUrls: ['./anmol.css']
})
export class AnmolComponent implements OnInit {

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

    constructor(private base_path_service: GlobalService) {
    }


    ngOnInit() {
        $('#endBtn').hide();
        $('#startBtn').hide();
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
            this.session.publish('myPublisher')
            $('#endBtn').show();
            $('#startBtn').hide();
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

        // this.session.on('connectionCreated', (event) => {
        //     console.log("connection created")            
        // })

        this.session.on("sessionDisconnected", function () {
            console.log("for publisher")
        })

        this.session.connect(this.apiKey, this.token)
    }

    subscribeToStream(stream) {
        this.stream = stream;
        this.dialog = true;
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
