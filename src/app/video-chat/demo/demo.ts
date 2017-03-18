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
    image: any;
    imageName: any;
    imageFlag = 0;
    showfileSection: boolean = false;
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

    getSessionDetails(id, type) {

        this.id = id;
        if (localStorage.getItem('session_details')) {
            var data = JSON.parse(localStorage.getItem('session_details'))
            this.apiKey = data.apiKey;
            this.sessionId = data.sessionId;
            this.token = data.token;
            // console.log(this.apiKey, this.sessionId, this.token, "localStorage")
            if (type == 'file') {
                this.sendFileSection(id)
            } else {
                this.initializeSession();
            }
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

                    if (type == 'file') {
                        this.sendFileSection(id)
                    } else {
                        this.initializeSession();
                    }
                })
        }
    }

    sendFileSection(id) {

        this.session = OT.initSession(this.apiKey, this.sessionId);

        this.session.on('sessionConnected', (event) => {
            console.log("I'm connected")
            this.showfileSection = true;
        })

        this.session.on('signal:sender', (event) => {
            console.log(event, "gsffee")
            // var msg = document.createElement('p');
            // msg.innerHTML = event.data;
            var msg = document.createElement('img');
            msg.setAttribute('src', event.data);
            msg.className = event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs';
            var msgHistory = document.getElementById('history')
            msgHistory.appendChild(msg);
            msg.scrollIntoView();
        });

        this.session.connect(this.token, (error) => {
            console.log(error, "connection error")
        })
    }

    sendFile() {

        this.imageFlag = 0;

        var url = this.base_path_service.base_path + 'upload/';
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();

            formData.append("id", this.id);
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
                        type: 'receiver',
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

    initializeSession() {
        $('#endBtn').show();
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

                // this.session.signal({
                //     data: "acceptCall",
                //     type: 'sed'
                // }, function (error) {
                //     if (error) {
                //         console.log("signal error ("
                //             + error.name
                //             + "): " + error.message);
                //     } else {
                //         console.log("signal sent.");
                //     }
                // });
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

        this.session.on('signal:callAccepted', (event) => {
            console.log('signal call accepted')
            this.subscribeToStream(this.stream);
        })

        this.session.on('signal:endCall', (event) => {
            console.log('signal call end')
            this.endCall();
        })

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
