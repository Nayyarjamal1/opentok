import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-publisher',
    templateUrl: './publisher.html',
    styleUrls: ['./publisher.css']
})
export class PublisherComponent implements OnInit {
    
    apiKey: any;
    sessionId: any;
    token: any;
    status: any;
    archiveID: any;
    session: any;
    dialog: boolean = false;
    stream: any;
    doctorList: Array<any> = [];

    constructor(private base_path_service:GlobalService) {
    }


    ngOnInit() {
        $('#endBtn').hide();
        this.getDoctors();
    }

    getDoctors() {
        var url = this.base_path_service.base_path+'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.doctorList = res[0].json;
            })
    }

    getSessionDetails(id, type) {
        var url = this.base_path_service.base_path+'session/?id=' + id;
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                // this.apiKey = '45783972';
                // this.sessionId = "1_MX40NTc4Mzk3Mn4xMi4zNC41Ni43OH4xNDg4ODY3MzE5ODAyflhrNVVMcGJRblVTK1FBRGtORGJ1UGNQTX5-";
                // this.token = "T1==cGFydG5lcl9pZD00NTc4Mzk3MiZzaWc9NjkxYWY2Y2I0ODU3OGI5ODVmOGYxZWY3YmQwNDAyYzM3YWM4NDVjOTpub25jZT0xMzA0NjcmY29ubmVjdGlvbl9kYXRhPU5vbmUmY3JlYXRlX3RpbWU9MTQ4ODg3MTg0MiZyb2xlPXB1Ymxpc2hlciZleHBpcmVfdGltZT0xNDg4OTU4MjQyJnNlc3Npb25faWQ9MV9NWDQwTlRjNE16azNNbjR4TWk0ek5DNDFOaTQzT0g0eE5EZzRPRFkzTXpFNU9EQXlmbGhyTlZWTWNHSlJibFZUSzFGQlJHdE9SR0oxVUdOUVRYNS0="

                this.session = OT.initSession(this.apiKey, this.sessionId);

                if (type == 'audio') {
                    this.audioCall();
                    console.log(type, "call type audio")
                } else {
                    this.videoCall();
                    console.log(type, "call type audio")
                }
            })
    }

    audioCall() {
        this.session.on('sessionConnected', (event) => {
            console.log("Hi i'm connected")

            var pubOptions = { videoSource: null };
            var publisher = OT.initPublisher('myPublisher', pubOptions);

            this.session.publish(publisher);

            $('#endBtn').show();
            this.session.on('streamCreated', (event) => {
                console.log(event, "stream")
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToAudioStream(event.streams[i]);
                    }
                }
            })
        })

        this.session.connect(this.apiKey, this.token, (error) => {
            console.log(error, "connect error")
        })
    }

    videoCall() {

        this.session.on('sessionConnected', (event) => {
            console.log("Hi i'm connected")

            this.session.publish('myPublisher');

            $('#endBtn').show();
            this.session.on('streamCreated', (event) => {
                console.log(event, "stream")
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToVideoStream(event.streams[i]);
                    }
                }
            })
        })

        this.session.connect(this.apiKey, this.token, (error) => {
            console.log(error, "connect error")
        })

    }

    initializeSession() {

        // this.session.on('sessionConnected', (event) => {
        //     console.log("Hi i'm connected")

        //     var pubOptions = { videoSource: null };
        //     var publisher = OT.initPublisher('myPublisher', pubOptions);

        //     this.session.publish(publisher);

        //     $('#endBtn').show();
        //     this.session.on('streamCreated', (event) => {
        //         console.log(event, "stream")
        //         for (let i = 0; i < event.streams.length; i++) {
        //             if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
        //                 this.subscribeToStream(event.streams[i]);
        //             }
        //         }
        //     })
        // })

        // this.session.on('sessionCreated', (event) => {
        //     this.session.on('streamCreated', (event) => {
        //         console.log(event, "stream")
        //         for (let i = 0; i < event.streams.length; i++) {
        //             if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
        //                 this.subscribeToStream(event.streams[i]);
        //             }
        //         }
        //     })
        // })

        // this.session.connect(this.apiKey, this.token, (error) => {
        //     console.log(error, "connect error")
        // })
    }

    subscribeToAudioStream(stream) {
        console.log(stream, 'helloo')
        var div = document.createElement('div');
        div.innerHTML = 'subscriber';
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);

        var options = { subscribeToAudio: true, subscribeToVideo: false };
        this.session.subscribe(stream, div.id, options).subscribeToVideo(false);
    }

    subscribeToVideoStream(stream) {
        console.log(stream, 'helloo')
        this.stream = stream;
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

    endCall() {
        $('#endBtn').hide();
    }
}
