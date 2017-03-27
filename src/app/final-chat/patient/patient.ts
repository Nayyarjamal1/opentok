import { Component, OnInit, AfterViewInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;
declare var ReconnectingWebSocket: any

@Component({
    selector: 'app-patient',
    templateUrl: './patient.html',
    styleUrls: ['./patient.css']
})
export class FinalPatientComponent implements OnInit {

    id: any;
    userList: any;
    senderForm: FormGroup;
    socket: any;
    msg: any;
    connectionName: any;

    apiKey: any;
    sessionId: any;
    token: any;
    status: any;
    archiveID: any;
    session: any;
    dialog: boolean = false;
    stream: any;
    doctorList: Array<any> = [];
    subscriber: any;
    publisher: any;
    image: any;
    imageName: any;
    imageFlag = 0;
    showfileSection: boolean = false;
    connectionInfo: boolean = false;
    connectionID: any;
    chatDiv:boolean=false;
    audioVideoChat:boolean=false;

    constructor(private base_path_service: GlobalService, private route: ActivatedRoute,
        private router: Router, private fb: FormBuilder) {
    }

    ngOnInit() {
        this.route.params.subscribe(param => {
            console.log(param)
            this.id = param['id'];
        })

        this.senderForm = this.fb.group({
            'message': ['', [Validators.required]]
        })

        this.getUserList();
    }

    getUserList() {
        var url = this.base_path_service.base_path + 'doc/';
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                console.log(res[0].json, "resssssss");
                this.userList = res[0].json;
                this.getUserInfo(this.id);
            })
    }

    /*** audio video chat ***/

    getSessionDetails(id, type) {

        console.log('idddd')

        var url = this.base_path_service.base_path + 'session/?id=' + id;
        this.base_path_service.GetRequest(url)
            .subscribe(res => {
                this.apiKey = res[0].json.apiKey;
                this.sessionId = res[0].json.sessionId;
                this.token = res[0].json.token;

                this.initializeSession(type);
            })

        // this.initializeSession(type);
    }

    initializeSession(type) {

        this.session = OT.initSession(this.apiKey, this.sessionId);

        this.session.on("sessionConnected", (event) => {
            this.connectionInfo = true;
            $('#endBtn').show();
        })

        this.session.on('connectionCreated', (event) => {
            this.connectionID = event.connection.connectionId;
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
                var pubOptions;
                if (type == 'audio') {
                    pubOptions = {
                        width: 264,
                        height: 186,
                        videoSource: null,
                        publishAudio: true,
                        publishVideo: false
                    };
                } else if (type == 'video') {
                    pubOptions = {
                        width: 264,
                        height: 186,
                        resolution: '320x240',
                        frameRate: 15
                    };
                }

                this.publisher = OT.initPublisher(this.apiKey, 'myPublisher', pubOptions); // Pass the replacement div id and properties
                this.session.publish(this.publisher);

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
            console.log(this.connectionID, "*****" + event.data, 'if notMatched')
            console.log(event.data, 'signal accepted')
        })

        this.session.on('signal:REJECT', (event) => {
            console.log('reject call')
            $('#endBtn').hide();
            this.session.disconnect()
            if (this.publisher) {
                this.session.unpublish(this.publisher);
                this.publisher = null;
            }

            if (this.subscriber) {
                this.session.unsubscribe(this.subscriber);
                this.subscriber = null;
            }

            this.connectionInfo = false;
        })

        this.session.on('connectionDestroyed', (event) => {
            console.log('connection destroyed')
            this.chatDiv = true;
            this.audioVideoChat = false;
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

        this.session.connect(this.token)
    }

    subscribeToStream(stream, type) {
        console.log(stream, 'helloo')
        this.stream = stream;
        var div = document.createElement('div');
        div.setAttribute('style', 'width: 264px; height: 186px; margin-top: 30px;');
        div.setAttribute('id', 'stream-' + stream.streamId);
        document.body.appendChild(div);

        var subProp;
        if (type == 'video') {
            subProp = {
                resolution: '320x240',
                frameRate: 15
            }
        } else if (type == 'audio') {
            subProp = {
                subscribeToAudio: true,
                subscribeToVideo: false,
                videoSource: null
            };
        }

        this.session.subscribe(stream, div.id);
        this.subscriber = this.session.subscribe(stream, div.id, subProp);
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
        this.chatDiv = true;
        this.audioVideoChat = false;
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

    /*** audio video chat ***/

    getUserInfo(id) {
        var url = this.base_path_service.base_path_chat + '1/' + this.id + '/';
        this.socket = new ReconnectingWebSocket(url);

        this.socket.onmessage = (message) => {
            this.msg = message;
            console.log("Message after 1: ", message.data)
        };
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

    // sendFileSection(id) {
    //     this.id = id;
    //     var url = this.base_path_service.base_path + 'session/?id='+id;
    //     this.base_path_service.GetRequest(url)
    //         .subscribe(res => {
    //             this.apiKey = res[0].json.apiKey;
    //             this.sessionId = res[0].json.sessionId;
    //             this.token = res[0].json.token;

    //             this.session = OT.initSession(this.apiKey, this.sessionId);

    //             this.session.on('sessionConnected', (event) => {
    //                 console.log("I'm connected")
    //                 this.showfileSection = true;
    //             })

    //             this.session.on('signal:sender', (event) => {
    //                 console.log(event, "gsffee")
    //                 // var msg = document.createElement('p');
    //                 // msg.innerHTML = event.data;
    //                 var msg = document.createElement('img');
    //                 msg.setAttribute('src', event.data);
    //                 msg.className = event.from.connectionId === this.session.connection.connectionId ? 'mine' : 'theirs';
    //                 var msgHistory = document.getElementById('history')
    //                 msgHistory.appendChild(msg);
    //                 msg.scrollIntoView();
    //             });

    //             this.session.on("signal", (event) => {
    //                 console.log(event, "Signal sent from connection ");
    //             });

    //             this.session.connect(this.token, (error) => {
    //                 console.log(error, "connection error")
    //             })
    //         })
    // }

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

    makeConnection(id) {
        for (let i = 0; i < this.userList.length; i++) {
            if (this.userList[i].id == id) {
                this.connectionName = this.userList[i].name;
            }
        }
        var url = this.base_path_service.base_path_chat + '2/' + this.id + '/' + id;
        this.socket = new ReconnectingWebSocket(url);
        this.socket.onmessage = (message) => {
            this.msg = message;
            var mymsg;
            console.log("message after 2: ", message.data)
            if (JSON.parse(message.data).is_file) {
                mymsg = document.createElement('img');
                mymsg.setAttribute('style', 'width: 200px; height: 180px');
                mymsg.setAttribute('src', this.base_path_service.base_path + JSON.parse(message.data).file);
                var msgHistory = document.getElementById('history')
                msgHistory.appendChild(mymsg);
                mymsg.scrollIntoView();
            } else {
                if (JSON.parse(message.data).job_name) {
                    mymsg = document.createElement('p');
                    for (let i = 0; i < this.userList.length; i++) {
                        if (this.userList[i].id == JSON.parse(message.data).u_id) {
                            mymsg.innerHTML = this.userList[i].name + ':    ' + JSON.parse(message.data).job_name;
                        }
                    }
                    // mymsg.innerHTML = JSON.parse(message.data).job_name;
                    var msgHistory = document.getElementById('history')
                    msgHistory.appendChild(mymsg);
                    mymsg.scrollIntoView();
                }
            }
        };
    }

    sendMessage(value) {

        console.log(value.message, 'message')

        var data_to_be_send = {
            job_name: value.message,
            id: this.id,
            group: JSON.parse(this.msg.data).group_name
        }

        this.socket.send(JSON.stringify(data_to_be_send));

        this.senderForm.reset();

    }
}
