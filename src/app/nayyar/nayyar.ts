import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-nayyar',
    templateUrl: './nayyar.html',
    styleUrls: ['./nayyar.css']
})
export class NayyarComponent implements OnInit {
    
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

    constructor(private base_path_service:GlobalService) {
    }


    ngOnInit() {
        $('#endBtn').hide();
        $('#startBtn').hide();
        this.getSessionDetails();
    }

    getSessionDetails() {
        var url = this.base_path_service.base_path+'session/?id=2';
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

        // this.session.on('sessionConnected', (event) => {
        //     console.log("Hi i'm connected")

        //     var pubOptions = { videoSource: null };
        //     var publisher = OT.initPublisher('myPublisher', pubOptions);

        //     this.session.publish(publisher);

        //     // this.session.publish('myPublisher')
        //     $('#endBtn').show();
        //     $('#startBtn').hide();
        //     this.noCallFound = false;
        //     this.session.on('streamCreated', (event) => {
        //         console.log(event, "stream")
        //         // this.session.subscribe(event.stream, 'myPublisher');
        //         for (let i = 0; i < event.streams.length; i++) {
        //             if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {

        //                 console.log(event.streams[i].hasVideo, "stream type")
        //                 this.subscribeToStream(event.streams[i]);
        //             }
        //         }
        //     })
        // })

        this.session.on('streamCreated', (event) => {
            console.log(event, "stream")
            for (let i = 0; i < event.streams.length; i++) {
                if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {

                    console.log(event.streams[i].hasVideo, "stream type")
                    if (!event.streams[i].hasVideo) {
                        var pubOptions = { videoSource: null };
                        var publisher = OT.initPublisher('myPublisher', pubOptions);
                        this.session.publish(publisher);
                    } else {
                        this.session.publish('myPublisher');
                    }

                    this.subscribeToAudioStream(event.streams[i], event.streams[i].hasVideo);
                }
            }
        })

        this.session.connect(this.apiKey, this.token)
    }

    subscribeToAudioStream(stream, type) {
        this.dialog = true;
        this.stream = stream;
        this.stream_type = type;
    }

    acceptCall() {
        this.dialog = false;
        console.log(this.stream, 'helloo')
        var div = document.createElement('div');
        div.innerHTML = 'subscriber';
        div.setAttribute('style', 'width: 264px; height: 186px; margin: 30px;');
        div.setAttribute('id', 'stream-' + this.stream.streamId);
        document.body.appendChild(div);

        if (!this.stream_type) {
            var options = { subscribeToAudio: true, subscribeToVideo: false };
            this.session.subscribe(this.stream, div.id, options).subscribeToVideo(false);
        }else {
            this.session.subscribe(this.stream, div.id);
        }
        // this.session.subscribe(this.stream, div.id);
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
