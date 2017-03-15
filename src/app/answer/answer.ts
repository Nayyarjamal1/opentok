import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

declare var $: any;
declare var OT: any;


@Component({
    selector: 'app-answer',
    templateUrl: './answer.html',
    styleUrls: ['./answer.css']
})
export class AnswerComponent implements OnInit {
    
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

    constructor(private base_path_service:GlobalService) {
    }


    ngOnInit() {
        this.getDoctors();
    }    

    getDoctors() {
        var url = this.base_path_service.base_path+'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.doctorList = res[0].json;
            })
    }

    getSessionDetails(id) {
        this.noCallFound = false;
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
                
                this.initializeSession();
            })
    }

    initializeSession() {

        this.session.on('sessionConnected', (event) => {
            console.log("Hi i'm connected")
            this.session.publish('myPublisher1') 
            this.session.on('streamCreated', (event) => {
                console.log(event, "stream")                
                for (let i = 0; i < event.streams.length; i++) {
                    if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                        this.subscribeToStream(event.streams[i]);
                    }
                }
            })
        })
        this.session.on('streamCreated', (event) => {
            console.log(event, "stream")                
            for (let i = 0; i < event.streams.length; i++) {
                if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                    this.subscribeToStream(event.streams[i]);
                }
            }
        })

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

        this.session.connect(this.apiKey, this.token)
    }

    subscribeToStream(stream) {
        console.log(stream, 'helloo')
        var div = document.createElement('div');
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);

        this.session.subscribe(stream, div.id);
    }

    rejectCall() {
        this.session.disconnect();
    }
}
