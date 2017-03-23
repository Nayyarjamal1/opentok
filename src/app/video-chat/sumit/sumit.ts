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
    image: any;
    imageName: any;
    id: any;
    imageFlag = 0;
    callType: any;
    connectionInfo: boolean = false;

    constructor(private base_path_service: GlobalService) {
    }

    ngOnInit() {
        $('#endBtn').hide();
        $('#startBtn').hide();
        this.getSessionDetails();
    }

    getSessionDetails() {
        var url = 'https://chat.sia.co.in/session/?id=1';
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

        this.session = OT.initSession(this.apiKey, this.sessionId);

        this.session.on("sessionConnected", (event) => {
            this.connectionInfo = true;
        })

        this.session.on('connectionCreated', (event) => {
            if (event.connection.connectionId != this.session.connection.connectionId) {
                console.log("Hi i'm connected");
            }
        })

        this.session.on('signal:VIDEO', (event) => {
            console.log('video')
            this.callType = 'video';
            this.dialog = true;
        })

        this.session.on('signal:AUDIO', (event) => {
            console.log('audio')
            this.callType = 'audio';
            this.dialog = true;
        })

        this.session.on('signal:TERMINATED', (event) => {
            console.log('signal call end')
            this.endCall();
        })

        this.session.on('signal:REJECT', (event) => {
            console.log('call rejected')
            this.rejectCall();
        })

        // this.session.on('sessionDisconnected', (event) => {
        //     this.session.disconnect()
        // })

        this.session.on('connectionDestroyed', (event) => {
            console.log('connection destroyed')
            this.session.disconnect()
            if (this.publisher) {
                this.session.unpublish(this.publisher);
            }
            this.publisher = null;
            if (this.subscriber) {
                this.session.unsubscribe(this.subscriber);
            }
            this.subscriber = null;
        })

        this.session.on('signal:receiver', (event) => {
            console.log(event, "gsffee")
            var msg = document.createElement('img');
            msg.setAttribute('src', event.data);
            msg.className = event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs';
            var msgHistory = document.getElementById('history')
            msgHistory.appendChild(msg);
            msg.scrollIntoView();
        });

        this.session.connect(this.apiKey, this.token)
    }

    subscribeToStream(stream) {
        this.stream = stream;
        console.log(this.stream, 'helloo')
        var div = document.createElement('div');
        div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
        div.setAttribute('id', 'stream-' + this.stream.streamId);
        document.body.appendChild(div);
        if (this.callType == 'audio') {
            var subOptions = {
                subscribeToAudio: true,
                subscribeToVideo: false,
                videoSource: null
            };
            this.session.subscribe(this.stream, div.id);
            this.subscriber = this.session.subscribe(this.stream, div.id, subOptions);
        } else if (this.callType == 'video') {
            var subProp = {
                resolution: '320x240'
            }
            this.session.subscribe(this.stream, div.id);
            this.subscriber = this.session.subscribe(this.stream, div.id, subProp);
        }
    }

    acceptCall() {

        this.session.signal({
            type: 'ACCEPT'
        }, function (error) {
            if (error) {
                console.log("signal error ("
                    + error.name
                    + "): " + error.message);
            } else {
                console.log("signal sent.");
            }
        });

        $('#endBtn').show();
        this.dialog = false;
        console.log(this.callType, "call type")
        if (!this.publisher) {
            // var publisherDiv = document.createElement('div');
            // publisherDiv.setAttribute('id', 'myPublisher');
            // document.body.appendChild(publisherDiv);
            if (this.callType == 'audio') {
                var pubOptions = {
                    width: 264,
                    height: 186,
                    videoSource: null,
                    publishAudio: true,
                    publishVideo: false
                };
                this.publisher = OT.initPublisher(this.apiKey, 'myPublisher', pubOptions); // Pass the replacement div id and properties
                this.session.publish(this.publisher);
            } else if (this.callType == 'video') {
                var publisherProps = {
                    width: 264,
                    height: 186,
                    resolution: '320x240'
                };
                this.publisher = OT.initPublisher(this.apiKey, 'myPublisher', publisherProps); // Pass the replacement div id and properties
                this.session.publish(this.publisher);
            }
        }

        this.session.on('streamCreated', (event) => {
            for (let i = 0; i < event.streams.length; i++) {
                if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                    this.subscribeToStream(event.streams[i]);
                }
            }
        })

    }

    endCall() {
        $('#endBtn').hide();
        this.session.signal({
            type: 'TERMINATED'
        }, function (error) {
            if (error) {
                console.log("signal error ("
                    + error.name
                    + "): " + error.message);
            } else {
                console.log("signal sent.");
            }
        });
        this.session.disconnect();
        if (this.publisher) {
            this.session.unpublish(this.publisher);
        }
        this.publisher = null;
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
        $('#myPublisher').hide();
        $('stream-' + this.stream.streamId).hide();
        this.connectionInfo = false;
        this.getSessionDetails();
    }

    rejectCall() {

        this.dialog = false;
        this.session.signal({
            type: 'REJECT'
        }, function (error) {
            if (error) {
                console.log("signal error ("
                    + error.name
                    + "): " + error.message);
            } else {
                console.log("signal sent.");
            }
        });

        if (this.publisher) {
            this.session.unpublish(this.publisher);
        }
        this.publisher = null;
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
        this.getSessionDetails();
    }

    fileChangeEvent(fileInput: any) {

        this.image = fileInput.target.files[0];

        if (this.image != undefined) {
            this.imageFlag = 1;
            this.imageName = this.image.name;
            if (FileReader != undefined) {
                var reader = new FileReader();
                reader.addEventListener("load", function () {
                    console.log(reader);
                }, false);
                if (this.image) {
                    reader.readAsDataURL(this.image);
                }
            }
        } else {

        }
    }

    sendFile() {

        this.imageFlag = 0;

        var url = this.base_path_service.base_path + 'upload/';
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();

            formData.append("id", 2);
            formData.append("file", this.image);

            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {

                    console.log(JSON.parse(xhr.response).file, 'success')

                    var mymsg = document.createElement('img');
                    mymsg.setAttribute('src', this.base_path_service.base_path + JSON.parse(xhr.response).file);
                    var msgHistory = document.getElementById('history')
                    msgHistory.appendChild(mymsg);
                    mymsg.scrollIntoView();

                    this.session.signal({
                        type: 'sender',
                        data: this.base_path_service.base_path + JSON.parse(xhr.response).file
                    }, function (error) {
                        if (!error) {
                            console.log('error')
                        }
                    });
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }
}
