import { Component, OnInit, AfterViewInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { GlobalService } from '../../GlobalService';

declare var $: any;
declare var OT: any;
declare var ReconnectingWebSocket: any

@Component({
    selector: 'app-sender',
    templateUrl: './sender.html',
    styleUrls: ['./sender.css']
})
export class SenderDemoComponent implements OnInit {

    message: any;
    userList: any;
    id: any;
    msg: any;
    socket: any;
    senderForm: FormGroup;
    connectionName: any;

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

    getUserInfo(id) {
        var url = this.base_path_service.base_path_chat + '1/' + this.id + '/';
        this.socket = new ReconnectingWebSocket(url);

        this.socket.onmessage = (message) => {
            this.msg = message;
            console.log("Message after 1: ", message.data)
        };
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
            console.log("message after 2: ", message.data)
            if (JSON.parse(message.data).job_name) {
                var mymsg = document.createElement('p');
                for (let i = 0; i < this.userList.length; i++) {
                    if (this.userList[i].id == JSON.parse(message.data).u_id) {
                        mymsg.innerHTML = this.userList[i].name + ':' + JSON.parse(message.data).job_name;
                    }
                }
                // mymsg.innerHTML = JSON.parse(message.data).job_name;
                var msgHistory = document.getElementById('history')
                msgHistory.appendChild(mymsg);
                mymsg.scrollIntoView();
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
