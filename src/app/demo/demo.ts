import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../GlobalService';

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
        var url = this.base_path_service.base_path + 'session/?id=' + id;
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                this.session = OT.initSession(this.apiKey, this.sessionId);

                this.session.on('sessionConnected', (event) => {
                    console.log("Hi i'm connected")
                    this.session.publish('myPublisher');

                    this.session.on('streamCreated', (event) => {
                        console.log(event, "stream")
                        for (let i = 0; i < event.streams.length; i++) {
                            if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                                this.subscribeToStream(event.streams[i]);
                            }
                        }
                    })
                })

                this.session.on('connectionCreated', (event) => {
                    console.log("connection created")
                })

                this.session.on('sessionCreated', (event) => {
                    console.log("session is created")
                    this.session.on('streamCreated', (event) => {
                        console.log(event, "stream")
                        for (let i = 0; i < event.streams.length; i++) {
                            if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                                this.subscribeToStream(event.streams[i]);
                            }
                        }
                    })
                })

                this.session.connect(this.apiKey, this.token)
            })
    }

    subscribeToStream(stream) {
        console.log(stream, 'helloo')
        this.stream = stream;
        var div = document.createElement('div');
        div.innerHTML = 'subscriber';
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);
        this.session.subscribe(stream, div.id);
    }

    endCall() {
        this.session.disconnect();
        this.session.on("sessionDisconnected", function () {
            console.log("for publisher")
        })

        // this.session.on("sessionDestroyed", function () {
        //     console.log("for subscriber");
        // });        

        // this.session.forceUnpublish(this.stream, (error)=>{
        //     console.log('force unpublish')
        // })
        // this.session.forceDisconnect(this.stream.connection, (error)=>{
        //     console.log('force disconnect')
        // })
        // var url = this.base_path_service.base_path+'destroy/?id='+this.id;
        // this.base_path_service.GetRequest(url)
        //     .subscribe(res=>{
        //         console.log(res[0].json, "res")
        //     })

        $('#endBtn').hide();
    }
}
