import { Component, OnInit, AfterViewInit} from '@angular/core';
import { GlobalService } from '../../GlobalService';

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
    subscriber: any;
    publisher: any;
    image: any;
    imageName: any;
    id: any;
    imageFlag = 0;
    callType:any;

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
            var url = 'https://chat.sia.co.in/session/?id=2';
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
            var subOptions = { videoSource: null };
            this.session.subscribe(this.stream, div.id);
            this.subscriber = this.session.subscribe(this.stream, div.id, subOptions);
        } else if (this.callType == 'video') {
            this.session.subscribe(this.stream, div.id);
            this.subscriber = this.session.subscribe(this.stream, div.id);
        }
    }

    acceptCall() {
        $('#endBtn').show();
        this.dialog = false;
        console.log(this.callType, "call type")
        if (!this.publisher) {
            var publisherDiv = document.createElement('div');
            publisherDiv.setAttribute('id', 'myPublisher');
            document.body.appendChild(publisherDiv);
            if (this.callType == 'audio') {
                var pubOptions = {
                    width: 264,
                    height: 186,
                    videoSource: null
                };
                this.publisher = OT.initPublisher(this.apiKey, publisherDiv.id, publisherProps); // Pass the replacement div id and properties
                this.session.publish(this.publisher);
            } else if (this.callType == 'video') {
                var publisherProps = {
                    width: 264,
                    height: 186,
                };
                this.publisher = OT.initPublisher(this.apiKey, publisherDiv.id, publisherProps); // Pass the replacement div id and properties
                this.session.publish(this.publisher);
            }
            // var publisherDiv = document.createElement('div');
            // publisherDiv.setAttribute('id', 'myPublisher');
            // document.body.appendChild(publisherDiv);
            // var publisherProps = {
            //     width: 264,
            //     height: 186,
            // };
            // this.publisher = OT.initPublisher(this.apiKey, publisherDiv.id, publisherProps); // Pass the replacement div id and properties
            // this.session.publish(this.publisher);
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
        $('#endBtn').show();
        this.session.signal({
            to: this.stream.connection,
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

        if (this.publisher) {
            this.session.unpublish(this.publisher);
        }
        this.publisher = null;
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
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
