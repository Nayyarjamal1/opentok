import { Component, OnInit, AfterViewInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;
declare var ReconnectingWebSocket: any;


@Component({
    selector: 'app-doctor',
    templateUrl: './doctor.html',
    styleUrls: ['./doctor.css']
})
export class FinalDoctorComponent implements OnInit {

    message: any;
    userList: any;
    socket: any;
    msg: any;
    receiverForm: FormGroup;

    showfileSection: boolean = false;


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
    connectionID: any;

    audioVideoChat = false;
    chatDiv = true;

    constructor(private base_path_service: GlobalService, private route: ActivatedRoute,
        private router: Router, private fb: FormBuilder) {
    }

    ngOnInit() {
        this.route.params.subscribe(param => {
            console.log(param)
            this.id = param['id'];
        })

        this.receiverForm = this.fb.group({
            'message': ['', [Validators.required]]
        })

        this.getUserList();
        this.getUserInfo();
        this.getSessionDetails();
    }

    getSessionDetails() {
        var url = this.base_path_service.base_path + 'session/?id=' + this.id;
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
            this.connectionID = event.connection.connectionId
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

        this.session.on('signal:BUSY', (event) => {
            this.dialog = false;
            console.log('busy')
        });


        this.session.on('signal:ACCEPT', (event) => {
            console.log(this.connectionID, "*****" + event.data, 'if notMatched')
            if (this.connectionID == event.data) {
                this.dialog = false;
                console.log(this.connectionID, event.data, 'notMatched')
            } else {
                this.session.signal({
                    type: 'BUSY'
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
        })

        this.session.on('signal:TERMINATED', (event) => {
            console.log('signal call end')
            this.endCall();
        })

        this.session.on('signal:REJECT', (event) => {
            console.log('call rejected')
            this.rejectCall();
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
        // var div document.getElementById('mySubscriber');
        div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
        div.setAttribute('id', 'stream-' + this.stream.streamId);
        document.body.appendChild(div);

        var subProp;
        if (this.callType == 'audio') {
            subProp = {
                subscribeToAudio: true,
                subscribeToVideo: false,
                videoSource: null
            };
            this.session.subscribe(this.stream, div.id);
            this.subscriber = this.session.subscribe(this.stream, div.id, subProp);
        } else if (this.callType == 'video') {
            subProp = {
                resolution: '320x240',
                frameRate: 15
            }

            this.session.subscribe(this.stream, div.id);
            this.subscriber = this.session.subscribe(this.stream, div.id, subProp);
        }
    }

    acceptCall() {

        this.session.signal({
            type: 'ACCEPT',
            retryAfterReconnect: true,
            data: this.connectionID
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
        this.audioVideoChat = true;
        this.chatDiv = false;
        console.log(this.callType, "call type")
        if (!this.publisher) {
            console.log('inside publisher')
            var pubOptions;
            var div = document.createElement('div');
            div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
            div.setAttribute('id', 'myPublisher');
            document.body.appendChild(div);
            if (this.callType == 'audio') {
                pubOptions = {
                    width: 264,
                    height: 186,
                    videoSource: null,
                    publishAudio: true,
                    publishVideo: false
                };

                this.publisher = OT.initPublisher(this.apiKey, div.id, pubOptions); // Pass the replacement div id and properties
                this.session.publish(this.publisher);

            } else if (this.callType == 'video') {
                pubOptions = {
                    width: 264,
                    height: 186,
                    resolution: '320x240',
                    frameRate: 15
                };

                this.publisher = OT.initPublisher(this.apiKey, div.id, pubOptions); // Pass the replacement div id and properties
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
        this.chatDiv = true;
        this.connectionInfo = false;
        $('#endBtn').hide();
        this.dialog = false;

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
        // $('stream-' + this.stream.streamId).hide();
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
        this.connectionInfo = false;
        this.getSessionDetails();
    }

    getUserList() {
        var url = this.base_path_service.base_path + 'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                console.log(res[0].json, "resssssss");
                this.userList = res[0].json;
            })
    }

    getUserInfo() {

        var url = this.base_path_service.base_path_chat + '1/' + this.id + '/';
        this.socket = new ReconnectingWebSocket(url);
        this.socket.onmessage = (message) => {
            console.log("response after 1: ", JSON.parse(message.data))
            this.msg = message;
            if (JSON.parse(message.data).person == this.id) {
                console.log('HEYY connected')
                var group = JSON.parse(this.msg.data).group_name;
                var url = this.base_path_service.base_path_chat + '3/' + group + '/' + this.id;
                this.socket = new ReconnectingWebSocket(url);
                this.socket.onmessage = (message) => {
                    var mymsg;
                    console.log("message after 3: ", message.data)
                    // if (JSON.parse(message.data).is_file) {
                    //     mymsg = document.createElement('img');
                    //     mymsg.setAttribute('style', 'width: 210px; height: 180px');
                    //     mymsg.setAttribute('src', this.base_path_service.base_path + JSON.parse(message.data).file);
                    //     var msgHistory = document.getElementById('history')
                    //     msgHistory.appendChild(mymsg);
                    //     mymsg.scrollIntoView();
                    // } else {
                    var url = this.base_path_service.base_path + 'getHistory/?group=' + JSON.parse(this.msg.data).group_name + '&page=1';
                    this.base_path_service.GetRequest(url)
                        .subscribe(res => {
                            console.log(res[0].json, "history");
                            document.getElementById('history').innerHTML = '';
                            for (let i = 0; i < res[0].json.data.length; i++) {
                                for (let j = 0; j < this.userList.length; j++) {
                                    if (this.userList[j].id == res[0].json.data[i].u_id) {
                                        if (res[0].json.data[i].is_file) {
                                            console.log(res[0].json.data[i].file.split('.').pop(), "file extension")
                                            var name = document.createElement('p');
                                            name.innerHTML = this.userList[j].name + ':    '
                                            if (res[0].json.data[i].file.split('.').pop() == 'png' || res[0].json.data[i].file.split('.').pop() == 'jpg' ||
                                            res[0].json.data[i].file.split('.').pop() == 'jpeg') {
                                                mymsg = document.createElement('img');
                                            } else {
                                                mymsg = document.createElement('embed');
                                            }
                                            mymsg.setAttribute('style', 'width: 210px; height: 180px');
                                            mymsg.setAttribute('src', this.base_path_service.base_path + res[0].json.data[i].file);
                                            var msgHistory = document.getElementById('history')
                                            msgHistory.appendChild(name);
                                            msgHistory.appendChild(mymsg);
                                            mymsg.scrollIntoView();
                                        } else {
                                            mymsg = document.createElement('p');
                                            mymsg.innerHTML = this.userList[j].name + ':    ' + res[0].json.data[i].job_name;
                                            var msgHistory = document.getElementById('history')
                                            msgHistory.appendChild(mymsg);
                                            mymsg.scrollIntoView();
                                        }
                                    }
                                }
                            }
                        })
                    // if (JSON.parse(message.data).job_name) {
                    //     mymsg = document.createElement('p');
                    //     for (let i = 0; i < this.userList.length; i++) {
                    //         if (this.userList[i].id == JSON.parse(message.data).u_id) {
                    //             mymsg.innerHTML = this.userList[i].name + ':     ' + JSON.parse(message.data).job_name;
                    //         }
                    //     }
                    //     var msgHistory = document.getElementById('history')
                    //     msgHistory.appendChild(mymsg);
                    //     mymsg.scrollIntoView();
                    // }
                    //     };
                }
            }
        };
    }

    sendMessage(value) {

        var data_to_be_send = {

            job_name: value.message,
            id: this.id,
            group: JSON.parse(this.msg.data).group_name
        }

        this.socket.send(JSON.stringify(data_to_be_send));

        this.receiverForm.reset();
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

            formData.append("id", this.id);
            formData.append("file", this.image);
            formData.append("group", JSON.parse(this.msg.data).group_name);

            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    console.log(JSON.parse(xhr.response).file, 'success')

                    // var mymsg = document.createElement('img');
                    // mymsg.setAttribute('style', 'width: 200px; height: 180px');
                    // mymsg.setAttribute('src', this.base_path_service.base_path + JSON.parse(xhr.response).file);
                    // var msgHistory = document.getElementById('history')
                    // msgHistory.appendChild(mymsg);
                    // mymsg.scrollIntoView();
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });

    }

}
