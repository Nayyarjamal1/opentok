import { Component, OnInit, AfterViewInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;
declare var ReconnectingWebSocket: any;


@Component({
    selector: 'app-receiver',
    templateUrl: './receiver.html',
    styleUrls: ['./receiver.css']
})
export class ReceiverDemoComponent implements OnInit {

    message: any;
    id: any;
    userList: any;
    socket: any;
    msg: any;
    receiverForm: FormGroup;

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
                    if (JSON.parse(message.data).is_file) {
                        mymsg = document.createElement('img');
                        mymsg.setAttribute('style', 'width: 210px; height: 180px');
                        mymsg.setAttribute('src', this.base_path_service.base_path + JSON.parse(message.data).file);
                        var msgHistory = document.getElementById('history')
                        msgHistory.appendChild(mymsg);
                        mymsg.scrollIntoView();
                    } else {
                        if (JSON.parse(message.data).job_name) {
                            mymsg = document.createElement('p');
                            for (let i = 0; i < this.userList.length; i++) {
                                if (this.userList[i].id == JSON.parse(message.data).u_id) {
                                    mymsg.innerHTML = this.userList[i].name + ':     ' + JSON.parse(message.data).job_name;
                                }
                            }
                            var msgHistory = document.getElementById('history')
                            msgHistory.appendChild(mymsg);
                            mymsg.scrollIntoView();
                        }
                    };
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
