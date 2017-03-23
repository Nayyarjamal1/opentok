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
    connectionInfo:boolean=false;
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

        var url = this.base_path_service.base_path + 'session/?id=' + id;
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                if (type == 'file') {
                    this.sendFileSection(id)
                } else {
                    this.initializeSession(type);
                }
            })
    }

    initializeSession(type) {
        this.session = OT.initSession(this.apiKey, this.sessionId);

        this.session.on("sessionConnected", (event) => {
            this.connectionInfo = true;
            $('#endBtn').show();
        })

        this.session.on('connectionCreated', (event) => {
            if (event.connection.connectionId != this.session.connection.connectionId) {
                console.log('Another client connected.');

                if (type == 'video') {
                    this.session.signal({
                        type: 'VIDEO'
                    }, function (error) {
                        if (error) {
                            console.log("signal error ("
                                + error.name
                                + "): " + error.message);
                        } else {
                            console.log("signal sent.");
                        }
                    });
                } else if (type == 'audio') {
                    this.session.signal({
                        type: 'AUDIO'
                    }, function (error) {
                        if (error) {
                            console.log("signal error ("
                                + error.name
                                + "): " + error.message);
                        } else {
                            console.log("signal sent.");
                        }
                    });
                }
            }
        })

        this.session.on('streamCreated', (event) => {
            console.log(event, "stream")
            $('#endBtn').show();
            if (!this.publisher) {
                // var publisherDiv = document.createElement('div');
                // publisherDiv.setAttribute('id', 'myPublisher');
                // document.body.appendChild(publisherDiv);
                if (type == 'audio') {
                    var pubOptions = {
                        width: 264,
                        height: 186,
                        videoSource: null,
                        publishAudio: true,
                        publishVideo: false
                    };
                    this.publisher = OT.initPublisher(this.apiKey, 'myPublisher', pubOptions); // Pass the replacement div id and properties
                    this.session.publish(this.publisher);
                } else if (type == 'video') {
                    var publisherProps = {
                        width: 264,
                        height: 186,
                        resolution: '320x240'
                    };
                    this.publisher = OT.initPublisher(this.apiKey, 'myPublisher', publisherProps); // Pass the replacement div id and properties
                    this.session.publish(this.publisher);
                }

            }
            for (let i = 0; i < event.streams.length; i++) {
                if (this.session.connection.connectionId != event.streams[i].connection.connectionId) {
                    this.stream = event.streams[i];
                    this.subscribeToStream(this.stream, type);
                }
            }
        });

        this.session.on('signal:TERMINATED', (event) => {
            console.log('signal call end')
            this.end();
        })

        this.session.on('signal:ACCEPT', (event) => {
            console.log('signal accepted')
        })

        this.session.on('signal:REJECT', (event) => {
            console.log('reject call')
            $('#endBtn').hide();
            this.session.disconnect()
            if (this.publisher) {
                this.session.unpublish(this.publisher);
            }
            this.publisher = null;
            if (this.subscriber) {
                this.session.unsubscribe(this.subscriber);
            }
            this.subscriber = null;
            this.connectionInfo = false;
        })

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

        this.session.connect(this.token, (error) => {
            console.log(error, "connection error")
        })
    }

    subscribeToStream(stream, type) {
        console.log(stream, 'helloo')
        this.stream = stream;
        var div = document.createElement('div');
        div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);
        if (type == 'video') {
            var subProp = {
                resolution: '320x240'
            }
            this.session.subscribe(stream, div.id);
            this.subscriber = this.session.subscribe(stream, div.id, subProp);
        } else if (type == 'audio') {
            var subOptions = {
                subscribeToAudio: true,
                subscribeToVideo: false,
                videoSource: null
            };
            this.session.subscribe(stream, div.id);
            this.subscriber = this.session.subscribe(stream, div.id, subOptions);
        }
    }

    end() {
        $('#endBtn').hide();
        this.session.disconnect();
        if (this.publisher) {
            this.session.unpublish(this.publisher);
        }
        this.publisher = null;
        if (this.subscriber) {
            this.session.unsubscribe(this.subscriber);
        }
        this.subscriber = null;
        this.connectionInfo = false;
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
        this.connectionInfo = false;
    }

    sendFileSection(id) {

        this.session = OT.initSession(this.apiKey, this.sessionId);

        this.session.on('sessionConnected', (event) => {
            console.log("I'm connected")
            this.showfileSection = true;
        })

        this.session.on('signal:sender', (event) => {
            console.log(event, "gsffee")
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
}
